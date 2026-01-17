const API_URL = "http://localhost:5001/api/cities/generate";
let currentData = null;

const els = {
    type: document.getElementById('cityType'),
    theme: document.getElementById('theme'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                city_type: els.type.value,
                theme: els.theme.value || "Estándar"
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderCity(data);
        els.btnExp.style.display = 'block';

        if (typeof addToHistory === 'function') addToHistory(data);

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

function renderCity(data) {
    const s = (val) => val || '---';

    let districtsHtml = data.distritos.map(d => `
        <div style="margin-bottom:10px; padding:10px; background:#f4f4f4; border-left:3px solid var(--accent);">
            <strong>${d.nombre}</strong>: ${d.descripcion}
        </div>
    `).join('');

    let placesHtml = data.lugares_interes.map(p => `
        <li><strong>${p.nombre}</strong> (${p.tipo}): ${p.descripcion}</li>
    `).join('');

    let rumorsHtml = data.rumores.map(r => `<li>${r}</li>`).join('');

    els.content.innerHTML = `
        <h1 style="color:var(--accent); text-align:center;">${s(data.nombre)}</h1>
        <p style="text-align:center; font-style:italic;">${s(data.tipo)} - Población: ${s(data.poblacion)}</p>

        <div style="background:#eee; padding:15px; border-radius:8px; margin-bottom:20px;">
            <h3>👑 Gobierno: ${s(data.gobierno.tipo)}</h3>
            <p><strong>Líder:</strong> ${s(data.gobierno.lider)}</p>
            <p>${s(data.gobierno.descripcion)}</p>
        </div>

        <h3>🏙️ Distritos</h3>
        ${districtsHtml}

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
            <div>
                <h3>📍 Lugares de Interés</h3>
                <ul>${placesHtml}</ul>
            </div>
            <div>
                <h3>🗣️ Rumores</h3>
                <ul>${rumorsHtml}</ul>
            </div>
        </div>
    `;
}

// Exportar como Journal Entry para Foundry
els.btnExp.addEventListener('click', () => {
    if(!currentData) return;
    const contentHTML = els.content.innerHTML;

    const json = {
        name: currentData.nombre,
        type: "journal",
        pages: [
            {
                name: "Descripción General",
                type: "text",
                text: { content: contentHTML, format: 1 }
            }
        ]
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `City_${currentData.nombre.replace(/\s+/g, '_')}.json`;
    a.click();
});