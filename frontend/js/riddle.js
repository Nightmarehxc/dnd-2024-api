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
        renderRiddleContent(data);
        els.btnExp.style.display = 'block';

        if (typeof addToHistory === 'function') addToHistory(data, 'riddles');

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

function renderRiddle(data) {
    const s = (val) => val || '---';

    // Support both English and Spanish keys for backward compatibility
    const title = data.title || data.titulo;
    const type = data.type || data.tipo;
    const playerDesc = data.player_description || data.descripcion_jugadores;
    const solution = data.solution || data.solucion;
    const hints = data.hints || data.pistas;
    const failureCons = data.failure_consequence || data.consecuencia_fallo;

    let hintsHtml = hints ? hints.map(p => `<li>${p}</li>`).join('') : '<li>Sin pistas</li>';
    
    const failureEffect = failureCons?.description || failureCons?.descripcion || '---';
    const failureDamage = failureCons?.damage || failureCons?.dano || '---';
    const failureSave = failureCons?.save || failureCons?.salvacion || '---';

    els.content.innerHTML = `
        <h1 style="color:var(--accent); text-align:center;">${s(title)}</h1>
        <p style="text-align:center; font-weight:bold;">${s(type)}</p>

        <div style="background:#fff3cd; color:#856404; padding:15px; border:1px solid #ffeeba; border-radius:5px; margin-bottom:20px;">
            <h3>👁️ Para los Jugadores:</h3>
            <p style="font-style:italic; font-size:1.1rem;">"${s(playerDesc)}"</p>
        </div>

        <div style="background:#d4edda; color:#155724; padding:15px; border:1px solid #c3e6cb; border-radius:5px; margin-bottom:20px;">
            <h3>💡 Solución:</h3>
            <p><strong>${s(solution)}</strong></p>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
            <div style="background:#f8d7da; color:#721c24; padding:10px; border-radius:5px;">
                <h4>⚠️ Consecuencia de Fallo</h4>
                <p><strong>Efecto:</strong> ${s(failureEffect)}</p>
                <p><strong>Daño:</strong> ${s(failureDamage)}</p>
                <p><strong>Salvación:</strong> ${s(failureSave)}</p>
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
    const title = currentData.title || currentData.titulo;

    const json = {
        name: title,
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
    a.download = `Puzzle_${title.replace(/\s+/g, '_')}.json`;
    a.click();
});

// Global renderer para el historial
window.renderRiddle = function(data) {
    currentData = data;
    renderRiddleContent(data);
};

function renderRiddleContent(data) {
    const s = (val) => val || '---';

    // Support both English and Spanish keys for backward compatibility
    const title = data.title || data.titulo;
    const type = data.type || data.tipo;
    const playerDesc = data.player_description || data.descripcion_jugadores;
    const solution = data.solution || data.solucion;
    const hints = data.hints || data.pistas;
    const failureCons = data.failure_consequence || data.consecuencia_fallo;

    let hintsHtml = hints ? hints.map(p => `<li>${p}</li>`).join('') : '<li>Sin pistas</li>';
    
    const failureEffect = failureCons?.description || failureCons?.descripcion || '---';
    const failureDamage = failureCons?.damage || failureCons?.dano || '---';
    const failureSave = failureCons?.save || failureCons?.salvacion || '---';

    els.content.innerHTML = `
        <h1 style="color:var(--accent); text-align:center;">${s(title)}</h1>
        <p style="text-align:center; font-weight:bold;">${s(type)}</p>

        <div style="background:#fff3cd; color:#856404; padding:15px; border:1px solid #ffeeba; border-radius:5px; margin-bottom:20px;">
            <h3>👁️ Para los Jugadores:</h3>
            <p style="font-style:italic; font-size:1.1rem;">"${s(playerDesc)}"</p>
        </div>

        <div style="background:#d4edda; color:#155724; padding:15px; border:1px solid #c3e6cb; border-radius:5px; margin-bottom:20px;">
            <h3>💡 Solución:</h3>
            <p><strong>${s(solution)}</strong></p>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
            <div style="background:#f8d7da; color:#721c24; padding:10px; border-radius:5px;">
                <h4>⚠️ Consecuencia de Fallo</h4>
                <p><strong>Efecto:</strong> ${s(failureEffect)}</p>
                <p><strong>Daño:</strong> ${s(failureDamage)}</p>
                <p><strong>Salvación:</strong> ${s(failureSave)}</p>
            </div>
            <div style="background:#e2e3e5; padding:10px; border-radius:5px;">
                <h4>🔍 Pistas (DC Check)</h4>
                <ul>${hintsHtml}</ul>
            </div>
        </div>
    `;
}