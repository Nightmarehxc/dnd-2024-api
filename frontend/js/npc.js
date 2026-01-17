const API_URL = "http://localhost:5001/api/npcs/generate";
const CHAT_API_URL = "http://localhost:5001/api/npcs/chat";
const AUDIO_API_URL = "http://localhost:5001/api/npcs/chat/audio";
const IMAGE_API_URL = "http://localhost:5001/api/images/generate";

let currentData = null;
let chatHistoryLog = []; // Historial de la conversación activa

// Elementos del DOM
const els = {
    // Panel Principal
    desc: document.getElementById('desc'),
    btnGen: document.getElementById('btnGen'),
    btnImg: document.getElementById('btnImg'),
    btnChat: document.getElementById('btnChat'),
    btnExp: document.getElementById('btnExp'),
    content: document.getElementById('resultContent'),
    loader: document.getElementById('loader'),
    imgContainer: document.getElementById('imgContainer'),
    generatedImg: document.getElementById('generatedImg'),

    // Elementos del Chat
    modal: document.getElementById('chatModal'),
    closeModal: document.getElementById('closeModal'),
    chatHistory: document.getElementById('chatHistory'),
    chatInput: document.getElementById('chatInput'),
    btnSend: document.getElementById('btnSend'),

    // Elementos de Audio
    btnMic: document.getElementById('btnMic'),
    recStatus: document.getElementById('recordingStatus')
};

// --- VARIABLES DE GRABACIÓN ---
let mediaRecorder;
let audioChunks = [];

// ==========================================
// 1. GENERAR NPC (TEXTO)
// ==========================================
els.btnGen.addEventListener('click', async () => {
    if (!els.desc.value) return alert("Escribe una descripción.");

    // Reset UI
    els.content.innerHTML = '';
    els.imgContainer.style.display = 'none';
    els.generatedImg.src = '';
    els.btnImg.style.display = 'none';
    els.btnChat.style.display = 'none';

    els.loader.style.display = 'block';
    els.btnGen.disabled = true;
    els.btnExp.style.display = 'none';

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ description: els.desc.value })
        });

        const data = await res.json();

        if (data.error) throw new Error(data.error);

        currentData = data;
        renderNPC(data); // Renderiza y reinicia el chat

        if (typeof addToHistory === 'function') addToHistory(data);

    } catch (err) {
        els.content.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    } finally {
        els.loader.style.display = 'none';
        els.btnGen.disabled = false;
    }
});

// ==========================================
// 2. GESTIÓN DEL MODAL DE CHAT
// ==========================================
els.btnChat.addEventListener('click', () => {
    els.modal.style.display = 'block';
    els.chatInput.focus();
});

els.closeModal.addEventListener('click', () => {
    els.modal.style.display = 'none';
    // Cancelar audio si se cierra
    if (window.speechSynthesis) window.speechSynthesis.cancel();
});

window.onclick = function(event) {
    if (event.target == els.modal) {
        els.modal.style.display = 'none';
    }
}

// ==========================================
// 3. CHAT DE TEXTO
// ==========================================
els.btnSend.addEventListener('click', sendMessage);
els.chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
    const text = els.chatInput.value.trim();
    if (!text || !currentData) return;

    addMessageToUI("user", text);
    els.chatInput.value = '';

    const loadingId = "loading-" + Date.now();
    els.chatHistory.innerHTML += `<div id="${loadingId}" class="message msg-npc" style="font-style:italic; color:#777;">Thinking...</div>`;
    els.chatHistory.scrollTop = els.chatHistory.scrollHeight;

    try {
        const res = await fetch(CHAT_API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                npc_data: currentData,
                history: chatHistoryLog,
                message: text
            })
        });

        const data = await res.json();
        const loader = document.getElementById(loadingId);
        if(loader) loader.remove();

        if (data.error) throw new Error(data.error);

        addMessageToUI("npc", data.response);

    } catch (err) {
        const loader = document.getElementById(loadingId);
        if(loader) loader.remove();
        addMessageToUI("npc", "Error: " + err.message);
    }
}

// ==========================================
// 4. CHAT DE VOZ (Push-to-Talk)
// ==========================================

// Iniciar grabación
els.btnMic.addEventListener('mousedown', startRecording);
els.btnMic.addEventListener('touchstart', startRecording);

