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

    // Render Attacks
    let attacksHtml = '';
    if (data.attacks && Array.isArray(data.attacks) && data.attacks.length > 0) {
        attacksHtml = '<div style="background:#fff3cd; padding:10px; border-radius:5px; margin:10px 0; border-left:4px solid #f39c12;"><h3 style="margin:0 0 8px 0; color:#856404;">⚔️ Attacks</h3>';
        data.attacks.forEach(atk => {
            attacksHtml += `
                <div style="margin-bottom:8px; padding:8px; background:white; border-radius:4px; border:1px solid #ffc107;">
                    <strong>${atk.name || 'Attack'}</strong> 
                    <span style="color:#666;">(${atk.type || 'melee'})</span>
                    <br>
                    <span style="font-size:0.9em;">
                        +${atk.bonus || 0} to hit | 
                        <strong>${atk.damage || '1d6'}</strong> ${atk.damage_type || 'physical'} damage
                    </span>
                </div>
            `;
        });
        attacksHtml += '</div>';
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

            ${attacksHtml}

            <div style="background:#ecf0f1; padding:10px; border-radius:5px; margin:10px 0;">
                <p style="margin-bottom:5px;"><strong>🌟 Special Ability:</strong> ${s(data.special_ability)}</p>
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
    
    // Helper function to calculate modifier from ability score
    const calcMod = (score) => Math.floor((score - 10) / 2);
    
    // Build biography HTML
    let bioHtml = '<h2>Personality</h2>';
    if (currentData.personality && typeof currentData.personality === 'object') {
        const p = currentData.personality;
        bioHtml += `<p><strong>Trait:</strong> ${p.trait || ''}</p>`;
        bioHtml += `<p><strong>Ideal:</strong> ${p.ideal || ''}</p>`;
        bioHtml += `<p><strong>Bond:</strong> ${p.bond || ''}</p>`;
        bioHtml += `<p><strong>Flaw:</strong> ${p.flaw || ''}</p>`;
    } else {
        bioHtml += `<p>${currentData.personality || ''}</p>`;
    }
    bioHtml += `<h2>Plot Hook</h2><p>${currentData.plot_hook || ''}</p>`;
    if (currentData.special_ability) {
        bioHtml += `<h2>Special Ability</h2><p>${currentData.special_ability}</p>`;
    }
    
    // Build items array for attacks
    const items = [];
    if (currentData.attacks && Array.isArray(currentData.attacks)) {
        currentData.attacks.forEach((atk, idx) => {
            items.push({
                name: atk.name || `Attack ${idx + 1}`,
                type: "weapon",
                img: "icons/svg/sword.svg",
                system: {
                    description: { value: "" },
                    quantity: 1,
                    weight: 0,
                    equipped: true,
                    identified: true,
                    activation: { type: "action", cost: 1 },
                    range: { value: atk.type === "ranged" ? 150 : 5, units: "ft" },
                    actionType: atk.type === "melee" ? "mwak" : "rwak",
                    attackBonus: (atk.bonus || 0).toString(),
                    damage: { 
                        parts: [[atk.damage || "1d6", atk.damage_type || "bludgeoning"]] 
                    },
                    weaponType: atk.type === "melee" ? "simpleM" : "simpleR"
                }
            });
        });
    }

    // Export in Foundry VTT v13 D&D5e format
    const stats = currentData.stats || {};
    const json = {
        name: currentData.name || "NPC",
        type: "npc",
        img: "icons/svg/mystery-man.svg",
        system: {
            abilities: {
                str: { value: stats.STR || 10, proficient: 0, max: null, mod: calcMod(stats.STR || 10) },
                dex: { value: stats.DEX || 10, proficient: 0, max: null, mod: calcMod(stats.DEX || 10) },
                con: { value: stats.CON || 10, proficient: 0, max: null, mod: calcMod(stats.CON || 10) },
                int: { value: stats.INT || 10, proficient: 0, max: null, mod: calcMod(stats.INT || 10) },
                wis: { value: stats.WIS || 10, proficient: 0, max: null, mod: calcMod(stats.WIS || 10) },
                cha: { value: stats.CHA || 10, proficient: 0, max: null, mod: calcMod(stats.CHA || 10) }
            },
            attributes: {
                ac: { 
                    flat: currentData.ca || 10,
                    calc: "flat",
                    formula: ""
                },
                hp: { 
                    value: currentData.hp || 10, 
                    max: currentData.hp || 10,
                    temp: 0,
                    tempmax: 0,
                    formula: ""
                },
                movement: {
                    walk: currentData.speed || 30,
                    burrow: 0,
                    climb: 0,
                    fly: 0,
                    swim: 0,
                    units: "ft",
                    hover: false
                },
                senses: { darkvision: 0, blindsight: 0, tremorsense: 0, truesight: 0, units: "ft" },
                spellcasting: ""
            },
            details: {
                biography: { value: bioHtml, public: "" },
                alignment: currentData.alignment || "Unaligned",
                race: currentData.race || "",
                type: { value: "humanoid", subtype: "", swarm: "", custom: "" },
                cr: 0,
                spellLevel: 0,
                source: "D&D NPC Generator",
                role: currentData.role || ""
            },
            traits: {
                size: "med",
                di: { value: [], custom: "" },
                dr: { value: [], custom: "" },
                dv: { value: [], custom: "" },
                ci: { value: [], custom: "" },
                languages: { value: ["common"], custom: "" }
            },
            currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 },
            skills: {},
            spells: {},
            bonuses: {}
        },
        items: items,
        effects: [],
        flags: {},
        prototypeToken: {
            name: currentData.name || "NPC",
            displayName: 20,
            actorLink: false,
            width: 1,
            height: 1,
            disposition: 0,
            displayBars: 20,
            bar1: { attribute: "attributes.hp" },
            bar2: { attribute: null }
        }
    };
    
    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(currentData.name || 'npc').replace(/\s+/g, '_')}_foundry.json`;
    a.click();
});