const API_URL = "http://localhost:5001/api/mysteries/generate";
let currentData = null;

const els = {
    setting: document.getElementById('setting'),
    difficulty: document.getElementById('difficulty'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    if (!els.setting.value) return alert("Define el escenario del crimen.");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                setting: els.setting.value,
                difficulty: els.difficulty.value
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderMystery(data);
        els.btnExp.style.display = 'block';

        // NO llamar addToHistory() - el endpoint ya guarda en BD
        // Recargar historial para mostrar el nuevo item
        if (typeof loadHistory === 'function') {
            loadHistory();
        }

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

function renderMystery(data) {
    const s = (val) => val || '---';
    
    // Support both English and Spanish keys for backward compatibility
    const title = data.title || data.titulo;
    const crimeEvent = data.crime_event || data.crimen_evento;
    const suspects = data.suspects || data.sospechosos;
    const clues = data.clues || data.pistas;
    const truth = data.truth || data.verdad;

    const suspHtml = (suspects || []).map(sus =>
        `<li style="margin-bottom:5px;"><strong>${(sus.name || sus.nombre)}:</strong> ${(sus.motive || sus.motivo)}</li>`
    ).join('');

    const pistasHtml = (clues || []).map(p =>
        `<li style="margin-bottom:5px;">🔎 ${p}</li>`
    ).join('');

    els.content.innerHTML = `
        <div style="border-bottom:2px solid #34495e; padding-bottom:10px; margin-bottom:15px;">
            <h2 style="color:#2c3e50; margin:0;">${s(title)}</h2>
            <p style="color:#7f8c8d; margin:5px 0;">El Caso: ${s(crimeEvent)}</p>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
            <div style="background:#ecf0f1; padding:15px; border-radius:5px;">
                <h4 style="margin-top:0; color:#c0392b;">👥 Sospechosos</h4>
                <ul style="padding-left:20px; font-size:0.9em;">${suspHtml}</ul>
            </div>
            <div style="background:#ecf0f1; padding:15px; border-radius:5px;">
                <h4 style="margin-top:0; color:#2980b9;">🧩 Pistas Clave</h4>
                <ul style="padding-left:20px; font-size:0.9em;">${pistasHtml}</ul>
            </div>
        </div>

        <div style="border:2px dashed #c0392b; padding:15px; background:#fff; color:#c0392b;">
            <strong style="text-transform:uppercase;">🤫 La Verdad (Solo DM):</strong>
            <p style="margin:10px 0; font-style:italic;">${s(truth)}</p>
        </div>
    `;
}

// Exponer función al window para el historial (sin recursión)
window.renderMystery = renderMystery;

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;
    // Exportar como objeto JSON para notas del DM
    const title = currentData.title || currentData.titulo;
    const blob = new Blob([JSON.stringify(currentData, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Caso_${title.replace(/\s+/g, '_')}.json`;
    a.click();
});