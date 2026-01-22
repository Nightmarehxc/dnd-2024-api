const API_URL = "http://localhost:5001/api/npcs/generate";
let currentData = null;

const els = {
    race: document.getElementById('race'),
    job: document.getElementById('job'),
    btnGen: document.getElementById('btnGen'),

    btnEdit: document.getElementById('btnEdit'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader'),

    editorContainer: document.getElementById('formEditorContainer'),
    btnSave: document.getElementById('btnSaveChanges'),
    btnCancel: document.getElementById('btnCancelEdit'),

    // Inputs del editor
    eName: document.getElementById('editName'),
    eRace: document.getElementById('editRace'),
    eJob: document.getElementById('editJob'),
    eApp: document.getElementById('editApp'), // Nota: El JSON no tiene campo "apariencia" explícito, se usará descripción general
    ePers: document.getElementById('editPers'),
    eSecret: document.getElementById('editSecret')
};

// --- GENERAR ---
els.btnGen.addEventListener('click', async () => {
    els.content.innerHTML = '';
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnEdit.style.display = 'none';
    els.btnExp.style.display = 'none';

    // Construimos una descripción para que el backend entienda el contexto
    const descriptionPrompt = `${els.race.value || 'Cualquier raza'} ${els.job.value || 'Cualquier oficio'}`.trim();

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            // El backend (npcs.py) espera "description"
            body: JSON.stringify({ description: descriptionPrompt })
        });

        const data = await res.json();
        console.log('🔴 RESPUESTA CRUDA DEL API:', data);  // DEBUG CRÍTICO
        console.log('¿Contiene rol?', 'rol' in data);  // DEBUG
        console.log('¿Contiene nombre?', 'nombre' in data);  // DEBUG
        
        if (data.error) throw new Error(data.error);

        console.log('🎭 NPC generado:', data);  // DEBUG
        currentData = data;
        window.renderNPC(data);
        if (typeof addToHistory === 'function') {
            console.log('📝 Guardando en historial...', data);  // DEBUG
            addToHistory(currentData, 'npcs');
        }

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
        console.error(err);
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// --- EDITAR ---
els.btnEdit.addEventListener('click', () => {
    if(!currentData) return;

    // Mapeo de datos para el formulario de edición
    els.eName.value = currentData.nombre || "";
    els.eRace.value = currentData.raza || "";
    els.eJob.value = currentData.rol || "";

    // "Apariencia" no viene en el JSON, lo dejamos vacío o usamos la habilidad especial como placeholder
    els.eApp.value = currentData.habilidad_especial || "";

    // Convertimos el objeto personalidad a texto plano para editarlo fácilmente
    if (currentData.personalidad && typeof currentData.personalidad === 'object') {
        const p = currentData.personalidad;
        els.ePers.value = `Rasgo: ${p.rasgo || ''}\nIdeal: ${p.ideal || ''}\nVínculo: ${p.vinculo || ''}\nDefecto: ${p.defecto || ''}`;
    } else {
        els.ePers.value = currentData.personalidad || "";
    }

    els.eSecret.value = currentData.gancho_trama || "";

    els.content.style.display = 'none';
    els.editorContainer.style.display = 'block';
});

els.btnCancel.addEventListener('click', () => {
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';
});

els.btnSave.addEventListener('click', () => {
    // Al guardar, actualizamos el objeto localmente
    const newData = {
        ...currentData,
        nombre: els.eName.value,
        raza: els.eRace.value,
        rol: els.eJob.value,
        habilidad_especial: els.eApp.value, // Guardamos aquí por falta de campo apariencia
        personalidad: els.ePers.value, // Ahora será un string plano tras editar
        gancho_trama: els.eSecret.value
    };

    currentData = newData;
    window.renderNPC(currentData);
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';

    if (currentData._db_id && typeof updateHistoryItem === 'function') {
        updateHistoryItem(currentData._db_id, currentData);
    } else if (typeof addToHistory === 'function') {
        addToHistory(currentData, 'npcs');
    }
});

// --- RENDERIZAR ---
window.renderNPC = function(data) {
    // 🔑 IMPORTANTE: Actualizar currentData local para que funcione editar/exportar
    currentData = data;
    
    const s = (val) => val || '---';

    // Función auxiliar para renderizar la personalidad (que puede ser objeto o string)
    let personalityHtml = '';
    if (data.personalidad && typeof data.personalidad === 'object') {
        personalityHtml = `
            <ul style="margin:0; padding-left:20px;">
                <li><strong>Rasgo:</strong> ${data.personalidad.rasgo || '---'}</li>
                <li><strong>Ideal:</strong> ${data.personalidad.ideal || '---'}</li>
                <li><strong>Vínculo:</strong> ${data.personalidad.vinculo || '---'}</li>
                <li><strong>Defecto:</strong> ${data.personalidad.defecto || '---'}</li>
            </ul>
        `;
    } else {
        personalityHtml = s(data.personalidad);
    }

    // Renderizar Estadísticas si existen
    let statsHtml = '';
    if (data.estadisticas) {
        const st = data.estadisticas;
        statsHtml = `
            <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:5px; text-align:center; background:#fff; padding:5px; border-radius:4px; margin: 10px 0; font-size:0.8em;">
                <div><strong>FUE</strong><br>${st.FUE}</div>
                <div><strong>DES</strong><br>${st.DES}</div>
                <div><strong>CON</strong><br>${st.CON}</div>
                <div><strong>INT</strong><br>${st.INT}</div>
                <div><strong>SAB</strong><br>${st.SAB}</div>
                <div><strong>CAR</strong><br>${st.CAR}</div>
            </div>
        `;
    }

    els.content.innerHTML = `
        <div class="npc-card">
            <h2 style="color:#2c3e50; border-bottom:2px solid #3498db; margin-bottom:5px;">${s(data.nombre)}</h2>

            <div style="display:flex; justify-content:space-between; align-items:center; color:#555;">
                <span><strong>${s(data.raza)}</strong> - <em>${s(data.rol)}</em></span>
                <span style="font-size:0.9em;">Alineamiento: ${s(data.alineamiento)}</span>
            </div>

            <div style="display:flex; gap:10px; margin-top:10px;">
                <span style="background:#e74c3c; color:white; padding:3px 8px; border-radius:4px; font-weight:bold;">HP: ${data.hp || '?'}</span>
                <span style="background:#3498db; color:white; padding:3px 8px; border-radius:4px; font-weight:bold;">CA: ${data.ca || '?'}</span>
                <span style="background:#f39c12; color:white; padding:3px 8px; border-radius:4px; font-weight:bold;">Vel: ${data.velocidad || '?'} ft</span>
            </div>

            ${statsHtml}

            <div style="background:#ecf0f1; padding:10px; border-radius:5px; margin:10px 0;">
                <p style="margin-bottom:5px;"><strong>Habilidad Especial:</strong> ${s(data.habilidad_especial)}</p>
                <div style="border-top:1px solid #ccc; padding-top:5px; margin-top:5px;">
                    <strong>Personalidad:</strong>
                    ${personalityHtml}
                </div>
            </div>

            <p style="color:#c0392b; background:#fadbd8; padding:8px; border-radius:4px;">
                <strong>Gancho de Trama:</strong> ${s(data.gancho_trama)}
            </p>
        </div>
    `;

    if(els.btnEdit) els.btnEdit.style.display = 'block';
    if(els.btnExp) els.btnExp.style.display = 'block';
};

// --- EXPORTAR ---
els.btnExp.addEventListener('click', () => {
    if(!currentData) return;
    // Adaptamos el formato de exportación al estándar Foundry VTT o genérico
    const json = {
        name: currentData.nombre,
        type: "npc",
        system: {
            details: {
                biography: { value: JSON.stringify(currentData.personalidad) },
                race: currentData.raza
            },
            attributes: {
                hp: { value: currentData.hp, max: currentData.hp },
                ac: { value: currentData.ca }
            }
        }
    };
    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${currentData.nombre.replace(/\s+/g, '_')}.json`;
    a.click();
});