const API_URL = "http://localhost:5001/api/travel/generate";
let currentData = null;

const els = {
    env: document.getElementById('env'),
    days: document.getElementById('days'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    if (!els.env.value) return alert("Describe por dónde viajan.");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                environment: els.env.value,
                days: parseInt(els.days.value)
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderTravel(data);
        els.btnExp.style.display = 'block';

        const historyData = { ...data, nombre: `Viaje: ${els.env.value.substring(0, 20)}...` };
        if (typeof addToHistory === 'function') addToHistory(historyData, 'travel');

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// Global renderer para el historial
function renderTravel(data) {
    currentData = data;  // Sincronizar con global

    const s = (val) => val || '---';

    // Support both English and Spanish keys for backward compatibility
    const events = data.events || data.eventos;
    const generalEnvironment = data.general_environment || data.ambiente_general;
    const dominantClimate = data.dominant_climate || data.clima_dominante;

    // Función para elegir icono según tipo (simple heurística)
    const getIcon = (type) => {
        const t = (type || '').toLowerCase();
        if (t.includes('social') || t.includes('npc')) return '🗣️';
        if (t.includes('clima') || t.includes('weather')) return '⛈️';
        if (t.includes('monstruo') || t.includes('peligro')) return '⚠️';
        if (t.includes('ruina') || t.includes('explor')) return '🏛️';
        return '🎲';
    };

    const eventsHtml = (events || []).map((e, index) => `
        <div class="event-node">
            <div class="event-icon">${getIcon((e.type || e.tipo))}</div>
            <div class="event-content">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0; color:#d35400;">${(e.title || e.titulo)}</h3>
                    <span class="event-type-tag">${(e.type || e.tipo)}</span>
                </div>
                <p style="margin:10px 0; line-height:1.5;">${(e.description || e.descripcion)}</p>

                <div class="interaction-box">
                    <strong>👉 Interacción:</strong> ${(e.interaction || e.interaccion)}<br>
                    ${(e.consequence || e.consecuencia) ? `<small style="color:#c0392b;">⚠️ Si fallan: ${(e.consequence || e.consecuencia)}</small>` : ''}
                </div>
            </div>
        </div>
    `).join('');

    els.content.innerHTML = `
        <div class="travel-header">
            <h2 style="margin:0;">Ruta por ${s(els.env.value)}</h2>
            <p style="margin:5px 0 0 0; opacity:0.9;">${s(dominantClimate)}</p>
        </div>
        <div class="travel-body">
            <p style="font-style:italic; text-align:center; color:#555; margin-bottom:25px;">
                "${s(generalEnvironment)}"
            </p>
            <div class="timeline">
                ${eventsHtml}
            </div>
        </div>
    `;
}

// Hacer la función accesible globalmente para el historial
window.renderTravel = renderTravel;

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;

    const events = currentData.events || currentData.eventos;
    const generalEnvironment = currentData.general_environment || currentData.ambiente_general;
    const dominantClimate = currentData.dominant_climate || currentData.clima_dominante;

    let text = `--- DIARIO DE VIAJE: ${els.env.value} ---\n`;
    text += `AMBIENTE: ${generalEnvironment}\nCLIMA: ${dominantClimate}\n\n`;

    (events || []).forEach((e, i) => {
        text += `[Evento ${i+1}] ${(e.title || e.titulo)} (${(e.type || e.tipo)})\n`;
        text += `Desc: ${(e.description || e.descripcion)}\n`;
        text += `Interacción: ${(e.interaction || e.interaccion)}\n`;
        if(e.consequence || e.consecuencia) text += `Consecuencia: ${(e.consequence || e.consecuencia)}\n`;
        text += `--------------------------\n`;
    });

    const blob = new Blob([text], {type : 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Viaje_${Date.now()}.txt`;
    a.click();
});