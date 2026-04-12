import { PerfilNino, SesionGenerada, ExplicacionBloque } from '@/types';


// =====================
// TIPOS WIKIMEDIA
// =====================

interface WikimediaImageInfo {
    url: string;
    thumburl?: string;
    mime: string;
    size?: number;
}

interface WikimediaPageFull {
    title: string;
    imageinfo?: WikimediaImageInfo[];
}

interface WikimediaApiResponse {
    query: {
        pages: Record<string, WikimediaPageFull>;
    };
}

interface RankedImage {
    url: string;
    score: number;
    title: string;
}

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
  arte: 'Arte', ed_fisica: 'Educación Física', sociales:'Sociales'
};

function getApiKey(): string {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  if (!key) throw new Error('API key no configurada. Contacta al administrador.');
  return key;
}

//* BuildPrompt ajustado *//

function buildPrompt(perfil: PerfilNino): string {
    const nombre = perfil.nombre || 'el niño';
    const idioma = perfil.idioma === 'es' ? 'Español' : 'English';
    const interes = interesLabels[perfil.interes] || perfil.interes;
    const condicion = condicionLabels[perfil.condicion] || perfil.condicion;
    const asignatura = asignaturaLabels[perfil.asignatura] || perfil.asignatura;
    const numJuegos = perfil.edad <= 7 ? 2 : perfil.edad <= 10 ? 3 : 4;

    const pn = perfil.perfilNeuroeducativo;

    const perfilBloque = pn
        ? [
            'PERFIL NEUROEDUCATIVO INDIVIDUALIZADO — PRIORIDAD MÁXIMA',
            `Este perfil fue creado específicamente para ${nombre}.`,
            'No generes una lección estándar basada solo en la condición.',
            'La adaptación debe basarse primero en este perfil individual, luego en la edad, grado y tema.',
            '',
            `Resumen del niño/a: ${pn.resumen || ''}`,
            `Fortalezas: ${(pn.fortalezas || []).join('; ') || 'No especificadas'}`,
            `Retos reales: ${(pn.retos || []).join('; ') || 'No especificados'}`,
            `Estrategias recomendadas: ${(pn.estrategias || []).join('; ') || 'No especificadas'}`,
            '',
            'Reglas de uso del perfil:',
            '- Usa las fortalezas para definir cómo explicar.',
            '- Usa los retos para ajustar vocabulario, longitud, ritmo e instrucciones.',
            '- Usa las estrategias recomendadas para decidir explicación, ejemplos, apoyos visuales y juegos.',
            '- Si el perfil permite mayor profundidad conceptual, no simplifiques en exceso.',
            '- Si el perfil requiere más apoyo, simplifica la forma de enseñar, pero no elimines contenido esencial.',
        ].join('\n')
        : [
            'No hay perfil neuroeducativo individualizado.',
            `Adapta la sesión según condición (${condicion}), edad, grado y tema.`,
        ].join('\n');

    const estructuraJson = `
{
  "numeroJuegos": ${numJuegos},
  "explicacion": {
    "objetivo": "",
    "intro": "",
    "conceptosClave": [
      {
        "nombre": "Nombre de un concepto, parte, autor, categoría, elemento o componente esencial del tema",
        "funcion": "Qué hace, quién es, para qué sirve o por qué es importante dentro del tema",
        "explicacionSimple": "Explicación clara, concreta y adaptada para el niño"
      }
    ],
    "pasos": [""],
    "visualSugerido": {
      "tipo": "diagrama | pictograma | escena | secuencia | comparacion | ninguna",
      "descripcion": "Describe un apoyo visual que ayude a comprender el contenido. Debe indicar exactamente qué mostrar y por qué mejora el aprendizaje de este niño según su perfil.",
      "justificacionPedagogica": "Explica en 1 frase por qué este apoyo visual aporta comprensión real y no es decorativo"
    },
    "chequeoCobertura": ["Lista de ideas, partes, autores, categorías o relaciones que sí deben haber quedado explicadas"],
    "analogia": "Una frase que conecta el tema con ${interes} de manera lógica y útil. Empieza con 'Imagina que...' o 'Es como si...'. En ${idioma}.",
    "ejemplos": [
      {"original": "4 Ejemplos pedagógicos relacionado con el tema", "traduccion": "Explicación, solución o aclaración del ejemplo" }
    ],
    "resumen": "oración final que resume lo más importante para recordar. En ${idioma}."
  },
  "explicacionAlternativa1": {
    "objetivo": "La misma meta de aprendizaje expresada de forma más simple y flexibilizada de acuerdo con ${perfil.condicion}. En ${idioma}.Sin comprometer la calidad del aprendizaje ni acortando de manera excesiva el ${perfil.tema}",
    "intro": "Reexplica el mismo tema con palabras más simples, pero sin perder el contenido esencial. En ${idioma}.",
    "conceptosClave": [
      {
        "nombre": "Los mismos conceptos clave de la explicación principal",
        "funcion": "La misma idea explicada con vocabulario más sencillo",
        "explicacionSimple": "Explicación más pedagógica y concreta"
      }
    ],
    "pasos": [""],
    "visualSugerido": {
      "tipo": "diagrama | pictograma | escena | secuencia | comparacion | ninguna",
      "descripcion": "Describe un apoyo visual que ayude a comprender el contenido. Debe indicar exactamente qué mostrar y por qué mejora el aprendizaje de este niño según su perfil.",
      "justificacionPedagogica": "Explica en 1 frase por qué este apoyo visual aporta comprensión real y no es decorativo"
    },
    "chequeoCobertura": ["Lista de ideas, partes, autores, categorías o relaciones que sí deben haber quedado explicadas"],
    "analogia": "Una frase que conecta el tema con ${interes} de manera lógica y útil. Empieza con 'Imagina que...' o 'Es como si...'. En ${idioma}",
    "ejemplos": [
      { "original": "4 Ejemplos pedagógicos relacionado con el tema", "traduccion": "Explicación, solución o aclaración del ejemplo"  }
    ],
    "resumen": "oración final que resume lo más importante para recordar. En ${idioma}."
  },
  "explicacionAlternativa2": {
    "objetivo": "Versión aún mas didáctica con la misma meta de aprendizaje, sin comprometer la lógica ni la calidad pedagógica y flexibilizada de acuerdo con ${perfil.condicion} . En ${idioma}.",
    "intro": "Introducción pedagógica del tema en lenguaje muy concreto, pero manteniendo la idea esencial y flexibilizada de acuerdo con ${perfil.condicion}  . En ${idioma}.",
    "conceptosClave": [
      {
        "nombre": "Concepto esencial y pedagógico",
        "funcion": "Función o idea central",
        "explicacionSimple": "Explicación más pedagógica y concreta"
      }
    ],
    "pasos": [""],
    "visualSugerido": {
      "tipo": "diagrama | pictograma | escena | secuencia | comparacion | ninguna",
      "descripcion": "Describe un apoyo visual que ayude a comprender el contenido. Debe indicar exactamente qué mostrar y por qué mejora el aprendizaje de este niño según su perfil.",
      "justificacionPedagogica": "Explica en 1 frase por qué este apoyo visual aporta comprensión real y no es decorativo"
    },
    "chequeoCobertura": ["Lista de ideas, partes, autores, categorías o relaciones que sí deben haber quedado explicadas"],
    "analogia": "Una frase que conecta el tema con ${interes} de manera lógica y útil. Empieza con 'Imagina que...' o 'Es como si...'. En ${idioma}",
    "ejemplos": [
      { "original": "4 Ejemplos pedagógicos relacionado con el tema", "traduccion": "Explicación, solución o aclaración del ejemplo"  }
    ],
    "resumen": "oración final que resume lo más importante para recordar. En ${idioma}."
  },
  "mapaPedagogico": {
    "contenidosEnsenados": [""],
    "contenidosEvaluables": [""]
  },
    "juegos": [
      {
        "tipo": "A | B | C | D | E",
        "instruccion": "Texto del juego",
        "nota": "Cada juego debe usar exactamente la estructura completa correspondiente a su tipo"
      }
    ],
  "mensajesMotivacionales": [""],
  "mensajeCierre": "",
  "recomendaciones": [""]
}
`.trim();

    return [
        perfilBloque,
        '',
        'Genera una sesión de aprendizaje completa y adaptada.',
        `Nombre: ${nombre}`,
        `Edad: ${perfil.edad} años`,
        `Grado: ${perfil.grado}`,
        `Condición: ${condicion}`,
        `Interés motivacional: ${interes}`,
        `Asignatura: ${asignatura}`,
        `Tema: ${perfil.tema}`,
        `Idioma: ${idioma}`,
        '',
        'INSTRUCCIONES PEDAGÓGICAS OBLIGATORIAS:',
        `1. Antes de escribir, identifica todo lo que el niño necesita aprender sobre "${perfil.tema}" para responder correctamente los juegos.`,
        '2. La explicación principal debe enseñar exactamente ese contenido.',
        '3. Los juegos deben evaluar solo lo que fue explicado.',
        '4. No introduzcas en juegos nombres, autores, partes, categorías, fechas, nacionalidades o datos no enseñados explícitamente.',
        '5. Adaptar no significa recortar el contenido esencial: significa cambiar la forma de enseñarlo.',
        '6. Si el tema requiere varios autores, partes, categorías o pasos, inclúyelos todos.',
        '7. El campo conceptosClave debe incluir los elementos centrales reales del tema.',
        '8. Los campos pasos y chequeoCobertura no tienen número fijo: incluye lo que el tema necesite.',
        '9. visualSugerido debe proponer solo apoyos visuales realmente útiles para comprender el tema.',
        '10. No uses "diagrama" como opción por defecto.',
        '11. El tipo de visual debe depender de la naturaleza del contenido:',
        '- usa "diagrama" solo para partes, estructuras, sistemas, relaciones espaciales o clasificaciones visuales claras;',
        '- usa "secuencia" para procesos, pasos, ciclos o transformaciones;',
        '- usa "comparacion" para contrastar dos conceptos, categorías o formas;',
        '- usa "escena" para contextos cotidianos, acciones, uso comunicativo o ejemplos situados;',
        '- usa "pictograma" para apoyos visuales muy concretos, simples y directos;',
        '- usa "ninguna" cuando el contenido se comprenda mejor con texto, ejemplos verbales o práctica, y una imagen no añada comprensión real.',
        '12. Si el tema es abstracto, verbal o conceptual y no requiere representación visual clara, visualSugerido.tipo debe ser "ninguna".',
        '13. La decisión de visualSugerido debe ser conservadora: si no hay una ganancia clara de comprensión, usa "ninguna".',
        '14. Guía por asignatura para elegir visualSugerido:',
        '- en ciencias, usa diagrama o secuencia solo si ayudan a entender estructuras, sistemas o procesos reales;',
        '- en inglés, usa escena solo si ayuda a comprender uso real del lenguaje; si no, usa ninguna;',
        '- en lenguaje, usa comparacion o ninguna para conceptos literarios o gramaticales abstractos; evita diagramas genéricos;',
        '- en matemáticas, usa pictograma, secuencia o comparacion solo si concretan el concepto; evita imágenes decorativas;',
        '- en historia y sociales, usa escena o comparacion solo si clarifican contexto, relación o contraste; si no, usa ninguna.',
        '15. Si la imagen sería decorativa o no aporta comprensión, visualSugerido.tipo debe ser "ninguna".',
        '16. La explicación alternativa 1 debe usar lenguaje más simple, pero conservar el contenido esencial.',
        '17. La explicación alternativa 2 debe ser ultra simple, sin contradecir ni introducir contenido distinto a la explicación principal.',
        '18. mapaPedagogico.contenidosEnsenados debe listar lo que sí fue enseñado.',
        '19. mapaPedagogico.contenidosEvaluables debe contener solo elementos ya enseñados.', '',
        '20. La explicación principal debe quedar pedagógicamente completa para el nivel escolar correspondiente, aunque use lenguaje simple.',
        '21. Si el tema incluye listas, clasificaciones, componentes, autores, órganos, organelos, etapas, reglas o categorías, la explicación principal debe desarrollarlos con suficiente cobertura.',
        '22. No reduzcas artificialmente conceptosClave a 1 o 2 elementos si el tema necesita más.',
        '23. Los ejemplos ayudan a comprender, pero no sustituyen la enseñanza explícita de los conceptos esenciales.',
        '24. Si en los juegos aparece un nombre, parte, autor, categoría o dato, ese elemento debe haber aparecido antes en la explicación principal y en mapaPedagogico.contenidosEnsenados.',
        '25. Si el tema es de lenguaje, historia, ciencias o sociales, usa contenido real y correcto, no generalidades vagas.',
        '26. Si el tema contiene subelementos importantes con nombre propio (por ejemplo: planetas, autores, órganos, organelos, figuras geométricas, tipos de texto, capas, etapas o categorías), debes nombrarlos y explicarlos de forma básica en la explicación principal.',
        '27. Si luego en ejemplos o juegos aparece un subelemento específico del tema, ese subelemento debe haber sido enseñado antes con su nombre en conceptosClave, pasos o intro.',
        '28. No menciones en ejemplos o juegos elementos específicos que no fueron presentados pedagógicamente antes.',
        '29. En temas científicos, históricos, sociales y de lenguaje, evita explicaciones demasiado generales: incluye los elementos esenciales concretos que el niño necesita reconocer.',
        '30. Si el tema corresponde a una lista escolar conocida o a un conjunto de elementos reconocibles (por ejemplo planetas, continentes, sentidos, partes de la célula, tipos de texto o figuras geométricas), incluye los elementos relevantes necesarios para comprender y responder la lección.',
        '31. Si un concepto central del tema agrupa elementos escolares identificables (por ejemplo los planetas del sistema solar, los continentes, los órganos del cuerpo, los tipos de texto o las figuras geométricas), no te quedes solo en la categoría general: debes desglosar y nombrar sus elementos principales.',
        '32. En esos casos, conceptosClave o la explicación principal deben incluir los nombres concretos de esos elementos, al menos con una característica breve y útil de cada uno si luego serán usados en ejemplos o juegos.',
        '33. En ciencias, cuando el tema incluya partes, cuerpos, órganos, organelos, capas, etapas o elementos reconocibles de un sistema, debes nombrarlos explícitamente y no dejarlos solo como categoría general.',
        '34. Si el tema corresponde a un sistema, conjunto, estructura o lista escolar cerrada de elementos esenciales, debes incluir todos sus componentes principales necesarios para comprender el tema a nivel escolar.',
        '35. No presentes como completa una explicación que solo mencione una parte de los elementos esenciales del sistema o conjunto.',
        '36. Ejemplos de obligatoriedad de cobertura completa: sistema solar = todos los planetas; sistema digestivo = órganos principales del recorrido digestivo; célula = organelos esenciales; continentes = todos los continentes; tipos de texto = los tipos trabajados en ese nivel escolar.',
        '37. La adaptación puede simplificar la explicación de cada componente, pero no eliminar componentes esenciales del tema.',
        '38. Los juegos no deben ser superficiales ni incompletos: cada juego debe tener suficiente contenido para evaluar de manera clara un aspecto real de la lección.',
        '39. Cada juego debe estar completamente desarrollado según su tipo y no dejar campos vacíos o mínimos si el tipo requiere varios elementos.',
        '40. Si eliges selección múltiple, incluye varias preguntas completas; si eliges tarjetas, incluye varias tarjetas; si eliges clasificación, incluye suficientes elementos para clasificar; si eliges intruso, el contraste debe ser claro; si eliges actividad motriz, la instrucción debe ser concreta y realizable.',
        '41. Distribuye la evaluación entre varios contenidos enseñados y no concentres todos los juegos en un solo subtema si la lección explicó varios elementos importantes.',
        '42. Si la lección enseñó varios componentes importantes del tema, procura que los juegos los distribuyan y no repitan siempre la misma idea.',


        'SELECCIÓN DE JUEGOS:',
        `Debes generar EXACTAMENTE ${numJuegos} juegos.`,
        'Elige entre tipos A, B, C, D y E según lo más adecuado pedagógicamente para el tema.',
        'No uses siempre los mismos tipos.',
        '',
        'CRITERIOS DE TIPOS DE JUEGO:',
        '- Tipo A: clasificación cuando haya categorías claras. Debe incluir suficientes elementos para que clasificar tenga sentido.',
        '- Tipo B: selección múltiple para comprensión de conceptos ya enseñados. Debe incluir varias preguntas completas con opciones plausibles.',
        '- Tipo C: tarjetas para vocabulario, partes, autores o términos clave ya explicados. Debe incluir varias tarjetas suficientes para reforzar memoria y comprensión.',
        '- Tipo D: intruso cuando uno no pertenezca claramente al grupo. El contraste debe ser claro y pedagógicamente útil.',
        '- Tipo E: actividad motriz o en cuaderno para aplicación concreta. Debe tener una instrucción clara, específica y realizable.',
        '',
        'REGLAS CRÍTICAS:',
        '- Todo juego debe alinearse con la explicación principal.',
        '- Si algo no fue enseñado, no puede evaluarse.',
        '- Cada respuesta correcta de los juegos debe poder encontrarse o inferirse directamente a partir de la explicación principal.',
        '- No conviertas los juegos en una evaluación de conocimientos no enseñados.',
        '- Usa el interés motivacional para contextualizar, pero no deformes el contenido académico.',
        '- Si un juego o ejemplo menciona un elemento específico del tema (por ejemplo un planeta, autor, órgano, organelo, categoría o personaje histórico), ese elemento debe haber sido explicado antes de forma explícita.',
        '- Si el tema es un sistema, conjunto o lista escolar cerrada, no omitas elementos esenciales del contenido que deberían formar parte de la explicación.',
        '- El array juegos debe contener exactamente el número solicitado y cada juego debe estar completamente desarrollado.',
        '- Un juego incompleto cuenta como incorrecto: no omitas preguntas, tarjetas, items, opciones o instrucciones necesarias según el tipo elegido.',
        '- Los juegos deben cubrir varios contenidos enseñados cuando la lección abarque más de un elemento importante.',
        '- La estructura interna de cada juego debe coincidir exactamente con el tipo elegido para que pueda renderizarse correctamente en la interfaz.',
        '',
        'Responde SOLO con este JSON válido, sin texto fuera:',
        'IMPORTANTE: Los arrays conceptosClave, pasos, chequeoCobertura, contenidosEnsenados y contenidosEvaluables deben incluir tantos elementos como el tema necesite. No los dejes artificialmente cortos.',
        'IMPORTANTE: Si el tema incluye elementos con nombre propio que luego puedan aparecer en ejemplos o juegos, esos elementos deben estar presentes y explicados en conceptosClave o en la explicación principal.',
        'IMPORTANTE: Si una categoría principal del tema contiene elementos identificables y enseñables, no la dejes resumida como grupo general; nombra sus elementos principales.',
        'IMPORTANTE: Si el tema es un sistema, conjunto o lista cerrada de elementos esenciales, la explicación debe incluir todos esos elementos y no una selección parcial.',
        `IMPORTANTE: Debes generar EXACTAMENTE ${numJuegos} juegos en el array "juegos".`,
        'IMPORTANTE: Cada juego debe venir completo según su tipo y con contenido suficiente para evaluar aprendizaje real.',
        'IMPORTANTE: No dejes los juegos mínimos, vacíos o demasiado resumidos.',
        'IMPORTANTE: Cada juego debe respetar exactamente la estructura del tipo elegido, incluyendo todos sus campos obligatorios.',
        'IMPORTANTE: Si eliges tipo B debes incluir preguntas; si eliges tipo C debes incluir tarjetas; si eliges tipo A o D debes incluir items; si eliges tipo E debes incluir actividad y su validación.',
        estructuraJson,
        'ESTRUCTURAS OBLIGATORIAS DE JUEGOS:',
        `TIPO A: { "tipo": "A", "instruccion": "...", "categoria1": { "nombre": "...", "icono": "star" }, "categoria2": { "nombre": "...", "icono": "circle" }, "items": [ { "texto": "...", "icono": "zap", "categoriaCorrecta": 1 } ] }`,
        `TIPO B: { "tipo": "B", "instruccion": "...", "preguntas": [ { "pregunta": "...", "opciones": [ { "texto": "...", "correcta": true }, { "texto": "...", "correcta": false }, { "texto": "...", "correcta": false } ] } ] }`,
        `TIPO C: { "tipo": "C", "instruccion": "...", "tarjetas": [ { "pregunta": "...", "respuesta": "...", "pista": "...", "alternativas": [] } ] }`,
        `TIPO D: { "tipo": "D", "instruccion": "...", "items": [ { "texto": "...", "icono": "star", "esIntruso": false }, { "texto": "...", "icono": "cloud", "esIntruso": true } ] }`,
        `TIPO E: { "tipo": "E", "instruccion": "...", "actividad": "...", "tipoValidacion": "exacta | ia | confirmacion", "respuestaEsperada": "", "criterios": "", "mensajeMotor": "..." }`,
    ].join('\n');
}





