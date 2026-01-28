const API_URL = "http://localhost:5001/api/loot/generate";
let currentData = null;

const els = {
    enemy: document.getElementById('enemyType'),
    cr: document.getElementById('cr'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    if (!els.enemy.value) return alert("Indica de quién es el tesoro.");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                enemy_type: els.enemy.value,
                cr: parseInt(els.cr.value)
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderLootContent(data);
        els.btnExp.style.display = 'block';

        if (typeof addToHistory === 'function') addToHistory(data, 'loot');

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// Global renderer para el historial
window.renderLoot = function(data) {
    currentData = data;
    renderLootContent(data);
};

function renderLootContent(data) {
    const s = (val) => val || '---';

    // Support both English and Spanish keys for backward compatibility
    const summary = data.summary || data.resumen;
    const coins = data.coins || data.monedas;
    const artObjects = data.art_objects || data.objetos_arte;
    const magicItems = data.magic_items || data.objetos_magicos;
    const curiosities = data.curiosities || data.curiosidades;

    // Función auxiliar para renderizar items
    const renderList = (items, icon) => {
        if (!items || items.length === 0) return '<p style="color:#888; font-style:italic;">Nada de valor.</p>';
        return items.map(i => `
            <div style="margin-bottom:8px; padding-bottom:5px; border-bottom:1px dashed #ddd;">
                <strong>${icon} ${(i.name || i.nombre)}</strong> <span style="font-size:0.9em; color:#666;">(${(i.value || i.rarity || i.valor || i.rareza || '-')})</span><br>
                <span style="font-size:0.9em;">${(i.description || i.effect || i.descripcion || i.efecto || i)}</span>
            </div>
        `).join('');
    };

    els.content.innerHTML = `
        <h2 style="color:var(--accent); text-align:center; margin-top:0;">💎 Tesoro Encontrado</h2>
        <p style="text-align:center; font-style:italic;">${s(summary)}</p>

        <div style="display:flex; justify-content:space-around; background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #ddd; margin-bottom:20px;">
            <div style="text-align:center;"><span style="font-size:1.5em; display:block;">🟤</span>${(coins || {}).cp || 0} CP</div>
            <div style="text-align:center;"><span style="font-size:1.5em; display:block;">⚪</span>${(coins || {}).sp || 0} SP</div>
            <div style="text-align:center;"><span style="font-size:1.5em; display:block;">🟡</span>${(coins || {}).gp || 0} GP</div>
            <div style="text-align:center;"><span style="font-size:1.5em; display:block;">🟣</span>${(coins || {}).pp || 0} PP</div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
            <div>
                <h3 style="border-bottom:2px solid #e67e22;">🎨 Arte y Joyas</h3>
                ${renderList(artObjects, '🏺')}
            </div>
            <div>
                <h3 style="border-bottom:2px solid #9b59b6;">✨ Objetos Mágicos</h3>
                ${renderList(magicItems, '🔮')}
            </div>
        </div>

        <h3 style="border-bottom:2px solid #34495e; margin-top:20px;">❓ Curiosidades y Baratijas</h3>
        <ul style="color:#555;">
            ${(curiosities || []).map(c => `<li>${c}</li>`).join('')}
        </ul>
    `;
}

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;

    // Crear texto plano para exportar
    const summary = currentData.summary || currentData.resumen;
    const coins = currentData.coins || currentData.monedas;
    const magicItems = currentData.magic_items || currentData.objetos_magicos;
    
    let text = `--- BOTÍN: ${els.enemy.value} (CR ${els.cr.value}) ---\n\n`;
    text += `RESUMEN: ${summary}\n\n`;
    text += `MONEDAS: ${(coins || {}).gp} gp, ${(coins || {}).sp} sp...\n\n`;

    text += "OBJETOS MÁGICOS:\n";
    (magicItems || []).forEach(i => text += `- ${(i.name || i.nombre)} (${(i.rarity || i.rareza)}): ${(i.effect || i.efecto)}\n`);

    const blob = new Blob([text], {type : 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Loot_${els.enemy.value.replace(/\s+/g, '_')}.txt`;
    a.click();
});