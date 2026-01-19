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
        if (typeof addToHistory === 'function') addToHistory(historyData);

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

function renderTravel(data) {
    const s = (val) => val || '---';

    // Función para elegir icono según tipo (simple heurística)
    const getIcon = (type) => {
        const t = type.toLowerCase();
        if (t.includes('social') || t.includes('npc')) return '🗣️';
        if (t.includes('clima') || t.includes('weather')) return '⛈️';
        if (t.includes('monstruo') || t.includes('peligro')) return '⚠️';
        if (t.includes('ruina') || t.includes('explor')) return '🏛️';
        return '🎲';
    };

    const eventsHtml = data.eventos.map((e, index) => `
        <div class="event-node">
            <div class="event-icon">${getIcon(e.tipo)}</div>
            <div class="event-content">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0; color:#d35400;">${e.titulo}</h3>
                    <span class="event-type-tag">${e.tipo}</span>
                </div>
                <p style="margin:10px 0; line-height:1.5;">${e.descripcion}</p>

                <div class="interaction-box">
                    <strong>👉 Interacción:</strong> ${e.interaccion}<br>
                    ${e.consecuencia ? `<small style="color:#c0392b;">⚠️ Si fallan: ${e.consecuencia}</small>` : ''}
                </div>
            </div>
        </div>
    `).join('');

    els.content.innerHTML = `
        <div class="travel-header">
            <h2 style="margin:0;">Ruta por ${s(els.env.value)}</h2>
            <p style="margin:5px 0 0 0; opacity:0.9;">${s(data.clima_dominante)}</p>
        </div>
        <div class="travel-body">
            <p style="font-style:italic; text-align:center; color:#555; margin-bottom:25px;">
                "${s(data.ambiente_general)}"
            </p>
            <div class="timeline">
                ${eventsHtml}
            </div>
        </div>
    `;
}

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;

    let text = `--- DIARIO DE VIAJE: ${els.env.value} ---\n`;
    text += `AMBIENTE: ${currentData.ambiente_general}\nCLIMA: ${currentData.clima_dominante}\n\n`;

    currentData.eventos.forEach((e, i) => {
        text += `[Evento ${i+1}] ${e.titulo} (${e.tipo})\n`;
        text += `Desc: ${e.descripcion}\n`;
        text += `Interacción: ${e.interaccion}\n`;
        if(e.consecuencia) text += `Consecuencia: ${e.consecuencia}\n`;
        text += `--------------------------\n`;
    });

    const blob = new Blob([text], {type : 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Viaje_${Date.now()}.txt`;
    a.click();
});