const API_URL = "http://localhost:5001/api/npcs/generate";
const IMAGE_API_URL = "http://localhost:5001/api/images/generate";
let currentData = null;

const els = {
    desc: document.getElementById('desc'),
    btnGen: document.getElementById('btnGen'),
    btnImg: document.getElementById('btnImg'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader'),
    imgContainer: document.getElementById('imgContainer'),
    generatedImg: document.getElementById('generatedImg')
};

// --- GENERAR NPC (TEXTO) ---
els.btnGen.addEventListener('click', async () => {
    if (!els.desc.value) return alert("Escribe una descripción.");

    // Reset UI
    els.content.innerHTML = '';
    els.imgContainer.style.display = 'none';
    els.generatedImg.src = '';
    els.btnImg.style.display = 'none';

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

        // Mostrar botón de imagen
        els.btnImg.style.display = 'block';
        els.btnImg.disabled = false;
        els.btnImg.innerText = "🎨 Generar Retrato";

        if (typeof addToHistory === 'function') addToHistory(data);

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// --- GENERAR IMAGEN (CON DETECCIÓN DE ERROR REGIONAL) ---
els.btnImg.addEventListener('click', async () => {
    if (!currentData) return;

    els.btnImg.disabled = true;
    els.btnImg.innerText = "🎨 Pintando (espera unos segundos)...";

    try {
        const prompt = `Fantasy character portrait, D&D style, ${currentData.raza} ${currentData.rol}. ${currentData.apariencia || currentData.descripcion_fisica || ""} ${currentData.personalidad || ""}`;

        const res = await fetch(IMAGE_API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                description: prompt,
                type: 'npc'
            })
        });

        const data = await res.json();

        if (data.error) throw new Error(data.error);

        els.generatedImg.src = "../" + data.url;
        els.imgContainer.style.display = 'block';
        els.btnImg.style.display = 'none';

    } catch (err) {
        // --- MANEJO DE ERROR MEJORADO ---
        console.error(err);

        if (err.message.includes("not available in your country")) {
            alert("⚠️ BLOQUEO REGIONAL DETECTADO\n\nGoogle no permite generar imágenes con Gemini desde tu país (Europa).\n\nSOLUCIÓN: Activa una VPN (EE.UU) para usar esta función.");
            els.btnImg.innerText = "⚠️ No disponible en tu región";
        } else {
            alert("Error generando imagen: " + err.message);
            els.btnImg.innerText = "❌ Error (Intentar de nuevo)";
            els.btnImg.disabled = false;
        }
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

        <h3>Historia y Rasgos</h3>
        <p><strong>Personalidad:</strong> ${s(data.personalidad?.rasgo || data.personalidad)}</p>
        <p><strong>Apariencia:</strong> ${s(data.apariencia)}</p>
        <p><strong>Gancho:</strong> ${s(data.gancho_trama)}</p>
    `;
}

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;

    const json = {
        name: currentData.nombre,
        type: "npc",
        img: els.generatedImg.src.includes('generated') ? els.generatedImg.src : "icons/svg/mystery-man.svg",
        system: {
            attributes: {
                ac: { value: currentData.ca, calc: "natural" },
                hp: { value: currentData.hp, max: currentData.hp },
                movement: { walk: currentData.velocidad }
            },
            details: {
                race: currentData.raza,
                biography: { value: `<p>${currentData.gancho_trama}</p><p>${currentData.apariencia}</p>` }
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