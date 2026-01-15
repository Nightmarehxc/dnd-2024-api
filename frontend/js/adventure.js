const API_URL = "http://localhost:5001/api/adventures/generate";
let currentData = null;

const els = {
    theme: document.getElementById('theme'),
    players: document.getElementById('players'),
    level: document.getElementById('level'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    if (!els.theme.value) return alert("Define una temática.");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const payload = {
            theme: els.theme.value,
            players: parseInt(els.players.value),
            level: parseInt(els.level.value)
        };

        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderAdventure(data);
        els.btnExp.style.display = 'block';

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

function renderAdventure(data) {
    const s = (val) => val || '---';

    // Renderizado HTML
    let chaptersHtml = data.capitulos.map((cap, i) => `
        <div style="margin-bottom:15px; border-left: 3px solid var(--accent); padding-left:10px;">
            <strong>Capítulo ${i+1}: ${cap.titulo}</strong>
            <p style="margin:5px 0 0 0;">${cap.descripcion}</p>
        </div>
    `).join('');

    let npcsHtml = data.npcs_notables.map(npc => `
        <li><strong>${npc.nombre}</strong> (${npc.rol}): ${npc.breve_descripcion}</li>
    `).join('');

    let placesHtml = data.lugares.map(l => `
        <li><strong>${l.nombre}</strong>: ${l.descripcion}</li>
    `).join('');

    els.content.innerHTML = `
        <h1 style="color:var(--accent); text-align:center;">${s(data.titulo)}</h1>
        <p><strong>Sinopsis:</strong> ${s(data.sinopsis)}</p>

        <div style="background:#eee; padding:10px; border-radius:5px; margin-bottom:20px;">
            <strong>🎣 Gancho de Aventura:</strong><br>
            ${s(data.gancho)}
        </div>

        <h3>📜 Estructura de la Aventura</h3>
        ${chaptersHtml}

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-top:20px;">
            <div>
                <h4 style="border-bottom:1px solid #ccc;">Personajes Clave</h4>
                <ul style="padding-left:20px; font-size:0.9rem;">${npcsHtml}</ul>
            </div>
            <div>
                <h4 style="border-bottom:1px solid #ccc;">Lugares Importantes</h4>
                <ul style="padding-left:20px; font-size:0.9rem;">${placesHtml}</ul>
            </div>
        </div>
    `;
}

// Exportar como Journal Entry para Foundry VTT
els.btnExp.addEventListener('click', () => {
    if(!currentData) return;

    const contentHTML = els.content.innerHTML; // Reusamos el HTML generado para el Journal

    const json = {
        name: currentData.titulo,
        type: "journal", // Tipo JournalEntry
        pages: [
            {
                name: "Resumen de Aventura",
                type: "text",
                text: { content: contentHTML, format: 1 }
            }
        ],
        folder: null
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${currentData.titulo.replace(/\s+/g, '_')}_Adventure.json`;
    a.click();
});