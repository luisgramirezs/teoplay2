import { PerfilNino, SesionGenerada } from '@/types';

const SYSTEM_PROMPT = `Eres un neuropsicopedagogo experto en Diseño Universal para el Aprendizaje (DUA) y educación inclusiva. Generas contenido educativo altamente personalizado para niños con neurodiversidad. Siempre integras el interés motivacional del niño en TODO el contenido. Respondes SOLO en JSON válido, sin markdown, sin bloques de código, sin texto adicional.`;

const condicionLabels: Record<string, string> = {
  tea: 'TEA - Trastorno del Espectro Autista',
  tdah: 'TDAH - Déficit de Atención e Hiperactividad',
  down: 'Síndrome de Down',
  dislexia: 'Dislexia',
  discalculia: 'Discalculia',
  disgrafia: 'Disgrafía',
  general: 'Dificultad de aprendizaje general',
};

const interesLabels: Record<string, string> = {
  dinosaurios: 'Dinosaurios', espacio: 'Espacio y cohetes',
  arte: 'Arte y colores', deportes: 'Deportes y fútbol',
  animales: 'Animales y mascotas', videojuegos: 'Videojuegos',
  musica: 'Música', oceano: 'Océano y criaturas marinas',
  superheroes: 'Superhéroes',
};

const asignaturaLabels: Record<string, string> = {
  matematicas: 'Matemáticas', lenguaje: 'Lenguaje', ingles: 'Inglés',
  ciencias: 'Ciencias Naturales', historia: 'Historia',
  arte: 'Arte', ed_fisica: 'Educación Física',
};

function getApiKey(): string {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  if (!key) throw new Error('API key no configurada. Contacta al administrador.');
  return key;
}

