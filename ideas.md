Es una decisión sabia. A veces, las limitaciones técnicas (especialmente con modelos de imágenes y restricciones regionales) pueden frenar el desarrollo. La gran fortaleza de Gemini (especialmente el modelo Flash) es su **velocidad y capacidad lógica con texto**.

Dado que ya tienes una arquitectura sólida (Frontend modular, Backend Flask, Historial JSON), aquí tienes una lista de funcionalidades **basadas en texto y lógica** que aportarían muchísimo valor a tu app de D&D 2024:

---

### 1. ⚔️ Generador de Encuentros Tácticos (Combat Planner) ✅

No solo decir "5 Goblins", sino diseñar el encuentro completo.

    * **Qué hace:** Le das un nivel de grupo y una dificultad (Fácil, Medio, Mortal) y un entorno (Bosque, Cripta).
    * **La IA genera:**
    * La lista de monstruos ajustada al presupuesto de XP.
    * **Tácticas:** "Los arqueros se esconden tras los árboles mientras los lobos flanquean".
    * **Terreno:** Elementos interactivos (ej: "Un candelabro que puede caer", "Suelo resbaladizo").


* **Valor:** Ahorra al DM pensar en *cómo* pelean los monstruos.

### 2. 💬 "Interrogatorio" de NPCs (Chat Interactivo) ✅ 

Esta es mi favorita y técnicamente muy viable con tu código actual.

    * **Qué hace:** Aprovechando que ya guardas NPCs en el historial (`history_npc.json`).
    * **Funcionalidad:** Añadir un botón "Hablar" en la ficha del NPC. Esto abre un pequeño chat donde el usuario (DM) le hace preguntas y la IA responde **roleando como ese NPC** (usando su personalidad, secretos y trasfondo generados previamente).
    * **Valor:** Permite al DM improvisar diálogos en tiempo real si los jugadores hacen preguntas inesperadas.

### 3. ✨ La Forja Arcana (Spellcrafter) ✅ 

D&D 2024 fomenta mucho la personalización. A veces un jugador quiere un hechizo que no existe.

    El Problema: Crear hechizos caseros (homebrew) suele romper el juego (demasiado daño, coste muy bajo).

    Qué hace: El usuario dice: "Quiero una bola de fuego pero de electricidad que aturda".

    La IA Genera: Un bloque de estadísticas completo (Nivel, Tiempo de Casteo, Componentes, Daño, Duración) balanceado matemáticamente comparándolo con hechizos oficiales.

    Valor: Permite recompensas únicas para los magos del grupo.

### 4. 🏰 Generador de Asentamientos / Ciudades ✅ 

Ya tienes aventuras y tiendas, falta el lugar donde ocurren.

    * **Qué hace:** Genera un pueblo, ciudad o metrópolis.
      * **La IA genera:**
      * Gobierno y política.
      * Distritos importantes.
      * Rumores locales.
      * Lista breve de tabernas y templos.


* **Integración:** Podría tener botones para "Generar Tienda para esta ciudad" conectando con tu módulo de Tiendas.

### 5. 📜 Generador de Acertijos y Trampas ✅ 

Para las mazmorras.
    
    * **Qué hace:** El usuario pide "Un acertijo para abrir una puerta mágica en una biblioteca".
      * **La IA genera:** El acertijo, la solución, y qué pasa si fallan (la trampa/consecuencia).
      * **Valor:** Los acertijos son lo más difícil de improvisar para un humano.
 
### 6.📄 Exportación a PDF (Ficha de impresión)

Ya exportas a Foundry (JSON), pero muchos DMs juegan en mesa física.

* **Qué hace:** Un botón "Imprimir Carta" o "Descargar PDF".
* **Técnica:** Usar una librería de Python como `weasyprint` o `reportlab` en el backend, o simplemente CSS `@media print` bien hecho en el frontend para que salga bonito al imprimir en papel.

---

### 7.💰 Generador de Botín y Tesoros (Loot Hoard) ✅ 

