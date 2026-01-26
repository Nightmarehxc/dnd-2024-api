const API_URL = "http://localhost:5001/api/quests/generate";
let currentData = null;

const els = {
    loc: document.getElementById('location'),
    lvl: document.getElementById('level'),
    btnGen: document.getElementById('btnGen'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    if (!els.loc.value) return alert("¿Dónde estás buscando misiones?");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                location: els.loc.value,
                level: parseInt(els.lvl.value)
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderQuests(data);

        // Guardar en historial
        const historyData = { ...data, nombre: `Tablón: ${els.loc.value}` };
        if (typeof addToHistory === 'function') addToHistory(historyData, 'quests');

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// Renderer global para el historial
window.renderQuest = function(data) {
    currentData = data;  // Sincronizar con local
    renderQuests(data);
};

function renderQuests(data) {
    const s = (val) => val || '---';

    // Support both English and Spanish keys for backward compatibility
    const quests = data.quests || data.misiones;

    const cardsHtml = (quests || []).map(q => `
        <div class="quest-card">
            <div class="pin"></div>
            <h3 style="margin-top:15px; margin-bottom:5px; color:#8e44ad;">${(q.title || q.titulo)}</h3>
            <p style="font-size:0.9em; color:#555; margin-bottom:10px;">
                <strong>Cliente:</strong> ${(q.client || q.cliente)}
            </p>
            <p style="font-style:italic; font-family:serif; border-bottom:1px dashed #ccc; padding-bottom:10px;">
                "${(q.description || q.descripcion)}"
            </p>
            <p><strong>💰 Recompensa:</strong> ${(q.reward || q.recompensa)}</p>

            <div class="twist-box">
                <strong>👁️ SECRETO (DM):</strong> ${(q.twist || q.giro)}
            </div>
        </div>
    `).join('');

    els.content.innerHTML = `
        <p style="text-align:center; font-style:italic; color:#666;">${s(data.flavor_text)}</p>
        <div class="quest-grid">
            ${cardsHtml}
        </div>
        <p style="text-align:center; margin-top:20px; font-size:0.8em; color:#999;">
            (Pasa el ratón sobre una nota para ver el secreto oculto)
        </p>
    `;
}