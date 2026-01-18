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

// --- GENERACIÓN DE CIUDAD ---
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

// --- RENDERIZADO (MODO LECTURA) ---
function renderCity(data) {
    const s = (val) => val || '---';

    // Botón de Editar
    const editBtn = `<button onclick="enterEditMode()" class="btn-generate" style="background:#f39c12; width:auto; padding:5px 15px; font-size:0.9rem; margin-bottom:10px;">✏️ Editar Ciudad</button>`;

    let distritosHtml = '';
    if (data.distritos && data.distritos.length > 0) {
        distritosHtml = data.distritos.map((d) => `
            <div style="margin-bottom:15px; padding:10px; background:white; border-left:4px solid var(--accent); border-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h4 style="margin:0; color:var(--text-main);">${d.nombre}</h4>
                    <button class="btn-mini-shop" onclick="openShopGen('${d.nombre}', '${data.nombre}')">🏪 Abrir Tienda Aquí</button>
                </div>
                <p style="font-size:0.95em; margin:5px 0;">${d.descripcion}</p>
                <div style="font-size:0.85em; color:#666;">
                    <strong>Ambiente:</strong> ${d.ambiente || 'N/A'} |
                    <strong>Habitantes:</strong> ${d.habitantes_tipo || 'Variado'}
                </div>
            </div>
        `).join('');
    }

    let poisHtml = '';
    if (data.lugares_interes && data.lugares_interes.length > 0) {
        poisHtml = `<h3 style="margin-top:20px; border-bottom:2px solid #3498db; color:#3498db;">📍 Lugares de Interés</h3>
        <ul style="padding-left:20px;">
            ${data.lugares_interes.map(p => `<li style="margin-bottom:5px;"><strong>${p.nombre}:</strong> ${p.descripcion}</li>`).join('')}
        </ul>`;
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
            <p><strong>🗣️ Rumor:</strong> ${s(data.rumores)}</p>
        </div>

        <h3 style="border-bottom:2px solid var(--accent); padding-bottom:5px;">🏘️ Distritos y Barrios</h3>
        ${distritosHtml || '<p>Sin distritos detallados.</p>'}

        ${poisHtml}

        <div style="text-align:center; margin-top:30px;">
            <button class="btn-generate" onclick="openShopGen('General', '${data.nombre}')" style="background:#8e44ad; width:auto;">🔮 Generar Tienda Aleatoria</button>
        </div>
    `;
}

// --- MODO EDICIÓN ---
window.enterEditMode = function() {
    const d = currentCityData;
    if (!d) return;

    // Generar inputs para distritos
    const districtsInputs = d.distritos.map((dist, idx) => `
        <div style="background:#eee; padding:10px; margin-bottom:10px; border-radius:5px;">
            <input type="text" id="edit_dist_name_${idx}" value="${dist.nombre}" style="font-weight:bold; margin-bottom:5px;">
            <textarea id="edit_dist_desc_${idx}" rows="2">${dist.descripcion}</textarea>
        </div>
    `).join('');

    els.content.innerHTML = `
        <h2 style="color:#f39c12;">✏️ Editando ${d.nombre}</h2>

        <label>Nombre de la Ciudad</label>
        <input type="text" id="edit_name" value="${d.nombre}">

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div><label>Tipo</label><input type="text" id="edit_type" value="${d.tipo}"></div>
            <div><label>Población</label><input type="text" id="edit_pop" value="${d.poblacion}"></div>
        </div>

        <label>Clima</label>
        <input type="text" id="edit_clima" value="${d.clima}">

        <h3 style="margin-top:20px;">Gobierno</h3>
        <label>Tipo de Gobierno</label><input type="text" id="edit_gob_type" value="${d.gobierno?.tipo || ''}">
        <label>Líder</label><input type="text" id="edit_gob_leader" value="${d.gobierno?.lider || ''}">
        <label>Descripción / Leyes</label><textarea id="edit_gob_desc" rows="3">${d.gobierno?.descripcion || ''}</textarea>

        <label>Rumores</label>
        <textarea id="edit_rumors" rows="2">${d.rumores || ''}</textarea>

        <h3>Distritos</h3>
        ${districtsInputs}

        <div style="margin-top:20px; display:flex; gap:10px;">
            <button onclick="saveCityChanges()" class="btn-generate" style="background:#27ae60;">💾 Guardar Cambios</button>
            <button onclick="renderCity(currentCityData)" class="btn-generate" style="background:#95a5a6;">❌ Cancelar</button>
        </div>
    `;
};

window.saveCityChanges = function() {
    if (!currentCityData) return;

    // Actualizar objeto en memoria
    currentCityData.nombre = document.getElementById('edit_name').value;
    currentCityData.tipo = document.getElementById('edit_type').value;
    currentCityData.poblacion = document.getElementById('edit_pop').value;
    currentCityData.clima = document.getElementById('edit_clima').value;

    if(!currentCityData.gobierno) currentCityData.gobierno = {};
    currentCityData.gobierno.tipo = document.getElementById('edit_gob_type').value;
    currentCityData.gobierno.lider = document.getElementById('edit_gob_leader').value;
    currentCityData.gobierno.descripcion = document.getElementById('edit_gob_desc').value;

    currentCityData.rumores = [document.getElementById('edit_rumors').value]; // Guardar como array de 1

    // Guardar distritos
    currentCityData.distritos.forEach((dist, idx) => {
        const nameInput = document.getElementById(`edit_dist_name_${idx}`);
        const descInput = document.getElementById(`edit_dist_desc_${idx}`);
        if(nameInput) dist.nombre = nameInput.value;
        if(descInput) dist.descripcion = descInput.value;
    });

    // Volver a renderizar modo lectura
    renderCity(currentCityData);
};

// --- MODAL Y TIENDAS ---
window.openShopGen = async function(districtName, cityName) {
    els.modal.style.display = 'block';
    els.shopBody.innerHTML = '';
    els.shopLoader.style.display = 'block';
    els.btnSaveShop.style.display = 'none';

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

        currentShopData = data;
        renderShopInModal(data);
        els.btnSaveShop.style.display = 'inline-block';

    } catch (err) {
        els.shopBody.innerHTML = `<p style="color:red">Error generando tienda: ${err.message}</p>`;
    } finally {
        els.shopLoader.style.display = 'none';
    }
};

function renderShopInModal(data) {
    const s = (val) => val || '---';
    const itemsHtml = data.inventario.map(item => `
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:5px 0;">
            <span>${item.item}</span>
            <span style="font-weight:bold; color:#e67e22;">${item.precio}</span>
        </div>
    `).join('');

    els.shopBody.innerHTML = `
        <h2 style="color:#27ae60; margin-top:0; text-align:center;">${s(data.nombre)}</h2>
        <p style="text-align:center; font-style:italic; color:#666;">${s(data.tipo)} - Propiedad de ${s(data.dueno)}</p>
        <div style="background:#f9f9f9; padding:10px; border-radius:5px; margin-bottom:15px; font-size:0.9em;">
            <p><strong>Apariencia:</strong> ${s(data.descripcion)}</p>
        </div>
        <h4 style="border-bottom:2px solid #27ae60;">📦 Inventario</h4>
        <div style="max-height:200px; overflow-y:auto;">${itemsHtml}</div>
    `;
}

els.closeModal.addEventListener('click', () => els.modal.style.display = 'none');
window.onclick = function(event) { if (event.target == els.modal) els.modal.style.display = 'none'; }

els.btnSaveShop.addEventListener('click', () => {
    alert("Tienda guardada en memoria.");
    els.modal.style.display = 'none';
});

els.btnExp.addEventListener('click', () => {
    if(!currentCityData) return;
    let text = `--- CIUDAD: ${currentCityData.nombre} ---\n`;
    text += `TIPO: ${currentCityData.tipo}\nPOBLACIÓN: ${currentCityData.poblacion}\n\n`;
    text += `GOBIERNO: ${currentCityData.gobierno?.tipo} (Líder: ${currentCityData.gobierno?.lider})\n`;
    text += "DISTRITOS:\n";
    currentCityData.distritos.forEach(d => { text += `- ${d.nombre}: ${d.descripcion}\n`; });

    const blob = new Blob([text], {type : 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Ciudad_${currentCityData.nombre.replace(/\s+/g, '_')}.txt`;
    a.click();
});