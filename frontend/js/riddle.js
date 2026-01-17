const API_URL = "http://localhost:5001/api/riddles/generate";
let currentData = null;

const els = {
    theme: document.getElementById('theme'),
    difficulty: document.getElementById('difficulty'),
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
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                theme: els.theme.value,
                difficulty: els.difficulty.value
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderRiddle(data);
        els.btnExp.style.display = 'block';

        if (typeof addToHistory === 'function') addToHistory(data);

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

function renderRiddle(data) {
    const s = (val) => val || '---';

    let hintsHtml = data.pistas ? data.pistas.map(p => `<li>${p}</li>`).join('') : '<li>Sin pistas</li>';

    els.content.innerHTML = `
        <h1 style="color:var(--accent); text-align:center;">${s(data.titulo)}</h1>
        <p style="text-align:center; font-weight:bold;">${s(data.tipo)}</p>

        <div style="background:#fff3cd; color:#856404; padding:15px; border:1px solid #ffeeba; border-radius:5px; margin-bottom:20px;">
            <h3>👁️ Para los Jugadores:</h3>
            <p style="font-style:italic; font-size:1.1rem;">"${s(data.descripcion_jugadores)}"</p>
        </div>

        <div style="background:#d4edda; color:#155724; padding:15px; border:1px solid #c3e6cb; border-radius:5px; margin-bottom:20px;">
            <h3>💡 Solución:</h3>
            <p><strong>${s(data.solucion)}</strong></p>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
            <div style="background:#f8d7da; color:#721c24; padding:10px; border-radius:5px;">
                <h4>⚠️ Consecuencia de Fallo</h4>
                <p><strong>Efecto:</strong> ${s(data.consecuencia_fallo.descripcion)}</p>
                <p><strong>Daño:</strong> ${s(data.consecuencia_fallo.dano)}</p>
                <p><strong>Salvación:</strong> ${s(data.consecuencia_fallo.salvacion)}</p>
            </div>
            <div style="background:#e2e3e5; padding:10px; border-radius:5px;">
                <h4>🔍 Pistas (DC Check)</h4>
                <ul>${hintsHtml}</ul>
            </div>
        </div>
    `;
}

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;
    const contentHTML = els.content.innerHTML;

    const json = {
        name: currentData.titulo,
        type: "journal",
        pages: [
            {
                name: "Acertijo",
                type: "text",
                text: { content: contentHTML, format: 1 }
            }
        ]
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Puzzle_${currentData.titulo.replace(/\s+/g, '_')}.json`;
    a.click();
});