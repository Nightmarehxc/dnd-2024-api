const HISTORY_API_BASE = "http://localhost:5001/api/history";
const historyContainer = document.getElementById('historyList');

// Detectar automáticamente el tipo de generador según la URL
function getCurrentType() {
    const path = window.location.pathname;
    if (path.includes('npc.html')) return 'npc';
    if (path.includes('item.html')) return 'item';
    if (path.includes('character.html')) return 'character';
    if (path.includes('adventure.html')) return 'adventure';
    if (path.includes('shop.html')) return 'shop';
    if (path.includes('city.html')) return 'city';
    if (path.includes('riddle.html')) return 'riddle';
    if (path.includes('encounter.html')) return 'encounter';
    if (path.includes('loot.html')) return 'loot';
    if (path.includes('rules.html')) return 'rules';
    if (path.includes('quest.html')) return 'quest';
    if (path.includes('journal.html')) return 'journal';
    if (path.includes('spell.html')) return 'spell';
    if (path.includes('villain.html')) return 'villain';
    if (path.includes('faction.html')) return 'faction';
    if (path.includes('alchemy.html')) return 'alchemy';

    return null;
}

const PAGE_TYPE = getCurrentType();

const ICONS = {
    'character': '👤',
    'npc': '🎭',
    'item': '⚔️',
    'adventure': '🗺️',
    'shop': '💰',
    'city': '🏰',
    'riddle': '🧩',
    'encounter': '⚔️',
    'loot': '💰',
    'rules': '⚖️',
    'quest': '📜',
    'journal': '🖋️',
    'spell': '✨',
    'villain': '👺',
    'faction': '🛡️',
    'alchemy': '🧪',
};

// --- 1. CARGAR LISTA ---
async function loadHistory() {
    if (!historyContainer || !PAGE_TYPE) return;
    try {
        const res = await fetch(`${HISTORY_API_BASE}/${PAGE_TYPE}`);
        const history = await res.json();
        renderHistoryList(history);
    } catch (e) {
        console.error("Error historial:", e);
        historyContainer.innerHTML = '<p style="color:red; text-align:center;">Error de conexión</p>';
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
        // Guardamos los datos en el elemento para recuperarlos sin fetch extra
        div.dataset.json = JSON.stringify(item.data);
        div.dataset.id = item.id;
        historyContainer.appendChild(div);
    });
}

// --- 2. GUARDAR (Usado por item.js, character.js...) ---
async function addToHistory(data) {
    if (!PAGE_TYPE) return;
    try {
        await fetch(`${HISTORY_API_BASE}/${PAGE_TYPE}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: data })
        });
        loadHistory(); // Recargar la lista para ver el nuevo ítem
    } catch (e) {
        console.error("Error guardando:", e);
    }
}

// --- 3. RESTAURAR Y BORRAR ---
function restoreItem(id) {
    const itemDiv = Array.from(document.querySelectorAll('.history-item'))
        .find(div => div.dataset.id === id);

    if (itemDiv) {
        const data = JSON.parse(itemDiv.dataset.json);

        // Actualizar variable global y renderizar según la función disponible
        if (typeof currentData !== 'undefined') currentData = data;

        if (typeof renderItem === 'function') renderItem(data);
        if (typeof renderCharacter === 'function') renderCharacter(data);
        if (typeof renderNPC === 'function') renderNPC(data);
        if (typeof renderAdventure === 'function') renderAdventure(data);
        if (PAGE_TYPE === 'shop' && typeof renderShop === 'function') renderShop(data);
        if (typeof renderCity === 'function' && PAGE_TYPE === 'city') renderCity(data);
        if (typeof renderRiddle === 'function' && PAGE_TYPE === 'riddle') renderRiddle(data);
        if (typeof renderEncounter === 'function' && PAGE_TYPE === 'encounter') renderEncounter(data);
        if (typeof renderLoot === 'function' && PAGE_TYPE === 'loot') renderLoot(data);
        if (typeof renderRule === 'function' && PAGE_TYPE === 'rules') renderRule(data);
        if (typeof renderQuests === 'function' && PAGE_TYPE === 'quest') renderQuests(data);
        if (typeof renderJournal === 'function' && PAGE_TYPE === 'journal') renderJournal(data);
        if (typeof renderSpell === 'function' && PAGE_TYPE === 'spell') renderSpell(data);
        if (typeof renderVillain === 'function' && PAGE_TYPE === 'villain') renderVillain(data);
        if (typeof renderFaction === 'function' && PAGE_TYPE === 'faction') renderFaction(data);
        if (typeof renderAlchemy === 'function' && PAGE_TYPE === 'alchemy') renderAlchemy(data);


        const btnExp = document.getElementById('btnExp');
        if (btnExp) btnExp.style.display = 'block';
    }
}

async function deleteItem(id) {
    if (!confirm("¿Borrar esta entrada?")) return;
    await fetch(`${HISTORY_API_BASE}/${PAGE_TYPE}/${id}`, { method: 'DELETE' });
    loadHistory();
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', loadHistory);