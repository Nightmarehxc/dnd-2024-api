const API_URL = "http://localhost:5001/api/items/generate";
let currentData = null;

const els = {
    name: document.getElementById('itemName'),
    type: document.getElementById('itemType'),
    rarity: document.getElementById('itemRarity'),
    attunement: document.getElementById('itemAttunement'),
    btnGen: document.getElementById('btnGen'),

    btnEdit: document.getElementById('btnEdit'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader'),

    editorContainer: document.getElementById('formEditorContainer'),
    btnSave: document.getElementById('btnSaveChanges'),
    btnCancel: document.getElementById('btnCancelEdit'),

    eName: document.getElementById('editName'),
    eType: document.getElementById('editType'),
    eRarity: document.getElementById('editRarity'),
    eDesc: document.getElementById('editDesc'),
    eMech: document.getElementById('editMech')
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
                item_type: els.type.value,
                rarity: els.rarity.value,
                attunement: els.attunement.checked
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        window.renderItem(data);
        if (typeof addToHistory === 'function') addToHistory(currentData, 'item');

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
    els.eType.value = currentData.type || "";
    els.eRarity.value = currentData.rarity || "";
    els.eDesc.value = currentData.description || "";
    els.eMech.value = currentData.mechanics || "";

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
        type: els.eType.value,
        rarity: els.eRarity.value,
        description: els.eDesc.value,
        mechanics: els.eMech.value
    };

    currentData = newData;
    window.renderItem(currentData);
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';

    if (currentData._db_id && typeof updateHistoryItem === 'function') {
        updateHistoryItem(currentData._db_id, currentData);
    } else if (typeof addToHistory === 'function') {
        addToHistory(currentData, 'item');
    }
});

// --- RENDERIZAR ---
window.renderItem = function(data) {
    const s = (val) => val || '---';
    els.content.innerHTML = `
        <div style="border:2px solid #333; padding:20px; background:white;">
            <h2 style="color:#8e44ad; border-bottom:2px solid #8e44ad;">${s(data.name)}</h2>
            <p><em>${s(data.type)}, ${s(data.rarity)}</em></p>
            <p>${s(data.description)}</p>
            <div style="background:#f4f4f4; padding:10px; border-left:3px solid #8e44ad;">
                <strong>Mecánicas:</strong> ${s(data.mechanics)}
            </div>
        </div>
    `;
    if(els.btnEdit) els.btnEdit.style.display = 'block';
    if(els.btnExp) els.btnExp.style.display = 'block';
};

els.btnExp.addEventListener('click', () => { /* ... */ });