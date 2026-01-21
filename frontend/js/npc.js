const API_URL = "http://localhost:5001/api/npcs/generate";
let currentData = null;

const els = {
    race: document.getElementById('race'),
    job: document.getElementById('job'),
    btnGen: document.getElementById('btnGen'),

    btnEdit: document.getElementById('btnEdit'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader'),

    editorContainer: document.getElementById('formEditorContainer'),
    btnSave: document.getElementById('btnSaveChanges'),
    btnCancel: document.getElementById('btnCancelEdit'),

    // Inputs
    eName: document.getElementById('editName'),
    eRace: document.getElementById('editRace'),
    eJob: document.getElementById('editJob'),
    eApp: document.getElementById('editApp'),
    ePers: document.getElementById('editPers'),
    eSecret: document.getElementById('editSecret')
};

// --- GENERAR ---
els.btnGen.addEventListener('click', async () => {
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
            body: JSON.stringify({ race: els.race.value, occupation: els.job.value })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        window.renderNPC(data);
        if (typeof addToHistory === 'function') addToHistory(currentData, 'npc');

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
    els.eName.value = currentData.name || "";
    els.eRace.value = currentData.race_class || "";
    els.eJob.value = currentData.occupation || "";
    els.eApp.value = currentData.appearance || "";
    els.ePers.value = currentData.personality || "";
    els.eSecret.value = currentData.secret || currentData.plot_hook || "";

    els.content.style.display = 'none';
    els.editorContainer.style.display = 'block';
});

els.btnCancel.addEventListener('click', () => {
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';
});

els.btnSave.addEventListener('click', () => {
    const newData = {
        ...currentData,
        name: els.eName.value,
        race_class: els.eRace.value,
        occupation: els.eJob.value,
        appearance: els.eApp.value,
        personality: els.ePers.value,
        secret: els.eSecret.value
    };

    currentData = newData;
    window.renderNPC(currentData);
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';

    if (currentData._db_id && typeof updateHistoryItem === 'function') {
        updateHistoryItem(currentData._db_id, currentData);
    } else if (typeof addToHistory === 'function') {
        addToHistory(currentData, 'npc');
    }
});

// --- RENDERIZAR ---
window.renderNPC = function(data) {
    const s = (val) => val || '---';
    els.content.innerHTML = `
        <div class="npc-card">
            <h2 style="color:#2c3e50; border-bottom:2px solid #3498db;">${s(data.name)}</h2>
            <p><strong>${s(data.race_class)}</strong> - <em>${s(data.occupation)}</em></p>
            <div style="background:#ecf0f1; padding:10px; border-radius:5px; margin:10px 0;">
                <p><strong>Apariencia:</strong> ${s(data.appearance)}</p>
                <p><strong>Personalidad:</strong> ${s(data.personality)}</p>
            </div>
            <p style="color:#c0392b;"><strong>Secreto / Gancho:</strong> ${s(data.secret || data.plot_hook)}</p>
        </div>
    `;
    if(els.btnEdit) els.btnEdit.style.display = 'block';
    if(els.btnExp) els.btnExp.style.display = 'block';
};

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;
    const json = { name: currentData.name, type: "npc", system: { details: { biography: { value: `App: ${currentData.appearance}<br>Pers: ${currentData.personality}` } } } };
    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${currentData.name}.json`;
    a.click();
});