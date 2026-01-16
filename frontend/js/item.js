const API_URL = "http://localhost:5001/api/items/generate";
let currentData = null;

const els = {
    type: document.getElementById('itemType'),
    desc: document.getElementById('desc'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    if (!els.desc.value) return alert("Describe el objeto.");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                description: els.desc.value,
                type: els.type ? els.type.value : "Cualquiera"
            })
        });
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        currentData = data;
        renderItem(data);
        els.btnExp.style.display = 'block';

        // --- GUARDAR EN HISTORIAL ---
        if (typeof addToHistory === 'function') addToHistory(data);

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

function renderItem(data) {
    els.content.innerHTML = `
        <h1 style="color:var(--accent); margin:0;">${data.nombre}</h1>
        <p style="font-style:italic;">${data.rareza} - ${data.tipo}</p>

        ${data.dano ? `<span class="tag" style="background:#ddd; padding:2px 8px; border-radius:10px; margin-right:5px;">💥 ${data.dano.formula} ${data.dano.tipo}</span>` : ''}
        ${data.weapon_mastery ? `<span class="tag" style="background:#fadbd8; color:#922b21; padding:2px 8px; border-radius:10px;">⚔️ Mastery: ${data.weapon_mastery}</span>` : ''}

        <h3>Mecánica</h3>
        <p>${data.efecto_mecanico}</p>

        <h3>Descripción</h3>
        <p style="font-style:italic;">${data.descripcion_vis}</p>
    `;
}

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;
    const isWeapon = !!currentData.dano;

    const json = {
        name: currentData.nombre,
        type: isWeapon ? "weapon" : "equipment",
        img: isWeapon ? "icons/svg/sword.svg" : "icons/svg/item-bag.svg",
        system: {
            description: { value: `<p>${currentData.descripcion_vis}</p><hr><p>${currentData.efecto_mecanico}</p>` },
            rarity: (currentData.rareza || "common").toLowerCase().split(' ')[0],
            equipped: true,
            identified: true
        }
    };

    if(isWeapon && currentData.dano) {
        json.system.actionType = "mwak";
        json.system.damage = {
            parts: [[currentData.dano.formula + " + @mod", currentData.dano.tipo]]
        };
    }

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${currentData.nombre}_Foundry.json`;
    a.click();
});