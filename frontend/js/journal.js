const API_URL = "http://localhost:5001/api/journal/generate";


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

        const text = await res.text();
        let data;

        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("Respuesta no es JSON:", text);
            throw new Error(`Error del Servidor: ${text.substring(0, 100)}...`);
        }

        if (!res.ok || data.error) throw new Error(data.error || "Error desconocido");

        // 2. USAR GLOBAL para que el manager lo vea si fuera necesario
        window.currentData = data;
        window.renderJournal(data);

        if (typeof addToHistory === 'function') {
            // Añadimos el name aquí también por seguridad para el historial
            data.name = data.session_title;
            addToHistory(data, 'journals');
        }

    } catch (err) {
        els.content.innerHTML = `<div style="color:red; padding:20px; border:1px solid red; background:#ffecec;">
            <strong>Ocurrió un error:</strong><br>${err.message}
        </div>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// --- RENDERIZAR ---
window.renderJournal = function(data) {
    currentData = data;  // Sincronizar con local
    const s = (val) => val || '';
    const ensureArray = (val) => Array.isArray(val) ? val : (val ? [val] : []);

    const lootHtml = ensureArray(data.loot_gained).map(i => `<li>${i}</li>`).join('');
    const npcsHtml = ensureArray(data.npcs_met).map(i => `<li>${i}</li>`).join('');
    const questsHtml = ensureArray(data.quests_updated).map(i => `<li>${i}</li>`).join('');

    els.content.innerHTML = `
        <div class="recap-card">
            <h2 style="color:#c0392b; margin-top:0;">${s(data.session_title)}</h2>
            <div class="recap-text">"${s(data.epic_recap)}"</div>
            <div class="lists-grid">
                <div class="list-box"><h4>💰 Botín</h4><ul>${lootHtml || '<li>Nada</li>'}</ul></div>
                <div class="list-box"><h4>👥 NPCs</h4><ul>${npcsHtml || '<li>Nadie</li>'}</ul></div>
                <div class="list-box"><h4>⚔️ Misiones</h4><ul>${questsHtml || '<li>Sin cambios</li>'}</ul></div>
            </div>
        </div>
    `;

    if(els.btnEdit) els.btnEdit.style.display = 'block';
    if(els.btnExp) els.btnExp.style.display = 'block';
};

// --- EDITAR ---
els.btnEdit.addEventListener('click', () => {
    // 3. LEER DE LA GLOBAL (la que actualiza el historial al restaurar)
    if(!window.currentData) return;

    els.eTitle.value = window.currentData.session_title || "";
    els.eRecap.value = window.currentData.epic_recap || "";

    const safeJoin = (val) => Array.isArray(val) ? val.join('\n') : String(val || "");
    els.eLoot.value = safeJoin(window.currentData.loot_gained);
    els.eNPCs.value = safeJoin(window.currentData.npcs_met);
    els.eQuests.value = safeJoin(window.currentData.quests_updated);

    els.content.style.display = 'none';
    els.editorContainer.style.display = 'block';
});

els.btnCancel.addEventListener('click', () => {
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';
});

els.btnSave.addEventListener('click', () => {
    if(!window.currentData) return; // Seguridad

    const newData = {
        ...window.currentData, // Mantiene el _db_id si existe
        session_title: els.eTitle.value,
        name: els.eTitle.value, // 4. IMPORTANTE: Sincronizar 'name' para el historial
        epic_recap: els.eRecap.value,
        loot_gained: els.eLoot.value.split('\n').filter(l => l.trim() !== ""),
        npcs_met: els.eNPCs.value.split('\n').filter(l => l.trim() !== ""),
        quests_updated: els.eQuests.value.split('\n').filter(l => l.trim() !== "")
    };

    window.currentData = newData; // Actualizar global
    window.renderJournal(newData);
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';

    // Lógica para ACTUALIZAR o CREAR nuevo
    // Ahora window.currentData sí tendrá el _db_id inyectado por restoreItem
    if (window.currentData._db_id && typeof updateHistoryItem === 'function') {
        updateHistoryItem(window.currentData._db_id, window.currentData);
    } else if (typeof addToHistory === 'function') {
        addToHistory(window.currentData, 'journals');
    }
});

// --- EXPORTAR ---
els.btnExp.addEventListener('click', () => {
    if(!window.currentData) return;
    const ensureArray = (val) => Array.isArray(val) ? val : (val ? [val] : []);
    const data = window.currentData;

    let content = `<h2>${data.session_title}</h2>`;
    content += `<p><i>${data.epic_recap}</i></p><hr>`;
    content += `<h3>Botín</h3><ul>${ensureArray(data.loot_gained).map(i=>`<li>${i}</li>`).join('')}</ul>`;
    content += `<h3>NPCs</h3><ul>${ensureArray(data.npcs_met).map(i=>`<li>${i}</li>`).join('')}</ul>`;
    content += `<h3>Misiones</h3><ul>${ensureArray(data.quests_updated).map(i=>`<li>${i}</li>`).join('')}</ul>`;

    const json = {
        name: data.session_title,
        type: "journal",
        pages: [{ name: "Resumen", type: "text", text: { content: content, format: 1 } }]
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Sesion_${(data.session_title || 'sin_titulo').replace(/\s+/g, '_')}.json`;
    a.click();
});