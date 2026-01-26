const API_URL = "http://localhost:5001/api/shops/generate";
let currentData = null;

const els = {
    type: document.getElementById('type'),
    location: document.getElementById('location'),
    cityList: document.getElementById('cityList'),
    level: document.getElementById('level'),
    btnGen: document.getElementById('btnGen'),
    btnEdit: document.getElementById('btnEdit'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader'),
    // Elementos del Editor
    editorContainer: document.getElementById('jsonEditorContainer'),
    textarea: document.getElementById('jsonTextarea'),
    btnSave: document.getElementById('btnSaveChanges'),
    btnCancel: document.getElementById('btnCancelEdit')
};

// --- AL CARGAR: RELLENAR LISTA DE CIUDADES ---
document.addEventListener('DOMContentLoaded', () => {
    try {
        const history = JSON.parse(localStorage.getItem('dnd_app_history') || '[]');
        const cities = history.filter(item => item.type === 'city');
        cities.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.nombre || c.name;
            els.cityList.appendChild(opt);
        });
    } catch(e) { console.error("Error cargando ciudades", e); }
});

// --- GENERAR ---
els.btnGen.addEventListener('click', async () => {
    if (!els.type.value) return alert("Indica el tipo de tienda.");

    els.content.innerHTML = '';
    els.editorContainer.style.display = 'none';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnEdit.style.display = 'none';
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                shop_type: els.type.value,
                level: parseInt(els.level.value) || 1,
                location: els.location.value
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderShop(data);

        els.btnEdit.style.display = 'block';
        els.btnExp.style.display = 'block';

        if (typeof addToHistory === 'function') {
            addToHistory({ ...data, nombre: data.shop_name, tipo_item: "Tienda" }, 'shops');
        }

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// --- FUNCIONALIDAD DE EDICIÓN ---

// 1. Abrir Editor
els.btnEdit.addEventListener('click', () => {
    if(!currentData) return;
    // Formateamos el JSON para que sea legible (indentación de 4 espacios)
    els.textarea.value = JSON.stringify(currentData, null, 4);
    els.editorContainer.style.display = 'block';
    // Scroll suave hacia el editor
    els.editorContainer.scrollIntoView({behavior: "smooth"});
});

// 2. Cancelar Edición
els.btnCancel.addEventListener('click', () => {
    els.editorContainer.style.display = 'none';
    els.content.scrollIntoView({behavior: "smooth"});
});

// 3. Guardar Cambios
els.btnSave.addEventListener('click', () => {
    try {
        const newData = JSON.parse(els.textarea.value);
        // Preservar ID si existía
        if (currentData._db_id) newData._db_id = currentData._db_id;

        currentData = newData;
        renderShop(currentData);
        els.editorContainer.style.display = 'none';

        // --- LÓGICA INTELIGENTE ---
        if (currentData._db_id && typeof updateHistoryItem === 'function') {
            updateHistoryItem(currentData._db_id, currentData);
        } else if (typeof addToHistory === 'function') {
            addToHistory(currentData, 'shops');
        }

        alert("✅ Inventario actualizado.");
    } catch (e) { alert("❌ Error JSON: " + e.message); }
});

// --- RENDERIZADO ---
window.renderShop = function(data) {
    currentData = data;  // Sincronizar con local
    const s = (val) => val || '---';

    // Support both English and Spanish keys for backward compatibility
    const shopName = data.shop_name || data.nombre || data.name;
    const shopType = data.shop_type || data.tipo || data.type;
    const location = data.location || data.location;
    const description = data.description || data.descripcion;
    const inventory = data.inventory || data.inventory;
    const shopkeeperName = data.shopkeeper_name || data.shopkeeper?.name || data.tendero_nombre || '---';
    const shopkeeperRace = data.shopkeeper_race || data.shopkeeper?.race || data.raza_tendero || '---';
    const shopkeeperPersonality = data.shopkeeper_personality || data.shopkeeper?.personality || data.personalidad_tendero || '---';
    const specialFeature = data.special_feature || data.special_feature;

    // Encabezado Inventario
    const inventoryHeader = `
        <div style="display:grid; grid-template-columns:1fr 80px 60px; gap:10px; border-bottom:2px solid #333; padding-bottom:5px; font-weight:bold; margin-bottom:10px;">
            <span>Artículo</span>
            <span style="text-align:right;">Precio</span>
            <span style="text-align:center;">Stock</span>
        </div>
    `;

    // Lista Items
    const inventoryHtml = (inventory || []).map(i => `
        <div class="item-row">
            <div>
                <span class="item-name">${(i.name || i.item)}</span>
                <span class="item-desc">${(i.description || i.desc)}</span>
            </div>
            <div class="item-price">${(i.price || i.precio)}</div>
            <div class="item-stock">${(i.stock || i.stock)}</div>
        </div>
    `).join('');

    const locationInfo = location ? `<br><small>📍 ${location}</small>` : '';

    els.content.innerHTML = `
        <div style="text-align:center; border-bottom:2px solid #f39c12; padding-bottom:15px; margin-bottom:20px;">
            <h1 style="color:#e67e22; margin:0;">${s(shopName)}</h1>
            <p style="font-style:italic; color:#7f8c8d;">${s(shopType)} ${locationInfo}</p>
            <p>${s(description)}</p>
        </div>

        <div style="background:#fdf2e9; padding:15px; border-radius:5px; margin-bottom:20px;">
            <h3 style="color:#d35400; margin-top:0;">🧑‍💼 ${s(shopkeeperName)}</h3>
            <p><strong>Raza:</strong> ${s(shopkeeperRace)} | <strong>Personalidad:</strong> ${s(shopkeeperPersonality)}</p>
            <p style="font-size:0.9em; color:#c0392b;"><strong>✨ Especialidad:</strong> ${s(specialFeature)}</p>
        </div>

        <div>
            <h3 style="color:#2c3e50;">📦 Inventario</h3>
            ${inventoryHeader}
            ${inventoryHtml}
        </div>
    `;
}

// --- EXPORTAR A FOUNDRY ---
els.btnExp.addEventListener('click', () => {
    if(!currentData) return;
    
    const shopName = currentData.shop_name || currentData.nombre || currentData.name;
    const shopType = currentData.shop_type || currentData.tipo || currentData.type;
    const location = currentData.location || currentData.location;
    const description = currentData.description || currentData.descripcion;
    const inventory = currentData.inventory || currentData.inventory;
    const shopkeeperName = currentData.shopkeeper_name || currentData.shopkeeper?.name || currentData.tendero_nombre || '---';
    const shopkeeperRace = currentData.shopkeeper_race || currentData.shopkeeper?.race || currentData.raza_tendero || '---';
    const shopkeeperPersonality = currentData.shopkeeper_personality || currentData.shopkeeper?.personality || currentData.personalidad_tendero || '---';
    const specialFeature = currentData.special_feature || currentData.special_feature;
    
    let content = `<h2>${shopName}</h2>`;
    content += `<p><i>${shopType} - ${location || ''}</i></p>`;
    content += `<p>${description}</p><hr>`;
    content += `<p><b>Tendero:</b> ${shopkeeperName} (${shopkeeperRace})</p>`;
    content += `<p><b>Personalidad:</b> ${shopkeeperPersonality}</p>`;
    content += `<p><b>Especial:</b> ${specialFeature}</p>`;
    
    content += `<h3>Inventario</h3><table><tr><th>Objeto</th><th>Precio</th><th>Stock</th></tr>`;
    (inventory || []).forEach(i => {
        content += `<tr><td><b>${(i.name || i.item)}</b><br><i>${(i.description || i.desc)}</i></td><td>${(i.price || i.precio)}</td><td>${(i.stock || i.stock)}</td></tr>`;
    });
    content += `</table>`;

    const json = {
        name: shopName,
        type: "journal",
        pages: [{ name: "Libro de Cuentas", type: "text", text: { content: content, format: 1 } }]
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Tienda_${shopName.replace(/\s+/g, '_')}.json`;
    a.click();
});