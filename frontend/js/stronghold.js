const API_URL = "http://localhost:5001/api/strongholds";
let currentData = null;
let currentType = null; // 'stronghold', 'hireling', 'event'
let currentStrongholdId = null; // ID del baluarte cargado
let currentDay = 0; // Día actual del baluarte
let currentLevel = 5; // Nivel del personaje
let bastionPoints = 0; // BP actuales
let lastBastionTurnDay = 0; // Último día de turno de bastión
let availableFacilities = []; // Instalaciones disponibles

const els = {
    // Stronghold
    strongholdType: document.getElementById('strongholdType'),
    strongholdName: document.getElementById('strongholdName'),
    level: document.getElementById('level'),
    locationDescription: document.getElementById('locationDescription'),
    btnGenStronghold: document.getElementById('btnGenStronghold'),

    // Hireling
    hirelingRole: document.getElementById('hirelingRole'),
    hirelingStrongholdType: document.getElementById('hirelingStrongholdType'),
    btnGenHireling: document.getElementById('btnGenHireling'),

    // Event
    eventStrongholdType: document.getElementById('eventStrongholdType'),
    eventSeverity: document.getElementById('eventSeverity'),
    btnGenEvent: document.getElementById('btnGenEvent'),

    // Lista y gestión
    btnShowList: document.getElementById('btnShowList'),
    strongholdList: document.getElementById('strongholdList'),
    btnSave: document.getElementById('btnSave'),
    btnDelete: document.getElementById('btnDelete'),

    // Gestión temporal y BP
    timeManagement: document.getElementById('timeManagement'),
    currentDayDisplay: document.getElementById('currentDay'),
    bastionPointsDisplay: document.getElementById('bastionPoints'),
    lastBastionTurnDisplay: document.getElementById('lastBastionTurn'),
    btnBastionTurn: document.getElementById('btnBastionTurn'),
    constructionProgress: document.getElementById('constructionProgress'),
    facilitiesPanel: document.getElementById('facilitiesPanel'),
    facilitiesList: document.getElementById('facilitiesList'),

    // UI
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

// === SWITCH TABS ===
function switchTab(tab) {
    // Desactivar todos los tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Activar tab seleccionado
    document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
    document.getElementById(`tab-${tab}`).classList.add('active');
}

// ============================================
// GESTIÓN DE LISTA
// ============================================

// Mostrar/Ocultar lista
els.btnShowList.addEventListener('click', async () => {
    if (els.strongholdList.style.display === 'none') {
        await loadStrongholdList();
        els.strongholdList.style.display = 'block';
        els.btnShowList.textContent = '❌ Ocultar Lista';
    } else {
        els.strongholdList.style.display = 'none';
        els.btnShowList.textContent = '📚 Mis Baluartes Guardados';
    }
});

// Cargar lista de baluartes
async function loadStrongholdList() {
    try {
        els.strongholdList.innerHTML = '<p style="color:#999; text-align:center;">⏳ Cargando...</p>';
        
        const res = await fetch(`${API_URL}/list`);
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const strongholds = await res.json();
        
        if (strongholds.length === 0) {
            els.strongholdList.innerHTML = '<p style="color:#999; text-align:center; padding:20px;">📭 No hay baluartes guardados<br><small>Genera uno nuevo para empezar</small></p>';
            return;
        }
        
        els.strongholdList.innerHTML = strongholds.map(s => {
            const type = (s.data && (s.data.type || s.data.tipo)) || 'Desconocido';
            const day = (s.data && (s.data.current_day || s.data.dia_actual)) || 0;
            return `
                <div style="padding:8px; border-bottom:1px solid #ddd; cursor:pointer; display:flex; justify-content:space-between; align-items:center;"
                     onmouseover="this.style.background='#e8f4f8'" 
                     onmouseout="this.style.background='transparent'">
                    <span onclick="loadStronghold(${s.id})" style="flex:1;">
                        <strong>${s.name}</strong><br>
                        <small style="color:#666;">${type} • Día ${day}</small>
                    </span>
                    <button onclick="deleteStrongholdConfirm(${s.id}, event)" 
                            style="background:#e74c3c; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer;">
                        🗑️
                    </button>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Error loading stronghold list:', err);
        els.strongholdList.innerHTML = `
            <div style="padding:20px; text-align:center;">
                <p style="color:#e74c3c; margin-bottom:10px;">❌ Error al cargar lista</p>
                <p style="color:#666; font-size:0.9em;">${err.message}</p>
                <p style="color:#999; font-size:0.85em; margin-top:10px;">
                    Asegúrate de que el servidor esté corriendo:<br>
                    <code style="background:#f0f0f0; padding:4px 8px; border-radius:3px;">python run.py</code>
                </p>
            </div>
        `;
    }
}

// Cargar un baluarte específico
async function loadStronghold(id) {
    try {
        els.loader.style.display = 'block';
        els.loader.textContent = '📂 Cargando baluarte...';
        
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error('Error al cargar baluarte');
        
        const stronghold = await res.json();
        currentData = stronghold.data;
        currentType = 'stronghold';
        currentStrongholdId = id;
        
        // Cargar datos temporales y BP
        currentDay = currentData.current_day || currentData.dia_actual || 0;
        currentLevel = currentData.level_requirement || currentData.nivel_requerido || 5;
        bastionPoints = currentData.bastion_points || currentData.puntos_bastion || 0;
        lastBastionTurnDay = currentData.last_bastion_turn_day || 0;
        
        // Cargar instalaciones disponibles para este nivel
        await loadAvailableFacilities(currentLevel);
        
        renderStronghold(currentData);
        updateTimeManagement();
        
        // Ocultar lista y mostrar botones de gestión
        els.strongholdList.style.display = 'none';
        els.btnShowList.textContent = '📚 Mis Baluartes Guardados';
        els.btnSave.style.display = 'block';
        els.btnDelete.style.display = 'block';
        els.btnExp.style.display = 'block';
        els.timeManagement.style.display = 'block';
        
    } catch (err) {
        alert(`Error al cargar: ${err.message}`);
    } finally {
        els.loader.style.display = 'none';
    }
}

// Cargar instalaciones disponibles por nivel
async function loadAvailableFacilities(level) {
    try {
        const res = await fetch(`${API_URL}/facilities?level=${level}`);
        if (!res.ok) throw new Error('Error al cargar instalaciones');
        availableFacilities = await res.json();
    } catch (err) {
        console.error('Error loading facilities:', err);
        availableFacilities = [];
    }
}

// Guardar cambios en el baluarte actual
els.btnSave.addEventListener('click', async () => {
    if (!currentStrongholdId || !currentData) {
        return alert('No hay baluarte cargado para guardar');
    }
    
    // Añadir datos temporales antes de guardar
    currentData.current_day = currentDay;
    currentData.dia_actual = currentDay;
    currentData.bastion_points = bastionPoints;
    currentData.puntos_bastion = bastionPoints;
    
    try {
        const res = await fetch(`${API_URL}/${currentStrongholdId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(currentData)
        });
        
        if (!res.ok) throw new Error('Error al guardar cambios');
        
        alert('✅ Cambios guardados exitosamente');
        await loadStrongholdList(); // Recargar lista
    } catch (err) {
        alert(`❌ Error al guardar: ${err.message}`);
    }
});

// Confirmar y eliminar baluarte
async function deleteStrongholdConfirm(id, event) {
    event.stopPropagation(); // Evitar que se dispare el click de carga
    
    if (!confirm('¿Estás seguro de eliminar este baluarte?')) return;
    
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!res.ok) throw new Error('Error al eliminar');
        
        alert('✅ Baluarte eliminado');
        
        // Si es el baluarte actual, limpiar pantalla
        if (currentStrongholdId === id) {
            currentData = null;
            currentType = null;
            currentStrongholdId = null;
            els.content.innerHTML = '<p style="text-align:center; margin-top:150px; color:#aaa;">Selecciona qué generar...</p>';
            els.btnSave.style.display = 'none';
            els.btnDelete.style.display = 'none';
            els.btnExp.style.display = 'none';
        }
        
        await loadStrongholdList(); // Recargar lista
    } catch (err) {
        alert(`❌ Error al eliminar: ${err.message}`);
    }
}

