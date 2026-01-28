const API_URL = "http://localhost:5001/api/herbalist/generate";
let currentData = null;

const els = {
    environment: document.getElementById('herbEnvironment'),
    skillRoll: document.getElementById('herbSkillRoll'),
    level: document.getElementById('herbLevel'),
    btnGen: document.getElementById('btnGen'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    const environment = els.environment.value.trim();
    const skillRoll = parseInt(els.skillRoll.value);
    const level = parseInt(els.level.value);

    if (!environment) {
        alert('Por favor, especifica un entorno de búsqueda');
        return;
    }

    if (skillRoll < 1 || skillRoll > 30) {
        alert('La tirada debe estar entre 1 y 30');
        return;
    }

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                environment: environment,
                skill_roll: skillRoll,
                character_level: level
            })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        displayHerbalistResult(data);
        
        // Agregar al historial
        if (typeof addToHistory === 'function') {
            addToHistory(data, 'herbalist');
        }

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// Global renderer para el historial
window.renderHerbalist = function(data) {
    currentData = data;
    displayHerbalistResult(data);
};

// Función para mostrar el resultado
function displayHerbalistResult(data) {
    const s = (val) => val || '---';

    const nombre = data.nombre || data.name || 'Planta Desconocida';
    const descripcion = data.descripcion || data.description;
    const ambiente = data.ambiente || data.environment;
    const rareza = data.rareza || data.rarity;
    const propiedades = data.propiedades_ocultas || data.hidden_properties || {};
    const desafio = data.desafio_recoleccion || data.collection_challenge || {};
    const valor = data.valor_mercado || data.market_value;
    const usosAlquimia = data.usos_alquimia || data.alchemy_uses;
    const folklore = data.folklore;

    const cruda = propiedades.cruda || propiedades.raw || 'No especificado';
    const hervida = propiedades.hervida || propiedades.boiled || 'No especificado';
    const aplicada = propiedades.aplicada || propiedades.applied || 'No especificado';
    const quemada = propiedades.quemada || propiedades.burned || '';

    const desafioDesc = desafio.descripcion || desafio.description || 'Ninguno';
    const consecuencias = desafio.consecuencias || desafio.consequences || 'Ninguna';
    const cdSugerida = desafio.cd_sugerida || desafio.suggested_dc || '---';

    // Color según rareza
    const rarityColors = {
        'Común': '#95a5a6',
        'Poco Común': '#27ae60',
        'Rara': '#3498db',
        'Muy Rara': '#9b59b6',
        'Legendaria': '#f39c12'
    };
    const rarityColor = rarityColors[rareza] || '#27ae60';

    els.content.innerHTML = `
        <div style="border: 3px solid ${rarityColor}; border-radius:12px; padding:20px; background:#fff;">
            <h1 style="color:${rarityColor}; margin-top:0; text-align:center; font-family: 'MedievalSharp', serif;">
                🌿 ${nombre}
            </h1>
            <div style="text-align:center; color:#666; font-style:italic; margin-bottom:15px; font-size:1.1em;">
                <strong>${s(rareza)}</strong> | ${s(ambiente)}
            </div>

            <div style="background:#e8f5e9; padding:15px; border-radius:8px; margin-bottom:15px; border-left: 4px solid #27ae60;">
                <h3 style="margin-top:0; color:#27ae60;">📖 Descripción</h3>
                <p style="line-height:1.6; font-size:1em;">${s(descripcion)}</p>
            </div>

            <h3 style="border-bottom:2px solid ${rarityColor}; color:${rarityColor}; padding-bottom:5px;">
                ✨ Propiedades Ocultas
            </h3>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:15px;">
                <div style="background:#fff3cd; padding:12px; border-radius:6px; border-left:4px solid #ffc107;">
                    <strong>🍃 Cruda:</strong><br>
                    <span style="font-size:0.95em;">${cruda}</span>
                </div>
                <div style="background:#d1ecf1; padding:12px; border-radius:6px; border-left:4px solid #17a2b8;">
                    <strong>♨️ Hervida:</strong><br>
                    <span style="font-size:0.95em;">${hervida}</span>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr${quemada ? ' 1fr' : ''}; gap:15px; margin-bottom:15px;">
                <div style="background:#d4edda; padding:12px; border-radius:6px; border-left:4px solid #28a745;">
                    <strong>💊 Aplicada:</strong><br>
                    <span style="font-size:0.95em;">${aplicada}</span>
                </div>
                ${quemada ? `
                <div style="background:#f8d7da; padding:12px; border-radius:6px; border-left:4px solid #dc3545;">
                    <strong>🔥 Quemada:</strong><br>
                    <span style="font-size:0.95em;">${quemada}</span>
                </div>
                ` : ''}
            </div>

            <div style="background:#fff3e0; padding:15px; border-radius:8px; margin-bottom:15px; border-left:4px solid #ff9800;">
                <h3 style="margin-top:0; color:#ff9800;">⚠️ Desafío de Recolección</h3>
                <p style="margin:5px 0;"><strong>Descripción:</strong> ${desafioDesc}</p>
                <p style="margin:5px 0;"><strong>Consecuencias:</strong> ${consecuencias}</p>
                <p style="margin:5px 0;"><strong>CD Sugerida:</strong> ${cdSugerida}</p>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:15px;">
                <div style="background:#e3f2fd; padding:12px; border-radius:6px;">
                    <strong>💰 Valor de Mercado:</strong><br>
                    ${s(valor)}
                </div>
                <div style="background:#f3e5f5; padding:12px; border-radius:6px;">
                    <strong>🧪 Usos en Alquimia:</strong><br>
                    ${s(usosAlquimia)}
                </div>
            </div>

            ${folklore ? `
            <div style="background:#fce4ec; padding:15px; border-radius:8px; border-left:4px solid #e91e63;">
                <h4 style="margin-top:0; color:#e91e63;">📜 Folklore</h4>
                <p style="font-style:italic; line-height:1.6;">${folklore}</p>
            </div>
            ` : ''}
        </div>
    `;
}
