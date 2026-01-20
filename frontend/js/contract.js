const API_URL = "http://localhost:5001/api/contracts/generate";
let currentData = null;

const els = {
    patron: document.getElementById('patron'),
    desire: document.getElementById('desire'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    if (!els.patron.value || !els.desire.value) return alert("Indica las partes del contrato.");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                patron: els.patron.value,
                desire: els.desire.value
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderContract(data);
        els.btnExp.style.display = 'block';

        if (typeof addToHistory === 'function') {
            addToHistory({ ...data, nombre: `Contrato: ${data.titulo}` });
        }

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

function renderContract(data) {
    const s = (val) => val || '---';

    els.content.innerHTML = `
        <div style="border: 6px double #000; padding:30px; background:#fff; position:relative;">
            <div style="position:absolute; bottom:20px; right:20px; width:80px; height:80px; background:#c0392b; border-radius:50%; opacity:0.8; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; transform:rotate(-15deg); border:2px solid #922b21;">SELLO</div>

            <h1 style="font-family:'Times New Roman', serif; text-align:center; text-transform:uppercase; border-bottom:1px solid #000; padding-bottom:10px;">${s(data.titulo)}</h1>

            <div style="font-size:1.1em; margin:20px 0;">
                <p><strong>YO, LA ENTIDAD, OTORGO:</strong><br>
                <span style="color:#27ae60;">${s(data.oferta)}</span></p>

                <p><strong>A CAMBIO, EL MORTAL PAGA:</strong><br>
                <span style="color:#c0392b;">${s(data.precio)}</span></p>
            </div>

            <div style="background:#eee; padding:10px; font-size:0.8em; color:#555; text-align:justify; border:1px solid #ccc;">
                <strong>Términos y Condiciones (Letra Pequeña):</strong><br>
                ${s(data.letra_pequena)}
            </div>

            <div style="margin-top:25px; color:#c0392b; font-size:0.9em; border:1px dashed #c0392b; padding:10px;">
                <strong>⚠️ Cláusula de Nulidad (Solo para el DM):</strong><br>
                ${s(data.clausula_escape)}
            </div>
        </div>
    `;
}

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;

    // Texto plano formateado para imprimir
    let text = `=== ${currentData.titulo.toUpperCase()} ===\n\n`;
    text += `OFERTA: ${currentData.oferta}\n`;
    text += `PRECIO: ${currentData.precio}\n\n`;
    text += `CONDICIONES: ${currentData.letra_pequena}\n`;
    text += `\n(Clave DM: ${currentData.clausula_escape})`;

    const blob = new Blob([text], {type : 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Contrato_${Date.now()}.txt`;
    a.click();
});