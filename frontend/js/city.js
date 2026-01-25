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

// === GENERAR CIUDAD ===
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

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderCity(data);

        els.btnEdit.style.display = 'block';
        els.btnExp.style.display = 'block';

        // GUARDADO AUTOMÁTICO EN HISTORIAL
        if (typeof addToHistory === 'function') {
            const cityName = data.name || data.nombre;
            await addToHistory({ 
                ...data, 
                name: cityName, 
                type_item: "City" 
            }, 'cities');

            // Guardar Negocios Vinculados
            if (data.linked_data) {
                if (data.linked_data.inn && !data.linked_data.inn.error) {
                    const inn = data.linked_data.inn;
                    const innName = inn.name || inn.nombre;
                    await addToHistory({ 
                        ...inn, 
                        name: innName 
                    }, 'inns');
                }
                if (data.linked_data.shop && !data.linked_data.shop.error) {
                    const shop = data.linked_data.shop;
                    const shopName = shop.name || shop.shop_name;
                    await addToHistory({ 
                        ...shop, 
                        name: shopName 
                    }, 'shops');
                }
            }
        }

    } catch (err) {
        els.content.innerHTML = `<p style="color:red; font-weight:bold;">❌ Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// === FUNCIONALIDAD DE EDICIÓN ===

// 1. Abrir Editor
els.btnEdit.addEventListener('click', () => {
    if (!currentData) return;

    // Rellenar inputs con datos actuales (English keys con fallback a Spanish)
    els.editName.value = currentData.name || currentData.nombre || "";
    els.editTitle.value = currentData.subtitle || currentData.titulo || "";
    els.editPop.value = currentData.population || currentData.poblacion || "";
    els.editGov.value = currentData.government || currentData.gobierno || "";
    els.editAtmos.value = currentData.atmosphere || currentData.clima_atmosfera || "";
    els.editConflict.value = currentData.current_conflict || currentData.conflicto_actual || "";

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
        const newData = {
            ...currentData,
            name: els.editName.value,
            subtitle: els.editTitle.value,
            population: els.editPop.value,
            government: els.editGov.value,
            atmosphere: els.editAtmos.value,
            current_conflict: els.editConflict.value
        };

        if (!newData.name) throw new Error("La ciudad debe tener nombre.");

        currentData = newData;
        renderCity(currentData);

        els.editorContainer.style.display = 'none';
        els.content.style.display = 'block';

        // Actualizar en historial
        if (currentData._db_id && typeof updateHistoryItem === 'function') {
            updateHistoryItem(currentData._db_id, currentData);
        } else if (typeof addToHistory === 'function') {
            addToHistory(currentData, 'cities');
        }

        alert("✅ Ciudad actualizada.");
        els.content.scrollIntoView({behavior: "smooth"});

    } catch (e) {
        alert("❌ Error: " + e.message);
    }
});

// === RENDERIZADO DE CIUDAD ===
function renderCity(data) {
    const s = (val) => val || '---';

    // Soportar ambas claves (English y Spanish)
    const name = data.name || data.nombre;
    const subtitle = data.subtitle || data.titulo;
    const population = data.population || data.poblacion;
    const government = data.government || data.gobierno;
    const atmosphere = data.atmosphere || data.clima_atmosfera;
    const currentConflict = data.current_conflict || data.conflicto_actual;
    const districts = data.districts || data.distritos || [];

    // Construir HTML de distritos
    const districtHtml = districts.map(d => {
        const dName = d.name || d.nombre;
        const dDesc = d.description || d.desc;
        return `<li><strong>${s(dName)}:</strong> ${s(dDesc)}</li>`;
    }).join('');

    // Construir HTML de comercios vinculados
    let linkedHtml = '';
    if (data.linked_data) {
        if (data.linked_data.inn && !data.linked_data.inn.error) {
            const innName = data.linked_data.inn.name || data.linked_data.inn.nombre;
            linkedHtml += `
                <div style="background:#fdf2e9; padding:10px; border:1px solid #e67e22; border-radius:5px; margin-top:10px; cursor:pointer;" onclick="window.location.href='inn.html'">
                    <strong>🍺 Posada:</strong> ${s(innName)}<br>
                    <small>👉 Ir a Posadas para ver detalles</small>
                </div>`;
        }
        if (data.linked_data.shop && !data.linked_data.shop.error) {
            const shopName = data.linked_data.shop.name || data.linked_data.shop.shop_name;
            linkedHtml += `
                <div style="background:#eaf2f8; padding:10px; border:1px solid #3498db; border-radius:5px; margin-top:5px; cursor:pointer;" onclick="window.location.href='shop.html'">
                    <strong>💰 Tienda:</strong> ${s(shopName)}<br>
                    <small>👉 Ir a Tiendas para ver inventario</small>
                </div>`;
        }
    }

    // HTML final de la ciudad
    els.content.innerHTML = `
        <div style="text-align:center; border-bottom:2px solid #2c3e50; margin-bottom:20px; padding-bottom:10px;">
            <h1 style="color:#2c3e50; margin:0;">${s(name)}</h1>
            <h3 style="color:#7f8c8d; margin-top:5px;">${s(subtitle)}</h3>
            <p><strong>Población:</strong> ${s(population)}</p>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
            <div>
                <h4 style="color:#c0392b; border-bottom:1px solid #ddd;">⚔️ Conflicto Actual</h4>
                <p>${s(currentConflict)}</p>
                <h4 style="color:#27ae60; border-bottom:1px solid #ddd;">🍃 Atmósfera</h4>
                <p>${s(atmosphere)}</p>
                <h4 style="color:#8e44ad; border-bottom:1px solid #ddd;">👑 Gobierno</h4>
                <p>${s(government)}</p>
            </div>
            <div>
                <h4 style="color:#2980b9; border-bottom:1px solid #ddd;">🏙️ Distritos</h4>
                <ul>${districtHtml || '<li>---</li>'}</ul>
            </div>
        </div>

        ${linkedHtml ? `
        <div style="margin-top:20px; padding-top:20px; border-top:2px solid #ddd;">
            <h4 style="color:#16a085; border-bottom:1px solid #ddd;">🎪 Comercios Locales</h4>
            ${linkedHtml}
        </div>
        ` : ''}
    `;
}

// === EXPORTAR A JOURNAL ===
els.btnExp.addEventListener('click', () => {
    if (!currentData) return alert("No hay ciudad para exportar.");

    const name = currentData.name || currentData.nombre;
    const subtitle = currentData.subtitle || currentData.titulo;
    const population = currentData.population || currentData.poblacion;
    const government = currentData.government || currentData.gobierno;
    const atmosphere = currentData.atmosphere || currentData.clima_atmosfera;
    const currentConflict = currentData.current_conflict || currentData.conflicto_actual;
    const districts = currentData.districts || currentData.distritos || [];

    let content = `<h1>${name}</h1>`;
    if (subtitle) content += `<p><em>${subtitle}</em></p>`;
    if (population) content += `<h3>Población</h3><p>${population}</p>`;
    if (government) content += `<h3>Gobierno</h3><p>${government}</p>`;
    if (atmosphere) content += `<h3>Atmósfera</h3><p>${atmosphere}</p>`;
    if (currentConflict) content += `<h3>Conflicto Actual</h3><p>${currentConflict}</p>`;

    if (districts.length > 0) {
        content += `<h3>Distritos</h3><ul>`;
        districts.forEach(d => {
            const dName = d.name || d.nombre;
            const dDesc = d.description || d.desc;
            content += `<li><b>${dName}:</b> ${dDesc}</li>`;
        });
        content += `</ul>`;
    }

    if (currentData.linked_data) {
        content += `<h3>Comercios Locales</h3>`;
        if (currentData.linked_data.inn && !currentData.linked_data.inn.error) {
            const innName = currentData.linked_data.inn.name || currentData.linked_data.inn.nombre;
            content += `<p><b>🍺 Posada:</b> ${innName}</p>`;
        }
        if (currentData.linked_data.shop && !currentData.linked_data.shop.error) {
            const shopName = currentData.linked_data.shop.name || currentData.linked_data.shop.shop_name;
            content += `<p><b>💰 Tienda:</b> ${shopName}</p>`;
        }
    }

    const json = {
        name: name,
        type: "journal",
        pages: [{ 
            name: "Descripción General", 
            type: "text", 
            text: { content: content, format: 1 } 
        }]
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Ciudad_${name.replace(/\s+/g, '_')}.json`;
    a.click();
});