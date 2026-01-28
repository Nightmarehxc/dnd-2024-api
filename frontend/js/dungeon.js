const API_URL = "http://localhost:5001/api/dungeons/generate";
let currentData = null;
let els = null; // Variable global para elementos DOM

// Función para inicializar después de que el DOM esté listo
function initDungeon() {
    console.log('🚀 Inicializando Arquitecto de Mazmorras...');
    
    els = {
        theme: document.getElementById('theme'),
        level: document.getElementById('level'),
        btnGen: document.getElementById('btnGen'),
        btnExp: document.getElementById('btnExp'),
        content: document.getElementById('resultContent'),
        loader: document.getElementById('loader')
    };

    console.log('✅ Elementos DOM cargados');

    // Verificar que todos los elementos existen
    if (!els.btnGen || !els.content) {
        console.error('❌ ERROR: Elementos DOM no encontrados!');
        return;
    }

    els.btnGen.addEventListener('click', handleGenerate);
    els.btnExp.addEventListener('click', handleExport);
}

async function handleGenerate() {
    console.log('🔘 Botón clickeado');
    if (!els.theme.value) return alert("Describe la temática.");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        console.log('📤 Enviando petición...');
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                theme: els.theme.value,
                level: parseInt(els.level.value) || 1
            })
        });

        console.log('📥 Respuesta recibida, status:', res.status);
        const data = await res.json();
        console.log('📦 Datos recibidos - tipo:', typeof data, 'tiene rooms:', !!(data.rooms || data.salas));
        
        if (data.error) {
            console.error('❌ Error en respuesta:', data.error);
            throw new Error(data.error);
        }

        currentData = data;
        console.log('🎨 Llamando a renderDungeon...');
        renderDungeonInternal(data);
        els.btnExp.style.display = 'block';

        if (typeof addToHistory === 'function') {
            console.log('💾 Guardando en historial...');
            // Crear una copia limpia solo con datos primitivos para el historial
            const cleanData = {
                name: data.name || data.nombre || 'Mazmorra',
                atmosphere: data.atmosphere || data.ambiente || '',
                rooms: data.rooms || data.salas || []
            };
            addToHistory(cleanData, 'dungeons');
        }

    } catch (err) {
        console.error('❌ Error capturado:', err.message);
        els.content.innerHTML = '<p style="color:red">Error: ' + err.message + '</p>';
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
}

