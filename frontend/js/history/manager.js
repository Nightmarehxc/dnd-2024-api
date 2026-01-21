// ==========================================
// 🏛️ GESTOR DE HISTORIAL (SQLITE VERSION)
// ==========================================

const HISTORY_API_BASE = "http://localhost:5001/api/history";
const historyContainer = document.getElementById('historyList');
const PAGE_TYPE = detectPageType(); // Viene de config.js

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
    if (!history || history.length === 0) {
        historyContainer.innerHTML = '<p style="text-align:center; color:#888;">Sin registros</p>';
        return;
    }

    history.forEach(item => {
        const itemConfig = HISTORY_CONFIG[item.type] || { icon: '📄' };

        const div = document.createElement('div');
        div.className = 'history-item';
        // IMPORTANTE: item.id ahora viene de la DB (1, 2, 3...)
        div.innerHTML = `
            <div class="history-info" onclick="restoreItem(${item.id})">
                <span class="h-icon">${itemConfig.icon}</span>
                <div class="h-details">
                    <div class="h-name">${item.name}</div>
                    <div class="h-date">${new Date(item.timestamp).toLocaleDateString()}</div>
                </div>
            </div>
            <button class="h-delete" onclick="deleteItem(${item.id})" title="Borrar">×</button>
        `;
        // Guardamos todo el objeto JSON en el dataset
        div.dataset.json = JSON.stringify(item.data);
        div.dataset.type = item.type;
        div.dataset.id = item.id; // ID de Base de Datos
        historyContainer.appendChild(div);
    });
}

// --- 2. GUARDAR (CREAR O ACTUALIZAR) ---
async function addToHistory(data, forcedType = null) {
    const targetType = forcedType || PAGE_TYPE;
    if (!targetType) return;

    // Si el objeto ya tiene un ID de base de datos (y estamos en su página), intentamos ACTUALIZAR
    // PERO: Para simplificar y evitar sobrescribir cosas que no queremos,
    // el comportamiento por defecto de 'Generar' suele ser crear uno nuevo.
    // Si queremos actualizar explícitamente, usaremos otra lógica o comprobaremos si data._db_id existe.

    // Por ahora, implementamos GUARDAR NUEVO siempre al generar.
    // La edición la manejaremos abajo.

    try {
        await fetch(`${HISTORY_API_BASE}/${targetType}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: data })
        });

        if (targetType === PAGE_TYPE) loadHistory();
        else console.log(`✅ Guardado en background: ${targetType}`);

    } catch (e) { console.error("Error guardando:", e); }
}

// --- 3. RESTAURAR ---
function restoreItem(id) {
    // Buscamos por ID (convirtiendo a string para asegurar compatibilidad en dataset)
    const itemDiv = Array.from(document.querySelectorAll('.history-item'))
        .find(div => div.dataset.id == id);

    if (itemDiv) {
        try {
            const data = JSON.parse(itemDiv.dataset.json);
            const type = itemDiv.dataset.type;

            // Inyectamos el ID de la base de datos en el objeto de datos
            // Esto es TRUCO CLAVE: Así cuando le demos a "Guardar Cambios" en el editor,
            // sabremos qué ID actualizar en la base de datos.
            data._db_id = id;

            if (typeof currentData !== 'undefined') currentData = data;

            // Renderizar
            const config = HISTORY_CONFIG[type];
            if (config && config.renderer) {
                const renderFn = window[config.renderer];
                if (typeof renderFn === 'function') renderFn(data);
            }

            // Mostrar botones
            const btnExp = document.getElementById('btnExp');
            if (btnExp) btnExp.style.display = 'block';

            const btnEdit = document.getElementById('btnEdit');
            if (btnEdit && ['monster', 'inn', 'shop', 'city'].includes(type)) {
                btnEdit.style.display = 'block';
            }

        } catch (e) { console.error(e); }
    }
}

// --- 4. ACTUALIZAR EXISTENTE (Para el botón "Guardar Cambios") ---
// Tienes que llamar a esto desde city.js / shop.js en el botón "Guardar"
// en lugar de addToHistory si quieres sobrescribir.
async function updateHistoryItem(id, data) {
    if (!id) return addToHistory(data); // Si no tiene ID, créalo nuevo

    try {
        await fetch(`${HISTORY_API_BASE}/${PAGE_TYPE}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: data })
        });
        loadHistory();
        console.log("✅ Elemento actualizado en DB");
    } catch(e) { console.error(e); }
}

// --- 5. BORRAR ---
async function deleteItem(id) {
    if (!confirm("¿Borrar permanentemente?")) return;
    await fetch(`${HISTORY_API_BASE}/${PAGE_TYPE}/${id}`, { method: 'DELETE' });
    loadHistory();
}

document.addEventListener('DOMContentLoaded', loadHistory);