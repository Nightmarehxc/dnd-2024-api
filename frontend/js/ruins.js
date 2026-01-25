const API_URL = "http://localhost:5001/api/ruins/generate";
let currentData = null;

const els = {
    name: document.getElementById('name'),
    type: document.getElementById('type'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    if (!els.name.value) return alert("Ponle un nombre a las ruinas.");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                name: els.name.value,
                ruin_type: els.type.value
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderRuinsContent(data);
        els.btnExp.style.display = 'block';

        // Recargar historial
        loadRuinsHistory();

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

function renderRuinsContent(data) {
    const s = (val) => val || '---';

    // Support both English and Spanish keys
    const name = data.name || data.nombre;
    const originalUse = data.original_use || data.uso_original;
    const cataclysm = data.cataclysm || data.el_cataclismo;
    const currentState = data.current_state || data.estado_actual;
    const inhabitants = data.inhabitants || data.habitantes;
    const secret = data.secret || data.secreto;

    els.content.innerHTML = `
        <div style="border-left: 5px solid #795548; padding-left: 20px;">
            <h1 style="color:#5d4037; margin-top:0;">${s(name)}</h1>

            <div style="margin-bottom:20px;">
                <h4 style="color:#8d6e63; margin-bottom:5px; text-transform:uppercase; font-size:0.8em;">🏛️ Origen (La Época Dorada)</h4>
                <p style="margin-top:0;">${s(originalUse)}</p>
            </div>

            <div style="margin-bottom:20px;">
                <h4 style="color:#c62828; margin-bottom:5px; text-transform:uppercase; font-size:0.8em;">🔥 El Cataclismo</h4>
                <p style="margin-top:0;">${s(cataclysm)}</p>
            </div>

            <div style="background:#efebe9; padding:15px; border-radius:5px; margin-bottom:20px;">
                <h4 style="margin-top:0; color:#4e342e;">👁️ Estado Actual</h4>
                <p>${s(currentState)}</p>
                <p><strong>Habitantes:</strong> ${s(inhabitants)}</p>
            </div>

            <div style="border: 1px dashed #5d4037; padding:10px; font-style:italic; font-size:0.9em; color:#5d4037;">
                <strong>🗝️ Secreto del DM:</strong> ${s(secret)}
            </div>
        </div>
    `;
}

// Exponer para historial
window.renderRuins = function(data) {
    currentData = data;
    renderRuinsContent(data);
};

els.btnExp.addEventListener('click', () => {
    if (!currentData) return;
    
    const name = currentData.name || currentData.nombre;
    const originalUse = currentData.original_use || currentData.uso_original;
    const cataclysm = currentData.cataclysm || currentData.el_cataclismo;
    const currentState = currentData.current_state || currentData.estado_actual;
    const inhabitants = currentData.inhabitants || currentData.habitantes;
    const secret = currentData.secret || currentData.secreto;

    const json = {
        name: name,
        type: "journal",
        pages: [{
            name: "Historia",
            type: "text",
            text: {
                content: `<h2>Origen</h2><p>${originalUse}</p><h2>La Caída</h2><p>${cataclysm}</p><h2>Actualidad</h2><p>${currentState}</p><p><strong>Habitantes:</strong> ${inhabitants}</p><hr><p><em>Secreto: ${secret}</em></p>`,
                format: 1
            }
        }]
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Ruina_${name.replace(/\s+/g, '_')}.json`;
    a.click();
});

// ========================================
// HISTORIAL PERSONALIZADO (desde BD)
// ========================================
async function loadRuinsHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    try {
        const res = await fetch('http://localhost:5001/api/ruins/list');
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const ruins = await res.json();
        
        historyList.innerHTML = '';
        if (!ruins || ruins.length === 0) {
            historyList.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px; font-size:0.9em;">Sin registros</p>';
            return;
        }
        
        ruins.forEach(ruin => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-info" onclick="loadRuinsById(${ruin.id})">
                    <span class="h-icon">🏚️</span>
                    <div class="h-details">
                        <div class="h-name">${ruin.name}</div>
                        <div class="h-date">${ruin.ruin_type || 'Ruinas'}</div>
                    </div>
                </div>
                <button class="h-delete" onclick="deleteRuins(event, ${ruin.id})" title="Borrar">×</button>
            `;
            historyList.appendChild(div);
        });
    } catch (err) {
        console.error('Error cargando historial:', err);
        historyList.innerHTML = `<p style="color:red; text-align:center; font-size:0.8em; padding: 10px;">
            Error: ${err.message}<br>
            <small>¿Está el servidor ejecutándose?</small>
        </p>`;
    }
}

async function loadRuinsById(id) {
    try {
        const res = await fetch(`http://localhost:5001/api/ruins/${id}`);
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);
        
        currentData = data;
        renderRuinsContent(data);
        els.btnExp.style.display = 'block';
    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    }
}

async function deleteRuins(event, id) {
    event.stopPropagation();
    if (!confirm('¿Eliminar esta ruina?')) return;
    
    try {
        const res = await fetch(`http://localhost:5001/api/ruins/${id}`, {
            method: 'DELETE'
        });
        
        if (res.ok) {
            loadRuinsHistory();
        }
    } catch (err) {
        alert('Error eliminando ruina');
    }
}

// Exponer funciones globalmente
window.loadRuinsById = loadRuinsById;
window.deleteRuins = deleteRuins;

// Cargar historial al inicio
loadRuinsHistory();
