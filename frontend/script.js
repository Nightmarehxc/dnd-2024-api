// CONFIGURACIÓN
const API_URL = "http://localhost:5001/api";
let currentMode = 'character'; // Modo por defecto
let currentData = null;        // Almacena el último JSON generado

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

// --- FUNCIÓN DE CAMBIO DE MODO (SIDEBAR) ---
function setMode(mode) {
    currentMode = mode;

    // 1. Actualizar Botones del Menú (Estilo activo)
    els.menuBtns.forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active'); // El botón clickeado

    // 2. Actualizar UI
    els.btnExp.style.display = 'none'; // Ocultar exportar al cambiar
    els.content.innerHTML = '<div style="text-align:center; margin-top:150px; color:#aaa;">Listo para generar.</div>';

    if (mode === 'character') {
        els.title.innerText = "Generador de Personajes";
        els.desc.placeholder = "Ej: Un bardo tiefling del colegio del valor...";
        els.levelGroup.style.display = 'block';
    } else if (mode === 'npc') {
        els.title.innerText = "Generador de NPCs";
        els.desc.placeholder = "Ej: Un vendedor de pociones sospechoso...";
        els.levelGroup.style.display = 'none';
    } else if (mode === 'item') {
        els.title.innerText = "Generador de Objetos";
        els.desc.placeholder = "Ej: Una espada legendaria de hielo...";
        els.levelGroup.style.display = 'none';
    }
}

// --- FUNCIÓN PRINCIPAL: GENERAR ---
els.btnGen.addEventListener('click', async () => {
    const description = els.desc.value;
    if (!description) return alert("Por favor, escribe una descripción.");

    // Preparar UI
    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    // Preparar Payload
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

        if (response.ok) {
            currentData = { ...data, genType: currentMode };
            renderResult(data);
            els.btnExp.style.display = 'block';
        } else {
            els.content.innerHTML = `<p style="color:var(--accent)">Error: ${data.error || 'Desconocido'}</p>`;
        }

    } catch (error) {
        els.content.innerHTML = `<p style="color:var(--accent)">Error de conexión: ${error.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// --- RENDERIZADO DE RESULTADOS ---
function renderResult(data) {
    const safe = (val) => val || '---';
    let html = '';

    if (currentMode === 'item') {
        html = `
            <div class="sheet-header">
                <h1 class="sheet-title">${safe(data.nombre)}</h1>
                <div class="sheet-subtitle">${safe(data.rareza)} - ${safe(data.tipo)}</div>
            </div>

            <div style="margin-bottom: 20px;">
                ${data.weapon_mastery ? `<span class="tag mastery">⚔️ Mastery: ${data.weapon_mastery}</span>` : ''}
                ${data.dano ? `<span class="tag damage">💥 ${data.dano.formula} ${data.dano.tipo}</span>` : ''}
            </div>

            <h3 class="section-title">Mecánica</h3>
            <p>${safe(data.efecto_mecanico)}</p>

            <h3 class="section-title">Descripción</h3>
            <p style="font-style:italic;">${safe(data.descripcion_vis)}</p>
        `;
    } else if (currentMode === 'npc') {
        html = `
            <div class="sheet-header">
                <h1 class="sheet-title">${safe(data.nombre)}</h1>
                <div class="sheet-subtitle">${safe(data.raza)} - ${safe(data.rol)}</div>
            </div>

            <h3 class="section-title">Personalidad</h3>
            <p><strong>Ideal:</strong> ${safe(data.personalidad?.ideal)}</p>
            <p><strong>Vínculo:</strong> ${safe(data.personalidad?.vinculo)}</p>
            <p><strong>Defecto:</strong> ${safe(data.personalidad?.defecto)}</p>

            <h3 class="section-title">Gancho de Trama</h3>
            <p>${safe(data.gancho_trama)}</p>
        `;
    } else { // Character
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

            <h3 class="section-title">Trasfondo: ${safe(data.trasfondo?.nombre)}</h3>
            <p><strong>Origin Feat:</strong> ${safe(data.trasfondo?.origin_feat)}</p>

            <h3 class="section-title">Historia</h3>
            <p>${safe(data.resumen_historia)}</p>
        `;
    }

    els.content.innerHTML = html;
}

// --- EXPORTAR A FOUNDRY ---
function exportToFoundry() {
    if (!currentData) return;

    // Objeto base
    let foundryJSON = {
        "name": currentData.nombre,
        "img": "icons/svg/item-bag.svg",
        "system": {}
    };

    if (currentData.genType === 'item') {
        const isWeapon = (currentData.tipo || "").toLowerCase().includes('arma') || !!currentData.dano;
        foundryJSON.type = isWeapon ? "weapon" : "equipment";
        foundryJSON.img = isWeapon ? "icons/svg/sword.svg" : "icons/svg/item-bag.svg";

        foundryJSON.system = {
            "description": {
                "value": `<p>${currentData.descripcion_vis}</p><hr><p>${currentData.efecto_mecanico}</p>`
            },
            "rarity": (currentData.rareza || "common").toLowerCase().split(' ')[0],
            "equipped": true,
            "identified": true
        };

        if (isWeapon && currentData.dano) {
            foundryJSON.system.actionType = "mwak";
            foundryJSON.system.damage = {
                "parts": [[currentData.dano.formula + " + @mod", currentData.dano.tipo]],
            };
        }

    } else if (currentData.genType === 'npc') {
        foundryJSON.type = "npc";
        foundryJSON.img = "icons/svg/mystery-man.svg";
        foundryJSON.system = { "details": { "biography": { "value": currentData.gancho_trama }, "race": currentData.raza } };
    } else {
        foundryJSON.type = "character";
        foundryJSON.img = "icons/svg/mystery-man.svg";
        foundryJSON.system = { "details": { "biography": { "value": currentData.resumen_historia }, "race": currentData.especie } };
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(foundryJSON, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${currentData.nombre.replace(/\s+/g, '_')}_Foundry.json`;
    document.body.appendChild(a); a.click(); a.remove();
}