// Eliminar baluarte desde el botón principal
els.btnDelete.addEventListener('click', async () => {
    if (!currentStrongholdId) return alert('No hay baluarte cargado');
    
    if (!confirm('¿Estás seguro de eliminar este baluarte?')) return;
    
    try {
        const res = await fetch(`${API_URL}/${currentStrongholdId}`, {
            method: 'DELETE'
        });
        
        if (!res.ok) throw new Error('Error al eliminar');
        
        alert('✅ Baluarte eliminado');
        
        // Limpiar pantalla
        currentData = null;
        currentType = null;
        currentStrongholdId = null;
        els.content.innerHTML = '<p style="text-align:center; margin-top:150px; color:#aaa;">Selecciona qué generar...</p>';
        els.btnSave.style.display = 'none';
        els.btnDelete.style.display = 'none';
        els.btnExp.style.display = 'none';
        
        await loadStrongholdList();
    } catch (err) {
        alert(`❌ Error al eliminar: ${err.message}`);
    }
});

// === GENERAR BALUARTE ===
els.btnGenStronghold.addEventListener('click', async () => {
    const level = parseInt(els.level.value);

    if (level < 5 || level > 20) return alert("El nivel debe estar entre 5 y 20.");

    await generate(`${API_URL}/generate`, {
        stronghold_type: els.strongholdType.value,
        name: els.strongholdName.value,
        level: level,
        location_description: els.locationDescription.value
    }, 'stronghold');
});

// === GENERAR EMPLEADO ===
els.btnGenHireling.addEventListener('click', async () => {
    if (!els.hirelingRole.value) return alert("Especifica el puesto de trabajo.");

    await generate(`${API_URL}/hireling`, {
        role: els.hirelingRole.value,
        stronghold_type: els.hirelingStrongholdType.value
    }, 'hireling');
});

// === GENERAR EVENTO ===
els.btnGenEvent.addEventListener('click', async () => {
    await generate(`${API_URL}/event`, {
        stronghold_type: els.eventStrongholdType.value,
        severity: els.eventSeverity.value
    }, 'event');
});

