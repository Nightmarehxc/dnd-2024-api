const API_URL = "http://localhost:5001/api/shops/generate";
let currentData = null;

const els = {
    type: document.getElementById('shopType'),
    loc: document.getElementById('location'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    if (!els.type.value) return alert("Define el tipo de tienda.");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                shop_type: els.type.value,
                location: els.loc.value
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderShop(data);
        els.btnExp.style.display = 'block';

        // Intentar detectar ciudad para guardarlo en historial
        if (els.loc.value && !currentData.city_reference) {
            // Si el usuario escribió "Baldur's Gate (Puerto)", extraemos "Baldur's Gate"
            const match = els.loc.value.match(/^(.*?)(\s\(|$)/);
            if (match) currentData.city_reference = match[1];
        }

        const historyItem = {
            ...data,
            nombre: data.nombre_tienda // Para que history.js lo muestre bien
        };
        if (typeof addToHistory === 'function') addToHistory(historyItem);

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

function renderShop(data) {
    const s = (val) => val || '---';

    const itemsHtml = (data.inventario || []).map(item => `
        <div style="display:flex; justify-content:space-between; padding:5px; border-bottom:1px solid #eee;">
            <span><strong>${item.nombre}</strong> <small style="color:#888;">(${item.tipo})</small></span>
            <span style="font-weight:bold; color:#d35400;">${item.precio_gp} gp</span>
        </div>
    `).join('');

    const vendedorHtml = data.vendedor ? `
        <div style="background:#fff; padding:10px; border:1px solid #ddd; border-radius:5px; margin-top:10px;">
            <strong>🤵 ${data.vendedor.nombre}</strong> (${data.vendedor.raza})<br>
            <em style="font-size:0.9em; color:#555;">"${data.vendedor.personalidad}"</em>
        </div>
    ` : '';

    // --- ENLACE CRUZADO A CIUDAD ---
    let cityLinkHtml = '';
    // Buscamos si existe una referencia directa o intentamos parsear la ubicación
    let cityRef = data.city_reference;

    // Si no viene referencia explícita, intentamos extraerla del string "location"
    if (!cityRef && data.location) {
        const match = data.location.match(/^(.*?)(\s\(|$)/);
        if (match) cityRef = match[1];
    }

    if (cityRef) {
        cityLinkHtml = `
            <div style="text-align:center; margin-bottom:15px;">
                <a href="city.html?load_city=${encodeURIComponent(cityRef)}"
                   class="btn-generate"
                   style="background:#34495e; padding:8px 15px; font-size:0.85rem; text-decoration:none; display:inline-block; width:auto;">
                   🏙️ Ir a ${cityRef}
                </a>
            </div>
        `;
    }
    // -------------------------------

    els.content.innerHTML = `
        ${cityLinkHtml}
        <h1 style="color:var(--accent); text-align:center; margin-bottom:5px;">${s(data.nombre_tienda)}</h1>
        <p style="text-align:center; font-style:italic; color:#666;">${s(data.tipo)}</p>

        <div style="background:#fdf2e9; padding:15px; border-radius:5px; border-left:4px solid #e67e22; margin-bottom:20px;">
            ${s(data.descripcion_ambiente)}
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
            <div>
                <h3 style="border-bottom:2px solid var(--accent);">📦 Inventario</h3>
                ${itemsHtml}
            </div>
            <div>
                <h3 style="border-bottom:2px solid var(--accent);">👤 Propietario</h3>
                ${vendedorHtml}

                ${data.secreto ? `
                    <div style="margin-top:20px; padding:10px; background:#e74c3c; color:white; border-radius:5px; font-size:0.9em;">
                        <strong>👁️ SECRETO (DM):</strong> ${data.secreto}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;

    // Export format for Foundry
    const json = {
        name: currentData.nombre_tienda,
        type: "journal",
        pages: [
            {
                name: "Tienda",
                type: "text",
                text: { content: els.content.innerHTML, format: 1 }
            }
        ]
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Tienda_${currentData.nombre_tienda.replace(/\s+/g, '_')}.json`;
    a.click();
});