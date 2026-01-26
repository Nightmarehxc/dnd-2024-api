const API_URL = "http://localhost:5001/api/alchemy/generate";
let currentData = null;

const els = {
    type: document.getElementById('alcType'),
    rarity: document.getElementById('alcRarity'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ item_type: els.type.value, rarity: els.rarity.value })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        displayAlchemyResult(data);
        els.btnExp.style.display = 'block';
        
        // Preparar datos para historial con ambos nombres (inglés y español)
        const historyData = {
            ...data,
            name: data.name || data.nombre,
            nombre: data.nombre || data.name
        };
        console.log('🔬 Preparando para historial:', historyData);
        if (typeof addToHistory === 'function') {
            addToHistory(historyData, 'alchemy');
        } else {
            console.error('❌ addToHistory no está disponible');
        }

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// Global renderer para el historial - Punto de entrada
window.renderAlchemy = function(data) {
    console.log('📡 window.renderAlchemy llamado con:', data);
    currentData = data;
    displayAlchemyResult(data);
};

// Función interna para mostrar el resultado
function displayAlchemyResult(data) {
    const s = (val) => val || '---';

    const name = data.name || data.nombre;
    const type = data.type || data.tipo;
    const rarity = data.rarity || data.rareza;
    const appearance = data.appearance || data.apariencia;
    const tasteSmell = data.taste_smell || data.sabor_olor;
    const mechanicEffect = data.mechanic_effect || data.efecto_mecanico;
    const secondaryEffect = data.secondary_effect || data.efecto_secundario;
    const ingredients = data.ingredients || data.ingredientes;

    const ingredientsList = Array.isArray(ingredients) 
        ? ingredients.map(ing => `<li>${ing}</li>`).join('') 
        : '<li>No especificados</li>';

    els.content.innerHTML = `
        <div style="border: 2px solid #8e44ad; border-radius:8px; padding:20px; background:#fff;">
            <h1 style="color:#8e44ad; margin-top:0; text-align:center;">${s(name)}</h1>
            <div style="text-align:center; color:#666; font-style:italic; margin-bottom:15px;">
                ${s(type)} - ${s(rarity)}
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:0.9em; background:#f4e7fb; padding:10px; border-radius:5px;">
                <div><strong>👁️ Apariencia:</strong> ${s(appearance)}</div>
                <div><strong>👅 Sabor/Olor:</strong> ${s(tasteSmell)}</div>
            </div>

            <h3 style="border-bottom:2px solid #8e44ad; color:#8e44ad;">🧪 Efecto Mecánico</h3>
            <p style="font-size:1.1em; line-height:1.6;">${s(mechanicEffect)}</p>

            ${secondaryEffect ? `<p style="font-size:0.9em; color:#d35400;"><strong>⚠️ Efecto Secundario:</strong> ${secondaryEffect}</p>` : ''}

            <h4 style="margin-bottom:5px;">🌿 Ingredientes Clave</h4>
            <ul style="background:#f9f1fd; padding:10px 20px; border-radius:5px;">${ingredientsList}</ul>
        </div>
    `;
}

els.btnExp.addEventListener('click', () => {
    if (!currentData) return;
    
    const name = currentData.name || currentData.nombre;
    const mechanicEffect = currentData.mechanic_effect || currentData.efecto_mecanico;
    const tasteSmell = currentData.taste_smell || currentData.sabor_olor;
    const rarity = currentData.rarity || currentData.rareza;
    
    const json = {
        name: name,
        type: "consumable",
        system: {
            description: { value: `<p>${mechanicEffect}</p><p><em>${tasteSmell}</em></p>` },
            rarity: rarity.toLowerCase(),
            consumableType: "potion"
        }
    };
    
    const blob = new Blob([JSON.stringify(json, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${name.replace(/\s+/g, '_')}.json`;
    a.click();
});