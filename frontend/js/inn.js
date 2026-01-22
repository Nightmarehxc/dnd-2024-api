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
    els.eKeeper.value = currentData.innkeeper_name || "";
    els.eKeeperRace.value = currentData.innkeeper_race || "";
    els.eRumor.value = currentData.rumor || "";

    els.content.style.display = 'none';
    els.editorContainer.style.display = 'block';
});

els.btnCancel.addEventListener('click', () => {
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';
});

els.btnSave.addEventListener('click', () => {
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

    if (currentData._db_id && typeof updateHistoryItem === 'function') {
        updateHistoryItem(currentData._db_id, currentData);
    } else if (typeof addToHistory === 'function') {
        addToHistory(currentData, 'inns');
    }
});

// --- RENDER ---
window.renderInn = function(data) {
    currentData = data;  // Sync with local
    const s = (val) => val || '---';
    const menuHtml = (data.menu || []).map(m => `<li><b>${m.name}</b> (${m.price})</li>`).join('');

    els.content.innerHTML = `
        <h2 style="color:#d35400;">${s(data.name)}</h2>
        <p><em>${s(data.comfort_level)}</em> - ${s(data.description)}</p>
        <div style="background:#fbeee6; padding:15px; border-radius:5px;">
            <h3>🧑‍🍳 ${s(data.innkeeper_name)}</h3>
            <p>${s(data.innkeeper_race)} - "${s(data.innkeeper_personality)}"</p>
        </div>
        <p><strong>🗣️ Rumor:</strong> ${s(data.rumor)}</p>
        <hr>
        <h4>Menu</h4><ul>${menuHtml}</ul>
    `;
    if(els.btnEdit) els.btnEdit.style.display = 'block';
    if(els.btnExp) els.btnExp.style.display = 'block';
};

els.btnExp.addEventListener('click', () => {
    // ... lógica exportación ...
});