const API_URL = "http://localhost:5001/api/alchemy/generate";
let currentData = null;

const els = {
    type: document.getElementById('alcType'),
    rarity: document.getElementById('alcRarity'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ item_type: els.type.value, rarity: els.rarity.value })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderAlchemy(data);
        els.btnExp.style.display = 'block';
        if (typeof addToHistory === 'function') addToHistory({...data, nombre: data.nombre}, 'alchemy');

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// Global renderer para el historial
window.renderAlchemy = function(data) {
    currentData = data;  // Sincronizar con local
    renderAlchemy(data);
};

function renderAlchemy(data) {
    const s = (val) => val || '---';

    els.content.innerHTML = `
        <div style="border: 2px solid #8e44ad; border-radius:8px; padding:20px; background:#fff;">
            <h1 style="color:#8e44ad; margin-top:0; text-align:center;">${s(data.nombre)}</h1>
            <div style="text-align:center; color:#666; font-style:italic; margin-bottom:15px;">
                ${s(data.tipo)} - ${s(data.rareza)}
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:0.9em; background:#f4e7fb; padding:10px; border-radius:5px;">
                <div><strong>👁️ Apariencia:</strong> ${s(data.apariencia)}</div>
                <div><strong>👅 Sabor/Olor:</strong> ${s(data.sabor_olor)}</div>
            </div>

            <h3 style="border-bottom:2px solid #8e44ad; color:#8e44ad;">🧪 Efecto Mecánico</h3>
            <p style="font-size:1.1em; line-height:1.6;">${s(data.efecto_mecanico)}</p>

            ${data.efecto_secundario ? `<p style="font-size:0.9em; color:#d35400;"><strong>⚠️ Efecto Secundario:</strong> ${data.efecto_secundario}</p>` : ''}

            <h4 style="margin-bottom:5px;">🌿 Ingredientes Clave</h4>
            <ul style="margin-top:0;">
                ${(data.ingredientes || []).map(i => `<li>${i}</li>`).join('')}
            </ul>
        </div>
    `;
}

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;
    // Formato Item de Foundry (Simplificado como Consumible)
    const json = {
        name: currentData.nombre,
        type: "consumable",
        system: {
            description: { value: `<p>${currentData.efecto_mecanico}</p><p><em>${currentData.sabor_olor}</em></p>` },
            rarity: currentData.rareza.toLowerCase(),
            consumableType: "potion"
        }
    };
    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${currentData.nombre.replace(/\s+/g, '_')}.json`;
    a.click();
});