// CONFIGURACIÓN
const API_URL = "http://localhost:5001/api";
let currentMode = 'character';
let currentData = null;

// ELEMENTOS DOM
const els = {
    title: document.getElementById('panelTitle'),
    desc: document.getElementById('description'),
    levelGroup: document.getElementById('levelGroup'),
    level: document.getElementById('level'),
    btnGen: document.getElementById('btnGenerate'),
    btnExp: document.getElementById('btnExport'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader'),
    menuBtns: document.querySelectorAll('.menu-btn')
};

// --- SIDEBAR ---
function setMode(mode) {
    currentMode = mode;
    els.menuBtns.forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    els.btnExp.style.display = 'none';
    els.content.innerHTML = '<div style="text-align:center; margin-top:150px; color:#aaa;">Listo para generar.</div>';

    if (mode === 'character') {
        els.title.innerText = "Generador de Personajes";
        els.desc.placeholder = "Ej: Un bardo tiefling del colegio del valor...";
        els.levelGroup.style.display = 'block';
    } else if (mode === 'npc') {
        els.title.innerText = "Generador de NPCs (Combate)";
        els.desc.placeholder = "Ej: Un jefe bandido orco muy fuerte...";
        els.levelGroup.style.display = 'none';
    } else if (mode === 'item') {
        els.title.innerText = "Generador de Objetos";
        els.desc.placeholder = "Ej: Una espada legendaria de hielo...";
        els.levelGroup.style.display = 'none';
    }
}

// --- GENERAR ---
els.btnGen.addEventListener('click', async () => {
    const description = els.desc.value;
    if (!description) return alert("Por favor, escribe una descripción.");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    let payload = { description: description };
    let endpoint = '';

    if (currentMode === 'character') {
        endpoint = '/characters/generate';
        payload.level = parseInt(els.level.value);
    } else if (currentMode === 'npc') {
        endpoint = '/npcs/generate';
    } else {
        endpoint = '/items/generate';
        payload.type = "Cualquiera";
    }

    try {
        const response = await fetch(API_URL + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // MANEJO DE ERRORES MEJORADO
        if (data.error) {
            els.content.innerHTML = `<div style="color:var(--accent); text-align:center;">
                <h3>⚠️ Error Arcano</h3>
                <p>${data.error}</p>
                ${data.raw_content ? `<small>La IA devolvió: ${data.raw_content.substring(0, 100)}...</small>` : ''}
            </div>`;
        } else if (response.ok) {
            currentData = { ...data, genType: currentMode };
            renderResult(data);
            els.btnExp.style.display = 'block';
        }

    } catch (error) {
        els.content.innerHTML = `<p style="color:var(--accent)">Error de conexión: ${error.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// --- RENDERIZADO VISUAL ---
function renderResult(data) {
    const safe = (val) => val || '---';
    let html = '';

    if (currentMode === 'npc') {
        // MODO NPC AVANZADO (Stats y Ataques)
        html = `
            <div class="sheet-header">
                <h1 class="sheet-title">${safe(data.nombre)}</h1>
                <div class="sheet-subtitle">${safe(data.raza)} - ${safe(data.rol)}</div>
            </div>

            <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px;">
                <div class="stat-box"><span class="stat-label">CA</span><span class="stat-value">🛡️ ${data.ca || 10}</span></div>
                <div class="stat-box"><span class="stat-label">HP</span><span class="stat-value">❤️ ${data.hp || 10}</span></div>
                <div class="stat-box"><span class="stat-label">Velocidad</span><span class="stat-value">🦶 ${data.velocidad || 30}</span></div>
            </div>

            <div class="stats-grid">
                ${data.estadisticas ? Object.entries(data.estadisticas).map(([k, v]) => `
                    <div class="stat-box"><span class="stat-label">${k}</span><span class="stat-value">${v}</span></div>
                `).join('') : ''}
            </div>

            <h3 class="section-title">Ataques</h3>
            ${data.ataques && data.ataques.length > 0 ? data.ataques.map(atk => `
                <div style="background:#fff; padding:10px; margin-bottom:5px; border:1px solid #ccc; border-radius:4px;">
                    <strong>${atk.nombre}</strong> <span style="font-size:0.8em">(${atk.tipo})</span><br>
                    ⚔️ +${atk.bonificador_ataque} | 💥 ${atk.formula_dano} ${atk.tipo_dano}
                </div>
            `).join('') : '<p>No tiene ataques.</p>'}

            <h3 class="section-title">Detalles</h3>
            <p><strong>Personalidad:</strong> ${safe(data.personalidad?.rasgo)}</p>
            <p><strong>Gancho:</strong> ${safe(data.gancho_trama)}</p>
        `;
    } else if (currentMode === 'item') {
        // MODO ITEM
        html = `
            <div class="sheet-header">
                <h1 class="sheet-title">${safe(data.nombre)}</h1>
                <div class="sheet-subtitle">${safe(data.rareza)} - ${safe(data.tipo)}</div>
            </div>
            ${data.weapon_mastery ? `<span class="tag mastery">⚔️ Mastery: ${data.weapon_mastery}</span>` : ''}
            ${data.dano ? `<span class="tag damage">💥 ${data.dano.formula} ${data.dano.tipo}</span>` : ''}
            <h3 class="section-title">Mecánica</h3>
            <p>${safe(data.efecto_mecanico)}</p>
            <h3 class="section-title">Descripción</h3>
            <p style="font-style:italic;">${safe(data.descripcion_vis)}</p>
        `;
    } else {
        // MODO PERSONAJE
        html = `
            <div class="sheet-header">
                <h1 class="sheet-title">${safe(data.nombre)}</h1>
                <div class="sheet-subtitle">Nivel ${data.nivel} ${data.especie} ${data.clase}</div>
            </div>
            <div class="stats-grid">
                ${data.estadisticas ? Object.entries(data.estadisticas).map(([k, v]) => `
                    <div class="stat-box"><span class="stat-label">${k}</span><span class="stat-value">${v}</span></div>
                `).join('') : ''}
            </div>
            <h3 class="section-title">Trasfondo</h3>
            <p>${safe(data.trasfondo?.nombre)}</p>
            <h3 class="section-title">Historia</h3>
            <p>${safe(data.resumen_historia)}</p>
        `;
    }
    els.content.innerHTML = html;
}

// --- EXPORTACIÓN FOUNDRY VTT ---
function exportToFoundry() {
    if (!currentData) return;

    let foundryJSON = {
        "name": currentData.nombre,
        "img": "icons/svg/mystery-man.svg",
        "system": {}
    };

    if (currentData.genType === 'npc') {
        foundryJSON.type = "npc";

        // 1. Mapeo de Atributos
        const statsMap = { "FUE": "str", "DES": "dex", "CON": "con", "INT": "int", "SAB": "wis", "CAR": "cha" };
        let abilities = {};
        if (currentData.estadisticas) {
            for (const [key, val] of Object.entries(currentData.estadisticas)) {
                if (statsMap[key]) abilities[statsMap[key]] = { "value": val, "proficient": 0 };
            }
        }

        foundryJSON.system = {
            "abilities": abilities,
            "attributes": {
                "ac": { "value": currentData.ca || 10, "calc": "natural" },
                "hp": { "value": currentData.hp || 10, "max": currentData.hp || 10, "formula": "" },
                "movement": { "walk": currentData.velocidad || 30 }
            },
            "details": {
                "alignment": currentData.alineamiento || "Neutral",
                "biography": { "value": `<p>${currentData.gancho_trama}</p>` },
                "race": currentData.raza,
                "type": { "value": "humanoid" },
                "cr": 1
            }
        };

        // 2. ITEMS (Ataques) para Foundry
        foundryJSON.items = [];
        if (currentData.ataques) {
            currentData.ataques.forEach(atk => {
                foundryJSON.items.push({
                    "name": atk.nombre,
                    "type": "weapon",
                    "img": "icons/svg/sword.svg",
                    "system": {
                        "actionType": atk.tipo === 'ranged' ? 'rwak' : 'mwak',
                        "damage": {
                            "parts": [[atk.formula_dano + " + @mod", atk.tipo_dano.toLowerCase()]]
                        },
                        "equipped": true,
                        "activation": { "type": "action", "cost": 1 }
                    }
                });
            });
        }

    } else if (currentData.genType === 'item') {
        // Exportación de ITEMS
        const isWeapon = (currentData.tipo || "").toLowerCase().includes('arma') || !!currentData.dano;
        foundryJSON.type = isWeapon ? "weapon" : "equipment";
        foundryJSON.img = isWeapon ? "icons/svg/sword.svg" : "icons/svg/item-bag.svg";

        foundryJSON.system = {
            "description": { "value": `<p>${currentData.descripcion_vis}</p><hr><p>${currentData.efecto_mecanico}</p>` },
            "rarity": (currentData.rareza || "common").toLowerCase().split(' ')[0],
            "equipped": true,
            "identified": true
        };

        if (isWeapon && currentData.dano) {
            foundryJSON.system.actionType = "mwak";
            foundryJSON.system.damage = {
                "parts": [[currentData.dano.formula + " + @mod", currentData.dano.tipo]]
            };
        }
    } else {
        // Exportación de Personaje
        foundryJSON.type = "character";
        foundryJSON.system = { "details": { "biography": { "value": currentData.resumen_historia }, "race": currentData.especie } };
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(foundryJSON, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${currentData.nombre.replace(/\s+/g, '_')}_Foundry.json`;
    document.body.appendChild(a); a.click(); a.remove();
}