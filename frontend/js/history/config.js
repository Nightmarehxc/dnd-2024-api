// ==========================================
// ⚙️ CONFIGURACIÓN DEL HISTORIAL (GLOBAL)
// ==========================================

// Usamos window.HISTORY_CONFIG para asegurar que manager.js lo vea
window.HISTORY_CONFIG = {
    // --- BÁSICOS ---
    'character': { icon: '👤', renderer: 'renderCharacter' },
    'npc':       { icon: '🎭', renderer: 'renderNPC' },
    'item':      { icon: '⚔️', renderer: 'renderItem' },
    'loot':      { icon: '💎', renderer: 'renderLoot' },
    'spell':     { icon: '✨', renderer: 'renderSpell' },
    'shop':      { icon: '💰', renderer: 'renderShop' },

    // --- MUNDO ---
    'city':      { icon: '🏰', renderer: 'renderCity' },
    'adventure': { icon: '🗺️', renderer: 'renderAdventure' },
    'encounter': { icon: '⚔️', renderer: 'renderEncounter' },
    'dungeon':   { icon: '🗝️', renderer: 'renderDungeon' }, // Asegura que este nombre coincida con tu JS
    'faction':   { icon: '🛡️', renderer: 'renderFaction' },
    'villain':   { icon: '👺', renderer: 'renderVillain' },
    'librarian': { icon: '📚', renderer: 'renderBook' },

    // --- EXTRAS ---
    'monster':   { icon: '👹', renderer: 'renderMonster' },
    'inn':       { icon: '🍺', renderer: 'renderInn' },
    'quest':     { icon: '📜', renderer: 'renderQuest' },
    'ruins':     { icon: '🏚️', renderer: 'renderRuins' }
};

// Función auxiliar global
window.detectPageType = function() {
    const path = window.location.pathname;
    for (const type in window.HISTORY_CONFIG) {
        if (path.includes(type)) return type;
    }
    return null;
};