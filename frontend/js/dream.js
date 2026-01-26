const API_URL = "http://localhost:5001/api/dreams/generate";
let currentData = null;

const els = {
    context: document.getElementById('context'),
    tone: document.getElementById('tone'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    if (!els.context.value) return alert("Describe el contexto del personaje.");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                context: els.context.value,
                tone: els.tone.value
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderDreamContent(data);
        els.btnExp.style.display = 'block';

        if (typeof addToHistory === 'function') {
            addToHistory({ ...data, nombre: `Sueño (${els.tone.value})` }, 'dreams');
        }

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// Función interna para renderizar
function renderDreamContent(data) {
    const s = (val) => val || '---';

    // Support both English and Spanish keys for backward compatibility
    const visions = data.visions || data.imagenes;
    const sensations = data.sensations || data.sensaciones;
    const meaning = data.meaning || data.significado;

    els.content.innerHTML = `
        <div style="background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%); padding:25px; border-radius:8px; border:1px solid #d1c4e9; box-shadow:0 4px 10px rgba(103, 58, 183, 0.1);">
            <h2 style="color:#673ab7; text-align:center; margin-top:0;">🌙 Secuencia Onírica</h2>

            <div style="background:rgba(255,255,255,0.7); padding:15px; border-radius:5px; margin-bottom:15px;">
                <h4 style="margin:0 0 5px 0; color:#512da8;">👁️ Visiones</h4>
                <p style="margin:0; font-style:italic;">${s(visions)}</p>
            </div>

            <div style="background:rgba(255,255,255,0.7); padding:15px; border-radius:5px; margin-bottom:20px;">
                <h4 style="margin:0 0 5px 0; color:#512da8;">🧠 Sensaciones</h4>
                <p style="margin:0;">${s(sensations)}</p>
            </div>

            <div style="border-left:4px solid #673ab7; padding:10px 15px; background:#ede7f6; color:#4527a0;">
                <strong>🔮 Significado Oculto (DM):</strong><br>
                ${s(meaning)}
            </div>
        </div>
    `;
}

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;
    const visions = currentData.visions || currentData.imagenes;
    const sensations = currentData.sensations || currentData.sensaciones;
    const meaning = currentData.meaning || currentData.significado;
    
    let text = `--- SUEÑO ---\n VISUAL: ${visions}\n SENSACIÓN: ${sensations}\n\n SIGNIFICADO: ${meaning}`;
    const blob = new Blob([text], {type : 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Sueño_${Date.now()}.txt`;
    a.click();
});

// Global renderer para el historial - SIN recursión
window.renderDream = function(data) {
    currentData = data;
    renderDreamContent(data);
};