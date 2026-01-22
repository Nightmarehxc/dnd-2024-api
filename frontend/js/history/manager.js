// ==========================================
// 🏛️ GESTOR DE HISTORIAL (SQLITE VERSION FINAL)
// ==========================================

const HISTORY_API_BASE = "http://localhost:5001/api/history";
const historyContainer = document.getElementById('historyList');
// detectPageType debe estar definido en config.js
const PAGE_TYPE = (typeof detectPageType === 'function') ? detectPageType() : null;

// --- 1. CARGAR LISTA ---
async function loadHistory() {
    if (!historyContainer || !PAGE_TYPE) return;
    try {
        const res = await fetch(`${HISTORY_API_BASE}/${PAGE_TYPE}`);
        const history = await res.json();
        console.log(`📥 Historial cargado (${PAGE_TYPE}):`, history);  // DEBUG
        renderHistoryList(history);
    } catch (e) {
        console.error("Error historial:", e);
        historyContainer.innerHTML = '<p style="color:red; text-align:center; font-size:0.8em;">Error de conexión</p>';
    }
}

function renderHistoryList(history) {
    console.log('📋 renderHistoryList llamado con:', history);  // DEBUG
    historyContainer.innerHTML = '';
    if (!history || history.length === 0) {
        console.warn('⚠️ Historial vacío o no definido');  // DEBUG
        historyContainer.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px; font-size:0.9em;">Sin registros</p>';
        return;
    }
    
    console.log(`✅ Renderizando ${history.length} items`);  // DEBUG

    history.forEach(item => {
        // Aseguramos config por defecto
        const itemConfig = (window.HISTORY_CONFIG && window.HISTORY_CONFIG[item.type])
                           ? window.HISTORY_CONFIG[item.type]
                           : { icon: '📄' };

        const div = document.createElement('div');
        div.className = 'history-item';
        // Dataset guarda ID numérico y JSON
        div.innerHTML = `
            <div class="history-info" onclick="restoreItem(${item.id})">
                <span class="h-icon">${itemConfig.icon}</span>
                <div class="h-details">
                    <div class="h-name">${item.name}</div>
                    <div class="h-date">${new Date(item.timestamp).toLocaleDateString()}</div>
                </div>
            </div>
            <button class="h-delete" onclick="deleteItem(event, ${item.id})" title="Borrar">×</button>
        `;
        div.dataset.json = JSON.stringify(item.data);
        div.dataset.type = item.type;
        div.dataset.id = item.id;
        historyContainer.appendChild(div);
    });
}

// --- 2. GUARDAR (CREAR NUEVO) ---
async function addToHistory(data, forcedType = null) {
    const targetType = forcedType || PAGE_TYPE;
    if (!targetType) return;
    
    console.log(`📤 addToHistory - Guardando ${targetType}:`, data);  // DEBUG

    try {
        await fetch(`${HISTORY_API_BASE}/${targetType}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: data })
        });

        // Si estamos en la misma página, recargamos la lista
        if (targetType === PAGE_TYPE) {
            console.log('🔄 Recargando historial...');  // DEBUG
            loadHistory();
        }
        else console.log(`✅ Guardado en background: ${targetType}`);

    } catch (e) { console.error("Error guardando:", e); }
}

// --- 3. ACTUALIZAR (EDITAR EXISTENTE) ---
async function updateHistoryItem(id, data) {
    if (!id) return addToHistory(data); // Fallback por seguridad

    try {
        await fetch(`${HISTORY_API_BASE}/${PAGE_TYPE}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: data })
        });
        loadHistory(); // Recargar para ver el cambio de nombre si hubo
        console.log("✅ Elemento actualizado correctamente");
    } catch(e) { console.error("Error actualizando:", e); }
}

// --- 4. RESTAURAR ---
function restoreItem(id) {
    console.log('🔄 Restaurando item ID:', id);  // DEBUG
    // Usamos '==' para que coincida "5" (string dataset) con 5 (number argumento)
    const itemDiv = Array.from(document.querySelectorAll('.history-item'))
        .find(div => div.dataset.id == id);

    if (itemDiv) {
        try {
            const data = JSON.parse(itemDiv.dataset.json);
            const type = itemDiv.dataset.type;
            console.log('📦 Datos restaurados:', { type, data });  // DEBUG

            // 💡 CLAVE: Inyectamos el ID de la base de datos en el objeto en memoria
            data._db_id = id;

            // Variable global para exportar/editar
            if (typeof currentData !== 'undefined') currentData = data;
            window.currentData = data; // Forzamos global por si acaso

            // Renderizar usando la configuración
            if (window.HISTORY_CONFIG && window.HISTORY_CONFIG[type]) {
                const rendererName = window.HISTORY_CONFIG[type].renderer;
                console.log(`📡 Llamando renderer: ${rendererName}`);  // DEBUG
                if (typeof window[rendererName] === 'function') {
                    try {
                        window[rendererName](data);
                        console.log('✅ Renderer ejecutado exitosamente');  // DEBUG
                    } catch (renderError) {
                        console.error(`❌ Error en renderer ${rendererName}:`, renderError);  // DEBUG
                    }
                } else {
                    console.error(`❌ Renderer no existe: ${rendererName}`);  // DEBUG
                }
            } else {
                console.error(`❌ Config no existe para tipo: ${type}`);  // DEBUG
            }

            // Mostrar botones UI
            const btnExp = document.getElementById('btnExp');
            if (btnExp) btnExp.style.display = 'block';

            const btnEdit = document.getElementById('btnEdit');
            // Permitimos editar en todas las herramientas editables
            const editableTypes = ['monsters', 'inns', 'shops', 'cities','items','journals','npcs','characters','spells','quests','riddles','adventures','dungeons','mysteries','villains','factions'];
            if (btnEdit && editableTypes.includes(type)) {
                btnEdit.style.display = 'block';
            }

        } catch (e) { console.error("Error al restaurar:", e); }
    }
}

// --- 5. BORRAR ---
async function deleteItem(event, id) {
    if(event) event.stopPropagation(); // Evitar que se abra al borrar
    if (!confirm("¿Borrar este registro permanentemente?")) return;

    try {
        await fetch(`${HISTORY_API_BASE}/${PAGE_TYPE}/${id}`, { method: 'DELETE' });
        loadHistory();
    } catch(e) { console.error(e); }
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', loadHistory);