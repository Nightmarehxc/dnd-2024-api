const API_URL = "http://localhost:5001/api/journal/generate";
let currentData = null;

const els = {
    notes: document.getElementById('rawNotes'),
    tone: document.getElementById('tone'),
    btnGen: document.getElementById('btnGen'),

    btnEdit: document.getElementById('btnEdit'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader'),

    editorContainer: document.getElementById('formEditorContainer'),
    btnSave: document.getElementById('btnSaveChanges'),
    btnCancel: document.getElementById('btnCancelEdit'),

    eTitle: document.getElementById('editTitle'),
    eRecap: document.getElementById('editRecap'),
    eLoot: document.getElementById('editLoot'),
    eNPCs: document.getElementById('editNPCs'),
    eQuests: document.getElementById('editQuests')
};

// --- GENERAR ---
els.btnGen.addEventListener('click', async () => {
    if (!els.notes.value) return alert("¡Escribe algo en las notas!");

    els.content.innerHTML = '';
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnEdit.style.display = 'none';
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                raw_notes: els.notes.value,
                tone: els.tone.value
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        window.renderJournal(data);

        // Guardar con tipo 'journal'
        if (typeof addToHistory === 'function') {
            addToHistory({ ...data, nombre: data.session_title, tipo_item: "Crónica" }, 'journal');
        }

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// --- EDITAR ---
els.btnEdit.addEventListener('click', () => {
    if(!currentData) return;

    els.eTitle.value = currentData.session_title || "";
    els.eRecap.value = currentData.epic_recap || "";

    // Convertir Arrays a Texto (uno por línea) para editar fácil
    els.eLoot.value = (currentData.loot_gained || []).join('\n');
    els.eNPCs.value = (currentData.npcs_met || []).join('\n');
    els.eQuests.value = (currentData.quests_updated || []).join('\n');

    els.content.style.display = 'none';
    els.editorContainer.style.display = 'block';
});

els.btnCancel.addEventListener('click', () => {
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';
});

els.btnSave.addEventListener('click', () => {
    // Reconstruir objeto
    const newData = {
        ...currentData,
        session_title: els.eTitle.value,
        epic_recap: els.eRecap.value,
        // Convertir texto multilinea de vuelta a Arrays
        loot_gained: els.eLoot.value.split('\n').filter(l => l.trim() !== ""),
        npcs_met: els.eNPCs.value.split('\n').filter(l => l.trim() !== ""),
        quests_updated: els.eQuests.value.split('\n').filter(l => l.trim() !== "")
    };

    currentData = newData;
    window.renderJournal(currentData);
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';

    if (currentData._db_id && typeof updateHistoryItem === 'function') {
        updateHistoryItem(currentData._db_id, { ...currentData, nombre: currentData.session_title });
    } else if (typeof addToHistory === 'function') {
        addToHistory({ ...currentData, nombre: currentData.session_title }, 'journal');
    }
});

// --- RENDERIZADO GLOBAL ---
window.renderJournal = function(data) {
    const s = (val) => val || '';

    const lootHtml = (data.loot_gained || []).map(i => `<li>${i}</li>`).join('');
    const npcsHtml = (data.npcs_met || []).map(i => `<li>${i}</li>`).join('');
    const questsHtml = (data.quests_updated || []).map(i => `<li>${i}</li>`).join('');

    els.content.innerHTML = `
        <div class="recap-card">
            <h2 style="color:#c0392b; margin-top:0;">${s(data.session_title)}</h2>

            <div class="recap-text">
                "${s(data.epic_recap)}"
            </div>

            <div class="lists-grid">
                <div class="list-box">
                    <h4>💰 Botín</h4>
                    <ul>${lootHtml || '<li>Nada relevante</li>'}</ul>
                </div>
                <div class="list-box">
                    <h4>👥 NPCs</h4>
                    <ul>${npcsHtml || '<li>Nadie nuevo</li>'}</ul>
                </div>
                <div class="list-box">
                    <h4>⚔️ Misiones</h4>
                    <ul>${questsHtml || '<li>Sin cambios</li>'}</ul>
                </div>
            </div>
        </div>
    `;

    if(els.btnEdit) els.btnEdit.style.display = 'block';
    if(els.btnExp) els.btnExp.style.display = 'block';
};

// --- EXPORTAR ---
els.btnExp.addEventListener('click', () => {
    if(!currentData) return;

    // Crear formato Journal de Foundry VTT
    let content = `<h2>${currentData.session_title}</h2>`;
    content += `<p><i>${currentData.epic_recap}</i></p><hr>`;

    content += `<h3>Botín</h3><ul>${(currentData.loot_gained||[]).map(i=>`<li>${i}</li>`).join('')}</ul>`;
    content += `<h3>NPCs</h3><ul>${(currentData.npcs_met||[]).map(i=>`<li>${i}</li>`).join('')}</ul>`;
    content += `<h3>Misiones</h3><ul>${(currentData.quests_updated||[]).map(i=>`<li>${i}</li>`).join('')}</ul>`;

    const json = {
        name: currentData.session_title,
        type: "journal",
        pages: [{ name: "Resumen", type: "text", text: { content: content, format: 1 } }]
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Sesion_${currentData.session_title.replace(/\s+/g, '_')}.json`;
    a.click();
});