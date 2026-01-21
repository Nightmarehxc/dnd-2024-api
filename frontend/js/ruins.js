const API_URL = "http://localhost:5001/api/ruins/generate";
let currentData = null;

const els = {
    name: document.getElementById('name'),
    type: document.getElementById('type'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    if (!els.name.value) return alert("Ponle un nombre a las ruinas.");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                name: els.name.value,
                ruin_type: els.type.value
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderRuins(data);
        els.btnExp.style.display = 'block';

        if (typeof addToHistory === 'function') {
            addToHistory({ ...data, nombre: data.nombre, tipo_item: "Ruina" });
        }

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

function renderRuins(data) {
    const s = (val) => val || '---';

    els.content.innerHTML = `
        <div style="border-left: 5px solid #795548; padding-left: 20px;">
            <h1 style="color:#5d4037; margin-top:0;">${s(data.nombre)}</h1>

            <div style="margin-bottom:20px;">
                <h4 style="color:#8d6e63; margin-bottom:5px; text-transform:uppercase; font-size:0.8em;">🏛️ Origen (La Época Dorada)</h4>
                <p style="margin-top:0;">${s(data.uso_original)}</p>
            </div>

            <div style="margin-bottom:20px;">
                <h4 style="color:#c62828; margin-bottom:5px; text-transform:uppercase; font-size:0.8em;">🔥 El Cataclismo</h4>
                <p style="margin-top:0;">${s(data.el_cataclismo)}</p>
            </div>

            <div style="background:#efebe9; padding:15px; border-radius:5px; margin-bottom:20px;">
                <h4 style="margin-top:0; color:#4e342e;">👁️ Estado Actual</h4>
                <p>${s(data.estado_actual)}</p>
                <p><strong>Habitantes:</strong> ${s(data.habitantes)}</p>
            </div>

            <div style="border: 1px dashed #5d4037; padding:10px; font-style:italic; font-size:0.9em; color:#5d4037;">
                <strong>🗝️ Secreto del DM:</strong> ${s(data.secreto)}
            </div>
        </div>
    `;
}

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;

    // Formato Journal de Foundry
    const json = {
        name: currentData.nombre,
        type: "journal",
        pages: [{
            name: "Historia",
            type: "text",
            text: {
                content: `<h2>Origen</h2><p>${currentData.uso_original}</p><h2>La Caída</h2><p>${currentData.el_cataclismo}</p><h2>Actualidad</h2><p>${currentData.estado_actual}</p><p><strong>Habitantes:</strong> ${currentData.habitantes}</p><hr><p><em>Secreto: ${currentData.secreto}</em></p>`,
                format: 1
            }
        }]
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Ruina_${currentData.nombre.replace(/\s+/g, '_')}.json`;
    a.click();
});