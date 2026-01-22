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

        if (typeof addToHistory === 'function') {
            addToHistory({ ...data, nombre: data.titulo }, 'mysteries');
        }

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// Global renderer para el historial
window.renderMystery = function(data) {
    currentData = data;  // Sincronizar con local
    renderMystery(data);
};

function renderMystery(data) {
    const s = (val) => val || '---';
    const suspHtml = (data.sospechosos || []).map(sus =>
        `<li style="margin-bottom:5px;"><strong>${sus.nombre}:</strong> ${sus.motivo}</li>`
    ).join('');

    const pistasHtml = (data.pistas || []).map(p =>
        `<li style="margin-bottom:5px;">🔎 ${p}</li>`
    ).join('');

    els.content.innerHTML = `
        <div style="border-bottom:2px solid #34495e; padding-bottom:10px; margin-bottom:15px;">
            <h2 style="color:#2c3e50; margin:0;">${s(data.titulo)}</h2>
            <p style="color:#7f8c8d; margin:5px 0;">El Caso: ${s(data.crimen_evento)}</p>
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
            <p style="margin:5px 0 0 0;">${s(data.verdad)}</p>
        </div>
    `;
}

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;
    // Exportar como objeto JSON para notas del DM
    const blob = new Blob([JSON.stringify(currentData, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Caso_${currentData.titulo.replace(/\s+/g, '_')}.json`;
    a.click();
});