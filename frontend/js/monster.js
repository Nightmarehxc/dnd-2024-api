const API_URL = "http://localhost:5001/api/monsters/generate";
let currentData = null;

const els = {
    // Generación
    base: document.getElementById('baseMonster'),
    theme: document.getElementById('theme'),
    cr: document.getElementById('targetCR'),
    btnGen: document.getElementById('btnGen'),

    // UI General
    btnEdit: document.getElementById('btnEdit'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader'),

    // Editor Formulario
    editorContainer: document.getElementById('formEditorContainer'),
    btnSave: document.getElementById('btnSaveChanges'),
    btnCancel: document.getElementById('btnCancelEdit'),

    // Inputs del Editor
    eName: document.getElementById('editName'),
    eType: document.getElementById('editType'),
    eAC: document.getElementById('editAC'),
    eHP: document.getElementById('editHP'),
    eSpeed: document.getElementById('editSpeed'),
    eCR: document.getElementById('editCR'),
    eVisual: document.getElementById('editVisual'),
    // Stats
    eStr: document.getElementById('editStr'),
    eDex: document.getElementById('editDex'),
    eCon: document.getElementById('editCon'),
    eInt: document.getElementById('editInt'),
    eWis: document.getElementById('editWis'),
    eCha: document.getElementById('editCha')
};

// --- GENERAR ---
els.btnGen.addEventListener('click', async () => {
    if (!els.base.value || !els.theme.value) return alert("Faltan datos.");

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
                base_monster: els.base.value,
                theme: els.theme.value,
                target_cr: els.cr.value || null
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        window.renderMonster(data);

        // Guardar Nuevo
        if (typeof addToHistory === 'function') addToHistory(currentData, 'monsters');

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// --- EDICIÓN ---
els.btnEdit.addEventListener('click', () => {
    if(!currentData) return;

    // Rellenar datos
    els.eName.value = currentData.name || "";
    els.eType.value = (currentData.type || "") + (currentData.alignment ? `, ${currentData.alignment}` : "");
    els.eAC.value = parseInt(currentData.ca) || 10;
    els.eHP.value = currentData.hp || "";
    els.eSpeed.value = currentData.speed || "";
    els.eCR.value = currentData.cr || "";
    els.eVisual.value = currentData.visual || "";

    const s = currentData.stats || {};
    els.eStr.value = s.STR || 10; els.eDex.value = s.DEX || 10; els.eCon.value = s.CON || 10;
    els.eInt.value = s.INT || 10; els.eWis.value = s.WIS || 10; els.eCha.value = s.CHA || 10;

    els.content.style.display = 'none';
    els.editorContainer.style.display = 'block';
});

els.btnCancel.addEventListener('click', () => {
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';
});

els.btnSave.addEventListener('click', () => {
    // Procesar Tipo y Alineamiento
    const typeParts = els.eType.value.split(',');

    const newData = {
        ...currentData,
        name: els.eName.value,
        type: typeParts[0]?.trim() || "Monstruo",
        alignment: typeParts[1]?.trim() || "Neutral",
        ca: els.eAC.value,
        hp: els.eHP.value,
        speed: els.eSpeed.value,
        cr: els.eCR.value,
        visual: els.eVisual.value,
        stats: {
            STR: parseInt(els.eStr.value) || 10, DEX: parseInt(els.eDex.value) || 10,
            CON: parseInt(els.eCon.value) || 10, INT: parseInt(els.eInt.value) || 10,
            WIS: parseInt(els.eWis.value) || 10, CHA: parseInt(els.eCha.value) || 10
        }
    };

    currentData = newData;
    window.renderMonster(currentData);
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';

    // Guardar en DB
    if (currentData._db_id && typeof updateHistoryItem === 'function') {
        updateHistoryItem(currentData._db_id, currentData);
    } else if (typeof addToHistory === 'function') {
        addToHistory(currentData, 'monsters');
    }
});

// --- RENDERIZADO GLOBAL ---
window.renderMonster = function(data) {
    currentData = data;  // Sincronizar con local
    const s = (val) => val || '---';
    const stats = data.stats || {};
    const getMod = (sc) => { const m = Math.floor((sc-10)/2); return m>=0?`+${m}`:m; };

    let statsHtml = '';
    ['STR','DEX','CON','INT','WIS','CHA'].forEach(k => {
        const v = parseInt(stats[k])||10;
        statsHtml += `<div class="ability-score"><strong>${k}</strong><br>${v} (${getMod(v)})</div>`;
    });

    const traitsHtml = (data.traits||[]).map(t => `<p><strong>${t.name}.</strong> ${t.desc}</p>`).join('');
    const actionsHtml = (data.actions||[]).map(a => `<p class="stat-line"><span class="action-name">${a.name}.</span> ${a.desc}</p>`).join('');

    els.content.innerHTML = `
        <div class="stat-block">
            <h2>${s(data.name)}</h2>
            <div style="font-style:italic;">${s(data.type)}, ${s(data.alignment)}</div>
            <div class="red-line"></div>
            <p class="stat-line"><strong>AC</strong> ${s(data.ca)}</p>
            <p class="stat-line"><strong>HP</strong> ${s(data.hp)}</p>
            <p class="stat-line"><strong>Velocidad</strong> ${s(data.speed)}</p>
            <div class="red-line"></div>
            <div style="display:flex; justify-content:space-between;">${statsHtml}</div>
            <div class="red-line"></div>
            <p class="stat-line"><strong>Desafío</strong> ${s(data.cr)}</p>
            <div class="red-line"></div>
            ${traitsHtml}
            <h3 style="color:#822000; border-bottom:1px solid #822000;">Acciones</h3>
            ${actionsHtml}
            <div style="margin-top:15px; border-top:1px solid #aaa; padding-top:10px; font-style:italic;">${s(data.visual)}</div>
        </div>
    `;

    if(els.btnEdit) els.btnEdit.style.display = 'block';
    if(els.btnExp) els.btnExp.style.display = 'block';
};

// --- EXPORTAR ---
els.btnExp.addEventListener('click', () => {
    if(!currentData) return;
    const json = { name: currentData.name, type: "npc", system: { details: { biography: { value: currentData.visual } }, attributes: { hp: { value: 10, max: 10, formula: currentData.hp } } } }; // Simplificado
    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${currentData.name.replace(/\s+/g, '_')}.json`;
    a.click();
});