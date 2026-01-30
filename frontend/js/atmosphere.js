const API_URL = "http://localhost:5001/api/atmosphere/generate";
let currentData = null;

const els = {
    place: document.getElementById('place'),
    context: document.getElementById('context'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    if (!els.place.value.trim()) return alert("Debes especificar un lugar.");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                place: els.place.value,
                context: els.context.value
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderAtmosphereContent(data);
        els.btnExp.style.display = 'block';

        if (typeof addToHistory === 'function') {
            addToHistory({ 
                ...data, 
                place: els.place.value,
                context: els.context.value,
                nombre: `Atmósfera: ${els.place.value}` 
            }, 'atmosphere');
        }

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// Función interna para renderizar
function renderAtmosphereContent(data) {
    const s = (val) => val || '---';

    els.content.innerHTML = `
        <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); padding:25px; border-radius:8px; border:1px solid #ffcc80; box-shadow:0 4px 10px rgba(255, 111, 0, 0.1);">
            <h2 style="color:#e65100; text-align:center; margin-top:0;">👁️ Descripción Sensorial</h2>

            <div style="background:rgba(255,255,255,0.8); padding:15px; border-radius:5px; margin-bottom:12px;">
                <h4 style="margin:0 0 5px 0; color:#bf360c;">👀 Vista</h4>
                <p style="margin:0; font-style:italic;">${s(data.sight)}</p>
            </div>

            <div style="background:rgba(255,255,255,0.8); padding:15px; border-radius:5px; margin-bottom:12px;">
                <h4 style="margin:0 0 5px 0; color:#bf360c;">🔊 Sonido</h4>
                <p style="margin:0; font-style:italic;">${s(data.sound)}</p>
            </div>

            <div style="background:rgba(255,255,255,0.8); padding:15px; border-radius:5px; margin-bottom:12px;">
                <h4 style="margin:0 0 5px 0; color:#bf360c;">👃 Olfato</h4>
                <p style="margin:0; font-style:italic;">${s(data.smell)}</p>
            </div>

            <div style="background:rgba(255,255,255,0.8); padding:15px; border-radius:5px; margin-bottom:20px;">
                <h4 style="margin:0 0 5px 0; color:#bf360c;">✋ Tacto</h4>
                <p style="margin:0; font-style:italic;">${s(data.touch)}</p>
            </div>

            <div style="border-left:4px solid #ff6f00; padding:15px; background:#fff8e1; color:#e65100;">
                <strong>📖 Descripción Completa (Para Leer en Voz Alta):</strong><br><br>
                ${s(data.atmosphere)}
            </div>
        </div>
    `;
}

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;
    
    let text = `=== EL OJO DEL DIRECTOR ===\n\n`;
    text += `LUGAR: ${els.place.value}\n\n`;
    
    text += `👀 VISTA:\n${currentData.sight}\n\n`;
    text += `🔊 SONIDO:\n${currentData.sound}\n\n`;
    text += `👃 OLFATO:\n${currentData.smell}\n\n`;
    text += `✋ TACTO:\n${currentData.touch}\n\n`;
    text += `📖 DESCRIPCIÓN COMPLETA:\n${currentData.atmosphere}\n`;
    
    const blob = new Blob([text], {type : 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Atmosfera_${els.place.value.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    a.click();
});

// Global renderer para el historial
window.renderAtmosphere = function(data) {
    currentData = data;
    renderAtmosphereContent(data);
};
