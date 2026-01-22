const API_URL = "http://localhost:5001/api/rules/ask";
let currentData = null;

const els = {
    query: document.getElementById('query'),
    btnAsk: document.getElementById('btnAsk'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnAsk.addEventListener('click', async () => {
    if (!els.query.value) return alert("Escribe una duda.");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnAsk.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ query: els.query.value })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderRule(data);
        els.btnExp.style.display = 'block';

        // Guardamos en historial con un "nombre" generado
        const historyData = { ...data, nombre: data.tema || "Consulta de Reglas" };
        if (typeof addToHistory === 'function') addToHistory(historyData, 'rules');

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnAsk.disabled = false;
    }
});

// Global renderer para el historial (nota: la config usa renderRules pero la función es renderRule)
window.renderRules = function(data) {
    currentData = data;  // Sincronizar con local
    renderRule(data);
};

function renderRule(data) {
    const s = (val) => val || '---';

    els.content.innerHTML = `
        <div class="rule-card">
            <h1 style="color:var(--accent); margin-top:0;">${s(data.tema)}</h1>
            <p style="font-size:1.1em; line-height:1.6;">${s(data.explicacion)}</p>

            ${data.cambio_importante && data.cambio_importante !== 'Sin cambios mayores' ? `
                <div class="change-box">
                    <strong>⚠️ Cambio vs 2014:</strong> ${data.cambio_importante}
                </div>
            ` : ''}

            <h3>Ejemplo Práctico</h3>
            <p style="font-style:italic; color:#555; border-left:3px solid #ccc; padding-left:10px;">
                "${s(data.ejemplo)}"
            </p>

            <div style="margin-top:20px; text-align:right; font-size:0.8em; color:#999;">
                Fuente: ${s(data.pagina_ref)}
            </div>
        </div>
    `;
}

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;

    let text = `--- REGLA: ${currentData.tema} (D&D 2024) ---\n\n`;
    text += `EXPLICACIÓN: ${currentData.explicacion}\n\n`;
    if (currentData.cambio_importante) text += `CAMBIO 2014: ${currentData.cambio_importante}\n\n`;
    text += `EJEMPLO: ${currentData.ejemplo}\n`;

    const blob = new Blob([text], {type : 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Regla_${currentData.tema.replace(/\s+/g, '_')}.txt`;
    a.click();
});