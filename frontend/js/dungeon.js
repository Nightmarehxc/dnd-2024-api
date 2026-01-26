const API_URL = "http://localhost:5001/api/dungeons/generate";
let currentData = null;

const els = {
    theme: document.getElementById('theme'),
    level: document.getElementById('level'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    if (!els.theme.value) return alert("Describe la temática.");

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
                level: parseInt(els.level.value) || 1
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderDungeon(data);
        els.btnExp.style.display = 'block';

        if (typeof addToHistory === 'function') addToHistory({...data, name: (data.name || data.nombre)}, 'dungeons');

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// Global renderer para el historial
window.renderDungeon = function(data) {
    currentData = data;  // Sincronizar con local
    renderDungeon(data);
};

function renderDungeon(data) {
    const s = (val) => val || '---';

    // Support both English and Spanish keys for backward compatibility
    const name = data.name || data.nombre;
    const environment = data.environment || data.ambiente;
    const rooms = data.rooms || data.salas;

    const roomsHtml = (rooms || []).map(room => `
        <div class="room-card">
            <div class="room-number">${room.id}</div>
            <div class="room-type">${(room.type || room.tipo)}</div>
            <h3 style="margin-top:5px; margin-left:15px; color:#2c3e50;">${(room.title || room.titulo)}</h3>

            <p style="font-style:italic; color:#555; border-left:3px solid #bdc3c7; padding-left:10px;">
                "${(room.description || room.descripcion)}"
            </p>

            <div class="challenge-box">
                <strong>⚠️ Desafío:</strong> ${(room.challenge || room.desafio)}<br>
                ${(room.consequence || room.consecuencia) ? `<small>Si fallan: ${(room.consequence || room.consecuencia)}</small>` : ''}
            </div>
        </div>
    `).join('');

    els.content.innerHTML = `
        <div style="text-align:center; margin-bottom:20px;">
            <h1 style="color:#2c3e50; margin-bottom:5px;">${s(name)}</h1>
            <p style="color:#7f8c8d;">${s(environment)}</p>
        </div>
        <div style="padding-left:15px;">
            ${roomsHtml}
        </div>
    const name = currentData.name || currentData.nombre;
    const environment = currentData.environment || currentData.ambiente;
    const rooms = currentData.rooms || currentData.salas;
    
    let text = `MAZMORRA: ${name}\nAmbiente: ${environment}\n\n`;
    (rooms || []).forEach(r => {
        text += `[${r.id}] ${(r.title || r.titulo)} (${(r.type || r.tipo)})\n${(r.description || r.descripcion)}\n>> Desafío: ${(r.challenge || r.desafio)}\n\n`;
    });

    const blob = new Blob([text], {type : 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Dungeon_${nam

    const blob = new Blob([text], {type : 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Dungeon_${currentData.nombre.replace(/\s+/g, '_')}.txt`;
    a.click();
});