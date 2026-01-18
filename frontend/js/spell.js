const API_URL = "http://localhost:5001/api/spells/generate";
let currentData = null;

const els = {
    desc: document.getElementById('desc'),
    lvl: document.getElementById('level'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    if (!els.desc.value) return alert("Describe la magia que buscas.");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const payload = { description: els.desc.value };
        if (els.lvl.value) payload.level = parseInt(els.lvl.value);

        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderSpell(data);
        els.btnExp.style.display = 'block';

        const historyData = { ...data, nombre: data.nombre };
        if (typeof addToHistory === 'function') addToHistory(historyData);

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

function renderSpell(data) {
    const s = (val) => val || '---';

    els.content.innerHTML = `
        <div class="spell-card">
            <h1 class="spell-header">${s(data.nombre)}</h1>
            <div class="spell-meta">${s(data.nivel_escuela)}</div>

            <div class="spell-stats">
                <strong>Tiempo:</strong> <span>${s(data.tiempo_casteo)}</span>
                <strong>Alcance:</strong> <span>${s(data.alcance)}</span>
                <strong>Compon:</strong> <span>${s(data.componentes)}</span>
                <strong>Duración:</strong> <span>${s(data.duracion)}</span>
            </div>

            <div class="spell-body">
                ${s(data.descripcion).replace(/\n/g, '<br>')}

                ${data.a_niveles_superiores ? `
                    <p class="higher-levels"><strong>A niveles superiores:</strong> ${data.a_niveles_superiores}</p>
                ` : ''}
            </div>

            <div class="classes-list">
                Clases: ${(data.clases || []).join(', ')}
            </div>
        </div>
    `;
}

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;

    // Intentar extraer el nivel número del string "Evocación de nivel 3"
    let levelNum = 0;
    const match = currentData.nivel_escuela.match(/\d+/);
    if(match) levelNum = parseInt(match[0]);

    const json = {
        name: currentData.nombre,
        type: "spell",
        img: "icons/svg/book.svg",
        system: {
            level: levelNum,
            school: "evo", // Genérico, difícil de mapear todos sin lógica compleja
            components: {
                vocal: currentData.componentes.includes('V'),
                somatic: currentData.componentes.includes('S'),
                material: currentData.componentes.includes('M'),
            },
            materials: { value: currentData.componentes },
            description: {
                value: `<p>${currentData.descripcion}</p><p><strong>A niveles superiores:</strong> ${currentData.a_niveles_superiores || ''}</p>`
            },
            activation: { type: "action", cost: 1 }, // Asumido
            duration: { units: "inst" } // Asumido
        }
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${currentData.nombre.replace(/\s+/g, '_')}_spell.json`;
    a.click();
});