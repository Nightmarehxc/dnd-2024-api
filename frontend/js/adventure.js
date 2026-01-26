const API_URL = "http://localhost:5001/api/adventures/generate";
let currentData = null;

const els = {
    theme: document.getElementById('theme'),
    players: document.getElementById('players'),
    level: document.getElementById('level'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

// Verificar que los elementos existan
console.log('[INIT] Elementos encontrados:', {
    theme: !!els.theme,
    players: !!els.players,
    level: !!els.level,
    btnGen: !!els.btnGen,
    btnExp: !!els.btnExp,
    content: !!els.content,
    loader: !!els.loader
});

els.btnGen.addEventListener('click', async () => {
    if (!els.theme.value) return alert("Define una temática.");

    // UI Reset
    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const payload = {
            theme: els.theme.value,
            players: parseInt(els.players.value),
            level: parseInt(els.level.value)
        };

        console.log('[ADVENTURE] Payload enviado:', payload);

        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        console.log('[ADVENTURE] Response status:', res.status);
        
        const data = await res.json();
        console.log('[ADVENTURE] Respuesta JSON:', data);
        console.log('[ADVENTURE] Keys en respuesta:', Object.keys(data));
        
        if (data.error) {
            throw new Error(data.error);
        }

        currentData = data;
        console.log('[ADVENTURE] Data asignado a currentData');
        
        // DEBUG: Mostrar estructura de data
        console.log('[ADVENTURE] Estructura:', {
            tiene_title: 'title' in data,
            tiene_synopsis: 'synopsis' in data,
            tiene_hook: 'hook' in data,
            tiene_chapters: 'chapters' in data,
            chapters_length: data.chapters ? data.chapters.length : 0,
            tiene_npcs: 'notable_npcs' in data,
            tiene_locations: 'locations' in data
        });
        
        // Llamar a paintAdventure (la función interna que pinta)
        try {
            paintAdventure(data);
            console.log('[ADVENTURE] paintAdventure ejecutado exitosamente');
        } catch (renderErr) {
            console.error('[ADVENTURE] Error en paintAdventure:', renderErr);
            console.error('[ADVENTURE] Stack:', renderErr.stack);
            throw renderErr;
        }
        
        els.btnExp.style.display = 'block';

        // --- GUARDAR EN HISTORIAL (NUEVO) ---
        if (typeof addToHistory === 'function') {
            console.log('[ADVENTURE] Guardando en historial...');
            // Guardar solo los datos de la aventura, no la respuesta envuelta
            addToHistory(data, 'adventures');
        }

    } catch (err) {
        console.error('[ADVENTURE] Error capturado:', err);
        els.content.innerHTML = `<p style="color:red"><strong>Error:</strong> ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// Función específica para el historial (sin recursión)
window.renderAdventure = function(historyData) {
    console.log('[HISTORY RENDER] Renderizando desde historial');
    
    // El historyData viene del historial (ya parseado)
    // Si es un objeto envuelto con .data, extraer
    let data = historyData;
    if (historyData && typeof historyData === 'object' && 'data' in historyData && !('title' in historyData)) {
        data = historyData.data;
    }
    
    if (!data || typeof data !== 'object') {
        console.error('[HISTORY RENDER] Datos inválidos');
        return;
    }
    
    // Simular el objeto currentData para que exporte funcione
    currentData = data;
    
    // Llamar a la función interna de renderizado
    paintAdventure(data);
};

// Función interna que pinta la aventura
function paintAdventure(data) {
    console.log('[PAINT] Iniciando pintado de aventura');
    
    if (!data || typeof data !== 'object') {
        console.error('[PAINT] ERROR: data inválido');
        els.content.innerHTML = '<p style="color:red">Error: datos inválidos</p>';
        return;
    }
    
    const s = (val) => val || '---';

    // Extraer datos (soportar ambos formatos)
    const title = data.title || data.titulo;
    const synopsis = data.synopsis || data.sinopsis;
    const hook = data.hook || data.gancho;
    const chapters = data.chapters || data.capitulos;
    const notableNpcs = data.notable_npcs || data.npcs_notables;
    const locations = data.locations || data.lugares;

    // Procesar chapters
    let chaptersHtml = '';
    if (Array.isArray(chapters) && chapters.length > 0) {
        chaptersHtml = chapters.map((cap, i) => {
            if (!cap || typeof cap !== 'object') return '';
            const capTitle = cap.title || cap.titulo || 'Sin título';
            const capDesc = cap.description || cap.descripcion || 'Sin descripción';
            return `
        <div style="margin-bottom:15px; border-left: 3px solid var(--accent); padding-left:10px;">
            <strong>Capítulo ${i+1}: ${capTitle}</strong>
            <p style="margin:5px 0 0 0;">${capDesc}</p>
        </div>`;
        }).join('');
    } else {
        chaptersHtml = '<p>Sin capítulos definidos</p>';
    }

    // Procesar NPCs
    let npcsHtml = '';
    if (Array.isArray(notableNpcs) && notableNpcs.length > 0) {
        npcsHtml = notableNpcs.map(npc => {
            if (!npc || typeof npc !== 'object') return '';
            const npcName = npc.name || npc.nombre || 'Sin nombre';
            const npcRole = npc.role || npc.rol || 'Sin rol';
            const npcDesc = npc.brief_description || npc.breve_descripcion || 'Sin descripción';
            return `<li><strong>${npcName}</strong> (${npcRole}): ${npcDesc}</li>`;
        }).join('');
    } else {
        npcsHtml = '<li>Sin personajes definidos</li>';
    }

    // Procesar locations
    let placesHtml = '';
    if (Array.isArray(locations) && locations.length > 0) {
        placesHtml = locations.map(l => {
            if (!l || typeof l !== 'object') return '';
            const locName = l.name || l.nombre || 'Sin nombre';
            const locDesc = l.description || l.descripcion || 'Sin descripción';
            return `<li><strong>${locName}</strong>: ${locDesc}</li>`;
        }).join('');
    } else {
        placesHtml = '<li>Sin lugares definidos</li>';
    }

    // Generar HTML
    const html = `
        <h1 style="color:var(--accent); text-align:center;">${s(title)}</h1>
        <p><strong>Sinopsis:</strong> ${s(synopsis)}</p>

        <div style="background:#eee; padding:10px; border-radius:5px; margin-bottom:20px;">
            <strong>🎣 Gancho:</strong><br>${s(hook)}
        </div>

        <h3>📜 Estructura</h3>
        ${chaptersHtml}

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-top:20px;">
            <div>
                <h4 style="border-bottom:1px solid #ccc;">Personajes</h4>
                <ul style="padding-left:20px; font-size:0.9rem;">${npcsHtml}</ul>
            </div>
            <div>
                <h4 style="border-bottom:1px solid #ccc;">Lugares</h4>
                <ul style="padding-left:20px; font-size:0.9rem;">${placesHtml}</ul>
            </div>
        </div>
    `;

    try {
        els.content.innerHTML = html;
        console.log('[PAINT] ✅ Aventura pintada correctamente');
    } catch (e) {
        console.error('[PAINT] ❌ Error:', e);
        els.content.innerHTML = `<p style="color:red">Error: ${e.message}</p>`;
    }
}

// Exportar Journal (Foundry VTT)
els.btnExp.addEventListener('click', () => {
    if(!currentData) return;

    // Usamos el HTML generado como contenido del Journal
    const contentHTML = els.content.innerHTML;
    const title = currentData.title || currentData.titulo;

    const json = {
        name: title,
        type: "journal",
        pages: [
            {
                name: "Resumen de Aventura",
                type: "text",
                text: { content: contentHTML, format: 1 }
            }
        ],
        folder: null
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${title.replace(/\s+/g, '_')}_Adventure.json`;
    a.click();
});