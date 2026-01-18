const API_URL = "http://localhost:5001/api/journal/generate";
let currentData = null;

const els = {
    notes: document.getElementById('notes'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    if (!els.notes.value || els.notes.value.length < 10) return alert("Escribe unas notas más largas.");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ notes: els.notes.value })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderJournal(data);
        els.btnExp.style.display = 'block';

        const historyData = { ...data, nombre: data.titulo_episodio };
        if (typeof addToHistory === 'function') addToHistory(historyData);

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

function renderJournal(data) {
    const s = (val) => val || '---';

    els.content.innerHTML = `
        <div class="parchment">
            <h1>${s(data.titulo_episodio)}</h1>
            <div class="narrative-text">
                ${s(data.narracion).replace(/\n/g, '<br>')}
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                <div>
                    <div class="section-title">Hechos Clave</div>
                    <ul class="clean-list">
                        ${data.puntos_clave.map(i => `<li>${i}</li>`).join('')}
                    </ul>
                </div>
                <div>
                    <div class="section-title">Inventario y Estado</div>
                    <ul class="clean-list">
                        ${data.botin_y_cambios.map(i => `<li>${i}</li>`).join('')}
                    </ul>
                    ${data.estado_misiones && data.estado_misiones.length > 0 ? `
                        <div class="section-title" style="margin-top:10px;">Misiones</div>
                        <ul class="clean-list">
                            ${data.estado_misiones.map(i => `<li>${i}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;

    // Formato Journal Foundry VTT (Texto enriquecido)
    const contentHTML = els.content.innerHTML;

    const json = {
        name: currentData.titulo_episodio,
        type: "journal",
        pages: [
            {
                name: "Crónica",
                type: "text",
                text: { content: contentHTML, format: 1 }
            }
        ]
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Cronica_${currentData.titulo_episodio.replace(/\s+/g, '_')}.json`;
    a.click();
});