function handleExport() {
    if (!currentData) return;
    
    try {
        const name = currentData.name || currentData.nombre || 'Dungeon';
        const environment = currentData.atmosphere || currentData.environment || currentData.ambiente || '';
        const rooms = currentData.rooms || currentData.salas || [];
        
        let text = 'MAZMORRA: ' + name + '\nAmbiente: ' + environment + '\n\n';
        
        for (let i = 0; i < rooms.length; i++) {
            const r = rooms[i];
            if (r && typeof r === 'object') {
                const roomId = r.id !== undefined ? String(r.id) : String(i + 1);
                const roomTitle = r.title || r.titulo || 'Sin título';
                const roomType = r.type || r.tipo || 'Unknown';
                const roomDesc = r.description || r.descripcion || '';
                const roomChallenge = r.challenge || r.desafio || '';
                
                text += '[' + roomId + '] ' + roomTitle + ' (' + roomType + ')\n';
                text += roomDesc + '\n';
                text += '>> Desafío: ' + roomChallenge + '\n\n';
            }
        }

        const blob = new Blob([text], {type: 'text/plain'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'Dungeon_' + name.replace(/\s+/g, '_') + '.txt';
        a.click();
    } catch (e) {
        console.error('Error exportando:', e.message);
        alert('Error al exportar: ' + e.message);
    }
}

function renderDungeonInternal(data) {
    console.log('🏗️ Render inicio');
    
    if (!els || !els.content) {
        console.error('❌ Els no disponible');
        return;
    }
    
    // Variables para almacenar SOLO strings
    let nameStr = '---';
    let envStr = '---';
    let roomCount = 0;
    let roomsArray = [];
    
    // PASO 1: Extraer datos primitivos sin invocar toString
    try {
        // Verificar que data existe y es objeto
        if (!data || typeof data !== 'object') {
            throw new Error('Datos invalidos');
        }
        
        // Extraer name/nombre
        const n = data.name || data.nombre;
        if (typeof n === 'string') nameStr = n;
        else if (typeof n === 'number') nameStr = n + '';
        
        // Extraer atmosphere/ambiente
        const e = data.atmosphere || data.environment || data.ambiente;
        if (typeof e === 'string') envStr = e;
        else if (typeof e === 'number') envStr = e + '';
        
        // Extraer rooms/salas
        const r = data.rooms || data.salas;
        if (Array.isArray(r)) {
            roomsArray = r;
            roomCount = r.length;
        }
        
    } catch (err) {
        console.error('❌ Error extraccion:', err.message);
        els.content.innerHTML = '<p style="color:red">Error al procesar datos</p>';
        return;
    }
    
    console.log('📝 Nombre:', nameStr.length, 'chars | Salas:', roomCount);

    if (roomCount === 0) {
        console.error('❌ Sin salas');
        els.content.innerHTML = '<p style="color:red">No se generaron salas</p>';
        return;
    }

    // PASO 2: Construir HTML sala por sala
    const parts = [];
    for (let idx = 0; idx < roomCount; idx++) {
        try {
            const rm = roomsArray[idx];
            if (!rm || typeof rm !== 'object') continue;
            
            // Extraer cada campo como string
            let idStr = '';
            let typeStr = '';
            let titleStr = '';
            let descStr = '';
            let chalStr = '';
            let consStr = '';
            
            // ID
            const idVal = rm.id !== undefined ? rm.id : (idx + 1);
            if (typeof idVal === 'string') idStr = idVal;
            else if (typeof idVal === 'number') idStr = idVal + '';
            else idStr = (idx + 1) + '';
            
            // Type
            const typeVal = rm.type || rm.tipo;
            if (typeof typeVal === 'string') typeStr = typeVal;
            else typeStr = 'Unknown';
            
            // Title
            const titleVal = rm.title || rm.titulo;
            if (typeof titleVal === 'string') titleStr = titleVal;
            else titleStr = 'Sin titulo';
            
            // Description
            const descVal = rm.description || rm.descripcion;
            if (typeof descVal === 'string') descStr = descVal;
            else descStr = '';
            
            // Challenge
            const chalVal = rm.challenge || rm.desafio;
            if (typeof chalVal === 'string') chalStr = chalVal;
            else chalStr = '';
            
            // Consequence
            const consVal = rm.consequence || rm.consecuencia;
            if (typeof consVal === 'string') consStr = consVal;
            
            // Construir HTML de consecuencia
            let consHtml = '';
            if (consStr && consStr.length > 0) {
                consHtml = '<small>Si fallan: ' + consStr + '</small>';
            }
            
            // Construir HTML de la sala
            const roomHtml = 
                '<div class="room-card">' +
                '<div class="room-number">' + idStr + '</div>' +
                '<div class="room-type">' + typeStr + '</div>' +
                '<h3 style="margin-top:5px; margin-left:15px; color:#2c3e50;">' + titleStr + '</h3>' +
                '<p style="font-style:italic; color:#555; border-left:3px solid #bdc3c7; padding-left:10px;">"' + descStr + '"</p>' +
                '<div class="challenge-box"><strong>⚠️ Desafío:</strong> ' + chalStr + '<br>' + consHtml + '</div>' +
                '</div>';
            
            parts.push(roomHtml);
            
        } catch (rmErr) {
            console.error('❌ Error sala:', rmErr.message);
        }
    }

    console.log('✅ HTML:', parts.length, 'salas');

    // PASO 3: Construir HTML final
    const html = 
        '<div style="text-align:center; margin-bottom:20px;">' +
        '<h1 style="color:#2c3e50; margin-bottom:5px;">' + nameStr + '</h1>' +
        '<p style="color:#7f8c8d;">' + envStr + '</p>' +
        '</div>' +
        '<div style="padding-left:15px;">' + parts.join('') + '</div>';

    console.log('🔄 DOM update');
    els.content.innerHTML = html;
    console.log('🎉 Completado');
}

// Exponer renderDungeon al contexto global para el historial
window.renderDungeon = function(data) {
    console.log('🌍 Llamada global a renderDungeon');
    currentData = data;
    renderDungeonInternal(data);
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDungeon);
} else {
    initDungeon();
} 