Ya tienes un generador de objetos sueltos (ItemService), pero los DMs a menudo necesitan llenar un cofre del tesoro entero tras un combate.

    Qué hace: Le das un "Nivel de Desafío (CR)" y un "Tipo de Enemigo" (ej: Dragón, Bandidos, Cultistas).

    La IA genera:

        Monedas: Cantidad exacta de cp, sp, gp, pp (ajustado a las tablas de la DMG).

        Objetos de Arte: "Un cáliz de plata con incrustaciones de ópalo (250gp)".

        Objetos Mágicos: Selecciona o inventa objetos acordes al nivel.

        Curiosidades: "Una carta de amor sin enviar manchada de sangre".

    Valor: Recompensa instantánea para los jugadores sin que el DM tenga que tirar en 10 tablas distintas.

###  8. 🛡️ El "Árbitro de Reglas" (Rules Lawyer 2024) ✅ 

Dado que D&D 2024 tiene cambios sutiles (Weapon Mastery, Exhaustion, Grappling), esto es oro puro.

    Qué hace: Un buscador simple donde preguntas: "¿Cómo funciona el empujón ahora?" o "¿Se apilan los puntos de golpe temporales?".

    La IA genera:

        La explicación clara de la regla 2024.

        Un ejemplo práctico.

        (Técnicamente: Solo necesitas un buen System Prompt que le diga "Eres un experto en el PHB 2024, ignora reglas de 2014 si han cambiado").

    Valor: Resuelve discusiones en la mesa en segundos.

### 9. 📜 Tablón de Anuncios / Misiones Secundarias (Quest Board) ✅ 

Tienes "Aventuras" (tramas largas), pero a veces los jugadores llegan a un pueblo y solo quieren hacer algo rápido para ganar dinero.

    Qué hace: Genera 3-5 misiones rápidas para una ciudad o taberna específica.

    La IA genera:

        El Cartel: "Se busca ayuda para limpiar el sótano".

        El Cliente: "Vieja Sra. Higgins".

        El Giro Inesperado: "Las ratas del sótano son en realidad druidas transformados".

        Recompensa: Oro o favores.

    Valor: Contenido de relleno infinito para cuando los jugadores ignoran la trama principal.

### 10. 🛡️ Gestor de Facciones (Faction & Guilds) ✅ 

Para dar profundidad política a tus ciudades.

    Qué hace: Crea organizaciones secretas, gremios de ladrones, cultos o órdenes de caballeros.

    La IA Genera: Nombre, Símbolo, Lema, Líder, Objetivos, Recursos y Relación con los jugadores (¿Aliados o Rivales?).

    Valor: Ideal para campañas urbanas o de intriga.


### 11. ⚡ Generador de "Desafíos de Habilidad" (Skill Challenges) 

No todo es combate. A veces hay que escapar de un templo que se derrumba, perseguir a un asesino por los tejados o convencer a un rey.

    El Problema: Es difícil improvisar mecánicas para escenas de acción que no sean "tira ataque".

    Qué hace: Pides: "Persecución de carruajes por la ciudad".

    La IA Genera:

        Objetivo: 5 éxitos antes de 3 fallos.

        Obstáculos: "Un carro de frutas bloquea el paso (Acrobacias DC 15)".

        Consecuencias: Si fallan, no mueren, pero pierden al objetivo o ganan niveles de agotamiento.

    Valor: Añade cine y tensión narrativa estructurada.

### 12. 👺 Arquitecto de Villanos (BBEG Planner) ✅

Tienes monstruos, pero ¿quién los manda?

    Qué hace: Pides "Un villano para una campaña de terror gótico nivel 5-10".

    La IA Genera:

        Nombre y Arquetipo: "Lord Valdos, el Vampiro Arrepentido".

        El Plan Maestro: Qué quiere conseguir y en cuántos pasos.

        Los Tenientes: Sus 3 comandantes clave.

        La Guarida: Dónde se esconde.

    Valor: Da estructura a largo plazo a la campaña.

### 13. 📝 El Cronista (Session Recap / Journal) ✅ 

Los DMs (y jugadores) siempre olvidan qué pasó la semana pasada.

    Qué hace: Pegas tus notas desordenadas ("Mataron al goblin, encontraron llave, el bardo sedujo al dragón").

    La IA Genera:

        Resumen Épico: Un texto narrado como si fuera una serie de TV ("Anteriormente en D&D...").

        Bullet Points: Lista limpia de objetos ganados, NPCs conocidos y misiones pendientes.

    Valor: Ahorra tiempo de organización post-partida.