/** Genera la sesión de texto con GPT-4o */
async function generarSesionTexto(perfil: PerfilNino, apiKey: string): Promise<SesionGenerada> {
    const prompt = buildPrompt(perfil);

    console.log('🟡 buildPrompt length:', prompt.length);
    console.log('🟡 buildPrompt preview:', prompt.slice(0, 1500));

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            max_tokens: 3500,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt },
            ],
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        console.error('🔴 Error OpenAI status:', res.status);
        console.error('🔴 Error OpenAI raw:', errText);
        throw new Error(`Error de OpenAI (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content || '{}';

    console.log('🟢 rawContent preview:', rawContent.slice(0, 1500));

    try {
        return JSON.parse(rawContent) as SesionGenerada;
    } catch (error) {
        console.error('🔴 JSON parse error:', error);
        console.error('🔴 rawContent completo:', rawContent);
        throw new Error('No se pudo interpretar la respuesta de la IA. Intenta nuevamente.');
    }
}

/** Busca imagen en Wikipedia para temas científicos — precisa y libre de derechos */
/** Traducción simple ES → EN (puedes mejorarla luego con IA si quieres) */
async function traducirTema(tema: string, apiKey: string): Promise<string> {
    try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                max_tokens: 20,
                messages: [{
                    role: 'user',
                    content: `Translate this educational topic to English. Reply with ONLY the translation, nothing else: "${tema}"`
                }],
            }),
        });
        const data = await res.json();
        
        return data.choices?.[0]?.message?.content?.trim().replace(/"/g, '') || tema;
    } catch {
        return tema;

    }
}

/** Construye query pedagógica */
async function construirQueryCientifica(tema: string, apiKey: string): Promise<string> {
    const temaEn = await traducirTema(tema, apiKey);
    console.log("🌐 Tema traducido:", temaEn);
    return `${temaEn} diagram`;
}


/** Busca imagen en Wikimedia Commons con URL de thumbnail para evitar CORS */
async function obtenerImagenCientifica(tema: string, apiKey: string): Promise<string | null> {
    console.log("🔬 Buscando imagen científica para:", tema);
    try {
        const query = await construirQueryCientifica(tema, apiKey);
        
        console.log("🔍 Query Wikimedia:", query);
        // Usamos iiurlwidth para obtener thumbnail — esto evita el problema de CORS
        const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=20&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=800&format=json&origin=*`;
        const res = await fetch(url);
        const data = await res.json() as WikimediaApiResponse;

        if (!data.query?.pages) return null;

        const pages = Object.values(data.query.pages);
        console.log("📦 Raw pages:", JSON.stringify(pages.slice(0, 2)));

        // Usamos thumburl en lugar de url directa
        const candidatos = pages
            .map(p => {
                const title = p.title.toLowerCase();
                const info = p.imageinfo?.[0];
                const thumburl = info?.thumburl; // ← esta es la clave
                const mime = info?.mime;

                if (!thumburl) return null;
                console.log("📄 mime:", mime, "| thumburl:", thumburl?.slice(0, 60));

                
                if (!['image/svg+xml', 'image/png', 'image/jpeg'].includes(mime ?? '')) return null;

                let score = 0;

                // POSITIVO
                if (title.includes("diagram")) score += 2;
                if (title.includes("labeled")) score += 3;
                if (title.includes("structure")) score += 5; // ← sube a 5
                if (title.includes("svg")) score += 2;
                if (title.includes("scheme")) score += 2;
                if (title.includes("education")) score += 6;
                if (title.includes("illustration")) score += 2;
                if (title.includes("color")) score += 3;
                if (title.includes("colour")) score += 3;
                if (title.includes("-en")) score += 3; // ← nuevo: prefiere versión en inglés etiquetada


                // NEGATIVO
                if (title.includes("histology")) score -= 3;
                if (title.includes("microscopy")) score -= 3;
                if (title.includes("blank")) score -= 3;
                if (title.includes("unlabeled")) score -= 3;
                if (title.includes("simple")) score -= 4; // ← penaliza diagramas simples/minimalistas
                if (title.includes("numbers")) score -= 4; // ← penaliza los de solo números sin etiquetas
                if (title.includes("turgor")) score -= 5; // ← muy específico

                return { url: thumburl, score, title };
            })
            .filter((p): p is RankedImage => p !== null)
            .sort((a, b) => b.score - a.score);

        console.log("Top imágenes Wikimedia:", candidatos.slice(0, 3));
        return candidatos[0]?.url ?? null;

    } catch (e) {
        console.error("Error buscando imagen científica:", e);
        return null;
    }
}




