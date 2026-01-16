const API_URL = "http://localhost:5001/api/shops/generate";
let currentData = null;

const els = {
    shopType: document.getElementById('shopType'),
    location: document.getElementById('location'),
    level: document.getElementById('level'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    if (!els.shopType.value) return alert("Indica el tipo de tienda.");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const payload = {
            shop_type: els.shopType.value,
            location: els.location.value || "Ciudad Genérica",
            level: parseInt(els.level.value)
        };

        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderShop(data);
        els.btnExp.style.display = 'block';

        // GUARDAR EN HISTORIAL
        if (typeof addToHistory === 'function') addToHistory(data);

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

function renderShop(data) {
    const s = (val) => val || '---';

    // Generar filas de la tabla de inventario
    let inventoryRows = data.inventario.map(item => `
        <tr>
            <td style="padding:8px; border-bottom:1px solid #ddd;"><strong>${item.nombre}</strong><br><small>${item.tipo}</small></td>
            <td style="padding:8px; border-bottom:1px solid #ddd;">${item.precio_gp} gp</td>
            <td style="padding:8px; border-bottom:1px solid #ddd; font-size:0.9rem;">${item.descripcion}</td>
        </tr>
    `).join('');

    els.content.innerHTML = `
        <h1 style="color:var(--accent); text-align:center; margin-bottom:5px;">${s(data.nombre_tienda)}</h1>
        <p style="text-align:center; font-style:italic; color:#666; margin-top:0;">${s(data.descripcion_ambiente)}</p>

        <div style="background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #ddd; margin-bottom:20px;">
            <h3 style="margin-top:0;">👤 Vendedor: ${s(data.vendedor.nombre)}</h3>
            <p><strong>${s(data.vendedor.raza)} - ${s(data.vendedor.rol)}</strong></p>
            <p>${s(data.vendedor.personalidad)}</p>
            <p><small>Apariencia: ${s(data.vendedor.apariencia)}</small></p>
        </div>

        <h3>📦 Inventario</h3>
        <table style="width:100%; border-collapse:collapse; background:white;">
            <thead style="background:var(--accent); color:white;">
                <tr>
                    <th style="padding:8px; text-align:left;">Objeto</th>
                    <th style="padding:8px; text-align:left;">Precio</th>
                    <th style="padding:8px; text-align:left;">Detalles</th>
                </tr>
            </thead>
            <tbody>
                ${inventoryRows}
            </tbody>
        </table>
    `;
}

// EXPORTAR A FOUNDRY (Actor con Items)
els.btnExp.addEventListener('click', () => {
    if(!currentData) return;

    const vendor = currentData.vendedor;

    // 1. Crear items en formato Foundry
    const foundryItems = currentData.inventario.map(item => {
        const isWeapon = !!item.dano;
        return {
            name: item.nombre,
            type: isWeapon ? "weapon" : "equipment", // Simplificación
            img: isWeapon ? "icons/svg/sword.svg" : "icons/svg/item-bag.svg",
            system: {
                description: { value: item.descripcion },
                price: { value: item.precio_gp, denomination: "gp" },
                quantity: 1,
                equipped: false,
                rarity: (item.rareza || "common").toLowerCase().split(' ')[0],
                // Si es arma, añadimos daño básico
                actionType: isWeapon ? "mwak" : null,
                damage: isWeapon ? { parts: [[item.dano, ""]] } : { parts: [] }
            }
        };
    });

    // 2. Crear el Actor (NPC) que contiene los items
    const foundryActor = {
        name: `${currentData.nombre_tienda} (${vendor.nombre})`,
        type: "npc",
        img: "icons/svg/mystery-man.svg",
        system: {
            details: {
                biography: {
                    value: `<p><strong>Tienda:</strong> ${currentData.nombre_tienda}</p>
                            <p>${currentData.descripcion_ambiente}</p>
                            <hr>
                            <p><strong>Vendedor:</strong> ${vendor.nombre}</p>
                            <p>${vendor.personalidad}</p>`
                },
                race: vendor.raza,
                type: { value: "humanoid" }
            },
            attributes: {
                hp: { value: vendor.stats_resumidos?.hp || 10, max: vendor.stats_resumidos?.hp || 10 },
                ac: { value: vendor.stats_resumidos?.ca || 10, calc: "natural" }
            }
        },
        items: foundryItems // ¡Aquí metemos todo el inventario!
    };

    const blob = new Blob([JSON.stringify(foundryActor, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Tienda_${currentData.nombre_tienda.replace(/\s+/g, '_')}.json`;
    a.click();
});