const API_URL = "http://localhost:5001/api/items/generate";
let currentData = null;

const els = {
    name: document.getElementById('itemName'),
    type: document.getElementById('itemType'),
    rarity: document.getElementById('itemRarity'),
    itemClass: document.getElementById('itemClass'),
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
    eMech: document.getElementById('editMech'),
    eClass: document.getElementById('editClass')
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
        if (typeof addToHistory === 'function') {
            // Crear copia sin _db_id para guardar
            const dataToSave = { ...data };
            const savedItem = await addToHistory(dataToSave, 'items');
            if (savedItem && savedItem.id) {
                currentData._db_id = savedItem.id;
                console.log('✅ Item guardado con ID:', savedItem.id);
            }
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
    els.eName.value = currentData.name || "";
    els.eType.value = currentData.type || "";
    els.eRarity.value = currentData.rarity || "";
    els.eDesc.value = currentData.description || "";
    els.eMech.value = currentData.mechanics || "";
    els.eClass.value = currentData.class_requirement || "";

    els.content.style.display = 'none';
    els.editorContainer.style.display = 'block';
});

els.btnCancel.addEventListener('click', () => {
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';
});

els.btnSave.addEventListener('click', async () => {
    const newData = {
        ...currentData,
        name: els.eName.value,
        type: els.eType.value,
        rarity: els.eRarity.value,
        description: els.eDesc.value,
        mechanics: els.eMech.value,
        class_requirement: els.eClass.value
    };

    console.log('💾 Guardando cambios:', newData);  // DEBUG
    
    // Crear una copia para enviar al servidor sin _db_id
    const dataToSave = { ...newData };
    delete dataToSave._db_id;  // No enviar el ID de BD al servidor
    
    currentData = newData;
    window.renderItem(currentData);
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';

    if (currentData._db_id && typeof updateHistoryItem === 'function') {
        console.log('📤 Actualizando item existente ID:', currentData._db_id);
        const result = await updateHistoryItem(currentData._db_id, dataToSave);
        if (result) {
            console.log('✅ Cambios guardados:', result);
        } else {
            console.error('❌ Error al guardar cambios');
        }
    } else if (typeof addToHistory === 'function') {
        console.log('📝 Guardando como nuevo item');
        const savedItem = await addToHistory(dataToSave, 'items');
        if (savedItem && savedItem.id) {
            currentData._db_id = savedItem.id;
            console.log('✅ Item guardado con ID:', savedItem.id);
        }
    }
});

// --- RENDERIZAR ---
window.renderItem = function(data) {
    currentData = data;  // Sincronizar con local
    const s = (val) => val || '---';
    const classInfo = data.class_requirement ? `<p><strong>Clase Sugerida:</strong> ${data.class_requirement}</p>` : '';
    const mechanicsInfo = data.mechanics ? `<div style="background:#f4ecf7; padding:10px; border-left:3px solid #9b59b6; margin-top:10px;">
        <strong>Mecánicas:</strong><br>${s(data.mechanics).replace(/\n/g, '<br>')}
    </div>` : '<div style="background:#f4ecf7; padding:10px; border-left:3px solid #9b59b6; margin-top:10px;"><strong>Mecánicas:</strong> ---</div>';
    
    els.content.innerHTML = `
        <div style="border:2px solid #333; padding:20px; background:white;">
            <h2 style="color:#8e44ad; border-bottom:2px solid #8e44ad;">${s(data.name)}</h2>
            <p><em>${s(data.type)}, ${s(data.rarity)}</em></p>
            ${classInfo}
            <p style="margin-top:10px; line-height:1.6;">${s(data.description)}</p>
            ${mechanicsInfo}
            <p style="margin-top:10px; color:#666;"><small>Valor estimado: <strong>${s(data.value)}</strong></small></p>
        </div>
    `;
    if(els.btnEdit) els.btnEdit.style.display = 'block';
    if(els.btnExp) els.btnExp.style.display = 'block';
};

els.btnExp.addEventListener('click', () => { /* ... */ });