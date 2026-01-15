const API_URL = "http://localhost:5001/api/npcs/generate";
let currentData = null;

const els = {
    desc: document.getElementById('desc'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    if (!els.desc.value) return alert("Escribe una descripción.");

    // Reset UI
    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ description: els.desc.value })
        });

        const data = await res.json();

        if (data.error) throw new Error(data.error);

        currentData = data;
        renderNPC(data);
        els.btnExp.style.display = 'block';

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

function renderNPC(data) {
    const s = (val) => val || '---';
    els.content.innerHTML = `
        <h1 style="color:var(--accent); margin:0;">${s(data.nombre)}</h1>
        <p style="font-style:italic; margin-top:0;">${s(data.raza)} - ${s(data.rol)} (${s(data.alineamiento)})</p>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; background:#eee; padding:10px; border-radius:5px; text-align:center;">
            <div><strong>CA</strong><br>${data.ca || 10}</div>
            <div><strong>HP</strong><br>${data.hp || 10}</div>
            <div><strong>Vel</strong><br>${data.velocidad || 30}ft</div>
        </div>

        <h3>Estadísticas</h3>
        <div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:5px; font-size:0.8rem; text-align:center;">
            ${data.estadisticas ? Object.entries(data.estadisticas).map(([k,v]) =>
                `<div><strong>${k}</strong><br>${v}</div>`).join('') : ''}
        </div>

        <h3>Ataques</h3>
        ${data.ataques?.map(atk => `
            <div style="margin-bottom:5px; border-bottom:1px solid #ccc; padding-bottom:5px;">
                <strong>${atk.nombre}</strong> (${atk.tipo}) <br>
                ⚔️ +${atk.bonificador_ataque} | 💥 ${atk.formula_dano} ${atk.tipo_dano}
            </div>
        `).join('') || '<p>Sin ataques</p>'}

        <h3>Historia</h3>
        <p>${s(data.gancho_trama)}</p>
    `;
}

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;

    // Mapeo básico de Foundry
    const json = {
        name: currentData.nombre,
        type: "npc",
        img: "icons/svg/mystery-man.svg",
        system: {
            attributes: {
                ac: { value: currentData.ca, calc: "natural" },
                hp: { value: currentData.hp, max: currentData.hp },
                movement: { walk: currentData.velocidad }
            },
            details: {
                race: currentData.raza,
                biography: { value: currentData.gancho_trama }
            }
        },
        items: currentData.ataques?.map(atk => ({
            name: atk.nombre,
            type: "weapon",
            img: "icons/svg/sword.svg",
            system: {
                actionType: atk.tipo === 'ranged' ? 'rwak' : 'mwak',
                damage: { parts: [[atk.formula_dano + " + @mod", atk.tipo_dano.toLowerCase()]] },
                activation: { type: "action", cost: 1 },
                equipped: true
            }
        })) || []
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${currentData.nombre}_foundry.json`;
    a.click();
});