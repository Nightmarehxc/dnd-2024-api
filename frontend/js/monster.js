const API_URL = "http://localhost:5001/api/monsters/generate";
let currentData = null;

const els = {
    base: document.getElementById('baseMonster'),
    theme: document.getElementById('theme'),
    cr: document.getElementById('targetCR'),
    btnGen: document.getElementById('btnGen'),
    btnEdit: document.getElementById('btnEdit'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader'),
    editorContainer: document.getElementById('jsonEditorContainer'),
    textarea: document.getElementById('jsonTextarea'),
    btnSave: document.getElementById('btnSaveChanges')
};

// --- 1. GENERAR ---
els.btnGen.addEventListener('click', async () => {
    if (!els.base.value || !els.theme.value) return alert("Faltan datos.");

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
                base_monster: els.base.value,
                theme: els.theme.value,
                target_cr: els.cr.value || null
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderMonster(data);

        els.btnEdit.style.display = 'block';
        els.btnExp.style.display = 'block';

        if (typeof addToHistory === 'function') {
            addToHistory({ ...data, nombre: data.name, tipo_item: "Monstruo" });
        }

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// --- 2. EDITAR JSON ---
els.btnEdit.addEventListener('click', () => {
    if(!currentData) return;
    els.textarea.value = JSON.stringify(currentData, null, 4);
    els.editorContainer.style.display = 'block';
    els.editorContainer.scrollIntoView({behavior: "smooth"});
});

els.btnSave.addEventListener('click', () => {
    try {
        const newData = JSON.parse(els.textarea.value);
        currentData = newData;
        renderMonster(currentData);
        els.editorContainer.style.display = 'none';
        alert("✅ Actualizado.");
    } catch (e) {
        alert("❌ Error JSON: " + e.message);
    }
});

// --- 3. RENDERIZAR ---
function renderMonster(data) {
    const s = (val) => val || '---';
    const stats = data.stats || {};

    const getMod = (score) => {
        const mod = Math.floor((score - 10) / 2);
        return mod >= 0 ? `+${mod}` : mod;
    };

    let statsHtml = '';
    ['STR','DEX','CON','INT','WIS','CHA'].forEach(stat => {
        const val = parseInt(stats[stat]) || 10;
        statsHtml += `
            <div class="ability-score">
                <strong>${stat}</strong><br>
                ${val} (${getMod(val)})
            </div>
        `;
    });

    const traitsHtml = (data.traits || []).map(t => `<p><strong>${t.name}.</strong> ${t.desc}</p>`).join('');
    const actionsHtml = (data.actions || []).map(a => `<p class="stat-line"><span class="action-name">${a.name}.</span> ${a.desc}</p>`).join('');

    els.content.innerHTML = `
        <div class="stat-block">
            <h2>${s(data.name)}</h2>
            <div style="font-style:italic;">${s(data.type)}, ${s(data.alignment)}</div>
            <div class="red-line"></div>

            <p class="stat-line"><strong>AC</strong> ${s(data.ac)}</p>
            <p class="stat-line"><strong>HP</strong> ${s(data.hp)}</p>
            <p class="stat-line"><strong>Speed</strong> ${s(data.speed)}</p>

            <div class="red-line"></div>
            <div style="display:flex; justify-content:space-between;">${statsHtml}</div>
            <div class="red-line"></div>

            <p class="stat-line"><strong>Saves:</strong> ${s(data.saves)}</p>
            <p class="stat-line"><strong>Skills:</strong> ${s(data.skills)}</p>
            <p class="stat-line"><strong>Senses:</strong> ${s(data.senses)}</p>
            <p class="stat-line"><strong>CR:</strong> ${s(data.cr)}</p>

            <div class="red-line"></div>
            ${traitsHtml}

            <h3 style="color:#822000; border-bottom:1px solid #822000;">Acciones</h3>
            ${actionsHtml}

            <div style="margin-top:15px; padding-top:10px; border-top:1px solid #aaa; font-style:italic; font-size:0.9em;">
                ${s(data.visual)}
            </div>
        </div>
    `;
}

// --- 4. EXPORTAR A FOUNDRY (Lógica Compleja) ---
els.btnExp.addEventListener('click', () => {
    if(!currentData) return;

    // 1. Procesar Stats (STR -> str)
    const abilities = {};
    const keys = { 'STR': 'str', 'DEX': 'dex', 'CON': 'con', 'INT': 'int', 'WIS': 'wis', 'CHA': 'cha' };

    // Default 10 si no existe
    Object.keys(keys).forEach(k => {
        abilities[keys[k]] = {
            value: parseInt(currentData.stats[k]) || 10,
            mod: Math.floor(((parseInt(currentData.stats[k]) || 10) - 10) / 2)
        };
    });

    // 2. Procesar HP (Separar "50 (6d10)" -> 50 y fórmula)
    let hpVal = 10;
    let hpFormula = "";
    if (currentData.hp) {
        // Intentar sacar el primer número
        const matchVal = currentData.hp.toString().match(/^(\d+)/);
        if (matchVal) hpVal = parseInt(matchVal[1]);

        // Intentar sacar fórmula entre paréntesis
        const matchForm = currentData.hp.toString().match(/\((.*?)\)/);
        if (matchForm) hpFormula = matchForm[1];
    }

    // 3. Crear Items (Rasgos y Acciones)
    const items = [];

    // Rasgos -> Feats
    (currentData.traits || []).forEach(t => {
        items.push({
            name: t.name,
            type: "feat",
            system: {
                description: { value: t.desc },
                activation: { type: "", cost: 0 },
                duration: { value: "", units: "" }
            }
        });
    });

    // Acciones -> Weapons (Para que se puedan tirar dados)
    (currentData.actions || []).forEach(a => {
        items.push({
            name: a.name,
            type: "weapon", // "weapon" permite tiradas de ataque/daño en Foundry
            system: {
                description: { value: a.desc },
                activation: { type: "action", cost: 1 },
                actionType: "mwak", // Melee Weapon Attack por defecto
                equipped: true
            }
        });
    });

    // 4. Construir JSON Final
    const json = {
        name: currentData.name,
        type: "npc",
        img: "icons/svg/mystery-man.svg",
        system: {
            attributes: {
                ac: { value: parseInt(currentData.ac) || 10 },
                hp: { value: hpVal, max: hpVal, formula: hpFormula },
                speed: { value: currentData.speed || "30 ft" }
            },
            abilities: abilities,
            details: {
                alignment: currentData.alignment || "Neutral",
                cr: parseFloat(currentData.cr) || 1,
                biography: { value: currentData.visual || "" },
                type: { value: currentData.type || "custom" }
            },
            traits: {
                languages: { value: [currentData.languages || "Common"] }
            }
        },
        items: items // <--- Aquí van las armas y poderes
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${currentData.name.replace(/\s+/g, '_')}_Foundry.json`;
    a.click();
});