const API_URL = "http://localhost:5001/api/monsters/generate";
let currentData = null;

const els = {
    base: document.getElementById('baseMonster'),
    theme: document.getElementById('theme'),
    cr: document.getElementById('targetCR'),
    btnGen: document.getElementById('btnGen'),
    btnEdit: document.getElementById('btnEdit'), // Botón Editar
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader'),
    // Elementos del Editor
    editorContainer: document.getElementById('jsonEditorContainer'),
    textarea: document.getElementById('jsonTextarea'),
    btnSave: document.getElementById('btnSaveChanges')
};

// --- 1. GENERAR MONSTRUO ---
els.btnGen.addEventListener('click', async () => {
    if (!els.base.value || !els.theme.value) return alert("Faltan datos básicos.");

    els.content.innerHTML = '';
    els.editorContainer.style.display = 'none'; // Ocultar editor si estaba abierto
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

        // Mostrar botones de acción
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

// --- 2. ABRIR EDITOR JSON ---
els.btnEdit.addEventListener('click', () => {
    if(!currentData) return;
    // Rellenar el textarea con los datos actuales bonitos
    els.textarea.value = JSON.stringify(currentData, null, 4);
    // Mostrar el contenedor
    els.editorContainer.style.display = 'block';
    // Scroll hacia el editor
    els.editorContainer.scrollIntoView({behavior: "smooth"});
});

// --- 3. GUARDAR CAMBIOS (JSON -> VISTA) ---
els.btnSave.addEventListener('click', () => {
    try {
        // Parsear el texto
        const newData = JSON.parse(els.textarea.value);

        // Actualizar datos actuales
        currentData = newData;

        // Regenerar la vista bonita
        renderMonster(currentData);

        // Ocultar editor
        els.editorContainer.style.display = 'none';

        // (Opcional) Actualizar historial si quisieras, pero requeriría lógica extra
        alert("✅ Monstruo actualizado correctamente.");

    } catch (e) {
        alert("❌ Error en el JSON: " + e.message + "\n\nRevisa las comillas y comas.");
    }
});

// --- RENDERIZAR FICHA (STAT BLOCK) ---
function renderMonster(data) {
    const s = (val) => val || '---';
    const stats = data.stats || {};

    // Función auxiliar para calcular modificador: (Score - 10) / 2
    const getMod = (score) => {
        const mod = Math.floor((score - 10) / 2);
        return mod >= 0 ? `+${mod}` : mod;
    };

    // Generar HTML de Atributos
    let statsHtml = '';
    ['STR','DEX','CON','INT','WIS','CHA'].forEach(stat => {
        const val = stats[stat] || 10;
        statsHtml += `
            <div class="ability-score">
                <strong>${stat}</strong><br>
                ${val} (${getMod(val)})
            </div>
        `;
    });

    // Generar HTML de Rasgos y Acciones
    const traitsHtml = (data.traits || []).map(t => `<p><strong>${t.name}.</strong> ${t.desc}</p>`).join('');
    const actionsHtml = (data.actions || []).map(a => `<p class="stat-line"><span class="action-name">${a.name}.</span> ${a.desc}</p>`).join('');

    els.content.innerHTML = `
        <div class="stat-block">
            <h2>${s(data.name)}</h2>
            <div style="font-style:italic;">${s(data.type)}, ${s(data.alignment)}</div>
            <div class="red-line"></div>

            <p class="stat-line"><strong>Armor Class</strong> ${s(data.ac)}</p>
            <p class="stat-line"><strong>Hit Points</strong> ${s(data.hp)}</p>
            <p class="stat-line"><strong>Speed</strong> ${s(data.speed)}</p>

            <div class="red-line"></div>
            <div style="display:flex; justify-content:space-between;">
                ${statsHtml}
            </div>
            <div class="red-line"></div>

            <p class="stat-line"><strong>Saving Throws</strong> ${s(data.saves)}</p>
            <p class="stat-line"><strong>Skills</strong> ${s(data.skills)}</p>
            <p class="stat-line"><strong>Senses</strong> ${s(data.senses)}</p>
            <p class="stat-line"><strong>Languages</strong> ${s(data.languages)}</p>
            <p class="stat-line"><strong>Challenge</strong> ${s(data.cr)}</p>

            <div class="red-line"></div>
            ${traitsHtml}

            <h3 style="color:#822000; border-bottom:1px solid #822000;">Actions</h3>
            ${actionsHtml}

            <div style="margin-top:15px; border-top:1px solid #aaa; padding-top:10px; font-style:italic; font-size:0.9em;">
                <strong>Visual:</strong> ${s(data.visual)}
            </div>
        </div>
    `;
}

// --- EXPORTAR A FOUNDRY ---
els.btnExp.addEventListener('click', () => {
    if(!currentData) return;
    const json = {
        name: currentData.name,
        type: "npc",
        system: {
            details: { biography: { value: currentData.visual } },
            attributes: { ac: { value: currentData.ac }, hp: { value: parseInt(currentData.hp) || 10 } }
        }
    };
    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${currentData.name.replace(/\s+/g, '_')}.json`;
    a.click();
});