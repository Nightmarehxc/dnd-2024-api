const API_URL = "http://localhost:5001/api/characters/generate";
const LIBRARY_URL = "http://localhost:5001/api/library";
let currentData = null;

const els = {
    desc: document.getElementById('desc'),
    level: document.getElementById('level'),
    raceSelect: document.getElementById('raceSelect'),
    classSelect: document.getElementById('classSelect'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader'),
    btnImport: document.getElementById('btnImport'),
    fileInput: document.getElementById('foundryFile'),
    statusDiv: document.getElementById('importStatus')
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch(`${LIBRARY_URL}/options`);
        const data = await res.json();
        if (data.races) data.races.forEach(r => els.raceSelect.add(new Option(r, r)));
        if (data.classes) data.classes.forEach(c => els.classSelect.add(new Option(c, c)));
    } catch (e) { console.error(e); }
});

// --- GENERAR ---
els.btnGen.addEventListener('click', async () => {
    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                description: els.desc.value || "Aventurero",
                level: parseInt(els.level.value) || 1,
                fixed_race: els.raceSelect.value || null,
                fixed_class: els.classSelect.value || null
            })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderCharacterSheet(data);
        els.btnExp.style.display = 'block';
        if (typeof addToHistory === 'function') addToHistory(currentData, 'characters');

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// --- IMPORTAR ---
if (els.btnImport) {
    els.btnImport.addEventListener('click', async () => {
        if (!els.fileInput.files.length) return alert("Selecciona archivo.");
        const formData = new FormData();
        formData.append('file', els.fileInput.files[0]);

        els.statusDiv.innerHTML = `<span style="color:#e67e22;">⏳ Procesando...</span>`;
        els.btnImport.disabled = true;

        try {
            const res = await fetch(`${LIBRARY_URL}/import-foundry`, { method: 'POST', body: formData });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            els.statusDiv.innerHTML = `<span style="color:#27ae60;">✅ Personaje cargado con éxito.</span>`;
            if (data.character) {
                console.log("DATOS HABILIDADES:", data.character.habilidades); // DEBUG
                currentData = data.character;
                renderCharacterSheet(currentData);
                els.btnExp.style.display = 'block';
                if (typeof addToHistory === 'function') addToHistory({...currentData, nombre: currentData.nombre || "Importado"}, 'characters');
            }
        } catch (err) {
            console.error(err);
            els.statusDiv.innerHTML = `<span style="color:#c0392b;">❌ Error (Ver consola)</span>`;
        } finally {
            els.btnImport.disabled = false;
            els.fileInput.value = '';
        }
    });
}

// ==========================================
// ⚔️ RENDERIZADOR HOJA D&D ⚔️
// ==========================================

function getMod(score) { return Math.floor((score - 10) / 2); }
function fmtMod(mod) { return mod >= 0 ? `+${mod}` : mod; }

// Renderer global para el historial
window.renderCharacter = function(data) {
    currentData = data;  // Sincronizar con local
    renderCharacterSheet(data);
};

