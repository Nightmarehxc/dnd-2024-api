const HISTORY_API_BASE = "http://localhost:5001/api/history";
const historyContainer = document.getElementById('historyList');

// 1. DETECTAR EL TIPO DE PÁGINA (Añadido 'shop')
function getCurrentType() {
    const path = window.location.pathname;
    if (path.includes('npc.html')) return 'npc';
    if (path.includes('item.html')) return 'item';
    if (path.includes('character.html')) return 'character';
    if (path.includes('adventure.html')) return 'adventure';
    if (path.includes('shop.html')) return 'shop'; // <--- ESTO FALTABA
    return null;
}

const PAGE_TYPE = getCurrentType();

// 2. AÑADIR ICONO
const ICONS = {
    'character': '👤',
    'npc': '🎭',
    'item': '⚔️',
    'adventure': '🗺️',
    'shop': '💰' // <--- ESTO FALTABA
};

async function loadHistory() {
    if (!historyContainer || !PAGE_TYPE) return;

    try {
        const res = await fetch(`${HISTORY_API_BASE}/${PAGE_TYPE}`);
        const history = await res.json();
        renderHistoryList(history);
    } catch (e) {
        console.error("Error cargando historial:", e);
        historyContainer.innerHTML = '<p style="text-align:center; color:red; font-size:0.8rem">Error de conexión</p>';
    }
}

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
        div.dataset.json = JSON.stringify(item.data);
        div.dataset.id = item.id;
        historyContainer.appendChild(div);
    });
}

async function addToHistory(data, type) {
    const targetType = type || PAGE_TYPE;
    if (!targetType) return;

    try {
        await fetch(`${HISTORY_API_BASE}/${targetType}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: data })
        });
        loadHistory();
    } catch (e) {
        console.error("Error guardando:", e);
    }
}

// 3. AÑADIR RESTAURACIÓN DE TIENDA
function restoreItem(id) {
    const itemDiv = Array.from(document.querySelectorAll('.history-item'))
        .find(div => div.dataset.id === id);

    if (itemDiv) {
        const data = JSON.parse(itemDiv.dataset.json);

        if (typeof currentData !== 'undefined') currentData = data;

        // Llamadas a renderizadores específicos
        if (PAGE_TYPE === 'npc' && typeof renderNPC === 'function') renderNPC(data);
        if (PAGE_TYPE === 'item' && typeof renderItem === 'function') renderItem(data);
        if (PAGE_TYPE === 'character' && typeof renderCharacter === 'function') renderCharacter(data);
        if (PAGE_TYPE === 'adventure' && typeof renderAdventure === 'function') renderAdventure(data);
        if (PAGE_TYPE === 'shop' && typeof renderShop === 'function') renderShop(data); // <--- ESTO FALTABA

        const btnExp = document.getElementById('btnExp');
        if (btnExp) btnExp.style.display = 'block';
    }