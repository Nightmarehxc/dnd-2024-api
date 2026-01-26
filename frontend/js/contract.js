const API_URL = "http://localhost:5001/api/contracts/generate";
let currentData = null;

const els = {
    patron: document.getElementById('patron'),
    desire: document.getElementById('desire'),
    btnGen: document.getElementById('btnGen'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader')
};

els.btnGen.addEventListener('click', async () => {
    if (!els.patron.value || !els.desire.value) return alert("Indica las partes del contrato.");

    els.content.innerHTML = '';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                patron: els.patron.value,
                desire: els.desire.value
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        renderContractContent(data);
        els.btnExp.style.display = 'block';

        // Recargar historial
        loadContractsHistory();

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

function renderContractContent(data) {
    const s = (val) => val || '---';

    // Support both English and Spanish keys
    const title = data.title || data.titulo;
    const offer = data.offer || data.oferta;
    const price = data.price || data.precio;
    const smallPrint = data.small_print || data.letra_pequena;
    const escapeClause = data.escape_clause || data.clausula_escape;

    els.content.innerHTML = `
        <div style="border: 6px double #000; padding:30px; background:#fff; position:relative;">
            <div style="position:absolute; bottom:20px; right:20px; width:80px; height:80px; background:#c0392b; border-radius:50%; opacity:0.8; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; transform:rotate(-15deg); border:2px solid #922b21;">SELLO</div>

            <h1 style="font-family:'Times New Roman', serif; text-align:center; text-transform:uppercase; border-bottom:1px solid #000; padding-bottom:10px;">${s(title)}</h1>

            <div style="font-size:1.1em; margin:20px 0;">
                <p><strong>YO, LA ENTIDAD, OTORGO:</strong><br>
                <span style="color:#27ae60;">${s(offer)}</span></p>

                <p><strong>A CAMBIO, EL MORTAL PAGA:</strong><br>
                <span style="color:#c0392b;">${s(price)}</span></p>
            </div>

            <div style="background:#eee; padding:10px; font-size:0.8em; color:#555; text-align:justify; border:1px solid #ccc;">
                <strong>Términos y Condiciones (Letra Pequeña):</strong><br>
                ${s(smallPrint)}
            </div>

            <div style="margin-top:25px; color:#c0392b; font-size:0.9em; border:1px dashed #c0392b; padding:10px;">
                <strong>⚠️ Cláusula de Nulidad (Solo para el DM):</strong><br>
                ${s(escapeClause)}
            </div>
        </div>
    `;
}

// Exponer para historial
window.renderContract = function(data) {
    currentData = data;
    renderContractContent(data);
};

els.btnExp.addEventListener('click', () => {
    if (!currentData) return;
    
    const title = currentData.title || currentData.titulo;
    const offer = currentData.offer || currentData.oferta;
    const price = currentData.price || currentData.precio;
    const smallPrint = currentData.small_print || currentData.letra_pequena;
    const escapeClause = currentData.escape_clause || currentData.clausula_escape;

    let text = `=== ${title.toUpperCase()} ===\n\n`;
    text += `OFERTA: ${offer}\n`;
    text += `PRECIO: ${price}\n\n`;
    text += `CONDICIONES: ${smallPrint}\n`;
    text += `\n(Clave DM: ${escapeClause})`;

    const blob = new Blob([text], {type: 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Contrato_${title.replace(/\s+/g, '_')}.txt`;
    a.click();
});

// ========================================
// HISTORIAL PERSONALIZADO (desde BD)
// ========================================
async function loadContractsHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    try {
        const res = await fetch('http://localhost:5001/api/contracts/list');
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const contracts = await res.json();
        
        historyList.innerHTML = '';
        if (!contracts || contracts.length === 0) {
            historyList.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px; font-size:0.9em;">Sin registros</p>';
            return;
        }
        
        contracts.forEach(contract => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-info" onclick="loadContractById(${contract.id})">
                    <span class="h-icon">⚖️</span>
                    <div class="h-details">
                        <div class="h-name">${contract.name}</div>
                        <div class="h-date">${contract.patron || 'Contrato'}</div>
                    </div>
                </div>
                <button class="h-delete" onclick="deleteContract(event, ${contract.id})" title="Borrar">×</button>
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

async function loadContractById(id) {
    try {
        const res = await fetch(`http://localhost:5001/api/contracts/${id}`);
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);
        
        currentData = data;
        renderContractContent(data);
        els.btnExp.style.display = 'block';
    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    }
}

async function deleteContract(event, id) {
    event.stopPropagation();
    if (!confirm('¿Anular este contrato?')) return;
    
    try {
        const res = await fetch(`http://localhost:5001/api/contracts/${id}`, {
            method: 'DELETE'
        });
        
        if (res.ok) {
            loadContractsHistory();
        }
    } catch (err) {
        alert('Error eliminando contrato');
    }
}

// Exponer funciones globalmente
window.loadContractById = loadContractById;
window.deleteContract = deleteContract;

// Cargar historial al inicio
loadContractsHistory();