function buildPrompt(perfil: PerfilNino): string {
    const nombre = perfil.nombre || 'el niño';
    const idioma = perfil.idioma === 'es' ? 'Español' : 'English';
    const interes = interesLabels[perfil.interes] || perfil.interes;
    const condicion = condicionLabels[perfil.condicion] || perfil.condicion;
    const asignatura = asignaturaLabels[perfil.asignatura] || perfil.asignatura;
    const numJuegos = perfil.edad <= 7 ? 2 : perfil.edad <= 10 ? 3 : 4;

    return `Genera una sesión de aprendizaje completa para:
    - Nombre: ${nombre}
    - Edad: ${perfil.edad} años | Grado: ${perfil.grado}
    - Condición: ${condicion}
    - Interés motivacional: ${interes}
    - Asignatura: ${asignatura} | Tema: ${perfil.tema}
    - Idioma de la sesión: ${idioma}

    INSTRUCCIÓN PEDAGÓGICA CRÍTICA:
    Antes de generar el JSON, planifica mentalmente todo el contenido que el niño necesita conocer sobre "${perfil.tema}" para poder responder correctamente los juegos. La explicación debe enseñar EXACTAMENTE ese contenido. Los juegos deben evaluar SOLO lo que fue explicado. Nunca incluyas en los juegos conceptos que no aparezcan en la explicación.

    INSTRUCCIÓN SOBRE EL CAMPO "ejemplos":
    Los ejemplos deben ser PEDAGÓGICAMENTE ÓPTIMOS para la asignatura. Sigue esta guía:
    - INGLÉS o idiomas: 4 oraciones de ejemplo en el idioma estudiado, cada una con su traducción al español. Formato: { "original": "I play football every day.", "traduccion": "Yo juego fútbol todos los días." }
    - MATEMÁTICAS: 4 ejercicios con su solución paso a paso. Formato: { "original": "3 + 5 = ?", "traduccion": "Paso 1: cuenta 3 objetos. Paso 2: agrega 5 más. Resultado: 8" }
    - CIENCIAS / HISTORIA / OTRAS: 4 casos o hechos concretos con su explicación. Formato: { "original": "El corazón bombea sangre.", "traduccion": "Esto significa que el corazón empuja la sangre por todo el cuerpo para darte energía." }
    Usa ${interes} para dar contexto cuando sea natural, pero nunca sacrifiques la claridad del ejemplo académico.
    Los ejemplos deben estar ordenados de menor a mayor complejidad.
    Adapta el vocabulario y complejidad a ${condicion} y ${perfil.edad} años.

    SELECCIÓN DE JUEGOS:
    Tienes disponibles 5 tipos de juego: A, B, C, D, E.
    Antes de generar el JSON, decide cuáles ${numJuegos} tipos son más adecuados pedagógicamente para el tema "${perfil.tema}" con la condición ${condicion}.

    Criterios de selección:
    - Tipo A (Clasificar): Úsalo cuando el tema tiene dos categorías claras o conceptos que se puedan agrupar.
    - Tipo B (Selección múltiple): Úsalo para evaluar comprensión de conceptos, definiciones o hechos concretos.
    - Tipo C (Tarjetas): Úsalo para vocabulario, términos clave o preguntas de respuesta corta.
    - Tipo D (Intruso): Úsalo cuando hay elementos del tema y uno claramente no pertenece al grupo.
    - Tipo E (Ordenar secuencia): SOLO cuando el tema tiene pasos, etapas o un orden cronológico claro. Si el tema no tiene secuencia lógica, NO uses este tipo.

    Elige los ${numJuegos} tipos más apropiados y varía la selección — no uses siempre los mismos tipos.

    Responde SOLO con este JSON (sin texto fuera):
    {
      "numeroJuegos": ${numJuegos},
      "explicacion": {
        "intro": "1-2 oraciones que presentan qué es '${perfil.tema}' de forma simple y directa, adaptada a ${condicion} y a la edad de ${perfil.edad} años. Sin tecnicismos. En ${idioma}.",
        "pasos": [
          "Concepto o parte importante #1 del tema con su nombre y función explicada claramente",
          "Concepto o parte importante #2 del tema con su nombre y función",
          "Concepto o parte importante #3 si aplica",
          "Concepto o parte importante #4 si aplica"
        ],
        "analogia": "Una frase que conecta el tema con ${interes} de manera lógica. Empieza con 'Imagina que...' o 'Es como si...'. En ${idioma}.",
        "ejemplos": [
          { "original": "Ejemplo 1 más simple — texto principal o ejercicio", "traduccion": "Explicación, traducción o solución del ejemplo 1" },
          { "original": "Ejemplo 2", "traduccion": "Explicación o traducción 2" },
          { "original": "Ejemplo 3", "traduccion": "Explicación o traducción 3" },
          { "original": "Ejemplo 4 más complejo", "traduccion": "Explicación o traducción 4" }
        ],
        "resumen": "1 oración final que resume lo más importante para recordar. En ${idioma}."
      },
      "explicacionAlternativa1": {
        "intro": "Reintroduce '${perfil.tema}' con palabras más simples. En ${idioma}.",
        "pasos": [
          "Los mismos conceptos clave pero con vocabulario más sencillo",
          "Segundo concepto simplificado",
          "Tercer concepto si aplica"
        ],
        "analogia": "Analogía diferente a la principal, usando ${interes}. Empieza con 'Imagina que...' En ${idioma}.",
        "ejemplos": [
          { "original": "Ejemplo simple 1", "traduccion": "Traducción o solución 1" },
          { "original": "Ejemplo simple 2", "traduccion": "Traducción o solución 2" }
        ],
        "resumen": "Resumen ultra-breve en 1 oración. En ${idioma}."
      },
      "explicacionAlternativa2": {
        "intro": "Introducción ultra-simple de '${perfil.tema}' en 1 oración. En ${idioma}.",
        "pasos": [
          "Solo el concepto más esencial que aparece en los juegos"
        ],
        "analogia": "Analogía muy concreta con ${interes} en 1 frase corta. En ${idioma}.",
        "ejemplos": [
          { "original": "El ejemplo más básico posible", "traduccion": "Explicación brevísima" }
        ],
        "resumen": "La idea más importante en 1 frase corta. En ${idioma}."
      },
      "juegos": [
        // Aquí van EXACTAMENTE ${numJuegos} juegos con los tipos que elegiste según los criterios anteriores.
        // Usa la estructura exacta de cada tipo definida abajo.
      ],
      "mensajesMotivacionales": [
        "Mensaje motivacional entre juego 1 y 2 mencionando a ${nombre} y ${interes}, en ${idioma}",
        "Mensaje motivacional entre juego 2 y 3 mencionando a ${nombre} y ${interes}, en ${idioma}"
      ],
      "mensajeCierre": "Mensaje de celebración personalizado con ${nombre} e ${interes}, en ${idioma}",
      "recomendaciones": [
        "Recomendación pedagógica específica para el docente basada en ${condicion} y el tema trabajado",
        "Recomendación pedagógica 2 sobre estrategias para reforzar '${perfil.tema}'",
        "Recomendación pedagógica 3 sobre cómo continuar el aprendizaje en casa"
      ]
    }

    ESTRUCTURA DE CADA TIPO DE JUEGO — usa exactamente estos formatos:

    TIPO A — Clasificación por arrastre:
    { "tipo": "A", "instruccion": "Instrucción clara sobre qué clasificar. En ${idioma}.", "categoria1": { "nombre": "Nombre real categoría 1", "icono": "star" }, "categoria2": { "nombre": "Nombre real categoría 2", "icono": "circle" }, "items": [ { "texto": "Elemento categoría 1", "icono": "zap", "categoriaCorrecta": 1 }, { "texto": "Elemento categoría 2", "icono": "heart", "categoriaCorrecta": 2 }, { "texto": "Elemento categoría 1", "icono": "sun", "categoriaCorrecta": 1 }, { "texto": "Elemento categoría 2", "icono": "moon", "categoriaCorrecta": 2 }, { "texto": "Elemento categoría 1", "icono": "star", "categoriaCorrecta": 1 }, { "texto": "Elemento categoría 2", "icono": "cloud", "categoriaCorrecta": 2 } ] }

    TIPO B — Selección múltiple con preguntas:
    { "tipo": "B", "instruccion": "Instrucción motivadora. En ${idioma}.", "preguntas": [ { "pregunta": "Pregunta sobre concepto clave explicado. En ${idioma}.", "opciones": [ { "texto": "Respuesta correcta", "correcta": true }, { "texto": "Distractor plausible", "correcta": false }, { "texto": "Distractor plausible", "correcta": false } ] }, { "pregunta": "Segunda pregunta sobre concepto diferente. En ${idioma}.", "opciones": [ { "texto": "Correcta", "correcta": true }, { "texto": "Distractor", "correcta": false }, { "texto": "Distractor", "correcta": false } ] }, { "pregunta": "Tercera pregunta integradora. En ${idioma}.", "opciones": [ { "texto": "Correcta", "correcta": true }, { "texto": "Distractor", "correcta": false }, { "texto": "Distractor", "correcta": false } ] } ] }

    TIPO C — Tarjetas de memoria:
    { "tipo": "C", "instruccion": "Instrucción motivadora. En ${idioma}.", "tarjetas": [ { "pregunta": "Pregunta directa respondible en 1-3 palabras. En ${idioma}.", "respuesta": "respuesta exacta en 1-3 palabras", "pista": "Pista breve sin revelar la respuesta. En ${idioma}.", "alternativas": ["variante aceptable"] }, { "pregunta": "Segunda pregunta directa. En ${idioma}.", "respuesta": "respuesta exacta", "pista": "Pista breve. En ${idioma}.", "alternativas": ["variante 1"] }, { "pregunta": "Tercera pregunta. En ${idioma}.", "respuesta": "respuesta exacta", "pista": "Pista. En ${idioma}.", "alternativas": [] }, { "pregunta": "Cuarta pregunta integradora. En ${idioma}.", "respuesta": "respuesta exacta", "pista": "Pista. En ${idioma}.", "alternativas": ["variante aceptable"] } ] }

    TIPO D — Encuentra el intruso:
    { "tipo": "D", "instruccion": "Instrucción clara. En ${idioma}.", "items": [ { "texto": "Elemento que SÍ pertenece", "icono": "star", "esIntruso": false }, { "texto": "Elemento que SÍ pertenece", "icono": "zap", "esIntruso": false }, { "texto": "Elemento que SÍ pertenece", "icono": "sun", "esIntruso": false }, { "texto": "Elemento que NO pertenece — intruso claro y evidente", "icono": "cloud", "esIntruso": true } ] }

    TIPO E — Ordenar secuencia (SOLO si el tema tiene pasos o etapas claras):
    { "tipo": "E", "instruccion": "Instrucción clara sobre qué ordenar. En ${idioma}.", "items": [ { "texto": "Primer paso", "icono": "star", "orden": 1 }, { "texto": "Segundo paso", "icono": "zap", "orden": 2 }, { "texto": "Tercer paso", "icono": "sun", "orden": 3 }, { "texto": "Cuarto paso", "icono": "moon", "orden": 4 } ] }

    REGLAS CRÍTICAS:
    - ALINEACIÓN PEDAGÓGICA OBLIGATORIA: Si un juego pregunta sobre partes, características o categorías del tema, esas partes/características/categorías DEBEN haber sido explicadas con sus nombres en la explicación principal. Sin excepciones.
    - El array "juegos" debe ser un array JSON válido con EXACTAMENTE ${numJuegos} objetos.
    - No repitas siempre los mismos tipos — varía según lo que mejor evalúe este tema específico.
    - Usa ${interes} para contextualizar ejemplos y mensajes, pero el contenido académico debe ser correcto y completo.
    - Todos los textos en ${idioma}.
    - Adapta para ${condicion}: TEA = instrucciones literales y predecibles; TDAH = frases cortas y energéticas; Down = vocabulario simple con mucho apoyo descriptivo; Dislexia = frases cortas sin palabras complejas; Discalculia = evita números abstractos solos; Disgrafía = solo interacciones táctiles/clic.
    - Iconos Lucide válidos: star, circle, zap, heart, sun, moon, rocket, book, music, fish, palette, check, x, minus, leaf, cloud, flame, award, crown, trophy, shield, gem, flower2, bug, bird, cat, dog, whale, pizza, apple, banana, coffee, cake, gamepad2, triangle, square, diamond, atom, globe, mountain, waves, snowflake, wind, droplets, dna, microscope, eye, brain, bone.`;
    }



