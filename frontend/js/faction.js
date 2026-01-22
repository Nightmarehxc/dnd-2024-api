const API_URL = "http://localhost:5001/api/factions/generate";
let currentData = null;

const els = {
    type: document.getElementById('fType'),
    theme: document.getElementById('fTheme'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    if (!els.theme.value) return alert("Indica dónde opera la facción.");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ faction_type: els.type.value, theme: els.theme.value })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderFaction(data);
        els.btnExp.style.display = 'block';
        if (typeof addToHistory === 'function') addToHistory({...data, nombre: data.nombre}, 'factions');

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// Global renderer para el historial
window.renderFaction = function(data) {
    currentData = data;  // Sincronizar con local
    renderFaction(data);
};

function renderFaction(data) {
    const s = (val) => val || '---';
    const leader = data.lider || {};

    els.content.innerHTML = `
        <div style="text-align:center; border-bottom:2px solid #333; padding-bottom:15px; margin-bottom:15px;">
            <h1 style="color:var(--accent); margin:0;">${s(data.nombre)}</h1>
            <p style="font-style:italic; font-family:serif; font-size:1.1em; color:#555;">"${s(data.lema)}"</p>
            <div style="background:#eee; display:inline-block; padding:5px 15px; border-radius:20px; font-size:0.9em;">🛡️ ${s(data.simbolo)}</div>
        </div>

        <p><strong>📍 Descripción:</strong> ${s(data.descripcion)}</p>

        <div style="background:#f9f9f9; padding:15px; border-left:4px solid var(--accent); margin:15px 0;">
            <h3 style="margin-top:0;">👑 Líder: ${s(leader.nombre)}</h3>
            <p style="margin:5px 0;"><strong>Clase:</strong> ${s(leader.clase)} | <strong>Rasgo:</strong> ${s(leader.rasgo)}</p>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
            <div>
                <h4 style="border-bottom:1px solid #ccc;">🎯 Objetivos</h4>
                <p>${s(data.objetivos)}</p>
            </div>
            <div>
                <h4 style="border-bottom:1px solid #ccc;">💰 Recursos</h4>
                <ul style="padding-left:20px;">
                    ${(data.recursos || []).map(r => `<li>${r}</li>`).join('')}
                </ul>
            </div>
        </div>

        <p style="margin-top:20px; text-align:center;">
            <strong>Relación con PJs:</strong> <span style="color:#d35400;">${s(data.relacion_inicial)}</span>
        </p>
    `;
}

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;
    const json = { name: currentData.nombre, type: "journal", pages: [{name: "Info", type: "text", text: { content: els.content.innerHTML, format: 1 }}]};
    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Faccion_${currentData.nombre.replace(/\s+/g, '_')}.json`;
    a.click();
});