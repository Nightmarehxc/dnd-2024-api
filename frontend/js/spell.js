const API_URL = "http://localhost:5001/api/spells/generate";
let currentData = null;

// Obtener elementos de forma defensiva
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

// Agregar listeners solo si los elementos existen
if (els.btnGen) {
    els.btnGen.addEventListener('click', async () => {
        els.content.innerHTML = '';
        if (els.editorContainer) els.editorContainer.style.display = 'none';
        els.content.style.display = 'block';
        els.loader.style.display = 'block';
        els.btnGen.disabled = true;
        if (els.btnEdit) els.btnEdit.style.display = 'none';
        if (els.btnExp) els.btnExp.style.display = 'none';

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    name: els.name?.value || "",
                    level: els.level?.value || "",
                    school: els.school?.value || ""
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
}

// --- EDITAR ---
if (els.btnEdit) {
    els.btnEdit.addEventListener('click', () => {
        if(!currentData || !els.editorContainer) return;
        if (els.eName) els.eName.value = currentData.name || "";
        if (els.eLevel) els.eLevel.value = currentData.level || "";
        if (els.eSchool) els.eSchool.value = currentData.school || "";
        if (els.eTime) els.eTime.value = currentData.casting_time || "";
        if (els.eRange) els.eRange.value = currentData.range || "";
        if (els.eDuration) els.eDuration.value = currentData.duration || "";
        if (els.eDesc) els.eDesc.value = currentData.description || "";

        els.content.style.display = 'none';
        els.editorContainer.style.display = 'block';
    });
}

if (els.btnCancel) {
    els.btnCancel.addEventListener('click', () => {
        if (els.editorContainer) els.editorContainer.style.display = 'none';
        els.content.style.display = 'block';
    });
}

if (els.btnSave) {
    els.btnSave.addEventListener('click', () => {
        const newData = {
            ...currentData,
            name: els.eName?.value || currentData.name,
            level: els.eLevel?.value || currentData.level,
            school: els.eSchool?.value || currentData.school,
            casting_time: els.eTime?.value || currentData.casting_time,
            range: els.eRange?.value || currentData.range,
            duration: els.eDuration?.value || currentData.duration,
            description: els.eDesc?.value || currentData.description
        };

        currentData = newData;
        window.renderSpell(currentData);
        if (els.editorContainer) els.editorContainer.style.display = 'none';
        els.content.style.display = 'block';

        if (currentData._db_id && typeof updateHistoryItem === 'function') {
            updateHistoryItem(currentData._db_id, currentData);
        } else if (typeof addToHistory === 'function') {
            addToHistory(currentData, 'spells');
        }
    });
}

// --- RENDERIZAR ---
window.renderSpell = function(data) {
    currentData = data;  // Sincronizar con local
    const s = (val) => val || '---';
    const components = Array.isArray(data.components) ? data.components.join(', ') : (data.components || '---');
    
    els.content.innerHTML = `
        <div class="spell-card">
            <h2 style="color:#2980b9;">${s(data.name)}</h2>
            <div style="font-style:italic; margin-bottom:10px;">${s(data.level)}, ${s(data.school)}</div>
            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; font-size:0.9em; border-top:1px solid #ddd; border-bottom:1px solid #ddd; padding:5px 0; margin-bottom:10px;">
                <div><strong>Tiempo:</strong> ${s(data.casting_time)}</div>
                <div><strong>Alcance:</strong> ${s(data.range)}</div>
                <div><strong>Duración:</strong> ${s(data.duration)}</div>
            </div>
            <div style="margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid #eee;">
                <strong>Componentes:</strong> ${components}
            </div>
            <p>${s(data.description)}</p>
        </div>
    `;
    if(els.btnEdit) els.btnEdit.style.display = 'block';
    if(els.btnExp) els.btnExp.style.display = 'block';
};

if (els.btnExp) {
    els.btnExp.addEventListener('click', () => { /* ... */ });
}