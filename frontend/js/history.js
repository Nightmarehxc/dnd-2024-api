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

// ==========================================
// 1. GENERAR PERSONAJE (IA)
// ==========================================
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

// ==========================================
// 2. IMPORTAR DESDE FOUNDRY
// ==========================================
const btnImport = document.getElementById('btnImport');
const fileInput = document.getElementById('foundryFile');
const statusDiv = document.getElementById('importStatus');

if (btnImport) {
    btnImport.addEventListener('click', async () => {
        if (!fileInput.files.length) {
            alert("Por favor, selecciona un archivo JSON primero.");
            return;
        }

        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);

        // Feedback visual inmediato
        statusDiv.innerHTML = `<span style="color:#e67e22;">⏳ Analizando pergaminos arcanos...</span>`;
        btnImport.disabled = true;
        els.content.innerHTML = ''; // Limpiar panel central

        try {
            const res = await fetch('http://localhost:5001/api/library/import-foundry', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (data.error) throw new Error(data.error);

            // 1. Mostrar resumen de lo aprendido en la librería
            const s = data.detalles;
            statusDiv.innerHTML = `
                <span style="color:#27ae60;">✅ Éxito! Datos aprendidos:</span><br>
                <ul style="margin:5px 0; padding-left:20px; color:#333; font-size:0.8em;">
                    <li>Razas: ${s.races} | Clases: ${s.classes}</li>
                    <li>Items: ${s.items} | Hechizos: ${s.spells}</li>
                </ul>
            `;

            // 2. MOSTRAR PERSONAJE IMPORTADO Y AÑADIR A HISTORIAL
            if (data.character) {
                currentData = data.character;

                // Renderizar en el panel principal
                renderCharacter(currentData);

                // Guardar explícitamente en el historial (Salón de Héroes)
                if (typeof addToHistory === 'function') {
                    // Aseguramos que tenga un nombre para el historial
                    addToHistory({ ...currentData, nombre: currentData.nombre || 'Sin Nombre' });
                }

                // Habilitar botón de exportar (por si se quiere volver a bajar)
                els.btnExp.style.display = 'block';
            }

        } catch (err) {
            console.error(err);
            statusDiv.innerHTML = `<span style="color:#c0392b;">❌ Error: ${err.message}</span>`;
            els.content.innerHTML = `<p style="color:red; text-align:center;">Error al importar: ${err.message}</p>`;
        } finally {
            btnImport.disabled = false;
            fileInput.value = ''; // Limpiar input
        }
    });
}

// ==========================================
// 3. RENDERIZADO (Unificado Generador/Importador)
// ==========================================
function renderCharacter(data) {
    const s = (val) => val || '---';

    // Normalización de campos para compatibilidad entre IA e Importador
    const raza = data.especie || data.raza; // IA usa 'especie', Importador 'raza'
    const stats = data.estadisticas || data.stats; // IA usa 'estadisticas', Importador 'stats'
    const historia = data.resumen_historia || data.historia;
    const equipo = data.equipo_destacado || data.equipo;

    // El trasfondo puede ser un objeto (IA) o un string (Importador)
    const trasfondoNombre = (typeof data.trasfondo === 'object') ? data.trasfondo?.nombre : data.trasfondo;
    const originFeat = data.trasfondo?.origin_feat || 'N/A'; // Solo IA suele tener esto

    els.content.innerHTML = `
        <div class="sheet-header">
            <h1 style="color:var(--accent); margin:0;">${s(data.nombre)}</h1>
            <p style="font-style:italic;">Nivel ${data.nivel || 1} - ${s(raza)} ${s(data.clase)}</p>
        </div>

        <div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:5px; margin:15px 0; text-align:center; background:#eee; padding:10px; border-radius:5px;">
            ${stats ? Object.entries(stats).map(([k,v]) =>
                `<div><strong>${k}</strong><br>${v}</div>`).join('') : '<p>Sin atributos</p>'}
        </div>

        <h3>Trasfondo: ${s(trasfondoNombre)}</h3>
        ${originFeat !== 'N/A' ? `<p><strong>Origin Feat:</strong> ${s(originFeat)}</p>` : ''}

        <h3>Historia</h3>
        <p>${s(historia)}</p>

        <h3>Equipo</h3>
        <ul>
            ${equipo ? equipo.map(e => `<li>${e}</li>`).join('') : '<li>Equipo estándar</li>'}
        </ul>
    `;
}

// ==========================================
// 4. EXPORTAR A JSON (Foundry)
// ==========================================
els.btnExp.addEventListener('click', () => {
    if(!currentData) return;

    // Normalizamos de nuevo para exportar
    const historia = currentData.resumen_historia || currentData.historia;
    const raza = currentData.especie || currentData.raza;
    const trasfondo = (typeof currentData.trasfondo === 'object') ? currentData.trasfondo?.nombre : currentData.trasfondo;

    const json = {
        name: currentData.nombre,
        type: "character",
        img: "icons/svg/mystery-man.svg",
        system: {
            details: {
                biography: { value: historia },
                race: raza,
                background: trasfondo,
                level: currentData.nivel || 1
            }
        }
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${currentData.nombre.replace(/\s+/g, '_')}_Foundry.json`;
    a.click();
});