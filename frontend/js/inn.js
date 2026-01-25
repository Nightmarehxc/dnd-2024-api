const API_URL = "http://localhost:5001/api/inns/generate";
let currentData = null;

const els = {
    name: document.getElementById('name'),
    city: document.getElementById('city'),
    cityList: document.getElementById('cityList'),
    comfort: document.getElementById('comfort'),
    theme: document.getElementById('theme'),
    btnGen: document.getElementById('btnGen'),

    btnEdit: document.getElementById('btnEdit'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader'),

    editorContainer: document.getElementById('formEditorContainer'),
    btnSave: document.getElementById('btnSaveChanges'),
    btnCancel: document.getElementById('btnCancelEdit'),

    eName: document.getElementById('editName'),
    eKeeper: document.getElementById('editKeeper'),
    eKeeperRace: document.getElementById('editKeeperRace'),
    eRumor: document.getElementById('editRumor')
};

// Cargar ciudades
document.addEventListener('DOMContentLoaded', () => {
    try {
        const history = JSON.parse(localStorage.getItem('dnd_app_history') || '[]');
        // Nota: Con SQLite esto debería cambiarse a una llamada fetch si quieres las ciudades de la DB
    } catch(e) {}
});

// --- GENERAR ---
els.btnGen.addEventListener('click', async () => {
    els.content.innerHTML = '';
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';
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
                city: els.city.value
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        window.renderInn(data);
        if (typeof addToHistory === 'function') addToHistory(currentData, 'inns');

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// --- EDIT ---
els.btnEdit.addEventListener('click', () => {
    if(!currentData) return;
    
    els.eName.value = currentData.name || "";
    els.eKeeper.value = currentData.innkeeper_name || currentData.tabernero || "";
    els.eKeeperRace.value = currentData.innkeeper_race || currentData.raza_tabernero || "";
    els.eRumor.value = currentData.rumor || "";

    els.content.style.display = 'none';
    els.editorContainer.style.display = 'block';
});

els.btnCancel.addEventListener('click', () => {
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';
});

els.btnSave.addEventListener('click', () => {
    // Crear objeto actualizado preservando todos los datos originales
    const newData = {
        ...currentData,
        name: els.eName.value,
        innkeeper_name: els.eKeeper.value,
        innkeeper_race: els.eKeeperRace.value,
        rumor: els.eRumor.value
    };

    currentData = newData;
    window.renderInn(currentData);
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';

    // IMPORTANTE: Solo UNO de los dos, nunca ambos
    if (currentData._db_id && typeof updateHistoryItem === 'function') {
        // Edición de existente
        updateHistoryItem(currentData._db_id, currentData);
    } else if (typeof addToHistory === 'function') {
        // Nuevo registro
        addToHistory(currentData, 'inns');
    }
});

// --- RENDER ---
window.renderInn = function(data) {
    currentData = data;  // Sync with local
    const s = (val) => val || '---';
    
    // Support both English and Spanish keys for backward compatibility
    const name = data.name || data.nombre;
    const comfortLevel = data.comfort_level || data.confort;
    const description = data.description || data.descripcion;
    const location = data.location || data.ubicacion;
    const innkeeperName = data.innkeeper_name || data.tabernero;
    const innkeeperRace = data.innkeeper_race || data.raza_tabernero;
    const innkeeperPersonality = data.innkeeper_personality || data.personalidad_tabernero;
    const rumor = data.rumor;
    const menu = data.menu;
    
    const menuHtml = (menu || []).map(m => `<li><b>${(m.name || m.nombre)}</b> (${(m.price || m.precio)})</li>`).join('');

    els.content.innerHTML = `
        <h2 style="color:#d35400;">${s(name)}</h2>
        ${location ? `<p style="color:#888; font-style:italic;">📍 ${s(location)}</p>` : ''}
        <p><em>${s(comfortLevel)}</em></p>
        ${description ? `<p style="background:#f5f5f5; padding:10px; border-radius:5px; font-style:italic;">${s(description)}</p>` : ''}
        
        <div style="background:#fbeee6; padding:15px; border-radius:5px;">
            <h3>🧑‍🍳 ${s(innkeeperName)}</h3>
            <p>${s(innkeeperRace)} ${innkeeperPersonality ? `- "${s(innkeeperPersonality)}"` : ''}</p>
        </div>
        
        <p><strong>🗣️ Rumor:</strong> ${s(rumor)}</p>
        <hr>
        <h4>📋 Menú</h4><ul>${menuHtml || '<li><em>Sin información de menú</em></li>'}</ul>
    `;
    if(els.btnEdit) els.btnEdit.style.display = 'block';
    if(els.btnExp) els.btnExp.style.display = 'block';
};

els.btnExp.addEventListener('click', () => {
    // ... lógica exportación ...
});