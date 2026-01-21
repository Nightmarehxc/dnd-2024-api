// ==========================================
// ⚙️ CONFIGURACIÓN DEL HISTORIAL
// ==========================================

// Mapeo maestro: Define el Icono y la Función de Renderizado para cada tipo
const HISTORY_CONFIG = {
    // --- BÁSICOS ---
    'character': { icon: '👤', renderer: 'renderCharacter' }, // Soporta renderCharacterSheet si existe
    'npc':       { icon: '🎭', renderer: 'renderNPC' },
    'item':      { icon: '⚔️', renderer: 'renderItem' },
    'loot':      { icon: '💎', renderer: 'renderLoot' },
    'spell':     { icon: '✨', renderer: 'renderSpell' },
    'shop':      { icon: '💰', renderer: 'renderShop' },

    // --- MUNDO Y AVENTURA ---
    'adventure': { icon: '🗺️', renderer: 'renderAdventure' },
    'encounter': { icon: '⚔️', renderer: 'renderEncounter' },
    'city':      { icon: '🏰', renderer: 'renderCity' },
    'faction':   { icon: '🛡️', renderer: 'renderFaction' },
    'villain':   { icon: '👺', renderer: 'renderVillain' },
    'quest':     { icon: '📜', renderer: 'renderQuest' }, // Ojo: a veces se llama renderQuests
    'riddle':    { icon: '🧩', renderer: 'renderRiddle' },
    'rules':     { icon: '⚖️', renderer: 'renderRule' },
    'travel':    { icon: '⛺', renderer: 'renderTravel' },
    'alchemy':   { icon: '🧪', renderer: 'renderAlchemy' },
    'journal':   { icon: '🖋️', renderer: 'renderJournal' },

    // --- HERRAMIENTAS NARRATIVAS (V2) ---
    'dungeon':   { icon: '🏰', renderer: 'renderDungeon' },
    'librarian': { icon: '📚', renderer: 'renderBook' },
    'dream':     { icon: '🔮', renderer: 'renderDream' },
    'mystery':   { icon: '🕵️', renderer: 'renderMystery' },
    'contract':  { icon: '⚖️', renderer: 'renderContract' },
    'ruins':     { icon: '🏚️', renderer: 'renderRuins' },
    'monster':   { icon: '👹', renderer: 'renderMonster' },
    'inn':       { icon: '🍺', renderer: 'renderInn' }
};

// Función auxiliar para detectar el tipo de página según la URL
function detectPageType() {
    const path = window.location.pathname;

    // Recorremos las claves de la config para ver si el nombre del archivo coincide
    // Ej: "city.html" contiene "city" -> retorna "city"
    for (const type in HISTORY_CONFIG) {
        if (path.includes(`${type}.html`)) {
            return type;
        }
    }
    return null;
}