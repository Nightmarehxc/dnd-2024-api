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
        renderRuleInternal(data);
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

// Global renderer para el historial (compatible con singular y plural)
window.renderRules = function(data) {
    currentData = data;  // Sincronizar con local
    renderRuleInternal(data);
};

// Alias para compatibilidad
window.renderRule = function(data) {
    currentData = data;
    renderRuleInternal(data);
};

function renderRuleInternal(data) {
    const s = (val) => val || '---';
    
    // Support both English and Spanish keys for backward compatibility
    const topic = data.topic || data.tema;
    const explanation = data.explanation || data.explicacion;
    const majorChange = data.important_change || data.cambio_importante || data.major_change;
    const example = data.example || data.ejemplo;
    const pageRef = data.page_reference || data.pagina_ref;

    els.content.innerHTML = `
        <div class="rule-card">
            <h1 style="color:var(--accent); margin-top:0;">${s(topic)}</h1>
            <p style="font-size:1.1em; line-height:1.6;">${s(explanation)}</p>

            ${majorChange && majorChange !== 'Sin cambios mayores' ? `
                <div class="change-box">
                    <strong>⚠️ Cambio vs 2014:</strong> ${majorChange}
                </div>
            ` : ''}

            <h3>Ejemplo Práctico</h3>
            <p style="font-style:italic; color:#555; border-left:3px solid #ccc; padding-left:10px;">
                "${s(example)}"
            </p>

            <div style="margin-top:20px; text-align:right; font-size:0.8em; color:#999;">
                Fuente: ${s(pageRef)}
            </div>
        </div>
    `;
}

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;
    
    // Support both English and Spanish keys for backward compatibility
    const topic = currentData.topic || currentData.tema;
    const explanation = currentData.explanation || currentData.explicacion;
    const majorChange = currentData.important_change || currentData.cambio_importante || currentData.major_change;
    const example = currentData.example || currentData.ejemplo;

    let text = `--- REGLA: ${topic} (D&D 2024) ---\n\n`;
    text += `EXPLICACIÓN: ${explanation}\n\n`;
    if (majorChange) text += `CAMBIO 2014: ${majorChange}\n\n`;
    text += `EJEMPLO: ${example}\n`;

    const blob = new Blob([text], {type : 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Regla_${topic.replace(/\s+/g, '_')}.txt`;
    a.click();
});