/** Construye prompt DALL-E pedagógico por asignatura y condición */
function buildDallePrompt(
    perfil: PerfilNino,
    visual?: ExplicacionBloque['visualSugerido']
): string {
    const tema = perfil.tema;
    const edad = perfil.edad;
    const interes = interesLabels[perfil.interes] || perfil.interes;
    const condicion = perfil.condicion;
    const asignatura = perfil.asignatura;

    const visualTipo = visual?.tipo || 'ninguna';
    const visualDescripcion = visual?.descripcion?.trim() || '';
    const visualJustificacion = visual?.justificacionPedagogica?.trim() || '';

    const noText = 'ABSOLUTELY NO TEXT, NO LETTERS, NO WORDS, NO NUMBERS, NO LABELS anywhere in the image.';
    const noDecor = 'No decorative backgrounds, no random objects, no fantasy fillers, no atmospheric embellishment, no irrelevant elements.';
    const educationalOnly = 'This must look like a school support visual, not like decorative children art. Every visible element must improve understanding of the topic.';

    const estiloBase =
        condicion === 'tea'
            ? 'clean flat educational illustration, minimal visual clutter, soft muted colors, highly predictable composition, few clearly separated elements'
            : condicion === 'down'
                ? 'bold flat educational illustration, very large simple shapes, bright friendly colors, high contrast, clear figure-ground separation'
                : condicion === 'dislexia'
                    ? 'flat educational illustration, high contrast, bold outlines, visually distinct elements, uncluttered composition'
                    : condicion === 'tdah'
                        ? 'clear educational illustration, visually engaging but not overloaded, strong focal hierarchy, vivid but organized colors'
                        : 'flat educational illustration, clean composition, clear elements, simple academic style';

    const tipoInstruction =
        visualTipo === 'diagrama'
            ? 'Create a structured educational diagram. Show the essential parts, categories, positions or relationships in a visually organized way.'
            : visualTipo === 'secuencia'
                ? 'Create a visual sequence. Show the steps, stages or transformations in a clear order that can be understood without text.'
                : visualTipo === 'comparacion'
                    ? 'Create a side-by-side educational comparison. Make the contrast between the two concepts or groups visually clear.'
                    : visualTipo === 'escena'
                        ? 'Create a realistic educational scene only if the scene helps explain usage, context, action or situation related to the topic.'
                        : visualTipo === 'pictograma'
                            ? 'Create a very simple educational pictogram-style visual with concrete, recognizable and highly simplified elements.'
                            : 'Create only the minimum visual support strictly needed for comprehension.';

    const asignaturaInstruction =
        asignatura === 'ciencias'
            ? 'For science topics, prioritize structure, system, process, parts or spatial relationships.'
            : asignatura === 'ingles'
                ? 'For English topics, prioritize use in context, action, daily situations or communicative meaning rather than abstract symbolic art.'
                : asignatura === 'lenguaje'
                    ? 'For language topics, avoid generic literary scenes. Use visual support only if it clarifies contrast, structure, form or communicative context.'
                    : asignatura === 'matematicas'
                        ? 'For math topics, use concrete, countable or visibly grouped elements only when they truly help understand the concept.'
                        : asignatura === 'historia'
                            ? 'For history topics, prioritize contextual accuracy, relevant setting, objects or relationships, avoiding cinematic or decorative style.'
                            : asignatura === 'sociales'
                                ? 'For social studies topics, prioritize systems, roles, context, relationships or comparisons.'
                                : asignatura === 'arte'
                                    ? 'For art topics, prioritize technique, material, form or visual contrast needed for instruction.'
                                    : asignatura === 'ed_fisica'
                                        ? 'For physical education topics, prioritize posture, movement, sequence or action clarity.'
                                        : 'Prioritize conceptual clarity over aesthetics.';

    const interesInstruction =
        visualTipo === 'escena' || visualTipo === 'pictograma'
            ? `Use the child's motivational interest "${interes}" only if it helps the topic logically and does not distract from the academic goal.`
            : `Do not force the child's motivational interest "${interes}" into the image unless it clearly improves understanding.`;

    const partes = [
        noText,
        educationalOnly,
        noDecor,
        `Topic: "${tema}".`,
        `Child age: ${edad}.`,
        `Visual support type: ${visualTipo}.`,
        tipoInstruction,
        asignaturaInstruction,
        visualDescripcion ? `Useful visual guidance: ${visualDescripcion}.` : '',
        visualJustificacion ? `Pedagogical reason: ${visualJustificacion}.` : '',
        interesInstruction,
        estiloBase,
        'Use a plain or neutral background if needed.',
        'Keep the composition simple, readable and instruction-focused.',
    ].filter(Boolean);

    return partes.join(' ');
}

