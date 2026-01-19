const API_URL = "http://localhost:5001/api/cities/generate";
const SHOP_API_URL = "http://localhost:5001/api/shops/generate";

let currentCityData = null;
let currentShopData = null;

const els = {
    name: document.getElementById('cityName'),
    type: document.getElementById('cityType'),
    biome: document.getElementById('biome'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader'),

    // Modal Elements
    modal: document.getElementById('shopModal'),
    closeModal: document.getElementById('closeModal'),
    shopBody: document.getElementById('shopResultContent'),
    shopLoader: document.getElementById('shopLoader'),
    btnSaveShop: document.getElementById('btnSaveShop')
};

// --- UTILIDADES DE SEGURIDAD ---

// 1. Para atributos HTML (value="..."). Solo escapa comillas dobles.
const escapeHtml = (str) => {
    if (!str) return '';
    return str.replace(/"/g, '&quot;');
};

// 2. Para argumentos JS (onclick="func('...')"). Escapa comillas simples.
const escapeJs = (str) => {
    if (!str) return '';
    return str.replace(/'/g, "\\'");
};

// --- LÓGICA DE INICIO (Cross-Linking) ---
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const loadCityName = params.get('load_city');

    if (loadCityName) {
        const historyKey = 'history_city';
        try {
            const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
            const found = history.find(c => c.nombre && c.nombre.toLowerCase() === loadCityName.toLowerCase());

            if (found) {
                currentCityData = found;
                renderCity(found);
                // Limpiar URL para no recargar siempre
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (e) {
            console.error("Error cargando historial:", e);
        }
    }
});

// ==========================================
// 1. GENERAR CIUDAD
// ==========================================
els.btnGen.addEventListener('click', async () => {
    if (!els.type.value) return alert("Selecciona un tipo de ciudad.");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                name: els.name.value,
                size_type: els.type.value,
                biome: els.biome.value
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentCityData = data;
        renderCity(data);
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
// 2. RENDERIZADO (MODO LECTURA)
// ==========================================
function renderCity(data) {
    if (!data) return;
    const s = (val) => val || '---';

    const editBtn = `<button onclick="enterEditMode()" class="btn-generate" style="background:#f39c12; width:auto; padding:5px 15px; font-size:0.9rem; margin-bottom:10px;">✏️ Editar Ciudad</button>`;

    // Distritos
    let distritosHtml = '';
    if (data.distritos && Array.isArray(data.distritos)) {
        distritosHtml = data.distritos.map((d) => `
            <div style="margin-bottom:15px; padding:10px; background:white; border-left:4px solid var(--accent); border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h4 style="margin:0; color:var(--text-main);">${d.nombre}</h4>
                    <button class="btn-mini-shop" onclick="openShopGen('${escapeJs(d.nombre)}', '${escapeJs(data.nombre)}')">🏪 Abrir Tienda Aquí</button>
                </div>
                <p style="font-size:0.95em; margin:5px 0;">${d.descripcion}</p>
                <div style="font-size:0.85em; color:#666;">
                    <strong>Ambiente:</strong> ${d.ambiente || 'N/A'} |
                    <strong>Habitantes:</strong> ${d.habitantes_tipo || 'Variado'}
                </div>
            </div>
        `).join('');
    }

    // Lugares de Interés
    let poisHtml = '';
    if (data.lugares_interes && Array.isArray(data.lugares_interes) && data.lugares_interes.length > 0) {
        const listItems = data.lugares_interes.map((p, index) => {
            if (p.shopData) {
                // Tienda vinculada -> Clickable
                return `
                <li style="margin-bottom:8px; padding:8px; background:#e8f5e9; border-radius:4px; cursor:pointer; border:1px solid #a5d6a7;"
                    onclick="viewSavedShop(${index})" title="Ver Tienda Completa">
                    <strong>🏪 ${p.nombre}</strong> <span style="font-size:0.8em; color:#2e7d32;">(Ver Ficha)</span><br>
                    <span style="font-size:0.9em; color:#555;">${p.descripcion}</span>
                </li>`;
            } else {
                // Lugar normal
                return `<li style="margin-bottom:5px;"><strong>${p.nombre}</strong> (${p.tipo || 'Lugar'}): ${p.descripcion}</li>`;
            }
        }).join('');

        poisHtml = `<h3 style="margin-top:20px; border-bottom:2px solid #3498db; color:#3498db;">📍 Lugares de Interés</h3>
        <ul style="padding-left:10px; list-style:none;">${listItems}</ul>`;
    }

    // Rumores
    let rumorsHtml = '';
    if (data.rumores && Array.isArray(data.rumores)) {
        rumorsHtml = `<p><strong>🗣️ Rumor:</strong> ${data.rumores.join(' ')}</p>`;
    } else if (data.rumores) {
        rumorsHtml = `<p><strong>🗣️ Rumor:</strong> ${data.rumores}</p>`;
    }

    els.content.innerHTML = `
        <div style="display:flex; justify-content:flex-end;">${editBtn}</div>

        <h1 style="color:var(--accent); text-align:center; margin-bottom:5px; margin-top:0;">${s(data.nombre)}</h1>
        <p style="text-align:center; font-style:italic; color:#666; margin-top:0;">
            ${s(data.tipo)} - ${s(data.clima)}
        </p>
        <p style="text-align:center; font-weight:bold; color:#555;">Población: ${s(data.poblacion)}</p>

        <div style="background:#fdf6e3; padding:15px; border-radius:8px; border:1px solid #d4c5a3; margin-bottom:20px; font-family:'Georgia', serif;">
            <p><strong>📜 Gobierno:</strong> ${s(data.gobierno?.tipo)}</p>
            <p><strong>👑 Líder:</strong> ${s(data.gobierno?.lider)}</p>
            <p><strong>⚖️ Leyes:</strong> ${s(data.gobierno?.descripcion)}</p>
            <p><strong>🛡️ Defensas:</strong> ${s(data.defensas)}</p>
            ${rumorsHtml}
        </div>

        <h3 style="border-bottom:2px solid var(--accent); padding-bottom:5px;">🏘️ Distritos y Barrios</h3>
        ${distritosHtml || '<p>Sin distritos detallados.</p>'}

        ${poisHtml}

        <div style="text-align:center; margin-top:30px;">
            <button class="btn-generate" onclick="openShopGen('General', '${escapeJs(data.nombre)}')">🔮 Generar Tienda Aleatoria</button>
        </div>
    `;
}

// ==========================================
// 3. MODO EDICIÓN
// ==========================================
window.enterEditMode = function() {
    const d = currentCityData;
    if (!d) return;

    // Distritos
    const distritosList = Array.isArray(d.distritos) ? d.distritos : [];
    const districtsInputs = distritosList.map((dist, idx) => `
        <div style="background:#eee; padding:10px; margin-bottom:10px; border-radius:5px;">
            <input type="text" id="edit_dist_name_${idx}" value="${escapeHtml(dist.nombre)}" style="font-weight:bold; margin-bottom:5px; width:100%;">
            <textarea id="edit_dist_desc_${idx}" rows="2" style="width:100%;">${dist.descripcion}</textarea>
        </div>
    `).join('');

    // Lugares
    let placesHtml = '<p style="color:#777; font-style:italic;">No hay lugares registrados.</p>';
    if (d.lugares_interes && d.lugares_interes.length > 0) {
        placesHtml = d.lugares_interes.map((p, idx) => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; padding:5px; border:1px solid #ddd; margin-bottom:5px;">
                <span>${p.shopData ? '🏪' : '📍'} <strong>${p.nombre}</strong></span>
                <button onclick="deletePlace(${idx})" style="background:#e74c3c; padding:2px 8px; font-size:0.8rem; width:auto; margin:0; cursor:pointer;">🗑️</button>
            </div>
        `).join('');
    }

    // Dropdown Tiendas
    let shopOptions = '<option value="">-- Seleccionar Tienda --</option>';
    try {
        const shopHistory = JSON.parse(localStorage.getItem('history_shop') || '[]');
        shopHistory.forEach((shop, index) => {
            shopOptions += `<option value="${index}">🏪 ${shop.nombre_tienda || shop.nombre} (${shop.tipo})</option>`;
        });
    } catch (e) { console.error(e); }

    const currentRumor = Array.isArray(d.rumores) ? d.rumores.join('\n') : (d.rumores || '');

    // Usamos escapeHtml para los values (no pone backslashes feos)
    els.content.innerHTML = `
        <h2 style="color:#f39c12;">✏️ Editando ${d.nombre}</h2>

        <label>Nombre</label><input type="text" id="edit_name" value="${escapeHtml(d.nombre)}">
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div><label>Tipo</label><input type="text" id="edit_type" value="${escapeHtml(d.tipo)}"></div>
            <div><label>Población</label><input type="text" id="edit_pop" value="${escapeHtml(d.poblacion)}"></div>
        </div>
        <label>Clima</label><input type="text" id="edit_clima" value="${escapeHtml(d.clima)}">

        <h3 style="margin-top:20px;">Gobierno</h3>
        <label>Tipo</label><input type="text" id="edit_gob_type" value="${escapeHtml(d.gobierno?.tipo || '')}">
        <label>Líder</label><input type="text" id="edit_gob_leader" value="${escapeHtml(d.gobierno?.lider || '')}">
        <label>Leyes</label><textarea id="edit_gob_desc" rows="2">${d.gobierno?.descripcion || ''}</textarea>

        <label>Rumores (Uno por línea)</label><textarea id="edit_rumors" rows="2">${currentRumor}</textarea>

        <div style="background:#e8f5e9; padding:15px; border:1px solid #a5d6a7; border-radius:5px; margin-top:20px;">
            <h4 style="margin-top:0; color:#2e7d32;">📥 Importar Tienda del Historial</h4>
            <div style="display:flex; gap:10px;">
                <select id="historyShopSelect" style="flex-grow:1;">${shopOptions}</select>
                <button onclick="importShopFromHistory()" style="width:auto; margin:0; background:#27ae60;">Importar</button>
            </div>
            <div style="margin-top:10px;">
                <strong>Lugares Actuales:</strong>
                <div style="max-height:150px; overflow-y:auto; margin-top:5px;">
                    ${placesHtml}
                </div>
            </div>
        </div>

        <h3>Distritos</h3>
        ${districtsInputs}

        <div style="margin-top:20px; display:flex; gap:10px;">
            <button onclick="saveCityChanges()" class="btn-generate" style="background:#27ae60;">💾 Guardar Cambios</button>
            <button onclick="renderCity(currentCityData)" class="btn-generate" style="background:#95a5a6;">❌ Cancelar</button>
        </div>
    `;
};

// --- FUNCIONES DE ACCIÓN EN MODO EDICIÓN ---

// ¡CRUCIAL! Guarda TODO el estado de los inputs antes de redibujar la pantalla.
function saveTempEditState() {
    if (!currentCityData) return;

    currentCityData.nombre = document.getElementById('edit_name').value;
    currentCityData.tipo = document.getElementById('edit_type').value;
    currentCityData.poblacion = document.getElementById('edit_pop').value;
    currentCityData.clima = document.getElementById('edit_clima').value;

    if (!currentCityData.gobierno) currentCityData.gobierno = {};
    currentCityData.gobierno.tipo = document.getElementById('edit_gob_type').value;
    currentCityData.gobierno.lider = document.getElementById('edit_gob_leader').value;
    currentCityData.gobierno.descripcion = document.getElementById('edit_gob_desc').value;

    const rumorsText = document.getElementById('edit_rumors').value;
    currentCityData.rumores = rumorsText.split('\n').filter(r => r.trim() !== '');

    if (Array.isArray(currentCityData.distritos)) {
        currentCityData.distritos.forEach((dist, idx) => {
            const nameInput = document.getElementById(`edit_dist_name_${idx}`);
            const descInput = document.getElementById(`edit_dist_desc_${idx}`);
            if (nameInput) dist.nombre = nameInput.value;
            if (descInput) dist.descripcion = descInput.value;
        });
    }
}

window.importShopFromHistory = function() {
    const select = document.getElementById('historyShopSelect');
    const index = select.value;

    if (index === "") return alert("Selecciona una tienda primero.");

    try {
        const shopHistory = JSON.parse(localStorage.getItem('history_shop') || '[]');
        const shop = shopHistory[index];

        if (shop) {
            if (!currentCityData.lugares_interes) currentCityData.lugares_interes = [];

            // Guardamos lo que el usuario haya escrito en los inputs antes de refrescar
            saveTempEditState();

            currentCityData.lugares_interes.push({
                nombre: shop.nombre_tienda || shop.nombre,
                tipo: "Tienda (Importada)",
                descripcion: `Sucursal de ${shop.nombre_tienda}. ${shop.descripcion_ambiente || ''}`,
                shopData: shop
            });

            enterEditMode(); // Refrescamos para ver la nueva lista
            alert("Tienda importada correctamente.");
        }
    } catch (e) {
        console.error(e);
        alert("Error al importar tienda.");
    }
};

window.deletePlace = function(index) {
    if (confirm("¿Borrar este lugar de interés?")) {
        // Guardamos antes de borrar para no perder ediciones
        saveTempEditState();
        currentCityData.lugares_interes.splice(index, 1);
        enterEditMode();
    }
};

window.saveCityChanges = function() {
    // Reutilizamos la lógica de guardado completo
    saveTempEditState();

    // Renderizamos la vista normal
    renderCity(currentCityData);

    // Persistimos en historial global
    if (typeof addToHistory === 'function') addToHistory(currentCityData);
};

// ==========================================
// 4. MODAL Y TIENDAS
// ==========================================
window.openShopGen = async function(districtName, cityName) {
    els.modal.style.display = 'block';
    els.shopBody.innerHTML = '';
    els.shopLoader.style.display = 'block';
    els.btnSaveShop.style.display = 'none';

    // Para la IA usamos texto limpio
    const shopTypePrompt = `Una tienda adecuada para el distrito "${districtName}" en la ciudad de "${cityName}"`;
    const locationPrompt = `${cityName} (${districtName})`;

    try {
        const res = await fetch(SHOP_API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                shop_type: shopTypePrompt,
                location: locationPrompt
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentShopData = {
            ...data,
            location: locationPrompt,
            city_reference: cityName
        };

        renderShopInModal(currentShopData);
        els.btnSaveShop.style.display = 'inline-block';

    } catch (err) {
        els.shopBody.innerHTML = `<p style="color:red">Error generando tienda: ${err.message}</p>`;
    } finally {
        els.shopLoader.style.display = 'none';
    }
};

// Abrir tienda existente (desde link de ciudad)
window.viewSavedShop = function(index) {
    if (!currentCityData || !currentCityData.lugares_interes) return;
    const item = currentCityData.lugares_interes[index];

    if (item && item.shopData) {
        currentShopData = item.shopData;
        renderShopInModal(currentShopData);
        els.btnSaveShop.style.display = 'none'; // Ya existe, no mostramos guardar
        els.modal.style.display = 'block';
    }
};

function renderShopInModal(data) {
    const s = (val) => val || '---';
    const inventario = data.inventario || [];
    const itemsHtml = inventario.map(item => `
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:5px 0;">
            <span><strong>${item.nombre}</strong> <small>(${item.tipo || 'Obj'})</small></span>
            <span style="font-weight:bold; color:#e67e22;">${item.precio_gp} gp</span>
        </div>
    `).join('');

    const vendedorNombre = data.vendedor ? data.vendedor.nombre : 'Desconocido';
    const vendedorRaza = data.vendedor ? data.vendedor.raza : '---';

    els.shopBody.innerHTML = `
        <h2 style="color:#27ae60; margin-top:0; text-align:center;">${s(data.nombre_tienda)}</h2>
        <p style="text-align:center; font-style:italic; color:#666;">Propiedad de ${s(vendedorNombre)} (${s(vendedorRaza)})</p>
        <div style="background:#f9f9f9; padding:10px; border-radius:5px; margin-bottom:15px; font-size:0.9em;">
            <p><strong>Ambiente:</strong> ${s(data.descripcion_ambiente)}</p>
        </div>
        <h4 style="border-bottom:2px solid #27ae60;">📦 Inventario</h4>
        <div style="max-height:200px; overflow-y:auto;">${itemsHtml || '<p>Sin inventario disponible.</p>'}</div>
    `;
}

// Guardar nueva tienda en la ciudad Y en el historial global
els.btnSaveShop.addEventListener('click', () => {
    try {
        if (!currentCityData || !currentShopData) return;

        if (!currentCityData.lugares_interes) currentCityData.lugares_interes = [];

        // 1. Añadir a la ciudad
        const nuevaTiendaEnCiudad = {
            nombre: currentShopData.nombre_tienda || "Tienda Nueva",
            tipo: "Tienda (Vinculada)",
            descripcion: `${currentShopData.descripcion_ambiente}. Regentada por ${currentShopData.vendedor?.nombre || 'un local'}.`,
            shopData: currentShopData
        };

        currentCityData.lugares_interes.push(nuevaTiendaEnCiudad);

        // 2. Refrescar ciudad
        renderCity(currentCityData);
        if (typeof addToHistory === 'function') addToHistory(currentCityData);

        // 3. Guardar en Historial Global Shops (Sin duplicados)
        try {
            const shopKey = 'history_shop';
            let shopHistory = JSON.parse(localStorage.getItem(shopKey) || '[]');

            const yaExiste = shopHistory.some(s => s.nombre_tienda === currentShopData.nombre_tienda);
            if (!yaExiste) {
                const historyItem = {
                    ...currentShopData,
                    nombre: currentShopData.nombre_tienda,
                    timestamp: new Date().toISOString()
                };
                shopHistory.unshift(historyItem);
                if (shopHistory.length > 20) shopHistory.pop();
                localStorage.setItem(shopKey, JSON.stringify(shopHistory));
            }
            alert("✅ Tienda guardada en ciudad y en historial global.");
        } catch (e) {
            console.error(e);
        }

    } catch (err) {
        console.error("Error al guardar:", err);
        alert("❌ Error: " + err.message);
    } finally {
        els.modal.style.display = 'none';
    }
});

els.closeModal.addEventListener('click', () => els.modal.style.display = 'none');
window.onclick = function(event) { if (event.target == els.modal) els.modal.style.display = 'none'; }

// ==========================================
// 5. EXPORTAR
// ==========================================
els.btnExp.addEventListener('click', () => {
    if(!currentCityData) return;
    let text = `--- CIUDAD: ${currentCityData.nombre} ---\n`;
    text += `TIPO: ${currentCityData.tipo}\nPOBLACIÓN: ${currentCityData.poblacion}\n\n`;
    text += `GOBIERNO: ${currentCityData.gobierno?.tipo} (Líder: ${currentCityData.gobierno?.lider})\n`;

    text += "DISTRITOS:\n";
    if (Array.isArray(currentCityData.distritos)) {
        currentCityData.distritos.forEach(d => { text += `- ${d.nombre}: ${d.descripcion}\n`; });
    }

    text += "\nLUGARES DE INTERÉS:\n";
    if (Array.isArray(currentCityData.lugares_interes)) {
        currentCityData.lugares_interes.forEach(p => text += `- ${p.nombre} (${p.tipo}): ${p.descripcion}\n`);
    }

    const blob = new Blob([text], {type : 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Ciudad_${currentCityData.nombre.replace(/\s+/g, '_')}.txt`;
    a.click();
});