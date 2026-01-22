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

    // Inputs del editor
    eName: document.getElementById('editName'),
    eRace: document.getElementById('editRace'),
    eJob: document.getElementById('editJob'),
    eApp: document.getElementById('editApp'), // Nota: El JSON no tiene campo "apariencia" explícito, se usará descripción general
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

    // Construimos una descripción para que el backend entienda el contexto
    const descriptionPrompt = `${els.race.value || 'Cualquier raza'} ${els.job.value || 'Cualquier oficio'}`.trim();

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            // El backend (npcs.py) espera "description"
            body: JSON.stringify({ description: descriptionPrompt })
        });

        const data = await res.json();
        console.log('🔴 RESPUESTA CRUDA DEL API:', data);  // DEBUG CRÍTICO
        console.log('¿Contiene rol?', 'rol' in data);  // DEBUG
        console.log('¿Contiene nombre?', 'nombre' in data);  // DEBUG
        
        if (data.error) throw new Error(data.error);

        console.log('🎭 NPC generado:', data);  // DEBUG
        currentData = data;
        window.renderNPC(data);
        if (typeof addToHistory === 'function') {
            console.log('📝 Guardando en historial...', data);  // DEBUG
            addToHistory(currentData, 'npcs');
        }

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
        console.error(err);
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// --- EDITAR ---
els.btnEdit.addEventListener('click', () => {
    if(!currentData) return;

    // Map English keys to edit form
    els.eName.value = currentData.name || "";
    els.eRace.value = currentData.race || "";
    els.eJob.value = currentData.role || "";

    // Special ability field
    els.eApp.value = currentData.special_ability || "";

    // Convert personality object to plain text for editing
    if (currentData.personality && typeof currentData.personality === 'object') {
        const p = currentData.personality;
        els.ePers.value = `Trait: ${p.trait || ''}\nIdeal: ${p.ideal || ''}\nBond: ${p.bond || ''}\nFlaw: ${p.flaw || ''}`;
    } else {
        els.ePers.value = currentData.personality || "";
    }

    els.eSecret.value = currentData.plot_hook || "";

    els.content.style.display = 'none';
    els.editorContainer.style.display = 'block';
});

els.btnCancel.addEventListener('click', () => {
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';
});

els.btnSave.addEventListener('click', () => {
    // Update object locally with English keys
    const newData = {
        ...currentData,
        name: els.eName.value,
        race: els.eRace.value,
        role: els.eJob.value,
        special_ability: els.eApp.value,
        personality: els.ePers.value,
        plot_hook: els.eSecret.value
    };

    currentData = newData;
    window.renderNPC(currentData);
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';

    if (currentData._db_id && typeof updateHistoryItem === 'function') {
        updateHistoryItem(currentData._db_id, currentData);
    } else if (typeof addToHistory === 'function') {
        addToHistory(currentData, 'npcs');
    }
});

// --- RENDERIZAR ---
window.renderNPC = function(data) {
    // 🔑 IMPORTANTE: Actualizar currentData local para que funcione editar/exportar
    currentData = data;
    
    const s = (val) => val || '---';

    // Render personality (can be object or string)
    let personalityHtml = '';
    if (data.personality && typeof data.personality === 'object') {
        personalityHtml = `
            <ul style="margin:0; padding-left:20px;">
                <li><strong>Trait:</strong> ${data.personality.trait || '---'}</li>
                <li><strong>Ideal:</strong> ${data.personality.ideal || '---'}</li>
                <li><strong>Bond:</strong> ${data.personality.bond || '---'}</li>
                <li><strong>Flaw:</strong> ${data.personality.flaw || '---'}</li>
            </ul>
        `;
    } else {
        personalityHtml = s(data.personality);
    }

    // Render Stats if they exist
    let statsHtml = '';
    if (data.stats) {
        const st = data.stats;
        statsHtml = `
            <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:5px; text-align:center; background:#fff; padding:5px; border-radius:4px; margin: 10px 0; font-size:0.8em;">
                <div><strong>STR</strong><br>${st.STR}</div>
                <div><strong>DEX</strong><br>${st.DEX}</div>
                <div><strong>CON</strong><br>${st.CON}</div>
                <div><strong>INT</strong><br>${st.INT}</div>
                <div><strong>WIS</strong><br>${st.WIS}</div>
                <div><strong>CHA</strong><br>${st.CHA}</div>
            </div>
        `;
    }

    els.content.innerHTML = `
        <div class="npc-card">
            <h2 style="color:#2c3e50; border-bottom:2px solid #3498db; margin-bottom:5px;">${s(data.name)}</h2>

            <div style="display:flex; justify-content:space-between; align-items:center; color:#555;">
                <span><strong>${s(data.race)}</strong> - <em>${s(data.role)}</em></span>
                <span style="font-size:0.9em;">Alignment: ${s(data.alignment)}</span>
            </div>

            <div style="display:flex; gap:10px; margin-top:10px;">
                <span style="background:#e74c3c; color:white; padding:3px 8px; border-radius:4px; font-weight:bold;">HP: ${data.hp || '?'}</span>
                <span style="background:#3498db; color:white; padding:3px 8px; border-radius:4px; font-weight:bold;">CA: ${data.ca || '?'}</span>
                <span style="background:#f39c12; color:white; padding:3px 8px; border-radius:4px; font-weight:bold;">Speed: ${data.speed || '?'} ft</span>
            </div>

            ${statsHtml}

            <div style="background:#ecf0f1; padding:10px; border-radius:5px; margin:10px 0;">
                <p style="margin-bottom:5px;"><strong>Special Ability:</strong> ${s(data.special_ability)}</p>
                <div style="border-top:1px solid #ccc; padding-top:5px; margin-top:5px;">
                    <strong>Personality:</strong>
                    ${personalityHtml}
                </div>
            </div>

            <p style="color:#c0392b; background:#fadbd8; padding:8px; border-radius:4px;">
                <strong>Plot Hook:</strong> ${s(data.plot_hook)}
            </p>
        </div>
    `;

    if(els.btnEdit) els.btnEdit.style.display = 'block';
    if(els.btnExp) els.btnExp.style.display = 'block';
};

// --- EXPORTAR ---
els.btnExp.addEventListener('click', () => {
    if(!currentData) return;
    // Export in Foundry VTT standard or generic format
    const json = {
        name: currentData.name,
        type: "npc",
        system: {
            details: {
                biography: { value: JSON.stringify(currentData.personality) },
                race: currentData.race
            },
            attributes: {
                hp: { value: currentData.hp, max: currentData.hp },
                ac: { value: currentData.ca }
            }
        }
    };
    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${currentData.name.replace(/\s+/g, '_')}.json`;
    a.click();
});