// === FUNCIÓN GENÉRICA DE GENERACIÓN ===
async function generate(url, body, type) {
    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.loader.textContent = "🏗️ Construyendo...";
    els.btnExp.style.display = 'none';

    // Deshabilitar botones
    els.btnGenStronghold.disabled = true;
    els.btnGenHireling.disabled = true;
    els.btnGenEvent.disabled = true;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        currentType = type;

        if (type === 'stronghold') {
            renderStronghold(data);
            // Al generar nuevo, mostrar botón save y asignar ID
            if (data.id) {
                currentStrongholdId = data.id;
                currentDay = 0;
                constructionsInProgress = [];
                els.btnSave.style.display = 'block';
                els.btnDelete.style.display = 'block';
                els.timeManagement.style.display = 'block';
                updateTimeManagement();
            }
        }
        else if (type === 'hireling') renderHireling(data);
        else if (type === 'event') renderEvent(data);

        els.btnExp.style.display = 'block';

    } catch (err) {
        els.content.innerHTML = `<div style="color:red; padding:20px;">❌ Error: ${err.message}</div>`;
    } finally {
        els.loader.style.display = 'none';
        // Re-habilitar botones
        els.btnGenStronghold.disabled = false;
        els.btnGenHireling.disabled = false;
        els.btnGenEvent.disabled = false;
    }
}

// === RENDERIZAR BALUARTE COMPLETO ===
function renderStronghold(data) {
    let html = `
        <div class="stronghold-section">
            <h2 style="color:#8e44ad; margin-top:0;">🏰 ${data.name || data.nombre}</h2>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                <div>
                    <p style="margin:5px 0;"><strong>Tipo:</strong> ${data.type || data.tipo}</p>
                    <p style="margin:5px 0;"><strong>Nivel Mínimo:</strong> ${data.level_requirement || data.nivel_requerido}</p>
                </div>
                <div>
                    <p style="margin:5px 0;"><strong>Día Actual:</strong> ${data.current_day || data.dia_actual || 0}</p>
                    <p style="margin:5px 0;"><strong>Puntos de Bastión:</strong> ⭐ ${data.bastion_points || data.puntos_bastion || 0} BP</p>
                    <p style="margin:5px 0;"><strong>Defensa:</strong> 🛡️ ${data.defense_score || data.puntuacion_defensa || 0}</p>
                </div>
            </div>
            <p><strong>Ubicación:</strong> ${data.location || data.ubicacion || data.ubicación}</p>
        </div>

        <div class="stronghold-section">
            <h3>🏗️ Instalaciones Activas</h3>
            ${renderActiveFacilities(data.active_facilities || data.instalaciones_activas)}
        </div>

        <div class="stronghold-section">
            <h3>👥 Personal</h3>
            ${renderStaff(data.staff || data.personal)}
        </div>

        <div class="stronghold-section">
            <h3>✨ Características Especiales</h3>
            ${renderSpecialFeatures(data.special_features || data.caracteristicas_especiales)}
        </div>

        <div class="stronghold-section">
            <h3>🎖️ Reputación</h3>
            ${renderReputation(data.reputation || data.reputacion || data.reputación)}
        </div>
    `;

    els.content.innerHTML = html;
}

// === RENDERIZAR INSTALACIONES ACTIVAS ===
function renderActiveFacilities(facilities) {
    if (!facilities || facilities.length === 0) {
        return '<p style="color:#999;">Este baluarte aún no tiene instalaciones.<br><small>Usa el panel de Gestión Temporal para construir instalaciones.</small></p>';
    }
    
    return facilities.map(facility => {
        const orderTypes = ['Craft', 'Research', 'Gather', 'Trade', 'Recruit', 'Empower'];
        const currentOrder = facility.current_order || facility.orden_actual;
        const orderResult = facility.order_result || facility.resultado_orden;
        
        // Opciones de orden basadas en el tipo de instalación
        const orderOptions = orderTypes.map(order => 
            `<option value="${order}" ${currentOrder === order ? 'selected' : ''}>${order}</option>`
        ).join('');
        
        return `
        <div class="room-card" style="border-left:4px solid #27ae60;">
            <h4>${facility.nombre || facility.name}</h4>
            <div style="display:flex; gap:8px; margin:8px 0; flex-wrap:wrap;">
                <span class="cost-badge" style="background:#9b59b6;">📏 ${facility.tamaño || facility.size}</span>
                ${facility.generacion_bp || facility.bp_generation ? 
                    `<span class="cost-badge" style="background:#27ae60;">⭐ +${facility.generacion_bp || facility.bp_generation} BP/turno</span>` 
                    : ''}
                <span class="cost-badge" style="background:#34495e;">🛠️ ${facility.tipo_orden || facility.order_type || 'Basic'}</span>
            </div>
            <p><strong>Beneficio:</strong> ${facility.beneficio || facility.benefit}</p>
            <p style="font-size:0.9em; color:#666;">${facility.descripcion || facility.description}</p>
            
            <!-- Sistema de Órdenes -->
            <div style="background:#f8f9fa; padding:10px; border-radius:4px; margin-top:10px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <label style="font-weight:bold; min-width:60px;">Orden:</label>
                    <select id="order-${facility.sf_id}" style="flex:1; padding:5px; border-radius:4px; border:1px solid #ddd;">
                        <option value="">-- Sin orden --</option>
                        ${orderOptions}
                    </select>
                    <button onclick="assignOrder(${facility.sf_id}, '${facility.nombre || facility.name}')" 
                            style="background:#3498db; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer; font-weight:bold;">
                        ✓ Asignar
                    </button>
                </div>
                
                ${orderResult ? `
                <div style="margin-top:10px; padding:8px; background:${orderResult.success ? '#d4edda' : '#f8d7da'}; border-radius:4px; border:1px solid ${orderResult.success ? '#c3e6cb' : '#f5c6cb'};">
                    <strong style="color:${orderResult.success ? '#155724' : '#721c24'};">Último resultado:</strong>
                    <p style="margin:5px 0 0 0; color:${orderResult.success ? '#155724' : '#721c24'};">${orderResult.message}</p>
                </div>
                ` : ''}
            </div>
        </div>
    `}).join('');
}