/** Genera imagen DALL-E 3 pedagógica para todos menos ciencias*/
async function generarImagenLeccion(
    perfil: PerfilNino,
    apiKey: string,
    visual?: ExplicacionBloque['visualSugerido']
): Promise<string | null> {
    const prompt = buildDallePrompt(perfil, visual);

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

        if (!res.ok) {
            const errText = await res.text();
            console.error('🔴 Error generando imagen:', errText);
            return null;
        }

        const data = await res.json();
        return data.data?.[0]?.url ?? null;
    } catch (error) {
        console.error('🔴 Excepción generando imagen:', error);
        return null;
    }
}
/** Genera la sesión completa: texto + imagen en paralelo */
export async function generarSesion(perfil: PerfilNino): Promise<SesionGenerada> {
    const apiKey = getApiKey();

    // 1. Generar primero la sesión de texto
    const sesion = await generarSesionTexto(perfil, apiKey);

    // 2. Leer visual sugerido desde la explicación principal
    let visualSugerido: ExplicacionBloque['visualSugerido'] | undefined = undefined;
    let visualTipo = 'ninguna';

    if (sesion.explicacion && typeof sesion.explicacion === 'object') {
        const bloque = sesion.explicacion as ExplicacionBloque;
        visualSugerido = bloque.visualSugerido;
        visualTipo = bloque.visualSugerido?.tipo || 'ninguna';
    }

    console.log('🖼️ visualSugerido:', visualSugerido);
    console.log('🖼️ visualTipo:', visualTipo);

    // 3. Solo generar imagen si realmente hay apoyo visual útil
    let imagenUrl: string | null = null;

    if (visualTipo !== 'ninguna') {
        imagenUrl = perfil.asignatura === 'ciencias'
            ? await obtenerImagenCientifica(perfil.tema, apiKey)
            : await generarImagenLeccion(perfil, apiKey, visualSugerido);
    }

    // 4. Guardar en localStorage
    guardarSesionLocal({
        nombre: perfil.nombre,
        edad: perfil.edad,
        grado: perfil.grado,
        condicion: perfil.condicion,
        asignatura: perfil.asignatura,
        tema: perfil.tema,
        interes: perfil.interes,
        aciertos: 0,
        errores: 0,
        duracion: 0,
        emocionDelta: 0,
    });
    console.log('🎮 juegos generados:', sesion.juegos);
    // 5. Devolver sesión final
    return {
        ...sesion,
        imagenUrl: imagenUrl ?? undefined,
    };
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

/** Función de guardado local de lecciones localstorage */
function guardarSesionLocal(session: any) {
    console.log("🔥 GUARDANDO SESION", session);
    try {
        const existing = localStorage.getItem("sessions");
        const sessions = existing ? JSON.parse(existing) : [];

        sessions.push({
            ...session,
            id: Date.now(),
            fecha: new Date().toISOString(),
        });

        localStorage.setItem("sessions", JSON.stringify(sessions));
    } catch (error) {
        console.error("Error guardando sesión:", error);
    }
}

// 👉 Leer sesiones desde localStorage
export function obtenerSesiones() {
    try {
        const data = localStorage.getItem("sessions");
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error obteniendo sesiones:", error);
        return [];
    }
}