### 14. 🏰 El Arquitecto de Mazmorras (Dungeon Architect) ✅ 

Ya tienes "Encuentros" (combate) y "Aventuras" (trama), pero falta la estructura física donde ocurren.

    Qué hace: Genera una estructura de mazmorra rápida (ej: "La Técnica de las 5 Habitaciones").

    La IA Genera:

        Entrada/Guardián: El obstáculo inicial.

        Puzzle/Roleplay: Un desafío no combativo.

        La Trampa/Revés: Algo que sale mal.

        Clímax: La batalla final.

        Recompensa: El tesoro y la salida.

    Valor: Crea una sesión de "dungeon crawl" completa en segundos.


### 15🧪 La Mesa de Alquimia (Potion & Poison Maker) ✅ 

Los jugadores siempre quieren craftear cosas o encuentran líquidos raros.

    Qué hace: Genera consumibles únicos que no están en el manual.

    La IA Genera:

        Apariencia: "Líquido viscoso y burbujeante color violeta".

        Sabor/Olor: "Huele a ozono y sabe a ceniza".

        Efecto Mecánico: "Cura 2d4 pero te vuelve azul durante 1 hora".

        Ingredientes: Qué necesitan para fabricarla.

    Valor: Da sabor (literalmente) al botín y al crafteo.

### 16 ⛺ Eventos de Viaje (Travel Events) ✅ 

El famoso "voy de Punto A a Punto B". A veces no quieres combate, sino "sabor".

    Qué hace: Genera encuentros no combativos para el camino.

    La IA Genera:

        "Un mercader con una rueda rota".

        "Ruinas antiguas con un mural profético".

        "Un cambio de clima repentino mágico".

    Valor: Hace que el mundo se sienta vivo y grande entre aventuras.

### 17. 👹 Laboratorio de Monstruos (Monster Modder)

A veces el manual de monstruos se queda corto o los jugadores ya se saben las estadísticas de memoria.

    Qué hace: Tomas un monstruo base (ej: "Ogro") y le aplicas una "Plantilla" o tema (ej: "Infernal", "Cibernético", "Fúngico").

    La IA genera:

        Nuevos Rasgos: "Piel de Esporas: Al recibir daño, libera una nube tóxica".

        Ataques Modificados: El garrote ahora hace daño de veneno.

        Descripción Visual: "Un ogro con setas púrpuras brotando de sus hombros y ojos lechosos".

    Valor: Sorprende a los jugadores veteranos reciclando monstruos clásicos con un giro fresco.

### 18📚 El Bibliotecario (Lore & Book Generator) ✅ 

Los jugadores adoran saquear estanterías. Decir "encuentras 3 libros" es aburrido.

    Qué hace: Genera el contenido de un libro, pergamino o carta encontrada en una mazmorra.

    La IA genera:

        Título y Autor: "Tratado sobre la cría de Wyverns, por Lord Fizzbang".

        Extracto de Texto: Un párrafo legible del contenido (lore, pistas o humor).

        Estado y Valor: "¿Está quemado? ¿Escrito en sangre? ¿Vale 50gp?".

    Valor: Aporta profundidad al mundo (Lore) instantáneo sin que tengas que escribir historias enteras.

### 19. 🕵️‍♂️ Generador de Misterios (Investigation Planner) ✅ 

Diseñar un buen misterio es difícil; la IA es experta en conectar puntos.

    Qué hace: Pides "Un asesinato en una mansión cerrada".

    La IA genera:

        La Víctima y el Lugar: Quién murió y dónde.

        Los Sospechosos: 3 NPCs con motivos creíbles.

        Las Pistas: 3 pistas físicas (una carta, una huella, un olor) que llevan al culpable.

        La Verdad: Quién lo hizo realmente y por qué.

    Valor: Crea una sesión completa de investigación estilo Sherlock Holmes en segundos.

### 20. ⚖️ El Abogado del Diablo (Contract Generator) ✅ 

