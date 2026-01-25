const API_URL = "http://localhost:5001/api/villains/generate";
let currentData = null;

const els = {
    theme: document.getElementById('theme'),
    lvl: document.getElementById('levelRange'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    if (!els.theme.value) return alert("Define la temática de la campaña.");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                theme: els.theme.value,
                level_range: els.lvl.value
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderVillainContent(data);
        els.btnExp.style.display = 'block';

        // Recargar historial para mostrar el nuevo villano
        loadVillainHistory();

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

function renderVillainContent(data) {
    const s = (val) => val || '---';

    // Support both English and Spanish keys for backward compatibility
    const name = data.name || data.nombre;
    const archetype = data.archetype || data.arquetipo;
    const race = data.race || data.raza || '---';
    const quote = data.famous_quote || data.cita_celebre;
    const motivation = data.motivation || data.motivacion;
    const lair = data.lair || data.guarida;
    const masterPlan = data.master_plan || data.plan_maestro;
    const planPhases = data.plan_phases || data.fases_plan;
    const lieutenants = data.lieutenants || data.tenientes || (data.habilidades && data.habilidades.lieutenants) || [];
    
    // Stats
    const ca = data.ca || 15;
    const hp = data.hp || 100;
    const speed = data.speed || 30;
    const stats = data.stats || {};
    
    // Combat abilities
    const attacks = data.attacks || [];
    const specialAbilities = data.special_abilities || data.habilidades_especiales || [];
    const legendaryActions = data.legendary_actions || data.acciones_legendarias || [];

    els.content.innerHTML = `
        <div class="villain-header">
            <h1 style="margin:0; color:#e74c3c;">${s(name)}</h1>
            <p style="margin:5px 0; color:#bdc3c7;">${s(archetype)} ${race !== '---' ? `(${race})` : ''}</p>
        </div>
        <div class="villain-body">
            <div class="quote">"${s(quote)}"</div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 15px 0; padding: 15px; background: #f9f9f9; border-radius: 5px;">
                <div><strong>⚔️ CA:</strong> ${ca}</div>
                <div><strong>❤️ HP:</strong> ${hp}</div>
                <div><strong>🏃 Velocidad:</strong> ${speed} ft</div>
            </div>

            ${Object.keys(stats).length > 0 ? `
            <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin: 15px 0;">
                ${Object.entries(stats).map(([stat, value]) => {
                    const mod = Math.floor((value - 10) / 2);
                    const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                    return `
                        <div style="text-align: center; padding: 10px; background: #e8e8e8; border-radius: 5px;">
                            <div style="font-weight: bold; font-size: 0.8em;">${stat}</div>
                            <div style="font-size: 1.2em;">${value}</div>
                            <div style="font-size: 0.9em; color: #666;">${modStr}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            ` : ''}

            <p><strong>🔥 Motivación:</strong> ${s(motivation)}</p>
            <p><strong>🏰 Guarida:</strong> ${s(lair)}</p>

            ${attacks.length > 0 ? `
            <h3 style="border-bottom:2px solid #c0392b; margin-top:20px;">⚔️ Ataques</h3>
            ${attacks.map(atk => `
                <div style="background: #ffe6e6; padding: 10px; margin-bottom: 8px; border-left: 3px solid #c0392b; border-radius: 3px;">
                    <strong>${atk.name || '---'}</strong> (${atk.type || 'melee'}): 
                    +${atk.bonus || 0} al golpe, ${atk.damage || '1d6'} de daño ${atk.damage_type || 'físico'}
                </div>
            `).join('')}
            ` : ''}

            ${specialAbilities.length > 0 ? `
            <h3 style="border-bottom:2px solid #8e44ad; margin-top:20px;">✨ Habilidades Especiales</h3>
            ${specialAbilities.map(ability => `
                <div style="background: #f3e6ff; padding: 10px; margin-bottom: 5px; border-left: 3px solid #8e44ad;">
                    ${ability}
                </div>
            `).join('')}
            ` : ''}

            ${legendaryActions.length > 0 ? `
            <h3 style="border-bottom:2px solid #f39c12; margin-top:20px;">👑 Acciones Legendarias</h3>
            <p style="font-size: 0.9em; color: #666; font-style: italic;">El villano puede realizar 3 acciones legendarias por ronda.</p>
            ${legendaryActions.map(action => `
                <div style="background: #fff3cd; padding: 10px; margin-bottom: 5px; border-left: 3px solid #f39c12;">
                    ${action}
                </div>
            `).join('')}
            ` : ''}

            <h3 style="border-bottom:2px solid #333;">🗺️ El Plan Maestro</h3>
            <p><em>${s(masterPlan)}</em></p>
            ${(planPhases || []).map(p => `<div class="plan-step">${p}</div>`).join('')}

            <h3 style="border-bottom:2px solid #333; margin-top:20px;">⚔️ Tenientes y Esbirros</h3>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                ${(lieutenants || []).map(t => `
                    <div class="minion-card">
                        <strong>${(t.name || t.nombre)}</strong> (${(t.race || t.raza)})<br>
                        <span style="font-size:0.9em; color:#666;">${(t.role || t.rol)}</span><br>
                        <small>${(t.brief_description || t.breve_desc || '')}</small>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Exponer renderVillain globalmente para el historial
window.renderVillain = function(data) {
    currentData = data;
    renderVillainContent(data);
};

els.btnExp.addEventListener('click', () => {
    if (!currentData) return;
    
    const name = currentData.name || currentData.nombre;
    const contentHTML = els.content.innerHTML;

    const json = {
        name: name,
        type: "journal",
        pages: [
            {
                name: "Dossier del Villano",
                type: "text",
                text: { content: contentHTML, format: 1 }
            }
        ]
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Villano_${name.replace(/\s+/g, '_')}.json`;
    a.click();
});

// ========================================
// HISTORIAL PERSONALIZADO (desde BD)
// ========================================
async function loadVillainHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    try {
        const res = await fetch('http://localhost:5001/api/villains/list');
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const villains = await res.json();
        
        historyList.innerHTML = '';
        if (!villains || villains.length === 0) {
            historyList.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px; font-size:0.9em;">Sin registros</p>';
            return;
        }
        
        villains.forEach(villain => {
            const div = document.createElement('div');
            div.className = 'history-item';
            const dateStr = villain.created_at ? new Date(villain.created_at).toLocaleDateString() : 'Sin fecha';
            div.innerHTML = `
                <div class="history-info" onclick="loadVillainById(${villain.id})">
                    <span class="h-icon">😈</span>
                    <div class="h-details">
                        <div class="h-name">${villain.name}</div>
                        <div class="h-date">${dateStr}</div>
                    </div>
                </div>
                <button class="h-delete" onclick="deleteVillain(event, ${villain.id})" title="Borrar">×</button>
            `;
            historyList.appendChild(div);
        });
    } catch (err) {
        console.error('Error cargando historial:', err);
        historyList.innerHTML = `<p style="color:red; text-align:center; font-size:0.8em; padding: 10px;">
            Error: ${err.message}<br>
            <small>¿Está el servidor ejecutándose?</small>
        </p>`;
    }
}

async function loadVillainById(id) {
    try {
        const res = await fetch(`http://localhost:5001/api/villains/${id}`);
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);
        
        currentData = data;
        renderVillainContent(data);
        els.btnExp.style.display = 'block';
    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    }
}

async function deleteVillain(event, id) {
    event.stopPropagation();
    if (!confirm('¿Eliminar este villano?')) return;
    
    try {
        const res = await fetch(`http://localhost:5001/api/villains/${id}`, {
            method: 'DELETE'
        });
        
        if (res.ok) {
            loadVillainHistory();
        }
    } catch (err) {
        alert('Error eliminando villano');
    }
}

// Exponer funciones globalmente
window.loadVillainById = loadVillainById;
window.deleteVillain = deleteVillain;

// Cargar historial al inicio
loadVillainHistory();