/** Genera la sesión de texto con GPT-4o */
async function generarSesionTexto(perfil: PerfilNino, apiKey: string): Promise<SesionGenerada> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 2500,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildPrompt(perfil) },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Error de OpenAI (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const rawContent = data.choices?.[0]?.message?.content || '{}';

  try {
    return JSON.parse(rawContent) as SesionGenerada;
  } catch {
    throw new Error('No se pudo interpretar la respuesta de la IA. Intenta nuevamente.');
  }
}

/** Construye prompt DALL-E pedagógico por asignatura y condición */
function buildDallePrompt(perfil: PerfilNino): string {
  const tema = perfil.tema;
  const edad = perfil.edad;
  const condicion = perfil.condicion;

  const estiloBase = condicion === 'tea'
    ? 'clean flat illustration, minimal details, no clutter, soft muted colors, predictable layout, clear visual structure'
    : condicion === 'down'
    ? 'bold flat illustration, very large clear elements, bright friendly colors, simple shapes, high contrast, minimal complexity'
    : condicion === 'dislexia'
    ? 'flat illustration, high contrast, clear distinct elements, uncluttered, bold outlines, simple composition'
    : 'flat digital illustration, vibrant colors, clear elements, friendly educational style';

  const baseStyle = `Style: ${estiloBase}, suitable for children aged ${edad}, educational diagram quality, NO decorative random backgrounds, ONLY elements directly related to "${tema}".`;

  switch (perfil.asignatura) {
    case 'ciencias':
      return `Educational science diagram for children showing "${tema}". Depict ALL key parts and components clearly (example: if cell — show nucleus, membrane, cytoplasm, organelles each visually distinct; if solar system — all planets in order with size differences; if water cycle — evaporation, cloud, rain arrows). Every component visually distinct and recognizable. ${baseStyle} Scientific illustration style, each part should be identifiable by shape and color.`;

    case 'matematicas':
      return `Educational math illustration for children explaining "${tema}" using concrete real objects. Show the mathematical concept visually step by step using objects (fruits, blocks, animals). If operations: show the process (3 apples + 2 apples = 5 apples with actual drawn apples). If fractions: show divided shapes with parts highlighted. If geometry: show the shapes with measurements implied visually. ${baseStyle} The math concept must be immediately understandable just by looking.`;

    case 'ingles':
    case 'lenguaje':
      return `Educational language scene for children illustrating "${tema}" in real-life context. Show a clear situation where this grammar concept appears naturally (present simple: daily routine scenes with clock; past tense: sequence of events with arrows; vocabulary topic: labeled objects in a scene). ${baseStyle} The grammar or language concept should be visually obvious from the scene.`;

    case 'historia':
      return `Educational historical illustration for children about "${tema}". Show the historical period or event with accurate visual elements: period clothing, architecture, tools, a map or key historical figures. ${baseStyle} Illustrative historical scene that teaches the concept at a glance.`;

    case 'arte':
      return `Educational art illustration for children demonstrating "${tema}" with clear visual examples of the artistic concept, technique or style. ${baseStyle}`;

    default:
      return `Educational diagram for children clearly illustrating "${tema}". Show the main elements, components or process steps in a visually organized way. Every element must directly teach something about the topic. ${baseStyle}`;
  }
}

