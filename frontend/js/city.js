const API_URL = "http://localhost:5001/api/cities/generate";
let currentData = null;

const els = {
    // Generación
    name: document.getElementById('name'),
    size: document.getElementById('size'),
    biome: document.getElementById('biome'),
    btnGen: document.getElementById('btnGen'),

    // UI General
    btnEdit: document.getElementById('btnEdit'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader'),

    // Editor Formulario
    editorContainer: document.getElementById('formEditorContainer'),
    btnSave: document.getElementById('btnSaveChanges'),
    btnCancel: document.getElementById('btnCancelEdit'),

    // Inputs del Editor
    editName: document.getElementById('editName'),
    editTitle: document.getElementById('editTitle'),
    editPop: document.getElementById('editPop'),
    editGov: document.getElementById('editGov'),
    editAtmos: document.getElementById('editAtmos'),
    editConflict: document.getElementById('editConflict')
};

// --- GENERAR CIUDAD ---
els.btnGen.addEventListener('click', async () => {
    if (!els.size.value) return alert("Selecciona un tamaño.");

    els.content.innerHTML = '';
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';

    els.loader.style.display = 'block';
    els.loader.textContent = "🏙️ Planificando distritos y comercios...";
    els.btnGen.disabled = true;
    els.btnEdit.style.display = 'none';
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                name: els.name.value,
                size_type: els.size.value,
                biome: els.biome.value
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderCity(data);

        els.btnEdit.style.display = 'block';
        els.btnExp.style.display = 'block';

        // GUARDADO AUTOMÁTICO EN HISTORIAL
        if (typeof addToHistory === 'function') {
            await addToHistory({ ...data, nombre: data.nombre, tipo_item: "Ciudad" }, 'cities');

            // Guardar Negocios Vinculados
            if (data.linked_data) {
                if (data.linked_data.inn && !data.linked_data.inn.error) {
                    const inn = data.linked_data.inn;
                    await addToHistory({ ...inn, nombre: inn.nombre }, 'inns');
                }
                if (data.linked_data.shop && !data.linked_data.shop.error) {
                    const shop = data.linked_data.shop;
                    await addToHistory({ ...shop, nombre: shop.shop_name }, 'shops');
                }
            }
        }

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// --- FUNCIONALIDAD DE EDICIÓN (FORMULARIO) ---

// 1. Abrir Editor (Poblar Formulario)
els.btnEdit.addEventListener('click', () => {
    if(!currentData) return;

    // Rellenar inputs con datos actuales
    els.editName.value = currentData.nombre || "";
    els.editTitle.value = currentData.titulo || "";
    els.editPop.value = currentData.poblacion || "";
    els.editGov.value = currentData.gobierno || "";
    els.editAtmos.value = currentData.clima_atmosfera || "";
    els.editConflict.value = currentData.conflicto_actual || "";

    // Mostrar formulario, ocultar vista de lectura
    els.content.style.display = 'none';
    els.editorContainer.style.display = 'block';
});

// 2. Cancelar Edición
els.btnCancel.addEventListener('click', () => {
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';
});

// 3. Guardar Cambios
els.btnSave.addEventListener('click', () => {
    try {
        // Recogemos datos del formulario
        const newData = {
            ...currentData, // Mantenemos datos viejos (como _db_id)
            nombre: els.editName.value,
            titulo: els.editTitle.value,
            poblacion: els.editPop.value,
            gobierno: els.editGov.value,
            clima_atmosfera: els.editAtmos.value,
            conflicto_actual: els.editConflict.value
        };

        if (!newData.nombre) throw new Error("La ciudad debe tener nombre.");

        currentData = newData;
        renderCity(currentData);

        // Ocultar editor
        els.editorContainer.style.display = 'none';
        els.content.style.display = 'block';

        // --- LÓGICA DE ACTUALIZACIÓN INTELIGENTE ---
        if (currentData._db_id && typeof updateHistoryItem === 'function') {
            // Si tiene ID, actualizamos el registro existente
            updateHistoryItem(currentData._db_id, currentData);
        } else if (typeof addToHistory === 'function') {
            // Si es nuevo (recién generado y editado antes de guardar), creamos
            addToHistory(currentData, 'cities');
        }

        alert("✅ Ciudad actualizada.");
        els.content.scrollIntoView({behavior: "smooth"});

    } catch (e) {
        alert("❌ Error: " + e.message);
    }
});

// --- RENDERIZADO ---
window.renderCity = function(data) {
    currentData = data;  // Sincronizar con local
    renderCity(data);
};

function renderCity(data) {
    const s = (val) => val || '---';

    const distritosHtml = (data.distritos || []).map(d => `
        <li style="margin-bottom:8px;"><strong>${d.nombre}:</strong> ${d.desc}</li>
    `).join('');

    let linkedHtml = '';
    if (data.linked_data) {
        if (data.linked_data.inn && !data.linked_data.inn.error) {
            linkedHtml += `
                <div style="background:#fdf2e9; padding:10px; border:1px solid #e67e22; border-radius:5px; margin-top:10px; cursor:pointer;" onclick="window.location.href='inn.html'">
                    <strong>🍺 Posada:</strong> ${data.linked_data.inn.nombre}<br>
                    <small>👉 Ir a Posadas para ver detalles</small>
                </div>`;
        }
        if (data.linked_data.shop && !data.linked_data.shop.error) {
            linkedHtml += `
                <div style="background:#eaf2f8; padding:10px; border:1px solid #3498db; border-radius:5px; margin-top:5px; cursor:pointer;" onclick="window.location.href='shop.html'">
                    <strong>💰 Tienda:</strong> ${data.linked_data.shop.shop_name}<br>
                    <small>👉 Ir a Tiendas para ver inventario</small>
                </div>`;
        }
    }

    els.content.innerHTML = `
        <div style="text-align:center; border-bottom:2px solid #2c3e50; margin-bottom:20px; padding-bottom:10px;">
            <h1 style="color:#2c3e50; margin:0;">${s(data.nombre)}</h1>
            <h3 style="color:#7f8c8d; margin-top:5px;">${s(data.titulo)}</h3>
            <p><strong>Población:</strong> ${s(data.poblacion)}</p>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
            <div>
                <h4 style="color:#c0392b; border-bottom:1px solid #ddd;">⚔️ Conflicto</h4>
                <p>${s(data.conflicto_actual)}</p>
                <h4 style="color:#27ae60; border-bottom:1px solid #ddd;">🍃 Atmósfera</h4>
                <p>${s(data.clima_atmosfera)}</p>
                <h4 style="color:#8e44ad; border-bottom:1px solid #ddd;">👑 Gobierno</h4>
                <p>${s(data.gobierno)}</p>
            </div>
            <div>
                <h4 style="color:#2980b9; border-bottom:1px solid #ddd;">🏙️ Distritos</h4>
                <ul>${distritosHtml}</ul>
                <h4 style="color:#d35400; border-bottom:1px solid #ddd;">📍 Negocios Generados</h4>
                ${linkedHtml || '<p style="color:#999; font-style:italic;">Sin negocios destacados.</p>'}
            </div>
        </div>
    `;
}

// --- EXPORTAR ---
els.btnExp.addEventListener('click', () => {
    if(!currentData) return;

    let content = `<h1>${currentData.nombre}</h1><p><i>${currentData.titulo}</i></p>`;
    content += `<h3>Atmósfera</h3><p>${currentData.clima_atmosfera}</p>`;
    content += `<h3>Gobierno</h3><p>${currentData.gobierno}</p>`;
    content += `<h3>Distritos</h3><ul>${(currentData.distritos || []).map(d => `<li><b>${d.nombre}:</b> ${d.desc}</li>`).join('')}</ul>`;
    content += `<h3>Conflicto</h3><p>${currentData.conflicto_actual}</p>`;

    if (currentData.linked_data) {
        content += `<h3>Comercios Locales</h3>`;
        if (currentData.linked_data.inn) content += `<p><b>Posada:</b> ${currentData.linked_data.inn.nombre} (Ver entrada propia)</p>`;
        if (currentData.linked_data.shop) content += `<p><b>Tienda:</b> ${currentData.linked_data.shop.shop_name} (Ver entrada propia)</p>`;
    }

    const json = {
        name: currentData.nombre,
        type: "journal",
        pages: [{ name: "Descripción General", type: "text", text: { content: content, format: 1 } }]
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Ciudad_${currentData.nombre.replace(/\s+/g, '_')}.json`;
    a.click();
});