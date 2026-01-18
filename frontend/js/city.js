const API_URL = "http://localhost:5001/api/cities/generate";
const SHOP_API_URL = "http://localhost:5001/api/shops/generate"; // <--- Conexión con el módulo de Tiendas

let currentCityData = null;
let currentShopData = null; // Para guardar la tienda temporalmente

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

function renderCity(data) {
    const s = (val) => val || '---';

    // Crear HTML de distritos con botones de acción
    let distritosHtml = '';
    if (data.distritos && data.distritos.length > 0) {
        distritosHtml = data.distritos.map((d, index) => `
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

    // Puntos de Interés
    let poisHtml = '';
    if (data.lugares_interes && data.lugares_interes.length > 0) {
        poisHtml = `<h3 style="margin-top:20px; border-bottom:2px solid #3498db; color:#3498db;">📍 Lugares de Interés</h3>
        <ul style="padding-left:20px;">
            ${data.lugares_interes.map(p => `<li style="margin-bottom:5px;"><strong>${p.nombre}:</strong> ${p.descripcion}</li>`).join('')}
        </ul>`;
    }

    els.content.innerHTML = `
        <h1 style="color:var(--accent); text-align:center; margin-bottom:5px;">${s(data.nombre)}</h1>
        <p style="text-align:center; font-style:italic; color:#666; margin-top:0;">
            ${s(data.tipo)} - ${s(data.clima)}
        </p>

        <div style="background:#fdf6e3; padding:15px; border-radius:8px; border:1px solid #d4c5a3; margin-bottom:20px; font-family:'Georgia', serif;">
            <p><strong>📜 Gobierno:</strong> ${s(data.gobierno)}</p>
            <p><strong>🛡️ Defensas:</strong> ${s(data.defensas)}</p>
            <p><strong>🗣️ Rumor Local:</strong> ${s(data.rumores)}</p>
        </div>

        <h3 style="border-bottom:2px solid var(--accent); padding-bottom:5px;">🏘️ Distritos y Barrios</h3>
        ${distritosHtml || '<p>Sin distritos detallados.</p>'}

        ${poisHtml}

        <div style="text-align:center; margin-top:30px;">
            <button class="btn-generate" onclick="openShopGen('General', '${data.nombre}')" style="background:#8e44ad; width:auto;">🔮 Generar Tienda Aleatoria en la Ciudad</button>
        </div>
    `;
}

// --- LÓGICA DEL MODAL DE TIENDAS ---

// Función global para poder llamarla desde el onclick del HTML inyectado
window.openShopGen = async function(districtName, cityName) {
    els.modal.style.display = 'block';
    els.shopBody.innerHTML = '';
    els.shopLoader.style.display = 'block';
    els.btnSaveShop.style.display = 'none';

    // Generar prompt inteligente basado en el distrito
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

    // Reutilizamos el estilo de renderizado de shops.js pero simplificado para el modal
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
            <p><strong>Personalidad del Dueño:</strong> ${s(data.personalidad_dueno)}</p>
        </div>

        <h4 style="border-bottom:2px solid #27ae60;">📦 Inventario</h4>
        <div style="max-height:200px; overflow-y:auto;">
            ${itemsHtml}
        </div>

        ${data.secreto ? `<p style="margin-top:15px; color:#c0392b; font-size:0.9em;"><strong>👁️ Secreto (DM):</strong> ${data.secreto}</p>` : ''}
    `;
}

// Cerrar Modal
els.closeModal.addEventListener('click', () => els.modal.style.display = 'none');
window.onclick = function(event) {
    if (event.target == els.modal) els.modal.style.display = 'none';
}

// Guardar Tienda (Opcional: Podría guardarlo en localStorage o enviarlo al backend si tuvieras persistencia)
els.btnSaveShop.addEventListener('click', () => {
    // Aquí hacemos un truco: Enviamos este objeto a la función addToHistory simulando que viene de la página de tiendas
    // Para que aparezca en el historial global si el usuario lo desea.
    const historyItem = {
        ...currentShopData,
        tipo_objeto: 'shop', // Flag para history.js
        nombre: `[Tienda] ${currentShopData.nombre}` // Diferenciarlo en el historial
    };

    // Necesitamos asegurarnos de que addToHistory maneje esto o simplemente alertar
    alert("Tienda guardada en la memoria temporal.");
    // Si tu history.js soporta tipos genéricos, esto funcionaría:
    if (typeof addToHistory === 'function') addToHistory(historyItem);

    els.modal.style.display = 'none';
});

// --- EXPORTAR CIUDAD ---
els.btnExp.addEventListener('click', () => {
    if(!currentCityData) return;

    let text = `--- CIUDAD: ${currentCityData.nombre} ---\n`;
    text += `TIPO: ${currentCityData.tipo}\n`;
    text += `GOBIERNO: ${currentCityData.gobierno}\n\n`;

    text += "DISTRITOS:\n";
    currentCityData.distritos.forEach(d => {
        text += `- ${d.nombre}: ${d.descripcion}\n`;
    });

    const blob = new Blob([text], {type : 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Ciudad_${currentCityData.nombre.replace(/\s+/g, '_')}.txt`;
    a.click();
});