// Detener y enviar
els.btnMic.addEventListener('mouseup', stopRecording);
els.btnMic.addEventListener('touchend', stopRecording);

async function startRecording(e) {
    e.preventDefault();
    if (window.speechSynthesis) window.speechSynthesis.cancel(); // Callar al NPC si hablo yo

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        audioChunks = [];

        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) audioChunks.push(event.data);
        };

        mediaRecorder.start();
        els.recStatus.style.display = 'block';
        els.btnMic.style.transform = "scale(1.1)";
        els.btnMic.style.background = "#c0392b"; // Rojo más oscuro
    } catch (err) {
        alert("No se pudo acceder al micrófono: " + err.message);
    }
}

async function stopRecording(e) {
    if (!mediaRecorder || mediaRecorder.state === "inactive") return;

    e.preventDefault();
    mediaRecorder.stop();
    els.recStatus.style.display = 'none';
    els.btnMic.style.transform = "scale(1)";
    els.btnMic.style.background = "#e74c3c"; // Volver a rojo normal

    mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

        // Evitar envíos accidentales muy cortos (< 0.5 seg)
        if (audioBlob.size < 3000) return;

        await sendAudioMessage(audioBlob);

        // Liberar micrófono
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    };
}

async function sendAudioMessage(audioBlob) {
    addMessageToUI("user", "🎤 (Audio enviado...)");

    const loadingId = "loading-" + Date.now();
    els.chatHistory.innerHTML += `<div id="${loadingId}" class="message msg-npc">👂 Escuchando...</div>`;
    els.chatHistory.scrollTop = els.chatHistory.scrollHeight;

    const formData = new FormData();
    formData.append('audio', audioBlob);
    // Enviamos JSONs como strings dentro del Form-Data
    formData.append('npc_data', JSON.stringify(currentData));
    formData.append('history', JSON.stringify(chatHistoryLog));

    try {
        const res = await fetch(AUDIO_API_URL, {
            method: 'POST',
            body: formData
        });

        const data = await res.json();

        const loader = document.getElementById(loadingId);
        if(loader) loader.remove();

        if (data.error) throw new Error(data.error);

        // Mostrar texto y HABLAR
        addMessageToUI("npc", data.response);
        speakText(data.response);

    } catch (err) {
        const loader = document.getElementById(loadingId);
        if(loader) loader.remove();
        addMessageToUI("npc", "Error: " + err.message);
    }
}

// ==========================================
// 5. TEXT-TO-SPEECH (Navegador)
// ==========================================
function speakText(text) {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 1.0;

    // Ajuste simple de tono según raza (Flavor)
    const raza = (currentData.raza || "").toLowerCase();
    if (raza.includes('orco') || raza.includes('enano') || raza.includes('dragonborn')) {
        utterance.pitch = 0.6; // Voz grave
    } else if (raza.includes('elfo') || raza.includes('gnomo') || raza.includes('halfling')) {
        utterance.pitch = 1.2; // Voz aguda
    } else {
        utterance.pitch = 1.0; // Voz normal
    }

    window.speechSynthesis.speak(utterance);
}

// ==========================================
// 6. UTILIDADES DE UI
// ==========================================
function addMessageToUI(role, text) {
    const div = document.createElement('div');
    div.className = `message ${role === 'user' ? 'msg-user' : 'msg-npc'}`;
    div.innerText = text;
    els.chatHistory.appendChild(div);
    els.chatHistory.scrollTop = els.chatHistory.scrollHeight;

    // Guardar en historial local
    chatHistoryLog.push({ role: role, content: text });
}