Ideal para Brujos (Warlocks), tratos con Diablos o gremios mercantiles estrictos.

    Qué hace: Genera un contrato legal o mágico con "letra pequeña".

    La IA genera:

        Términos del Servicio: Qué se ofrece y qué se pide a cambio.

        La Letra Pequeña (Trampa): "El alma se entregará tras la muerte o tras el primer incumplimiento menor".

        Forma de Romperlo: Una cláusula de escape oculta o difícil.

    Valor: Utilería de juego (Props) de alta calidad para rolear pactos y acuerdos.

### 21. 🎪 Organizador de Festivales (Festival Maker) 

Las ciudades están vivas. Cuando los jugadores llegan, a veces hay fiesta.

    Qué hace: Diseña una festividad local única.

    La IA genera:

        Nombre y Motivo: "La Fiesta de la Luna Roja (Conmemora una victoria antigua)".

        Eventos/Minijuegos: "Concurso de comer pasteles", "Tiro al trasgo", "Carrera de cerdos engrasados" (con mecánicas de dados simples).

        Comida Callejera: Platos típicos del festival.

    Valor: Momentos de relax y roleo divertido entre aventuras peligrosas.

### 22. 🕍 Panteones y Cultos (Deity & Cult Creator) 

Diferente a las facciones políticas, esto se centra en la fe y la magia divina.

    Qué hace: Crea una religión, secta o dios menor.

    La IA genera:

        Nombre y Dominios: "Zalthos, dios de las sombras y los secretos perdidos".

        Símbolo Sagrado: Descripción visual.

        Dogma/Mandamientos: "Nunca enciendas una luz sin pedir perdón a la oscuridad".

        Rituales: Qué hacen sus seguidores (sacrificios, cánticos, ayunos).

    Valor: Fundamental para Clérigos, Paladines y tramas de cultistas.

### 23. 🍲 Gastronomía Fantástica (Fantasy Chef) 

Para esas tabernas de lujo o cenas con el rey.

    Qué hace: Genera un menú exótico con efectos menores.

    La IA genera:

        Plato: "Estofado de Hidra con salsa de pimienta fantasma".

        Descripción Sensorial: "La carne se regenera ligeramente mientras la masticas, picante y ácida".

        Efecto Menor (Opcional): "Te sientes valiente (+1d4 a la próxima salvación de miedo) pero tienes ardores".

    Valor: Sabor (literalmente) y roleo para los momentos de descanso.

### 24.🛡️ Objetos de Legado (Evolving Items) 

Objetos que crecen con el jugador, muy populares en campañas largas.

    Qué hace: Crea un arma u objeto con niveles de poder.

    La IA genera:

        Historia: A quién perteneció.

        Nivel 1 (Dormido): Es una espada +1 normal.

        Nivel 5 (Despierto): Gana daño de fuego y brilla.

        Nivel 10 (Exaltado): Permite lanzar "Bola de Fuego" una vez al día.

        Condición de Desbloqueo: "Debes bañar la hoja en sangre de dragón para despertarla".

    Valor: Da a los jugadores un objetivo personal a largo plazo.

### 25. 🔮 Tejedor de Sueños (Dream Generator) ✅ 

Los DMs suelen usar los sueños para dar pistas o avanzar la trama.

    Qué hace: Genera una secuencia onírica simbólica o profética.

    La IA genera:

        Imágenes: "Ves una torre cayendo en silencio, rodeada de cuervos de cristal".

        Sensaciones: Frío intenso, sensación de caída.

        Significado Oculto: "Representa la caída inminente del rey local".

    Valor: Narrativa potente para cuando los personajes hacen un Descanso Largo.

### 26.️ 🏚️ Historiador de Ruinas (Ruins Lore)

Para darle sentido a tu "Dungeon Architect" o "Cities".

    Qué hace: Explica por qué ese lugar es una ruina.

    La IA genera:

        Uso Original: "Era una academia de magia para nobles".

        El Cataclismo: "Un experimento de invocación salió mal y fusionó a los estudiantes con las paredes".

        Estado Actual: "Los fantasmas de los estudiantes aún intentan asistir a clase".

    Valor: Convierte una "mazmorra genérica" en un lugar con historia y alma.
