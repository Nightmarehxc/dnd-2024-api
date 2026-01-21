const API_URL = "http://localhost:5001/api/inns/generate";
let currentData = null;

const els = {
    name: document.getElementById('name'),
    city: document.getElementById('city'), // Input de ciudad
    cityList: document.getElementById('cityList'), // Datalist
    comfort: document.getElementById('comfort'),
    theme: document.getElementById('theme'),
    btnGen: document.getElementById('btnGen'),
    btnEdit: document.getElementById('btnEdit'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader'),
    // Editor
    editorContainer: document.getElementById('jsonEditorContainer'),
    textarea: document.getElementById('jsonTextarea'),
    btnSave: document.getElementById('btnSaveChanges')
};

// --- AL CARGAR: RELLENAR CIUDADES ---
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Leemos el historial global
        const history = JSON.parse(localStorage.getItem('dnd_app_history') || '[]');
        // Filtramos solo las ciudades
        const cities = history.filter(item => item.type === 'city');

        // Llenamos el datalist
        cities.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.nombre || c.name; // Soporte para ambos campos
            els.cityList.appendChild(opt);
        });
    } catch(e) {
        console.warn("No se pudo cargar el historial de ciudades", e);
    }
});

// --- GENERAR ---
els.btnGen.addEventListener('click', async () => {
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
                name: els.name.value,
                comfort_level: els.comfort.value,
                theme: els.theme.value,
                city: els.city.value // Enviamos la ciudad seleccionada
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderInn(data);

        els.btnEdit.style.display = 'block';
        els.btnExp.style.display = 'block';

        if (typeof addToHistory === 'function') {
            addToHistory({ ...data, nombre: data.nombre, tipo_item: "Posada" });
        }

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// --- EDITOR JSON ---
els.btnEdit.addEventListener('click', () => {
    if(!currentData) return;
    els.textarea.value = JSON.stringify(currentData, null, 4);
    els.editorContainer.style.display = 'block';
    els.editorContainer.scrollIntoView({behavior: "smooth"});
});

els.btnSave.addEventListener('click', () => {
    try {
        const newData = JSON.parse(els.textarea.value);
        // Preservar ID si existía
        if (currentData._db_id) newData._db_id = currentData._db_id;

        currentData = newData;
        renderShop(currentData);
        els.editorContainer.style.display = 'none';

        // --- LÓGICA INTELIGENTE ---
        if (currentData._db_id && typeof updateHistoryItem === 'function') {
            updateHistoryItem(currentData._db_id, currentData);
        } else if (typeof addToHistory === 'function') {
            addToHistory(currentData, 'inn');
        }

        alert("✅ Inventario actualizado.");
    } catch (e) { alert("❌ Error JSON: " + e.message); }
});

// --- RENDERIZAR ---
function renderInn(data) {
    const s = (val) => val || '---';

    const menuHtml = (data.menu || []).map(m => `
        <div class="menu-grid-items">
            <div>
                <strong>${m.plato}</strong><br>
                <small style="color:#666;">${m.desc}</small>
            </div>
            <div class="price-tag">${m.precio}</div>
        </div>
    `).join('');

    const roomsHtml = (data.habitaciones || []).map(r => `
        <li><strong>${r.tipo} (${r.precio}):</strong> ${r.desc}</li>
    `).join('');

    // Mostrar ubicación si existe
    const locationInfo = data.ubicacion ? `<br><small>📍 ${data.ubicacion}</small>` : '';

    els.content.innerHTML = `
        <div style="text-align:center; border-bottom:2px solid #d35400; padding-bottom:15px; margin-bottom:20px;">
            <h1 style="color:#d35400; margin:0;">${s(data.nombre)}</h1>
            <p style="font-style:italic; color:#7f8c8d; margin:5px 0;">
                ${s(data.nivel_vida)} ${locationInfo}
            </p>
            <p style="margin-top:10px;">${s(data.descripcion)}</p>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
            <div>
                <div style="background:#fbeee6; padding:15px; border-radius:5px; margin-bottom:20px;">
                    <h3 style="color:#d35400; margin-top:0;">🧑‍🍳 ${s(data.posadero?.nombre)}</h3>
                    <p style="margin:5px 0;"><strong>Raza:</strong> ${s(data.posadero?.raza)}</p>
                    <p style="font-style:italic; margin-bottom:0;">"${s(data.posadero?.personalidad)}"</p>
                </div>

                <div style="margin-bottom:20px;">
                    <h4 style="border-bottom:1px solid #ddd; color:#d35400;">🗣️ Rumor Local</h4>
                    <p style="font-style:italic;">"${s(data.rumor_local)}"<p>
                </div>

                <div>
                    <h4 style="border-bottom:1px solid #ddd; color:#d35400;">👥 Parroquianos</h4>
                    <ul>${(data.clientes_destacados || []).map(c => `<li>${c}</li>`).join('')}</ul>
                </div>
            </div>

            <div>
                <h3 style="margin-top:0; color:#873600;">🥘 Menú del Día</h3>
                <div style="background:#fff; padding:10px; border:1px solid #eee; margin-bottom:20px;">
                    ${menuHtml}
                </div>

                <h3 style="color:#873600;">🛏️ Alojamiento</h3>
                <ul>${roomsHtml}</ul>
            </div>
        </div>
    `;
}

// --- EXPORTAR ---
els.btnExp.addEventListener('click', () => {
    if(!currentData) return;

    const content = `
        <h2>${currentData.nombre}</h2>
        <p><strong>Ubicación:</strong> ${currentData.ubicacion || 'Desconocida'} (${currentData.nivel_vida})</p>
        <p><em>${currentData.descripcion}</em></p>
        <hr>
        <h3>Personal</h3>
        <p><strong>Posadero:</strong> ${currentData.posadero.nombre} (${currentData.posadero.raza}) - ${currentData.posadero.personalidad}</p>
        <h3>Rumores</h3>
        <p>${currentData.rumor_local}</p>
        <h3>Menú</h3>
        <ul>${(currentData.menu || []).map(m => `<li><b>${m.plato}</b> (${m.precio}): ${m.desc}</li>`).join('')}</ul>
    `;

    const json = {
        name: currentData.nombre,
        type: "journal",
        pages: [{ name: "Información", type: "text", text: { content: content, format: 1 } }]
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Posada_${currentData.nombre.replace(/\s+/g, '_')}.json`;
    a.click();
});