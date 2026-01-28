const API_URL = "http://localhost:5001/api/encounters/generate";
let currentData = null;

const els = {
    env: document.getElementById('environment'),
    level: document.getElementById('level'),
    players: document.getElementById('players'),
    diff: document.getElementById('difficulty'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    if (!els.env.value) return alert("Define el entorno del combate.");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                environment: els.env.value,
                level: parseInt(els.level.value),
                players: parseInt(els.players.value),
                difficulty: els.diff.value
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderEncounter(data);
        els.btnExp.style.display = 'block';

        if (typeof addToHistory === 'function') addToHistory(data, 'encounters');

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

function renderEncounter(data) {
    currentData = data;  // Sincronizar con local
    const s = (val) => val || '---';

    // Support both English and Spanish keys for backward compatibility
    const title = data.title || data.titulo;
    const summary = data.summary || data.resumen;
    const monsters = data.monsters || data.monstruos;
    const tactics = data.tactics || data.tacticas;
    const terrain = data.terrain || data.terreno;
    const loot = data.loot || data.tesoro_botin;

    let monstersHtml = (monsters || []).map(m => `
        <div style="display:flex; justify-content:space-between; padding:5px; border-bottom:1px solid #eee;">
            <span><strong>${(m.quantity || m.cantidad)}x ${(m.name || m.nombre)}</strong> (${(m.role || m.rol)})</span>
            <span style="background:#eee; padding:0 5px; border-radius:4px; font-size:0.9em;">CR ${(m.cr)} | HP ${(m.hp)}</span>
        </div>
    `).join('');

    let tacticsHtml = (tactics || []).map(t => `<li style="margin-bottom:5px;">${t}</li>`).join('');

    let terrainHtml = (terrain || []).map(t => `
        <div style="background:#fff3e0; border-left:4px solid #e67e22; padding:10px; margin-bottom:10px;">
            <strong>${(t.element || t.elemento)}</strong>
            <p style="margin:5px 0 0 0; font-size:0.9em;">${(t.rule || t.regla)}</p>
        </div>
    `).join('');

    els.content.innerHTML = `
        <h1 style="color:var(--accent); text-align:center; margin-bottom:5px;">${s(title)}</h1>
        <p style="text-align:center; font-style:italic; color:#666;">${s(summary)}</p>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-top:20px;">
            <div>
                <h3 style="border-bottom:2px solid var(--accent); padding-bottom:5px;">👾 Enemigos</h3>
                <div style="background:white; border:1px solid #ddd; padding:10px; border-radius:5px;">
                    ${monstersHtml}
                </div>

                <h3 style="margin-top:20px;">💰 Botín</h3>
                <p>${s(loot)}</p>
            </div>

            <div>
                <h3 style="border-bottom:2px solid var(--accent); padding-bottom:5px;">🧠 Tácticas</h3>
                <ul style="padding-left:20px;">${tacticsHtml}</ul>

                <h3 style="margin-top:20px;">🌍 Terreno Interactivo</h3>
                ${terrainHtml}
            </div>
        </div>
    `;
}

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;
    const contentHTML = els.content.innerHTML;
    const title = currentData.title || currentData.titulo;

    const json = {
        name: title,
        type: "journal",
        pages: [
            {
                name: "Plan de Batalla",
                type: "text",
                text: { content: contentHTML, format: 1 }
            }
        ]
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Encounter_${title.replace(/\s+/g, '_')}.json`;
    a.click();
});

// Exportar renderer al scope global para el historial
window.renderEncounter = renderEncounter;