// === RENDERIZAR COSTES ===
function renderCosts(costs) {
    if (!costs) return '<p>No hay información de costes.</p>';
    return `
        <p><span class="cost-badge">💰 ${costs.gold || costs.oro} GP</span></p>
        <p><span class="time-badge">📅 ${costs.construction_days || costs.dias_construccion || costs.días_construcción} días</span></p>
        <p><strong>Mantenimiento Mensual:</strong> ${costs.monthly_maintenance || costs.mantenimiento_mensual} GP</p>
    `;
}

// === RENDERIZAR HABITACIONES ===
function renderRooms(rooms) {
    if (!rooms || rooms.length === 0) return '<p>No hay habitaciones definidas.</p>';
    return rooms.map(room => `
        <div class="room-card">
            <h4>${room.name || room.nombre}</h4>
            <p><strong>Tipo:</strong> ${room.type || room.tipo}</p>
            <p><span class="cost-badge">${room.cost || room.costo} GP</span> 
               <span class="time-badge">${room.construction_time || room.tiempo_construccion || room.tiempo_construcción} días</span></p>
            <p><strong>Beneficios:</strong> ${room.benefits || room.beneficios}</p>
            <p>${room.description || room.descripcion || room.descripción}</p>
        </div>
    `).join('');
}

// === RENDERIZAR MEJORAS ===
function renderUpgrades(upgrades) {
    if (!upgrades || upgrades.length === 0) return '<p>No hay mejoras disponibles.</p>';
    return upgrades.map((upgrade, index) => `
        <div class="room-card" style="border-left: 4px solid #3498db;">
            <h4>${upgrade.name || upgrade.nombre}</h4>
            <p><strong>Tipo:</strong> ${upgrade.type || upgrade.tipo}</p>
            <p><span class="cost-badge">${upgrade.cost || upgrade.costo} GP</span> 
               <span class="time-badge">${upgrade.construction_time || upgrade.tiempo_construccion || upgrade.tiempo_construcción} días</span></p>
            <p><strong>Requisitos:</strong> ${upgrade.requirements || upgrade.requisitos}</p>
            <p><strong>Beneficios:</strong> ${upgrade.benefits || upgrade.beneficios}</p>
            <p>${upgrade.description || upgrade.descripcion || upgrade.descripción}</p>
            <button class="btn-build" onclick="startConstruction(${index}, 'upgrade')">
                🏗️ Iniciar Construcción
            </button>
        </div>
    `).join('');
}

// === RENDERIZAR PERSONAL ===
function renderStaff(staff) {
    if (!staff || staff.length === 0) return '<p>No hay personal contratado.</p>';
    return staff.map(member => `
        <div class="staff-card">
            <h4>${member.name || member.nombre} - ${member.role || member.rol}</h4>
            <p><strong>Salario:</strong> <span class="cost-badge">${member.salary || member.salario} GP/mes</span></p>
            <p><strong>Peculiaridad:</strong> <em>${member.quirk || member.peculiaridad}</em></p>
            <p><strong>Habilidades:</strong> ${member.skills || member.habilidades}</p>
            <p>${member.backstory || member.historia || member.trasfondo}</p>
        </div>
    `).join('');
}

// === RENDERIZAR EVENTOS ===
function renderMaintenanceEvents(events) {
    if (!events || events.length === 0) return '<p>No hay eventos de mantenimiento.</p>';
    return events.map(event => {
        const severity = (event.severity || event.severidad || 'Minor').toLowerCase();
        const badgeClass = `severity-${severity}`;
        return `
            <div class="event-card">
                <h4>${event.title || event.titulo || event.título}</h4>
                <p><span class="cost-badge ${badgeClass}">${event.severity || event.severidad}</span></p>
                <p><strong>Coste de Reparación:</strong> <span class="cost-badge">${event.cost_to_fix || event.costo_reparacion || event.costo_reparación} GP</span> 
                   <span class="time-badge">${event.time_to_fix || event.tiempo_reparacion || event.tiempo_reparación} días</span></p>
                <p><strong>Consecuencias si se ignora:</strong> ${event.consequences_if_ignored || event.consecuencias_ignorar}</p>
                <p>${event.description || event.descripcion || event.descripción}</p>
            </div>
        `;
    }).join('');
}

// === RENDERIZAR CARACTERÍSTICAS ESPECIALES ===
function renderSpecialFeatures(features) {
    if (!features || features.length === 0) return '<p>No hay características especiales.</p>';
    return features.map(feature => `
        <div class="room-card" style="border-left: 4px solid #9b59b6;">
            <h4>${feature.name || feature.nombre}</h4>
            <p>${feature.description || feature.descripcion || feature.descripción}</p>
        </div>
    `).join('');
}