// ==========================================
// 7. GENERAR IMAGEN
// ==========================================
els.btnImg.addEventListener('click', async () => {
    if (!currentData) return;

    els.btnImg.disabled = true;
    els.btnImg.innerText = "🎨 Pintando...";

    try {
        const prompt = `Fantasy character portrait, D&D style, ${currentData.raza} ${currentData.rol}. ${currentData.apariencia || ""} ${currentData.personalidad || ""}`;

        const res = await fetch(IMAGE_API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                description: prompt,
                type: 'npc'
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        els.generatedImg.src = "../" + data.url;
        els.imgContainer.style.display = 'block';
        els.btnImg.style.display = 'none';

    } catch (err) {
        console.error(err);
        if (err.message.includes("not available")) {
            alert("⚠️ BLOQUEO REGIONAL: Usa VPN.");
            els.btnImg.innerText = "⚠️ No disponible";
        } else {
            alert("Error: " + err.message);
            els.btnImg.innerText = "❌ Error";
            els.btnImg.disabled = false;
        }
    }
});

// ==========================================
// 8. RENDERIZADO PRINCIPAL
// ==========================================
function renderNPC(data) {
    const s = (val) => val || '---';

    // REINICIAR CHAT AL CARGAR NUEVO NPC
    chatHistoryLog = [];
    if (els.chatHistory) {
        els.chatHistory.innerHTML = '<div style="text-align:center; color:#888; font-style:italic; margin-top:20px;">El NPC te está mirando...</div>';
    }

    // MOSTRAR BOTONES
    els.btnExp.style.display = 'block';
    els.btnChat.style.display = 'block'; // Habilitar chat
    els.btnImg.style.display = 'block';
    els.btnImg.disabled = false;
    els.btnImg.innerText = "🎨 Generar Retrato";

    // UI Reset
    els.imgContainer.style.display = 'none';
    els.generatedImg.src = '';

    els.content.innerHTML = `
        <h1 style="color:var(--accent); margin:0;">${s(data.nombre)}</h1>
        <p style="font-style:italic; margin-top:0;">${s(data.raza)} - ${s(data.rol)} (${s(data.alineamiento)})</p>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; background:#eee; padding:10px; border-radius:5px; text-align:center;">
            <div><strong>CA</strong><br>${data.ca || 10}</div>
            <div><strong>HP</strong><br>${data.hp || 10}</div>
            <div><strong>Vel</strong><br>${data.velocidad || 30}ft</div>
        </div>

        <h3>Estadísticas</h3>
        <div style="display:grid; grid-template-columns:repeat(6, 1fr); gap:5px; font-size:0.8rem; text-align:center;">
            ${data.estadisticas ? Object.entries(data.estadisticas).map(([k,v]) =>
                `<div><strong>${k}</strong><br>${v}</div>`).join('') : ''}
        </div>

        <h3>Ataques</h3>
        ${data.ataques?.map(atk => `
            <div style="margin-bottom:5px; border-bottom:1px solid #ccc; padding-bottom:5px;">
                <strong>${atk.nombre}</strong> (${atk.tipo}) <br>
                ⚔️ +${atk.bonificador_ataque} | 💥 ${atk.formula_dano} ${atk.tipo_dano}
            </div>
        `).join('') || '<p>Sin ataques</p>'}

        <h3>Historia y Rasgos</h3>
        <p><strong>Personalidad:</strong> ${s(data.personalidad?.rasgo || data.personalidad)}</p>
        <p><strong>Apariencia:</strong> ${s(data.apariencia)}</p>
        <p><strong>Gancho:</strong> ${s(data.gancho_trama)}</p>
    `;

    currentData = data;
}

// ==========================================
// 9. EXPORTAR A FOUNDRY
// ==========================================
els.btnExp.addEventListener('click', () => {
    if(!currentData) return;
    const json = {
        name: currentData.nombre,
        type: "npc",
        img: els.generatedImg.src.includes('generated') ? els.generatedImg.src : "icons/svg/mystery-man.svg",
        system: {
            attributes: {
                ac: { value: currentData.ca, calc: "natural" },
                hp: { value: currentData.hp, max: currentData.hp },
                movement: { walk: currentData.velocidad }
            },
            details: {
                race: currentData.raza,
                biography: { value: `<p>${currentData.gancho_trama}</p><p>${currentData.apariencia}</p>` }
            }
        },
        items: currentData.ataques?.map(atk => ({
            name: atk.nombre,
            type: "weapon",
            img: "icons/svg/sword.svg",
            system: {
                actionType: atk.tipo === 'ranged' ? 'rwak' : 'mwak',
                damage: { parts: [[atk.formula_dano + " + @mod", atk.tipo_dano.toLowerCase()]] },
                activation: { type: "action", cost: 1 },
                equipped: true
            }
        })) || []
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${currentData.nombre}_foundry.json`;
    a.click();
});