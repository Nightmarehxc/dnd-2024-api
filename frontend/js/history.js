const HISTORY_API_BASE = "http://localhost:5001/api/history";
const historyContainer = document.getElementById('historyList');

// Detectar el tipo de página basándonos en la URL
// Ejemplo: ".../pages/npc.html" -> "npc"
function getCurrentType() {
    const path = window.location.pathname;
    if (path.includes('npc.html')) return 'npc';
    if (path.includes('item.html')) return 'item';
    if (path.includes('character.html')) return 'character';
    if (path.includes('adventure.html')) return 'adventure';
    return null; // Si estamos en index u otro lado
}

const PAGE_TYPE = getCurrentType();

// Iconos
const ICONS = {
    'character': '👤',
    'npc': '🎭',
    'item': '⚔️',
    'adventure': '🗺️'
};

// 1. CARGAR HISTORIAL (Solo del tipo actual)
async function loadHistory() {
    if (!historyContainer || !PAGE_TYPE) return;

    try {
        // Petición GET a /api/history/npc (por ejemplo)
        const res = await fetch(`${HISTORY_API_BASE}/${PAGE_TYPE}`);
        const history = await res.json();
        renderHistoryList(history);
    } catch (e) {
        console.error("Error cargando historial:", e);
        historyContainer.innerHTML = '<p style="text-align:center; color:red; font-size:0.8rem">Error de conexión</p>';
    }
}

// 2. RENDERIZAR
function renderHistoryList(history) {
    historyContainer.innerHTML = '';

    if (history.length === 0) {
        historyContainer.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">Sin registros</p>';
        return;
    }

    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div class="history-info" onclick="restoreItem('${item.id}')">
                <span class="h-icon">${ICONS[item.type] || '📄'}</span>
                <div class="h-details">
                    <div class="h-name">${item.name}</div>
                    <div class="h-date">${item.timestamp}</div>
                </div>
            </div>
            <button class="h-delete" onclick="deleteItem('${item.id}')">🗑️</button>
        `;
        // Guardamos data en dataset para acceso rápido
        div.dataset.json = JSON.stringify(item.data);
        div.dataset.id = item.id;
        historyContainer.appendChild(div);
    });
}

// 3. GUARDAR (Llamado desde los scripts de generación)
// Nota: 'type' es opcional si ya tenemos PAGE_TYPE, pero lo mantenemos por compatibilidad
async function addToHistory(data, type) {
    const targetType = type || PAGE_TYPE;
    if (!targetType) return;

    try {
        await fetch(`${HISTORY_API_BASE}/${targetType}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: data })
        });
        loadHistory(); // Recargar la lista visual
    } catch (e) {
        console.error("Error guardando:", e);
    }
}

// 4. RESTAURAR
function restoreItem(id) {
    // Buscar el elemento en el DOM
    const itemDiv = Array.from(document.querySelectorAll('.history-item'))
        .find(div => div.dataset.id === id);

    if (itemDiv) {
        const data = JSON.parse(itemDiv.dataset.json);

        // Actualizar variable global 'currentData' del script de la página
        if (typeof currentData !== 'undefined') {
            currentData = data;
        }

        // Llamar a la función de renderizado específica
        if (PAGE_TYPE === 'npc' && typeof renderNPC === 'function') renderNPC(data);
        if (PAGE_TYPE === 'item' && typeof renderItem === 'function') renderItem(data);
        if (PAGE_TYPE === 'character' && typeof renderCharacter === 'function') renderCharacter(data); // Asegúrate de tener renderCharacter
        if (PAGE_TYPE === 'adventure' && typeof renderAdventure === 'function') renderAdventure(data);

        // Mostrar botón exportar si existe
        const btnExp = document.getElementById('btnExp');
        if (btnExp) btnExp.style.display = 'block';
    }
}

// 5. BORRAR
async function deleteItem(id) {
    if (!confirm("¿Borrar esta entrada?")) return;

    try {
        await fetch(`${HISTORY_API_BASE}/${PAGE_TYPE}/${id}`, { method: 'DELETE' });
        loadHistory();
    } catch (e) {
        console.error("Error borrando:", e);
    }
}

// Iniciar
document.addEventListener('DOMContentLoaded', loadHistory);