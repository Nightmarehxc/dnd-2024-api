const API_URL = "http://localhost:5001/api/characters/generate";
const LIBRARY_URL = "http://localhost:5001/api/library";
let currentData = null;

const els = {
    desc: document.getElementById('desc'),
    level: document.getElementById('level'),
    raceSelect: document.getElementById('raceSelect'),
    classSelect: document.getElementById('classSelect'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

// --- CARGAR OPCIONES DE BIBLIOTECA AL INICIAR ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch(`${LIBRARY_URL}/options`);
        const data = await res.json();

        if (data.races && data.races.length > 0) {
            data.races.forEach(r => {
                const opt = document.createElement('option');
                opt.value = r;
                opt.textContent = r;
                els.raceSelect.appendChild(opt);
            });
        }

        if (data.classes && data.classes.length > 0) {
            data.classes.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c;
                opt.textContent = c;
                els.classSelect.appendChild(opt);
            });
        }
    } catch (e) {
        console.error("No se pudo cargar la biblioteca:", e);
    }
});

// ==========================================
// 1. GENERAR PERSONAJE (IA + BIBLIOTECA)
// ==========================================
els.btnGen.addEventListener('click', async () => {
    // Si no hay descripción, ponemos una por defecto para permitir aleatorios
    const description = els.desc.value.trim() || "Un aventurero típico de fantasía";

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                description: description,
                level: parseInt(els.level.value) || 1,
                fixed_race: els.raceSelect.value || null,  // Enviamos selección
                fixed_class: els.classSelect.value || null // Enviamos selección
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderCharacter(data);
        els.btnExp.style.display = 'block';

        if (typeof addToHistory === 'function') addToHistory(data);

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// ==========================================
// 2. IMPORTAR DESDE FOUNDRY (Igual que antes)
// ==========================================
const btnImport = document.getElementById('btnImport');
const fileInput = document.getElementById('foundryFile');
const statusDiv = document.getElementById('importStatus');

if (btnImport) {
    btnImport.addEventListener('click', async () => {
        if (!fileInput.files.length) return alert("Selecciona un archivo JSON.");

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        statusDiv.innerHTML = `<span style="color:#e67e22;">⏳ Procesando...</span>`;
        btnImport.disabled = true;

        try {
            const res = await fetch(`${LIBRARY_URL}/import-foundry`, { method: 'POST', body: formData });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            const s = data.detalles;
            statusDiv.innerHTML = `<span style="color:#27ae60;">✅ Datos aprendidos. Recarga la página para verlos en los selectores.</span>`;

            if (data.character) {
                currentData = data.character;
                renderCharacter(currentData);
                els.btnExp.style.display = 'block';
                if (typeof addToHistory === 'function') addToHistory({...currentData, nombre: currentData.nombre || "Importado"});
            }
        } catch (err) {
            statusDiv.innerHTML = `<span style="color:#c0392b;">❌ Error: ${err.message}</span>`;
        } finally {
            btnImport.disabled = false;
            fileInput.value = '';
        }
    });
}

// ==========================================
// 3. RENDERIZADO UNIFICADO
// ==========================================
function renderCharacter(data) {
    const s = (val) => val || '---';
    const raza = data.especie || data.raza || 'Desconocida';
    const clase = data.clase || 'Aventurero';
    const stats = data.estadisticas || data.stats || {};
    const historia = data.resumen_historia || data.historia || 'Sin historia.';

    let equipoHtml = '<li>Sin equipo</li>';
    const equipoRaw = data.equipo_destacado || data.equipo;
    if (equipoRaw && Array.isArray(equipoRaw) && equipoRaw.length > 0) {
        equipoHtml = equipoRaw.map(e => `<li>${typeof e === 'string' ? e : e.name || e}</li>`).join('');
    }

    const trasfondoNombre = (typeof data.trasfondo === 'object') ? data.trasfondo?.nombre : data.trasfondo;
    const originFeat = data.trasfondo?.origin_feat;

    els.content.innerHTML = `
        <div class="sheet-header">
            <h1 style="color:var(--accent); margin:0;">${s(data.nombre)}</h1>
            <p style="font-style:italic;">Nivel ${data.nivel || 1} - ${s(raza)} ${s(clase)}</p>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(50px, 1fr)); gap:5px; margin:15px 0; text-align:center; background:#eee; padding:10px; border-radius:5px;">
            ${Object.entries(stats).map(([k,v]) => `
                <div><strong style="text-transform:uppercase; font-size:0.8em;">${k.substring(0,3)}</strong><br><span style="font-size:1.1em; color:var(--accent);">${v}</span></div>
            `).join('')}
        </div>

        <div style="margin-bottom:15px;">
            <strong>Trasfondo:</strong> ${s(trasfondoNombre)} ${originFeat ? `| <strong>Feat:</strong> ${originFeat}` : ''}
        </div>

        <h3>Historia</h3>
        <p style="font-size:0.95em; line-height:1.5;">${s(historia)}</p>

        <h3>Equipo</h3>
        <ul style="column-count: 2;">${equipoHtml}</ul>
    `;
}

// ==========================================
// 4. EXPORTAR JSON
// ==========================================
els.btnExp.addEventListener('click', () => {
    if(!currentData) return;
    const json = {
        name: currentData.nombre,
        type: "character",
        img: "icons/svg/mystery-man.svg",
        system: {
            details: {
                biography: { value: currentData.resumen_historia || currentData.historia },
                race: currentData.especie || currentData.raza,
                background: (typeof currentData.trasfondo === 'object') ? currentData.trasfondo?.nombre : currentData.trasfondo,
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