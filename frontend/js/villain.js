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
        renderVillain(data);
        els.btnExp.style.display = 'block';

        const historyData = { ...data, nombre: data.nombre };
        if (typeof addToHistory === 'function') addToHistory(historyData, 'villains');

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// Global renderer para el historial
window.renderVillain = function(data) {
    currentData = data;  // Sincronizar con local
    renderVillain(data);
};

function renderVillain(data) {
    const s = (val) => val || '---';

    els.content.innerHTML = `
        <div class="villain-header">
            <h1 style="margin:0; color:#e74c3c;">${s(data.nombre)}</h1>
            <p style="margin:5px 0; color:#bdc3c7;">${s(data.arquetipo)}</p>
        </div>
        <div class="villain-body">
            <div class="quote">"${s(data.cita_celebre)}"</div>

            <p><strong>🔥 Motivación:</strong> ${s(data.motivacion)}</p>
            <p><strong>🏰 Guarida:</strong> ${s(data.guarida)}</p>

            <h3 style="border-bottom:2px solid #333;">🗺️ El Plan Maestro</h3>
            <p><em>${s(data.plan_maestro)}</em></p>
            ${(data.fases_plan || []).map(p => `<div class="plan-step">${p}</div>`).join('')}

            <h3 style="border-bottom:2px solid #333; margin-top:20px;">⚔️ Tenientes y Esbirros</h3>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                ${(data.tenientes || []).map(t => `
                    <div class="minion-card">
                        <strong>${t.nombre}</strong> (${t.raza})<br>
                        <span style="font-size:0.9em; color:#666;">${t.rol}</span><br>
                        <small>${t.breve_desc || ''}</small>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;

    // Exportar como Journal Entry para Foundry
    const contentHTML = els.content.innerHTML;

    const json = {
        name: currentData.nombre,
        type: "journal",
        pages: [
            {
                name: "Dossier del Villano",
                type: "text",
                text: { content: contentHTML, format: 1 }
            }
        ]
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Villano_${currentData.nombre.replace(/\s+/g, '_')}.json`;
    a.click();
});