/** Genera imagen DALL-E 3 pedagógica */
async function generarImagenLeccion(perfil: PerfilNino, apiKey: string): Promise<string | null> {
  const prompt = buildDallePrompt(perfil);

  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.data?.[0]?.url ?? null;
  } catch {
    return null; // Image is optional — never fail the whole session
  }
}

/** Genera la sesión completa: texto + imagen en paralelo */
export async function generarSesion(perfil: PerfilNino): Promise<SesionGenerada> {
  const apiKey = getApiKey();

  const [sesion, imagenUrl] = await Promise.all([
    generarSesionTexto(perfil, apiKey),
    generarImagenLeccion(perfil, apiKey),
  ]);

  return { ...sesion, imagenUrl: imagenUrl ?? undefined };
}

export async function pedirExplicacionAlternativa(
  perfil: PerfilNino,
  intentoNumero: number
): Promise<string> {
  const apiKey = getApiKey();
  const idiomaStr = perfil.idioma === 'es' ? 'español' : 'English';
  const interes = interesLabels[perfil.interes] || perfil.interes;

  const prompt = `Explica "${perfil.tema}" de ${asignaturaLabels[perfil.asignatura] || perfil.asignatura} de forma ${intentoNumero === 1 ? 'más simple y concreta' : 'ultra-simple'}, usando ${interes} como analogía. Máximo 3 oraciones muy cortas. Condición del niño: ${condicionLabels[perfil.condicion] || perfil.condicion}. Edad: ${perfil.edad} años. Idioma: ${idiomaStr}. Solo el texto, sin formato ni JSON.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Error de OpenAI (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}
