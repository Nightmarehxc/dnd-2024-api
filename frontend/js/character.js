const API_URL = "http://localhost:5001/api/characters/generate";
let currentData = null;

const els = {
    desc: document.getElementById('desc'),
    level: document.getElementById('level'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    if (!els.desc.value) return alert("Describe tu personaje.");

    // UI Reset
    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                description: els.desc.value,
                level: parseInt(els.level.value) || 1
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderCharacter(data);
        els.btnExp.style.display = 'block';

        // --- GUARDAR EN HISTORIAL ---
        if (typeof addToHistory === 'function') addToHistory(data);

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

function renderCharacter(data) {
    const s = (val) => val || '---';
    els.content.innerHTML = `
        <div class="sheet-header">
            <h1 style="color:var(--accent); margin:0;">${s(data.nombre)}</h1>
            <p style="font-style:italic;">Nivel ${data.nivel} - ${s(data.especie)} ${s(data.clase)}</p>
        </div>

        <div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:5px; margin:15px 0; text-align:center; background:#eee; padding:10px; border-radius:5px;">
            ${data.estadisticas ? Object.entries(data.estadisticas).map(([k,v]) =>
                `<div><strong>${k}</strong><br>${v}</div>`).join('') : ''}
        </div>

        <h3>Trasfondo: ${s(data.trasfondo?.nombre)}</h3>
        <p><strong>Origin Feat:</strong> ${s(data.trasfondo?.origin_feat)}</p>

        <h3>Historia</h3>
        <p>${s(data.resumen_historia)}</p>

        <h3>Equipo Destacado</h3>
        <ul>
            ${data.equipo_destacado ? data.equipo_destacado.map(e => `<li>${e}</li>`).join('') : '<li>Equipo estándar</li>'}
        </ul>
    `;
}

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;
    const json = {
        name: currentData.nombre,
        type: "character",
        img: "icons/svg/mystery-man.svg",
        system: {
            details: {
                biography: { value: currentData.resumen_historia },
                race: currentData.especie,
                background: currentData.trasfondo?.nombre,
                level: currentData.nivel
            }
        }
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${currentData.nombre}_Foundry.json`;
    a.click();
});

const btnImport = document.getElementById('btnImport');
const fileInput = document.getElementById('foundryFile');
const statusDiv = document.getElementById('importStatus');

if(btnImport) {
    btnImport.addEventListener('click', async () => {
        if (!fileInput.files.length) {
            alert("Por favor, selecciona un archivo JSON primero.");
            return;
        }

        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);

        statusDiv.innerHTML = `<span style="color:#e67e22;">⏳ Analizando pergaminos arcanos...</span>`;
        btnImport.disabled = true;

        try {
            const res = await fetch('http://localhost:5001/api/library/import-foundry', {
                method: 'POST',
                body: formData // No ponemos Content-Type, fetch lo pone automático con el boundary
            });

            const data = await res.json();

            if (data.error) throw new Error(data.error);

            // Mostrar resumen bonito
            const s = data.detalles;
            statusDiv.innerHTML = `
                <span style="color:#27ae60;">✅ Éxito! Se han aprendido nuevos conocimientos:</span><br>
                <ul style="margin:5px 0; padding-left:20px; color:#333;">
                    <li>Razas: ${s.races}</li>
                    <li>Clases: ${s.classes}</li>
                    <li>Trasfondos: ${s.backgrounds}</li>
                    <li>Objetos: ${s.items}</li>
                    <li>Hechizos: ${s.spells}</li>
                </ul>
            `;

        } catch (err) {
            console.error(err);
            statusDiv.innerHTML = `<span style="color:#c0392b;">❌ Error: ${err.message}</span>`;
        } finally {
            btnImport.disabled = false;
            fileInput.value = ''; // Limpiar input
        }
    });
}