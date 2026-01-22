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
        renderLoot(data);
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
    currentData = data;  // Sincronizar con local
    renderLoot(data);
};

function renderLoot(data) {
    const s = (val) => val || '---';

    // Función auxiliar para renderizar items
    const renderList = (items, icon) => {
        if (!items || items.length === 0) return '<p style="color:#888; font-style:italic;">Nada de valor.</p>';
        return items.map(i => `
            <div style="margin-bottom:8px; padding-bottom:5px; border-bottom:1px dashed #ddd;">
                <strong>${icon} ${i.nombre}</strong> <span style="font-size:0.9em; color:#666;">(${i.valor || i.rareza || '-'})</span><br>
                <span style="font-size:0.9em;">${i.descripcion || i.efecto || i}</span>
            </div>
        `).join('');
    };

    els.content.innerHTML = `
        <h2 style="color:var(--accent); text-align:center; margin-top:0;">💎 Tesoro Encontrado</h2>
        <p style="text-align:center; font-style:italic;">${s(data.resumen)}</p>

        <div style="display:flex; justify-content:space-around; background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #ddd; margin-bottom:20px;">
            <div style="text-align:center;"><span style="font-size:1.5em; display:block;">🟤</span>${data.monedas?.cp || 0} CP</div>
            <div style="text-align:center;"><span style="font-size:1.5em; display:block;">⚪</span>${data.monedas?.sp || 0} SP</div>
            <div style="text-align:center;"><span style="font-size:1.5em; display:block;">🟡</span>${data.monedas?.gp || 0} GP</div>
            <div style="text-align:center;"><span style="font-size:1.5em; display:block;">🟣</span>${data.monedas?.pp || 0} PP</div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
            <div>
                <h3 style="border-bottom:2px solid #e67e22;">🎨 Arte y Joyas</h3>
                ${renderList(data.objetos_arte, '🏺')}
            </div>
            <div>
                <h3 style="border-bottom:2px solid #9b59b6;">✨ Objetos Mágicos</h3>
                ${renderList(data.objetos_magicos, '🔮')}
            </div>
        </div>

        <h3 style="border-bottom:2px solid #34495e; margin-top:20px;">❓ Curiosidades y Baratijas</h3>
        <ul style="color:#555;">
            ${(data.curiosidades || []).map(c => `<li>${c}</li>`).join('')}
        </ul>
    `;
}

els.btnExp.addEventListener('click', () => {
    if(!currentData) return;

    // Crear texto plano para exportar
    let text = `--- BOTÍN: ${els.enemy.value} (CR ${els.cr.value}) ---\n\n`;
    text += `RESUMEN: ${currentData.resumen}\n\n`;
    text += `MONEDAS: ${currentData.monedas.gp} gp, ${currentData.monedas.sp} sp...\n\n`;

    text += "OBJETOS MÁGICOS:\n";
    currentData.objetos_magicos?.forEach(i => text += `- ${i.nombre} (${i.rareza}): ${i.efecto}\n`);

    const blob = new Blob([text], {type : 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Loot_${els.enemy.value.replace(/\s+/g, '_')}.txt`;
    a.click();
});