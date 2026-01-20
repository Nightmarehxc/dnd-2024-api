const API_URL = "http://localhost:5001/api/librarian/generate";
let currentData = null;

const els = {
    topic: document.getElementById('topic'),
    type: document.getElementById('type'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

// --- GENERAR ---
els.btnGen.addEventListener('click', async () => {
    if (!els.topic.value) return alert("Escribe un tema para el libro.");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                topic: els.topic.value,
                type: els.type.value
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderBook(data);
        els.btnExp.style.display = 'block';

        // Guardar en historial
        if (typeof addToHistory === 'function') {
            addToHistory({ ...data, nombre: data.titulo, tipo_item: "Libro" });
        }

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// --- RENDERIZAR ---
function renderBook(data) {
    const s = (val) => val || '---';

    // Estilo visual según el tipo de documento
    let containerStyle = "background:#fdf6e3; border:1px solid #d4c5a3; color:#333;"; // Default libro
    if (els.type.value.includes("Pergamino")) containerStyle = "background:#fff3e0; border:1px solid #e67e22; color:#5d4037;";
    if (els.type.value.includes("Nota")) containerStyle = "background:#eceff1; border:1px dashed #78909c; color:#333;";
    if (els.type.value.includes("Tablilla")) containerStyle = "background:#9e9e9e; border:4px solid #616161; color:#212121; font-weight:bold;";

    els.content.innerHTML = `
        <div style="${containerStyle} padding:25px; font-family:'Georgia', serif; box-shadow:0 4px 6px rgba(0,0,0,0.1); border-radius:4px;">
            <h2 style="text-align:center; margin-top:0; border-bottom:2px solid rgba(0,0,0,0.1); padding-bottom:10px;">
                ${s(data.titulo)}
            </h2>
            <p style="text-align:center; font-style:italic; opacity:0.8; margin-bottom:20px;">
                Escrito por: ${s(data.autor)}
            </p>

            <div style="font-size:1.15em; line-height:1.7; text-align:justify; margin-bottom:20px;">
                "${s(data.contenido)}"
            </div>

            <hr style="border:0; border-top:1px dashed rgba(0,0,0,0.2);">

            <div style="display:flex; justify-content:space-between; font-size:0.85em; opacity:0.9;">
                <span><strong>Estado:</strong> ${s(data.descripcion_fisica)}</span>
                <span><strong>Valor:</strong> ${s(data.valor)}</span>
            </div>
        </div>
    `;
}

// --- EXPORTAR A FOUNDRY (Journal Entry) ---
els.btnExp.addEventListener('click', () => {
    if(!currentData) return;

    const json = {
        name: currentData.titulo,
        type: "journal",
        pages: [
            {
                name: "Contenido",
                type: "text",
                text: {
                    content: `<p><em>${currentData.descripcion_fisica}</em></p><hr><p>${currentData.contenido}</p><p align="right">-- ${currentData.autor}</p>`,
                    format: 1
                }
            }
        ]
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Libro_${currentData.titulo.replace(/\s+/g, '_')}.json`;
    a.click();
});