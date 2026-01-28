// ==========================================
// ⚙️ CONFIGURACIÓN DEL HISTORIAL (GLOBAL)
// ==========================================

// Usamos window.HISTORY_CONFIG para asegurar que manager.js lo vea
window.HISTORY_CONFIG = {
    // --- PERSONAJES Y NPCS ---
    'characters': { icon: '👤', renderer: 'renderCharacter' },
    'npcs':       { icon: '🎭', renderer: 'renderNPC' },

    // --- ITEMS Y OBJETOS ---
    'items':      { icon: '⚔️', renderer: 'renderItem' },
    'loot':       { icon: '💎', renderer: 'renderLoot' },
    'spells':     { icon: '✨', renderer: 'renderSpell' },

    // --- COMERCIO Y LUGARES ---
    'shops':      { icon: '💰', renderer: 'renderShop' },
    'inns':       { icon: '🍺', renderer: 'renderInn' },
    'cities':     { icon: '🏰', renderer: 'renderCity' },
    'strongholds': { icon: '🏛️', renderer: 'renderStronghold' },

    // --- AVENTURA Y EXPLORACIÓN ---
    'adventures': { icon: '🗺️', renderer: 'renderAdventure' },
    'dungeons':   { icon: '🗝️', renderer: 'renderDungeon' },
    'encounters': { icon: '⚔️', renderer: 'renderEncounter' },
    'travel':     { icon: '🛤️', renderer: 'renderTravel' },
    'travels':    { icon: '🛤️', renderer: 'renderTravel' },
    'ruins':      { icon: '🏚️', renderer: 'renderRuins' },

    // --- CONTENIDO Y DESAFÍOS ---
    'riddles':    { icon: '🎭', renderer: 'renderRiddle' },
    'quests':     { icon: '📜', renderer: 'renderQuest' },
    'mysteries':  { icon: '🔍', renderer: 'renderMystery' },

    // --- CRIATURAS Y ANTAGONISTAS ---
    'monsters':   { icon: '👹', renderer: 'renderMonster' },
    'villains':   { icon: '😈', renderer: 'renderVillain' },

    // --- FACCIONES Y SOCIEDADES ---
    'factions':   { icon: '🛡️', renderer: 'renderFaction' },

    // --- DOCUMENTOS Y REFERENCIAS ---
    'journals':   { icon: '📖', renderer: 'renderJournal' },
    'librarian':  { icon: '📚', renderer: 'renderBook' },
    'librarians': { icon: '📚', renderer: 'renderBook' },

    // --- MISCELÁNEA ---
    'alchemy':    { icon: '🧪', renderer: 'renderAlchemy' },
    'herbalist':  { icon: '🌿', renderer: 'renderHerbalist' },
    'contract':   { icon: '📋', renderer: 'renderContract' },
    'contracts':  { icon: '📋', renderer: 'renderContract' },
    'dreams':     { icon: '💭', renderer: 'renderDream' },
    'atmosphere': { icon: '👁️', renderer: 'renderAtmosphere' },
    'atmospheres':{ icon: '👁️', renderer: 'renderAtmosphere' },
    'rules':      { icon: '⚖️', renderer: 'renderRules' }
};

// Función auxiliar global - Mapea nombres de archivos a tipos de config
window.detectPageType = function() {
    const path = window.location.pathname.toLowerCase();
    
    // Mapeo de nombres de página a tipos
    const pageToType = {
        'character': 'characters',
        'npc': 'npcs',
        'item': 'items',
        'loot': 'loot',
        'spell': 'spells',
        'shop': 'shops',
        'inn': 'inns',
        'city': 'cities',
        'stronghold': 'strongholds',
        'adventure': 'adventures',
        'dungeon': 'dungeons',
        'encounter': 'encounters',
        'travel': 'travel',
        'ruins': 'ruins',
        'riddle': 'riddles',
        'quest': 'quests',
        'mystery': 'mysteries',
        'monster': 'monsters',
        'villain': 'villains',
        'faction': 'factions',
        'journal': 'journals',
        'librarian': 'librarian',
        'alchemy': 'alchemy',
        'herbalist': 'herbalist',
        'contract': 'contracts',
        'dream': 'dreams',
        'atmosphere': 'atmospheres',
        'rules': 'rules'
    };
    
    // Buscar en el path
    for (const [pageName, typeName] of Object.entries(pageToType)) {
        if (path.includes(pageName)) return typeName;
    }
    return null;
};