// === RENDERIZAR REPUTACIÓN ===
function renderReputation(reputation) {
    if (!reputation) return '<p>No hay información de reputación.</p>';
    return `
        <p><strong>Posición Local:</strong> ${reputation.local_standing || reputation.posicion_local || reputation.posición_local}</p>
        <p><strong>Conocido Por:</strong> ${reputation.known_for || reputation.conocido_por}</p>
        <p><strong>Visitantes Potenciales:</strong> ${reputation.potential_visitors || reputation.visitantes_potenciales}</p>
    `;
}

// === RENDERIZAR EMPLEADO INDIVIDUAL ===
function renderHireling(data) {
    let html = `
        <div class="stronghold-section">
            <h2 style="color:#16a085; margin-top:0;">👤 ${data.name || data.nombre}</h2>
            <p><strong>Puesto:</strong> ${data.role || data.rol}</p>
            <p><strong>Edad:</strong> ${data.age || data.edad}</p>
            <p><strong>Raza:</strong> ${data.race || data.raza}</p>
            <p><strong>Salario:</strong> <span class="cost-badge">${data.salary || data.salario} GP/mes</span></p>
        </div>

        <div class="stronghold-section">
            <h3>✨ Personalidad</h3>
            ${renderPersonality(data.personality || data.personalidad)}
        </div>

        <div class="stronghold-section">
            <h3>🎯 Habilidades</h3>
            ${renderSkills(data.skills || data.habilidades)}
        </div>

        <div class="stronghold-section">
            <h3>📖 Trasfondo</h3>
            <p>${data.backstory || data.historia || data.trasfondo}</p>
        </div>

        <div class="stronghold-section">
            <h3>👁️ Apariencia</h3>
            <p>${data.appearance || data.apariencia}</p>
        </div>

        <div class="stronghold-section">
            <h3>📅 Rutina Diaria</h3>
            <p>${data.daily_routine || data.rutina_diaria}</p>
        </div>

        <div class="stronghold-section">
            <h3>🔗 Conexiones Narrativas</h3>
            ${renderRelationshipHooks(data.relationship_hooks || data.ganchos_relacion || data.ganchos_relación)}
        </div>

        <div class="stronghold-section">
            <h3>⚔️ Estadísticas</h3>
            ${renderStatBlock(data.stat_block || data.estadisticas || data.estadísticas)}
        </div>
    `;

    els.content.innerHTML = html;
}

function renderPersonality(personality) {
    if (!personality) return '<p>Sin información de personalidad.</p>';
    return `
        <p><strong>Peculiaridad:</strong> <em>${personality.quirk || personality.peculiaridad}</em></p>
        <p><strong>Le Gusta:</strong> ${personality.likes || personality.gustos}</p>
        <p><strong>Le Disgusta:</strong> ${personality.dislikes || personality.disgustos}</p>
        <p><strong>Secreto:</strong> ${personality.secret || personality.secreto}</p>
    `;
}

function renderSkills(skills) {
    if (!skills) return '<p>Sin habilidades definidas.</p>';
    const secondary = skills.secondary || skills.secundarias || [];
    const secondaryList = Array.isArray(secondary) ? secondary.join(', ') : secondary;
    return `
        <p><strong>Primaria:</strong> ${skills.primary || skills.primaria}</p>
        <p><strong>Secundarias:</strong> ${secondaryList}</p>
    `;
}

function renderRelationshipHooks(hooks) {
    if (!hooks || hooks.length === 0) return '<p>Sin conexiones narrativas.</p>';
    return '<ul>' + hooks.map(hook => `<li>${hook}</li>`).join('') + '</ul>';
}

function renderStatBlock(stats) {
    if (!stats) return '<p>Sin estadísticas.</p>';
    return `
        <p><strong>HP:</strong> ${stats.hit_points || stats.puntos_golpe}</p>
        <p><strong>AC:</strong> ${stats.armor_class || stats.clase_armadura}</p>
        <p><strong>Habilidad Principal:</strong> ${stats.key_ability || stats.habilidad_clave}</p>
    `;
}

// === RENDERIZAR EVENTO ===
function renderEvent(data) {
    const severity = (data.severity || data.severidad || 'Minor').toLowerCase();
    const badgeClass = `severity-${severity}`;

    let html = `
        <div class="stronghold-section">
            <h2 style="color:#e74c3c; margin-top:0;">⚠️ ${data.title || data.titulo || data.título}</h2>
            <p><span class="cost-badge ${badgeClass}">${data.severity || data.severidad}</span></p>
            <p><strong>Tipo:</strong> ${data.type || data.tipo}</p>
        </div>

        <div class="stronghold-section">
            <h3>🔍 Descripción Inicial</h3>
            <p>${data.immediate_description || data.descripcion_inmediata || data.descripción_inmediata}</p>
        </div>

        <div class="stronghold-section">
            <h3>🕵️ Investigación</h3>
            ${renderInvestigation(data.investigation || data.investigacion || data.investigación)}
        </div>

        <div class="stronghold-section">
            <h3>✅ Opciones de Resolución</h3>
            ${renderResolutionOptions(data.resolution_options || data.opciones_resolucion || data.opciones_resolución)}
        </div>

        <div class="stronghold-section">
            <h3>⏰ Si Se Ignora...</h3>
            ${renderIgnoreConsequences(data.if_ignored || data.si_ignora)}
        </div>

        <div class="stronghold-section">
            <h3>👥 NPCs Involucrados</h3>
            ${renderInvolvedNPCs(data.npcs_involved || data.npcs_involucrados)}
        </div>

        <div class="stronghold-section">
            <h3>🎁 Recompensas Potenciales</h3>
            <p>${data.potential_rewards || data.recompensas_potenciales}</p>
        </div>
    `;

    els.content.innerHTML = html;
}

