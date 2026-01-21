// ==========================================
// 🏛️ GESTOR DE HISTORIAL (LÓGICA)
// ==========================================

const HISTORY_API_BASE = "http://localhost:5001/api/history";
const historyContainer = document.getElementById('historyList');
const PAGE_TYPE = detectPageType(); // Viene de config.js

// --- 1. CARGAR LISTA ---
async function loadHistory() {
    if (!historyContainer || !PAGE_TYPE) return;
    try {
        // Pedimos al servidor solo el historial de ESTA página
        const res = await fetch(`${HISTORY_API_BASE}/${PAGE_TYPE}`);
        const history = await res.json();
        renderHistoryList(history);
    } catch (e) {
        console.error("Error historial:", e);
        historyContainer.innerHTML = '<p style="color:red; text-align:center; font-size:0.8em;">Error de conexión</p>';
    }
}

function renderHistoryList(history) {
    historyContainer.innerHTML = '';
    if (!history || history.length === 0) {
        historyContainer.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px; font-size:0.9em;">Sin registros recientes</p>';
        return;
    }

    history.forEach(item => {
        // Obtenemos la config para este ítem (por si acaso cargamos tipos mixtos en el futuro)
        const itemConfig = HISTORY_CONFIG[item.type] || { icon: '📄' };

        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div class="history-info" onclick="restoreItem('${item.id}')">
                <span class="h-icon">${itemConfig.icon}</span>
                <div class="h-details">
                    <div class="h-name">${item.name}</div>
                    <div class="h-date">${item.timestamp || ''}</div>
                </div>
            </div>
            <button class="h-delete" onclick="deleteItem('${item.id}')" title="Borrar">×</button>
        `;
        // Guardamos los datos en el elemento DOM
        div.dataset.json = JSON.stringify(item.data);
        div.dataset.type = item.type; // Guardamos el tipo real del ítem
        div.dataset.id = item.id;
        historyContainer.appendChild(div);
    });
}

// --- 2. GUARDAR ---
// forcedType permite guardar un 'inn' estando en la página de 'city'
async function addToHistory(data, forcedType = null) {
    const targetType = forcedType || PAGE_TYPE;

    if (!targetType) return;

    try {
        await fetch(`${HISTORY_API_BASE}/${targetType}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: data })
        });

        // Solo recargamos la lista visual si el ítem guardado pertenece a la página actual
        if (targetType === PAGE_TYPE) {
            loadHistory();
        } else {
            console.log(`✅ Guardado en segundo plano en categoría: ${targetType}`);
        }
    } catch (e) {
        console.error("Error guardando:", e);
    }
}

// --- 3. RESTAURAR (DINÁMICO) ---
function restoreItem(id) {
    const itemDiv = Array.from(document.querySelectorAll('.history-item'))
        .find(div => div.dataset.id === id);

    if (itemDiv) {
        try {
            const data = JSON.parse(itemDiv.dataset.json);
            const type = itemDiv.dataset.type; // Tipo del ítem (ej: 'inn')

            // Actualizamos variable global para exportaciones
            if (typeof currentData !== 'undefined') currentData = data;

            // 🔍 BÚSQUEDA DINÁMICA DEL RENDERIZADOR
            const config = HISTORY_CONFIG[type];

            if (config && config.renderer) {
                // Buscamos la función en el ámbito global (window)
                const renderFn = window[config.renderer];

                // Caso especial Character Sheet (prioridad sobre renderCharacter simple)
                if (type === 'character' && typeof window['renderCharacterSheet'] === 'function') {
                    window['renderCharacterSheet'](data);
                }
                else if (typeof renderFn === 'function') {
                    renderFn(data);
                } else {
                    console.warn(`Función ${config.renderer} no encontrada.`);
                }
            }

            // Gestión de botones UI
            const btnExp = document.getElementById('btnExp');
            if (btnExp) btnExp.style.display = 'block';

            const btnEdit = document.getElementById('btnEdit');
            if (btnEdit) {
                // Solo mostramos editar si es un tipo soportado (ej: monster, inn)
                if (['monster', 'inn','shop','city'].includes(type)) {
                    btnEdit.style.display = 'block';
                } else {
                    btnEdit.style.display = 'none';
                }
            }

        } catch (e) {
            console.error("Error al restaurar:", e);
            alert("No se pudo cargar el elemento.");
        }
    }
}

// --- 4. BORRAR ---
async function deleteItem(id) {
    if (!confirm("¿Borrar esta entrada?")) return;
    await fetch(`${HISTORY_API_BASE}/${PAGE_TYPE}/${id}`, { method: 'DELETE' });
    loadHistory();
}

// Inicializar
document.addEventListener('DOMContentLoaded', loadHistory);