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
            addToHistory({ ...data, nombre: data.shop_name, tipo_item: "Tienda" }, 'shop');
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
            addToHistory(currentData, 'shop');
        }

        alert("✅ Inventario actualizado.");
    } catch (e) { alert("❌ Error JSON: " + e.message); }
});

// --- RENDERIZADO ---
function renderShop(data) {
    const s = (val) => val || '---';

    // Encabezado Inventario
    const inventoryHeader = `
        <div style="display:grid; grid-template-columns:1fr 80px 60px; gap:10px; border-bottom:2px solid #333; padding-bottom:5px; font-weight:bold; margin-bottom:10px;">
            <span>Artículo</span>
            <span style="text-align:right;">Precio</span>
            <span style="text-align:center;">Stock</span>
        </div>
    `;

    // Lista Items
    const inventoryHtml = (data.inventory || []).map(i => `
        <div class="item-row">
            <div>
                <span class="item-name">${i.item}</span>
                <span class="item-desc">${i.desc}</span>
            </div>
            <div class="item-price">${i.price}</div>
            <div class="item-stock">${i.stock}</div>
        </div>
    `).join('');

    const locationInfo = data.location ? `<br><small>📍 ${data.location}</small>` : '';

    els.content.innerHTML = `
        <div style="text-align:center; border-bottom:2px solid #f39c12; padding-bottom:15px; margin-bottom:20px;">
            <h1 style="color:#e67e22; margin:0;">${s(data.shop_name)}</h1>
            <p style="font-style:italic; color:#7f8c8d;">${s(data.shop_type)} ${locationInfo}</p>
            <p>${s(data.description)}</p>
        </div>

        <div style="background:#fdf2e9; padding:15px; border-radius:5px; margin-bottom:20px;">
            <h3 style="color:#d35400; margin-top:0;">🧑‍💼 ${s(data.shopkeeper?.name)}</h3>
            <p><strong>Raza:</strong> ${s(data.shopkeeper?.race)} | <strong>Rasgos:</strong> ${s(data.shopkeeper?.traits)}</p>
            <p style="font-size:0.9em; color:#c0392b;"><strong>✨ Especialidad:</strong> ${s(data.special_feature)}</p>
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
    
    let content = `<h2>${currentData.shop_name}</h2>`;
    content += `<p><i>${currentData.shop_type} - ${currentData.location || ''}</i></p>`;
    content += `<p>${currentData.description}</p><hr>`;
    content += `<p><b>Tendero:</b> ${currentData.shopkeeper.name} (${currentData.shopkeeper.race})</p>`;
    content += `<p><b>Especial:</b> ${currentData.special_feature}</p>`;
    
    content += `<h3>Inventario</h3><table><tr><th>Objeto</th><th>Precio</th><th>Stock</th></tr>`;
    (currentData.inventory || []).forEach(i => {
        content += `<tr><td><b>${i.item}</b><br><i>${i.desc}</i></td><td>${i.price}</td><td>${i.stock}</td></tr>`;
    });
    content += `</table>`;

    const json = {
        name: currentData.shop_name,
        type: "journal",
        pages: [{ name: "Libro de Cuentas", type: "text", text: { content: content, format: 1 } }]
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Tienda_${currentData.shop_name.replace(/\s+/g, '_')}.json`;
    a.click();
});