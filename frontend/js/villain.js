const API_URL = "http://localhost:5001/api/villains/generate";
let currentData = null;

const els = {
    theme: document.getElementById('theme'),
    lvl: document.getElementById('levelRange'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    if (!els.theme.value) return alert("Define la temática de la campaña.");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                theme: els.theme.value,
                level_range: els.lvl.value
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderVillainContent(data);
        els.btnExp.style.display = 'block';

        // Recargar historial para mostrar el nuevo villano
        loadVillainHistory();

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

function renderVillainContent(data) {
    const s = (val) => val || '---';

    // Support both English and Spanish keys for backward compatibility
    const name = data.name || data.nombre;
    const archetype = data.archetype || data.arquetipo;
    const race = data.race || data.raza || '---';
    const quote = data.famous_quote || data.cita_celebre;
    const motivation = data.motivation || data.motivacion;
    const lair = data.lair || data.guarida;
    const masterPlan = data.master_plan || data.plan_maestro;
    const planPhases = data.plan_phases || data.fases_plan;
    const lieutenants = data.lieutenants || data.tenientes || (data.habilidades && data.habilidades.lieutenants) || [];
    
    // Stats
    const ca = data.ca || 15;
    const hp = data.hp || 100;
    const speed = data.speed || 30;
    const stats = data.stats || {};
    
    // Combat abilities
    const attacks = data.attacks || [];
    const specialAbilities = data.special_abilities || data.habilidades_especiales || [];
    const legendaryActions = data.legendary_actions || data.acciones_legendarias || [];

    els.content.innerHTML = `
        <div class="villain-header">
            <h1 style="margin:0; color:#e74c3c;">${s(name)}</h1>
            <p style="margin:5px 0; color:#bdc3c7;">${s(archetype)} ${race !== '---' ? `(${race})` : ''}</p>
        </div>
        <div class="villain-body">
            <div class="quote">"${s(quote)}"</div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 15px 0; padding: 15px; background: #f9f9f9; border-radius: 5px;">
                <div><strong>⚔️ CA:</strong> ${ca}</div>
                <div><strong>❤️ HP:</strong> ${hp}</div>
                <div><strong>🏃 Velocidad:</strong> ${speed} ft</div>
            </div>

            ${Object.keys(stats).length > 0 ? `
            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin: 15px 0;">
                ${Object.entries(stats).map(([stat, value]) => {
                    const mod = Math.floor((value - 10) / 2);
                    const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                    return `
                        <div style="text-align: center; padding: 10px; background: #e8e8e8; border-radius: 5px;">
                            <div style="font-weight: bold; font-size: 0.8em;">${stat}</div>
                            <div style="font-size: 1.2em;">${value}</div>
                            <div style="font-size: 0.9em; color: #666;">${modStr}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            ` : ''}

            <p><strong>🔥 Motivación:</strong> ${s(motivation)}</p>
            <p><strong>🏰 Guarida:</strong> ${s(lair)}</p>

            ${attacks.length > 0 ? `
            <h3 style="border-bottom:2px solid #c0392b; margin-top:20px;">⚔️ Ataques</h3>
            ${attacks.map(atk => `
                <div style="background: #ffe6e6; padding: 10px; margin-bottom: 8px; border-left: 3px solid #c0392b; border-radius: 3px;">
                    <strong>${atk.name || '---'}</strong> (${atk.type || 'melee'}): 
                    +${atk.bonus || 0} al golpe, ${atk.damage || '1d6'} de daño ${atk.damage_type || 'físico'}
                </div>
            `).join('')}
            ` : ''}

            ${specialAbilities.length > 0 ? `
            <h3 style="border-bottom:2px solid #8e44ad; margin-top:20px;">✨ Habilidades Especiales</h3>
            ${specialAbilities.map(ability => `
                <div style="background: #f3e6ff; padding: 10px; margin-bottom: 5px; border-left: 3px solid #8e44ad;">
                    ${ability}
                </div>
            `).join('')}
            ` : ''}

            ${legendaryActions.length > 0 ? `
            <h3 style="border-bottom:2px solid #f39c12; margin-top:20px;">👑 Acciones Legendarias</h3>
            <p style="font-size: 0.9em; color: #666; font-style: italic;">El villano puede realizar 3 acciones legendarias por ronda.</p>
            ${legendaryActions.map(action => `
                <div style="background: #fff3cd; padding: 10px; margin-bottom: 5px; border-left: 3px solid #f39c12;">
                    ${action}
                </div>
            `).join('')}
            ` : ''}

            <h3 style="border-bottom:2px solid #333;">🗺️ El Plan Maestro</h3>
            <p><em>${s(masterPlan)}</em></p>
            ${(planPhases || []).map(p => `<div class="plan-step">${p}</div>`).join('')}

            <h3 style="border-bottom:2px solid #333; margin-top:20px;">⚔️ Tenientes y Esbirros</h3>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                ${(lieutenants || []).map(t => `
                    <div class="minion-card">
                        <strong>${(t.name || t.nombre)}</strong> (${(t.race || t.raza)})<br>
                        <span style="font-size:0.9em; color:#666;">${(t.role || t.rol)}</span><br>
                        <small>${(t.brief_description || t.breve_desc || '')}</small>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Exponer renderVillain globalmente para el historial
window.renderVillain = function(data) {
    currentData = data;
    renderVillainContent(data);
};

els.btnExp.addEventListener('click', () => {
    if (!currentData) return;
    
    const name = currentData.name || currentData.nombre;
    const archetype = currentData.archetype || currentData.arquetipo || 'Villano';
    const race = currentData.race || currentData.raza || 'Humanoide';
    const quote = currentData.famous_quote || currentData.cita_celebre || '';
    const motivation = currentData.motivation || currentData.motivacion || '';
    const lair = currentData.lair || currentData.guarida || '';
    const masterPlan = currentData.master_plan || currentData.plan_maestro || '';
    const planPhases = currentData.plan_phases || currentData.fases_plan || [];
    const lieutenants = currentData.lieutenants || currentData.tenientes || [];
    
    // Stats
    const stats = currentData.stats || {};
    const ca = currentData.ca || 15;
    const hp = currentData.hp || 100;
    const speed = currentData.speed || 30;
    
    // Combat abilities
    const attacks = currentData.attacks || [];
    const specialAbilities = currentData.special_abilities || currentData.habilidades_especiales || [];
    const legendaryActions = currentData.legendary_actions || currentData.acciones_legendarias || [];
    
    // Construir biografía HTML
    let biographyHTML = `<h2>${name}</h2>`;
    biographyHTML += `<p><em>"${quote}"</em></p>`;
    biographyHTML += `<p><strong>Arquetipo:</strong> ${archetype}</p>`;
    biographyHTML += `<p><strong>Raza:</strong> ${race}</p>`;
    biographyHTML += `<h3>Motivación</h3><p>${motivation}</p>`;
    biographyHTML += `<h3>Guarida</h3><p>${lair}</p>`;
    biographyHTML += `<h3>Plan Maestro</h3><p>${masterPlan}</p>`;
    if (planPhases.length > 0) {
        biographyHTML += `<ul>${planPhases.map(p => `<li>${p}</li>`).join('')}</ul>`;
    }
    if (lieutenants.length > 0) {
        biographyHTML += `<h3>Tenientes</h3><ul>`;
        lieutenants.forEach(t => {
            const tName = t.name || t.nombre || 'Desconocido';
            const tRace = t.race || t.raza || '';
            const tRole = t.role || t.rol || '';
            const tDesc = t.brief_description || t.breve_desc || '';
            biographyHTML += `<li><strong>${tName}</strong> (${tRace}) - ${tRole}: ${tDesc}</li>`;
        });
        biographyHTML += `</ul>`;
    }
    
    // Mapear stats a formato Foundry
    const abilities = {
        str: { value: stats.STR || stats.FUE || 10 },
        dex: { value: stats.DEX || stats.DES || 10 },
        con: { value: stats.CON || 10 },
        int: { value: stats.INT || 10 },
        wis: { value: stats.WIS || stats.SAB || 10 },
        cha: { value: stats.CHA || stats.CAR || 10 }
    };
    
    // Crear items para ataques
    const items = [];
    attacks.forEach((atk, idx) => {
        const attackItem = {
            name: atk.name || `Ataque ${idx + 1}`,
            type: "weapon",
            system: {
                description: { value: `<p>${atk.type || 'Ataque'}</p>` },
                actionType: atk.type === 'ranged' ? 'rwak' : 'mwak',
                attackBonus: String(atk.bonus || 0),
                damage: {
                    parts: [[atk.damage || '1d6', atk.damage_type || 'bludgeoning']]
                },
                equipped: true,
                activation: { type: 'action', cost: 1 }
            },
            img: "icons/svg/sword.svg"
        };
        items.push(attackItem);
    });
    
    // Agregar habilidades especiales como features
    specialAbilities.forEach((ability, idx) => {
        const featureItem = {
            name: `Habilidad Especial ${idx + 1}`,
            type: "feat",
            system: {
                description: { value: `<p>${ability}</p>` },
                activation: { type: 'special' },
                actionType: 'other'
            },
            img: "icons/svg/aura.svg"
        };
        items.push(featureItem);
    });
    
    // Agregar acciones legendarias
    legendaryActions.forEach((action, idx) => {
        const legendaryItem = {
            name: `Acción Legendaria ${idx + 1}`,
            type: "feat",
            system: {
                description: { value: `<p>${action}</p>` },
                activation: { type: 'legendary', cost: 1 },
                actionType: 'other'
            },
            img: "icons/svg/lightning.svg"
        };
        items.push(legendaryItem);
    });
    
    // Construir el actor de Foundry VTT v13 para D&D 5e
    const foundryActor = {
        name: name,
        type: "npc",
        system: {
            abilities: abilities,
            attributes: {
                ac: { 
                    flat: ca,
                    calc: "flat",
                    formula: ""
                },
                hp: { 
                    value: hp, 
                    max: hp,
                    temp: 0,
                    tempmax: 0,
                    formula: ""
                },
                movement: { 
                    walk: speed,
                    burrow: 0,
                    climb: 0,
                    fly: 0,
                    swim: 0,
                    units: "ft",
                    hover: false
                },
                senses: {
                    darkvision: 0,
                    blindsight: 0,
                    tremorsense: 0,
                    truesight: 0,
                    units: "ft",
                    special: ""
                },
                spellcasting: ""
            },
            details: {
                biography: { 
                    value: biographyHTML,
                    public: ""
                },
                alignment: "",
                race: race,
                type: { 
                    value: archetype.toLowerCase(),
                    subtype: "",
                    swarm: "",
                    custom: ""
                },
                cr: 0,
                spellLevel: 0,
                xp: { value: 0 },
                source: "Generador de Villanos D&D 2024"
            },
            traits: {
                size: "med",
                di: { value: [], custom: "" },
                dr: { value: [], custom: "" },
                dv: { value: [], custom: "" },
                ci: { value: [], custom: "" },
                languages: { value: ["common"], custom: "" }
            },
            currency: {
                pp: 0, gp: 0, ep: 0, sp: 0, cp: 0
            },
            skills: {},
            spells: {},
            bonuses: {},
            resources: {
                legact: {
                    value: legendaryActions.length > 0 ? 3 : 0,
                    max: legendaryActions.length > 0 ? 3 : 0
                },
                legres: { value: 0, max: 0 },
                lair: { value: false, initiative: 20 }
            }
        },
        items: items,
        effects: [],
        flags: {},
        img: "icons/svg/mystery-man.svg",
        token: {
            name: name,
            displayName: 20,
            actorLink: false,
            width: 1,
            height: 1,
            texture: {
                src: "icons/svg/mystery-man.svg",
                scaleX: 1,
                scaleY: 1
            },
            sight: {
                enabled: false,
                range: 0,
                angle: 360,
                visionMode: "basic"
            },
            detectionModes: [],
            bar1: { attribute: "attributes.hp" },
            bar2: { attribute: null },
            displayBars: 20
        },
        prototypeToken: {
            name: name,
            displayName: 20,
            actorLink: false,
            width: 1,
            height: 1,
            texture: {
                src: "icons/svg/mystery-man.svg",
                scaleX: 1,
                scaleY: 1
            }
        }
    };

    const blob = new Blob([JSON.stringify(foundryActor, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Villano_${name.replace(/\s+/g, '_')}_Foundry.json`;
    a.click();
});

// ========================================
// HISTORIAL PERSONALIZADO (desde BD)
// ========================================
async function loadVillainHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    try {
        const res = await fetch('http://localhost:5001/api/villains/list');
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const villains = await res.json();
        
        historyList.innerHTML = '';
        if (!villains || villains.length === 0) {
            historyList.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px; font-size:0.9em;">Sin registros</p>';
            return;
        }
        
        villains.forEach(villain => {
            const div = document.createElement('div');
            div.className = 'history-item';
            const dateStr = villain.created_at ? new Date(villain.created_at).toLocaleDateString() : 'Sin fecha';
            div.innerHTML = `
                <div class="history-info" onclick="loadVillainById(${villain.id})">
                    <span class="h-icon">😈</span>
                    <div class="h-details">
                        <div class="h-name">${villain.name}</div>
                        <div class="h-date">${dateStr}</div>
                    </div>
                </div>
                <button class="h-delete" onclick="deleteVillain(event, ${villain.id})" title="Borrar">×</button>
            `;
            historyList.appendChild(div);
        });
    } catch (err) {
        console.error('Error cargando historial:', err);
        historyList.innerHTML = `<p style="color:red; text-align:center; font-size:0.8em; padding: 10px;">
            Error: ${err.message}<br>
            <small>¿Está el servidor ejecutándose?</small>
        </p>`;
    }
}

async function loadVillainById(id) {
    try {
        const res = await fetch(`http://localhost:5001/api/villains/${id}`);
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);
        
        currentData = data;
        renderVillainContent(data);
        els.btnExp.style.display = 'block';
    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    }
}

async function deleteVillain(event, id) {
    event.stopPropagation();
    if (!confirm('¿Eliminar este villano?')) return;
    
    try {
        const res = await fetch(`http://localhost:5001/api/villains/${id}`, {
            method: 'DELETE'
        });
        
        if (res.ok) {
            loadVillainHistory();
        }
    } catch (err) {
        alert('Error eliminando villano');
    }
}

// Exponer funciones globalmente
window.loadVillainById = loadVillainById;
window.deleteVillain = deleteVillain;

// Cargar historial al inicio
loadVillainHistory();