function renderInvestigation(investigation) {
    if (!investigation) return '<p>Sin información de investigación.</p>';
    
    const clues = investigation.clues || investigation.pistas || [];
    const cluesList = Array.isArray(clues) ? clues.map(c => `<li>${c}</li>`).join('') : '';

    const checks = investigation.skill_checks || investigation.chequeos_habilidad || [];
    const checksList = checks.map(check => `
        <li><strong>${check.skill || check.habilidad}</strong> (CD ${check.dc}): ${check.reveals || check.revela}</li>
    `).join('');

    return `
        <p><strong>Pistas:</strong></p>
        <ul>${cluesList}</ul>
        <p><strong>Chequeos de Habilidad:</strong></p>
        <ul>${checksList}</ul>
    `;
}

function renderResolutionOptions(options) {
    if (!options || options.length === 0) return '<p>Sin opciones de resolución.</p>';
    return options.map(option => `
        <div class="room-card">
            <h4>${option.approach || option.enfoque}</h4>
            <p><strong>Coste:</strong> <span class="cost-badge">${option.cost || option.costo}</span> 
               <span class="time-badge">${option.time || option.tiempo} días</span></p>
            <p><strong>Si Tiene Éxito:</strong> ${option.success_outcome || option.resultado_exito || option.resultado_éxito}</p>
            <p><strong>Si Falla:</strong> ${option.failure_consequence || option.consecuencia_fallo}</p>
        </div>
    `).join('');
}

function renderIgnoreConsequences(consequences) {
    if (!consequences) return '<p>Sin consecuencias definidas.</p>';
    
    const cascading = consequences.cascading_problems || consequences.problemas_cascada || [];
    const cascadingList = Array.isArray(cascading) ? cascading.map(p => `<li>${p}</li>`).join('') : '';

    return `
        <p><strong>Corto Plazo (1 semana):</strong> ${consequences.short_term || consequences.corto_plazo}</p>
        <p><strong>Largo Plazo (1 mes):</strong> ${consequences.long_term || consequences.largo_plazo}</p>
        <p><strong>Problemas en Cascada:</strong></p>
        <ul>${cascadingList}</ul>
    `;
}

function renderInvolvedNPCs(npcs) {
    if (!npcs || npcs.length === 0) return '<p>Sin NPCs involucrados.</p>';
    return npcs.map(npc => `
        <div class="staff-card">
            <h4>${npc.name || npc.nombre}</h4>
            <p><strong>Participación:</strong> ${npc.involvement || npc.participacion || npc.participación}</p>
            <p><strong>Actitud:</strong> ${npc.attitude || npc.actitud}</p>
        </div>
    `).join('');
}

// === EXPORTAR A JOURNAL ===
els.btnExp.addEventListener('click', async () => {
    if (!currentData) return alert("No hay datos para exportar.");

    let title = '';
    if (currentType === 'stronghold') title = currentData.name || currentData.nombre;
    else if (currentType === 'hireling') title = `${currentData.name || currentData.nombre} - ${currentData.role || currentData.rol}`;
    else if (currentType === 'event') title = currentData.title || currentData.titulo || currentData.título;

    const entry = {
        title: title,
        date: new Date().toISOString().split('T')[0],
        content: els.content.innerText,
        type: currentType
    };

    try {
        const res = await fetch('http://localhost:5001/api/journal/save', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(entry)
        });

        if (!res.ok) throw new Error('Error al guardar en el journal');

        alert('✅ Guardado en el Journal exitosamente.');
    } catch (err) {
        alert(`❌ Error al exportar: ${err.message}`);
    }
});

// ============================================
// GESTIÓN TEMPORAL Y CONSTRUCCIÓN
// ============================================

// Actualizar display de gestión temporal
function updateTimeManagement() {
    els.currentDayDisplay.textContent = currentDay;
    els.bastionPointsDisplay.textContent = bastionPoints;
    els.lastBastionTurnDisplay.textContent = lastBastionTurnDay;
    updateConstructionProgress();
}