function renderCharacterSheet(data) {
    const s = (val) => val || '---';

    // 1. Datos básicos
    const raza = data.especie || data.raza || 'Desconocido';
    const clase = data.clase || 'Aventurero';
    // Nivel seguro
    let nivel = data.nivel || 1;
    if (typeof data.clase === 'string') {
        const match = data.clase.match(/(\d+)/);
        if (match) nivel = parseInt(match[0]);
    }
    const prof = Math.ceil(nivel / 4) + 1;

    // 2. Stats
    const statsMap = {
        'Fuerza': 10, 'Destreza': 10, 'Constitución': 10,
        'Inteligencia': 10, 'Sabiduría': 10, 'Carisma': 10
    };
    const rawStats = data.estadisticas || data.stats || {};
    for (let [k, v] of Object.entries(rawStats)) {
        let key = k.toLowerCase();
        if (key.includes('fuer') || key.includes('str')) statsMap['Fuerza'] = v;
        else if (key.includes('dest') || key.includes('dex')) statsMap['Destreza'] = v;
        else if (key.includes('cons') || key.includes('con')) statsMap['Constitución'] = v;
        else if (key.includes('inte') || key.includes('int')) statsMap['Inteligencia'] = v;
        else if (key.includes('sab') || key.includes('wis')) statsMap['Sabiduría'] = v;
        else if (key.includes('car') || key.includes('cha')) statsMap['Carisma'] = v;
    }

    const mods = {};
    for (let [k, v] of Object.entries(statsMap)) mods[k] = getMod(v);

    const hp = (8 + mods['Constitución']) + ((5 + mods['Constitución']) * (nivel - 1));
    const ac = 10 + mods['Destreza'];

    // 3. Habilidades (Lógica V4: Búsqueda flexible)
    const knownSkills = data.habilidades || {};
    const skillList = [
        ['Acrobacias', 'Destreza'], ['Trato Animales', 'Sabiduría'], ['Arcanos', 'Inteligencia'],
        ['Atletismo', 'Fuerza'], ['Engaño', 'Carisma'], ['Historia', 'Inteligencia'],
        ['Perspicacia', 'Sabiduría'], ['Intimidación', 'Carisma'], ['Investigación', 'Inteligencia'],
        ['Medicina', 'Sabiduría'], ['Naturaleza', 'Inteligencia'], ['Percepción', 'Sabiduría'],
        ['Interpretación', 'Carisma'], ['Persuasión', 'Carisma'], ['Religión', 'Inteligencia'],
        ['Juego de Manos', 'Destreza'], ['Sigilo', 'Destreza'], ['Supervivencia', 'Sabiduría']
    ];

    const skillsHtml = skillList.map(([label, statKey]) => {
        let profLevel = 0;

        // Intentamos encontrar la habilidad por nombre exacto ("Sigilo")
        if (knownSkills[label]) profLevel = parseFloat(knownSkills[label]);

        // Si no, buscamos si hay alguna clave que contenga el nombre (para compatibilidad inversa)
        else if (typeof knownSkills === 'object') {
            for(let k in knownSkills) {
                if (k.includes(label)) {
                    profLevel = parseFloat(knownSkills[k]);
                    break;
                }
            }
        }

        let total = mods[statKey];
        let icon = '<span style="color:#ddd;">○</span>';

        if (profLevel >= 1) {
            total += prof;
            icon = '<span style="color:#333;">●</span>';
        }
        if (profLevel >= 2) {
            total += prof; // Expertise (suma proficiencia 2 veces)
            icon = '<span style="color:#f39c12;">🌟</span>';
        }

        return `
            <div class="skill-row">
                <span style="width:25px; text-align:center; font-size:1.1em;">${icon}</span>
                <span style="flex-grow:1;">${label} <small style="color:#999;">(${statKey.substring(0,3)})</small></span>
                <strong>${fmtMod(total)}</strong>
            </div>
        `;
    }).join('');

    // HTML
    els.content.innerHTML = `
        <div class="char-sheet">
            <div class="char-header">
                <div class="char-name">${s(data.nombre)}</div>
                <div style="text-align:right; font-size:0.9em;">
                    Nivel ${nivel} | Bono Prof: <strong>+${prof}</strong>
                </div>
            </div>

            <div class="char-details">
                <div><strong>Raza:</strong> ${s(raza)}</div>
                <div><strong>Clase:</strong> ${s(clase)}</div>
                <div><strong>Fondo:</strong> ${s(data.trasfondo?.nombre || data.trasfondo)}</div>
                <div><strong>Alineamiento:</strong> ${s(data.alineamiento)}</div>
            </div>
            <hr>

            <div class="char-main">
                <div class="ability-scores">
                    ${Object.entries(statsMap).map(([k, v]) => `
                        <div class="ability-box">
                            <div class="ability-label">${k.substring(0,3)}</div>
                            <span class="ability-mod">${fmtMod(getMod(v))}</span>
                            <div class="ability-score">${v}</div>
                        </div>
                    `).join('')}
                </div>

                <div>
                    <div class="combat-stats">
                        <div class="combat-box"><div class="combat-lbl">AC</div><div class="combat-val">🛡️ ${ac}</div></div>
                        <div class="combat-box"><div class="combat-lbl">INIT</div><div class="combat-val">⚡ ${fmtMod(mods['Destreza'])}</div></div>
                        <div class="combat-box"><div class="combat-lbl">HP</div><div class="combat-val">❤️ ${hp}</div></div>
                    </div>
                    <div class="sheet-section skills-list">${skillsHtml}</div>
                </div>

                <div class="sheet-section">
                    <h3>Rasgos y Dotes</h3>
                    <div style="font-size:0.85em; max-height:300px; overflow-y:auto;">
                        ${(data.rasgos || []).map(r => `
                            <div style="margin-bottom:8px; border-bottom:1px solid #eee; padding-bottom:5px;">
                                <strong>${r.nombre}</strong>
                                <div style="color:#555; font-size:0.9em;">${r.descripcion || 'Sin descripción'}</div>
                            </div>
                        `).join('') || '<p>Sin rasgos especiales.</p>'}
                    </div>

                    <h3 style="margin-top:20px;">Inventario</h3>
                    <ul style="padding-left:20px; font-size:0.9em;">
                        ${(data.equipo || data.equipo_destacado || []).map(item => {
                            const name = item.name || item;
                            const qty = item.quantity > 1 ? `x${item.quantity}` : '';
                            const detail = item.detail ? `<span style="color:#888; font-size:0.85em;">(${item.detail})</span>` : '';
                            return `<li>${name} ${qty} ${detail}</li>`;
                        }).join('') || '<li>Mochila vacía</li>'}
                    </ul>
                </div>
            </div>

            <div style="margin-top:20px; font-size:0.9em; border-top:1px solid #eee; padding-top:10px;">
                <strong>Historia:</strong> ${s(data.resumen_historia || data.historia).substring(0, 400)}...
            </div>
        </div>
    `;
}

// --- EXPORT ---
els.btnExp.addEventListener('click', () => {
    if(!currentData) return;
    const json = { name: currentData.nombre, type: "character", img: "icons/svg/mystery-man.svg", system: { details: { biography: { value: currentData.historia } } } };
    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${currentData.nombre.replace(/\s+/g, '_')}_Foundry.json`;
    a.click();
});