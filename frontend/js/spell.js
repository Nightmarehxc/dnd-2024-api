const API_URL = "http://localhost:5001/api/spells/generate";
let currentData = null;

const els = {
    name: document.getElementById('spellName'),
    level: document.getElementById('spellLevel'),
    school: document.getElementById('spellSchool'),
    btnGen: document.getElementById('btnGen'),

    btnEdit: document.getElementById('btnEdit'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader'),

    editorContainer: document.getElementById('formEditorContainer'),
    btnSave: document.getElementById('btnSaveChanges'),
    btnCancel: document.getElementById('btnCancelEdit'),

    eName: document.getElementById('editName'),
    eLevel: document.getElementById('editLevel'),
    eSchool: document.getElementById('editSchool'),
    eTime: document.getElementById('editTime'),
    eRange: document.getElementById('editRange'),
    eDuration: document.getElementById('editDuration'),
    eDesc: document.getElementById('editDesc')
};

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
            body: JSON.stringify({
                name: els.name.value,
                level: els.level.value,
                school: els.school.value
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        window.renderSpell(data);
        if (typeof addToHistory === 'function') addToHistory(currentData, 'spells');

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
    els.eLevel.value = currentData.level || "";
    els.eSchool.value = currentData.school || "";
    els.eTime.value = currentData.casting_time || "";
    els.eRange.value = currentData.range || "";
    els.eDuration.value = currentData.duration || "";
    els.eDesc.value = currentData.description || "";

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
        level: els.eLevel.value,
        school: els.eSchool.value,
        casting_time: els.eTime.value,
        range: els.eRange.value,
        duration: els.eDuration.value,
        description: els.eDesc.value
    };

    currentData = newData;
    window.renderSpell(currentData);
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';

    if (currentData._db_id && typeof updateHistoryItem === 'function') {
        updateHistoryItem(currentData._db_id, currentData);
    } else if (typeof addToHistory === 'function') {
        addToHistory(currentData, 'spells');
    }
});

// --- RENDERIZAR ---
window.renderSpell = function(data) {
    currentData = data;  // Sincronizar con local
    const s = (val) => val || '---';
    els.content.innerHTML = `
        <div class="spell-card">
            <h2 style="color:#2980b9;">${s(data.name)}</h2>
            <div style="font-style:italic; margin-bottom:10px;">${s(data.level)}, ${s(data.school)}</div>
            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; font-size:0.9em; border-top:1px solid #ddd; border-bottom:1px solid #ddd; padding:5px 0; margin-bottom:10px;">
                <div><strong>Tiempo:</strong> ${s(data.casting_time)}</div>
                <div><strong>Alcance:</strong> ${s(data.range)}</div>
                <div><strong>Duración:</strong> ${s(data.duration)}</div>
            </div>
            <p>${s(data.description)}</p>
        </div>
    `;
    if(els.btnEdit) els.btnEdit.style.display = 'block';
    if(els.btnExp) els.btnExp.style.display = 'block';
};

els.btnExp.addEventListener('click', () => { /* ... */ });