// Actualizar progreso de construcciones
function updateConstructionProgress() {
    const underConstruction = currentData?.under_construction || currentData?.en_construccion || [];
    
    if (underConstruction.length === 0) {
        els.constructionProgress.innerHTML = `
            <p style="opacity:0.7; margin:0 0 10px 0;">No hay construcciones en progreso</p>
            <button onclick="toggleFacilitiesPanel()" style="background:#27ae60; color:white; border:none; padding:10px; border-radius:4px; cursor:pointer; font-weight:bold; width:100%;">
                🏗️ Ver Instalaciones Disponibles
            </button>
        `;
        return;
    }
    
    els.constructionProgress.innerHTML = 
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">' +
            '<h4 style="margin:0; font-size:1em;">🏗️ Construcciones en Progreso:</h4>' +
            '<button onclick="toggleFacilitiesPanel()" style="background:rgba(39,174,96,0.2); color:#27ae60; border:1px solid #27ae60; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:0.85em;">' +
                '+ Añadir Instalación' +
            '</button>' +
        '</div>' +
        underConstruction.map(construction => {
            const daysRemaining = construction.construction_remaining_days || construction.dias_restantes || 0;
            const isComplete = daysRemaining <= 0;
            
            return `
                <div class="construction-item ${isComplete ? 'construction-complete' : ''}">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div style="flex:1;">
                            <strong>${construction.nombre || construction.name}</strong>
                            <br>
                            <small>${isComplete ? '✅ ¡Completado! Ejecuta Turno de Bastión para finalizar' : `⏳ ${daysRemaining} días restantes`}</small>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
}

// Iniciar construcción de una mejora
function startConstruction(upgradeIndex, type) {
    if (!currentData || currentType !== 'stronghold') {
        alert('Solo se pueden construir mejoras en baluartes completos');
        return;
    }
    
    const upgrades = currentData.available_upgrades || currentData.mejoras_disponibles || [];
    const upgrade = upgrades[upgradeIndex];
    
    if (!upgrade) {
        alert('Mejora no encontrada');
        return;
    }
    
    const cost = parseInt(upgrade.cost || upgrade.costo || 0);
    const days = parseInt(upgrade.construction_time || upgrade.tiempo_construccion || upgrade.tiempo_construcción || 0);
    
    if (!confirm(`¿Iniciar construcción de "${upgrade.name || upgrade.nombre}"?\n\nCoste: ${cost} GP\nTiempo: ${days} días`)) {
        return;
    }
    
    // Añadir a construcciones en progreso
    constructionsInProgress.push({
        name: upgrade.name,
        nombre: upgrade.nombre,
        type: upgrade.type,
        tipo: upgrade.tipo,
        original_days: days,
        dias_originales: days,
        days_remaining: days,
        dias_restantes: days,
        cost: cost,
        costo: cost,
        data: upgrade
    });
    
    // Remover de mejoras disponibles
    upgrades.splice(upgradeIndex, 1);
    
    // Actualizar display
    renderStronghold(currentData);
    updateTimeManagement();
    
    alert(`✅ Construcción iniciada!\n\nSe completará en ${days} días.`);
}

// Completar construcción y añadir a habitaciones actuales
function completeConstruction(constructionIndex) {
    const construction = constructionsInProgress[constructionIndex];
    
    if (!construction) return;
    
    // Añadir a habitaciones actuales
    const currentRooms = currentData.current_rooms || currentData.habitaciones_actuales || [];
    
    const newRoom = {
        name: construction.name,
        nombre: construction.nombre,
        type: construction.type,
        tipo: construction.tipo,
        cost: construction.cost,
        costo: construction.costo,
        construction_time: construction.original_days,
        tiempo_construccion: construction.dias_originales,
        tiempo_construcción: construction.dias_originales,
        benefits: construction.data.benefits || construction.data.beneficios,
        beneficios: construction.data.benefits || construction.data.beneficios,
        description: construction.data.description || construction.data.descripcion || construction.data.descripción,
        descripcion: construction.data.description || construction.data.descripcion || construction.data.descripción,
        descripción: construction.data.description || construction.data.descripcion || construction.data.descripción
    };
    
    currentRooms.push(newRoom);
    
    // Actualizar en currentData
    currentData.current_rooms = currentRooms;
    currentData.habitaciones_actuales = currentRooms;
    
    // Remover de construcciones en progreso
    constructionsInProgress.splice(constructionIndex, 1);
    
    // Actualizar display
    renderStronghold(currentData);
    updateTimeManagement();
    
    alert(`✅ ¡Construcción completada!\n\n"${newRoom.name || newRoom.nombre}" ha sido añadida a las habitaciones actuales.`);
}

// Avanzar días
async function advanceDay(days) {
    if (!currentData || currentType !== 'stronghold') {
        alert('Solo se puede avanzar el tiempo en baluartes completos');
        return;
    }
    
    currentDay += days;
    
    // Actualizar en el servidor
    try {
        currentData.current_day = currentDay;
        currentData.dia_actual = currentDay;
        
        const res = await fetch(`${API_URL}/${currentStrongholdId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(currentData)
        });
        
        if (!res.ok) throw new Error('Error al actualizar día');
        
        // Recargar el baluarte para obtener construcciones actualizadas
        await loadStronghold(currentStrongholdId);
        
        alert(`⏰ Han pasado ${days} días (Día ${currentDay})`);
    } catch (err) {
        alert(`Error al avanzar tiempo: ${err.message}`);
    }
}

// Ejecutar Turno de Bastión
async function executeBastionTurn() {
    if (!currentStrongholdId) {
        alert('No hay baluarte cargado');
        return;
    }
    
    try {
        els.loader.style.display = 'block';
        els.loader.textContent = '🎲 Ejecutando Turno de Bastión...';
        
        const res = await fetch(`${API_URL}/bastion-turn`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                stronghold_id: currentStrongholdId,
                character_level: currentLevel
            })
        });
        
        if (!res.ok) throw new Error('Error al ejecutar turno');
        
        const result = await res.json();
        
        // Actualizar BP
        bastionPoints = result.total_bp;
        lastBastionTurnDay = currentDay;
        
        // Construir mensaje con resultados de órdenes
        let message = `✅ ${result.message}`;
        
        if (result.completed_facilities && result.completed_facilities.length > 0) {
            message += `\n\n🎊 Instalaciones completadas:\n${result.completed_facilities.join('\n')}`;
        }
        
        if (result.order_results && result.order_results.length > 0) {
            message += '\n\n📋 Resultados de Órdenes:\n';
            result.order_results.forEach(or => {
                message += `\n${or.facility} (${or.order}):\n  ${or.result.message}`;
            });
        }
        
        alert(message);
        
        // Recargar baluarte
        await loadStronghold(currentStrongholdId);
        
    } catch (err) {
        alert(`Error: ${err.message}`);
    } finally {
        els.loader.style.display = 'none';
    }
}

