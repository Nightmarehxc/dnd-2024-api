const API_URL = "http://localhost:5001/api/librarian/generate";
let currentData = null;

const els = {
    type: document.getElementById('bType'),
    topic: document.getElementById('bTopic'),
    tone: document.getElementById('bTone'),
    btnGen: document.getElementById('btnGen'),

    btnEdit: document.getElementById('btnEdit'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader'),

    editorContainer: document.getElementById('formEditorContainer'),
    btnSave: document.getElementById('btnSaveChanges'),
    btnCancel: document.getElementById('btnCancelEdit'),

    eTitle: document.getElementById('editTitle'),
    eAuthor: document.getElementById('editAuthor'),
    eType: document.getElementById('editType'),
    eDesc: document.getElementById('editDesc'),
    eContent: document.getElementById('editContent'),
    eSecret: document.getElementById('editSecret')
};

// --- GENERAR ---
els.btnGen.addEventListener('click', async () => {
    if (!els.topic.value) return alert("Define un tema para el libro.");

    els.content.innerHTML = '';
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';
    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnEdit.style.display = 'none';
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                book_type: els.type.value || "Libro",
                topic: els.topic.value,
                tone: els.tone.value
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        currentData = data;
        window.renderBook(data);
        // Guardar como 'librarian' o 'library' según tu config.js (asumo 'librarian')
        if (typeof addToHistory === 'function') addToHistory(currentData, 'librarians');

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// --- EDITAR ---
els.btnEdit.addEventListener('click', () => {
    if(!currentData) return;
    els.eTitle.value = currentData.title || "";
    els.eAuthor.value = currentData.author || "";
    els.eType.value = currentData.type || "";
    els.eDesc.value = currentData.description || "";
    els.eContent.value = currentData.content || "";
    els.eSecret.value = currentData.secret || "";

    els.content.style.display = 'none';
    els.editorContainer.style.display = 'block';
});

els.btnCancel.addEventListener('click', () => {
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';
});

els.btnSave.addEventListener('click', () => {
    const newData = {
        ...currentData,
        title: els.eTitle.value,
        author: els.eAuthor.value,
        type: els.eType.value,
        description: els.eDesc.value,
        content: els.eContent.value,
        secret: els.eSecret.value
    };

    currentData = newData;
    window.renderBook(currentData);
    els.editorContainer.style.display = 'none';
    els.content.style.display = 'block';

    if (currentData._db_id && typeof updateHistoryItem === 'function') {
        updateHistoryItem(currentData._db_id, currentData);
    } else if (typeof addToHistory === 'function') {
        addToHistory(currentData, 'librarians');
    }
});

// --- RENDERIZADO GLOBAL ---
// Nota: en config.js debes tener 'librarian': { renderer: 'renderBook' }
window.renderBook = function(data) {
    currentData = data;  // Sincronizar con local
    const s = (val) => val || '';

    els.content.innerHTML = `
        <div class="book-page">
            <h1 style="text-align:center; margin-bottom:5px; color:#2c3e50;">${s(data.title)}</h1>
            <p style="text-align:center; font-style:italic; color:#7f8c8d; margin-top:0;">por ${s(data.author)}</p>

            <div style="margin:20px 0; font-size:0.9em; background:#f4ecd8; padding:10px; border-radius:4px;">
                <strong>Descripción:</strong> ${s(data.description)}
            </div>

            <div style="text-align:justify; line-height:1.6;">
                ${s(data.content)}
            </div>

            ${data.secret ? `
                <div style="margin-top:30px; border-top:1px solid #d4c4a8; padding-top:10px; color:#c0392b; font-size:0.9em;">
                    <strong>👁️ Secreto para el DM:</strong> ${s(data.secret)}
                </div>
            ` : ''}
        </div>
    `;

    if(els.btnEdit) els.btnEdit.style.display = 'block';
    if(els.btnExp) els.btnExp.style.display = 'block';
};

// --- EXPORTAR ---
els.btnExp.addEventListener('click', () => {
    if(!currentData) return;
    const json = {
        name: currentData.title,
        type: "journal",
        pages: [{
            name: "Texto",
            type: "text",
            text: { content: currentData.content, format: 1 }
        }]
    };
    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${currentData.title.replace(/\s+/g, '_')}.json`;
    a.click();
});