// Asignar orden a una instalación
async function assignOrder(facilityId, facilityName) {
    const selectElement = document.getElementById(`order-${facilityId}`);
    const orderType = selectElement.value;
    
    if (!orderType) {
        alert('Selecciona un tipo de orden');
        return;
    }
    
    try {
        const res = await fetch(`${API_URL}/assign-order`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                facility_id: facilityId,
                order_type: orderType
            })
        });
        
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Error al asignar orden');
        }
        
        const result = await res.json();
        alert(`✅ ${result.message}\n\nSe ejecutará durante el próximo Turno de Bastión.`);
        
        // Recargar baluarte para mostrar la orden asignada
        await loadStronghold(currentStrongholdId);
        
    } catch (err) {
        alert(`❌ Error: ${err.message}`);
    }
}

// Mostrar/ocultar panel de instalaciones
function toggleFacilitiesPanel() {
    els.facilitiesPanel.style.display = 
        els.facilitiesPanel.style.display === 'none' ? 'block' : 'none';
    
    if (els.facilitiesPanel.style.display === 'block') {
        renderFacilitiesList();
    }
}

// Renderizar lista de instalaciones disponibles
function renderFacilitiesList() {
    if (availableFacilities.length === 0) {
        els.facilitiesList.innerHTML = '<p style="color:rgba(255,255,255,0.7); text-align:center; padding:20px;">No hay instalaciones disponibles para tu nivel</p>';
        return;
    }
    
    // Agrupar por nivel
    const byLevel = {};
    availableFacilities.forEach(f => {
        if (!byLevel[f.min_level]) byLevel[f.min_level] = [];
        byLevel[f.min_level].push(f);
    });
    
    let html = '';
    Object.keys(byLevel).sort((a, b) => a - b).forEach(level => {
        html += `<h5 style="color:rgba(255,255,255,0.9); margin:15px 0 10px 0;">Nivel ${level}+</h5>`;
        byLevel[level].forEach(f => {
            html += `
                <div style="background:rgba(255,255,255,0.1); padding:12px; border-radius:6px; margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:start;">
                        <div style="flex:1;">
                            <h6 style="margin:0 0 5px 0; color:white; font-size:1.1em;">${f.nombre}</h6>
                            <p style="margin:0 0 8px 0; font-size:0.9em; color:rgba(255,255,255,0.8);">${f.descripcion}</p>
                            <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:8px;">
                                <span style="background:rgba(241,196,15,0.3); color:#f1c40f; padding:3px 8px; border-radius:3px; font-size:0.85em;">
                                    💰 ${f.costo_construccion} gp
                                </span>
                                <span style="background:rgba(52,152,219,0.3); color:#3498db; padding:3px 8px; border-radius:3px; font-size:0.85em;">
                                    ⏱️ ${f.dias_construccion} días
                                </span>
                                <span style="background:rgba(155,89,182,0.3); color:#9b59b6; padding:3px 8px; border-radius:3px; font-size:0.85em;">
                                    📏 ${f.tamaño}
                                </span>
                                ${f.generacion_bp ? `<span style="background:rgba(46,204,113,0.3); color:#2ecc71; padding:3px 8px; border-radius:3px; font-size:0.85em;">⭐ +${f.generacion_bp} BP</span>` : ''}
                            </div>
                            <p style="margin:0; font-size:0.85em; color:rgba(255,255,255,0.7);">
                                <strong>Beneficio:</strong> ${f.beneficio}
                            </p>
                        </div>
                        <button onclick="buildFacility(${f.id}, '${f.nombre}')" 
                                style="background:#27ae60; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer; font-weight:bold; margin-left:10px; white-space:nowrap;">
                            🏗️ Construir
                        </button>
                    </div>
                </div>
            `;
        });
    });
    
    els.facilitiesList.innerHTML = html;
}

// Construir instalación
async function buildFacility(facilityId, facilityName) {
    if (!currentStrongholdId) {
        alert('No hay baluarte cargado');
        return;
    }
    
    if (!confirm(`¿Construir "${facilityName}"?`)) return;
    
    try {
        els.loader.style.display = 'block';
        els.loader.textContent = `🏗️ Iniciando construcción de ${facilityName}...`;
        
        const res = await fetch(`${API_URL}/build-facility`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                stronghold_id: currentStrongholdId,
                facility_id: facilityId
            })
        });
        
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Error al construir');
        }
        
        const result = await res.json();
        
        alert(`✅ ${result.message}\n\nCoste: ${result.cost} gp\nDuración: ${result.days} días\nCompletará: Día ${result.completion_day}`);
        
        // Recargar baluarte
        await loadStronghold(currentStrongholdId);
        
        // Cerrar panel de instalaciones
        toggleFacilitiesPanel();
        
    } catch (err) {
        alert(`❌ Error: ${err.message}`);
    } finally {
        els.loader.style.display = 'none';
    }
}
