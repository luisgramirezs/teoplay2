import { PerfilNino, SesionGenerada, ExplicacionBloque, Idioma, TipoOracion } from '@/types';
import { buildOperationalProfile, renderOperationalProfileBlock } from '../utils/profilePrompt';




// =====================
// TIPOS WIKIMEDIA (legacy — mantenidos por compatibilidad)
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

function buildPrompt(perfil: PerfilNino, escenaGramatical?: { url: string; descripcion: string } | null): string {
    const nombre = perfil.nombre || 'el niño';
    const idioma = perfil.idioma === 'es' ? 'Español' : 'English';
    const condicion = condicionLabels[perfil.condicion] || perfil.condicion;
    const asignatura = asignaturaLabels[perfil.asignatura] || perfil.asignatura;
    const numJuegos = perfil.edad <= 7 ? 2 : perfil.edad <= 10 ? 3 : 4;

    const pn = perfil.perfilNeuroeducativo;
    const perfilOperativo = buildOperationalProfile(pn);

    console.log('🟣 perfilOperativo:', perfilOperativo);

    const perfilBloque = renderOperationalProfileBlock(nombre, perfilOperativo, condicion);

    const estructuraJson = `
    {
      "numeroJuegos": ${numJuegos},
      "tipoLeccion": "procedimiento_matematico | observacion_experimental | formula_gramatical | clasificacion_conceptual | secuencia_biologica | descripcion_conceptual",
      "materiales": {
        "requiereMateriales": true,
        "lista": ["objeto real 1", "objeto real 2"],
        "justificacion": "Por qué estos materiales ayudan a comprender este tema"
      },
      "explicacion": {
        "objetivo": "Nivel 1: versión esencial en ${idioma}.",
        "intro": { "fraseEnganche": "", "cuerpo": "" },
        "conceptosClave": [
          {
            "nombre": "",
            "etiqueta": "",
            "explicacionSimple": "",
            "funcion": "",
            "uso": "",
            "necesidad": "",
            "formula": "",
            "elementos": "",
            "componentes": "",
            "miembros": "",
            "ejemploPedagogico": "",
            "practicaDirigida": "",
            "fragmentoEnOracion": "",
            "icono": "",
            "colorRamp": "gray",
            "tipoEntidad": "persona | lugar | evento | objeto | proceso",
            "fraseVisual": ""
          }
        ],
 
        "pasos": [""],
        "visualSugerido": {
          "tipo": "ninguna",
          "icono": "",
          "colorRamp": "gray",
          "descripcion": "",
          "justificacionPedagogica": ""
        },
        "chequeoCobertura": [""],
        "analogia": "",
        "ejemplos": [
          {
            "enunciado": "",
            "requiereProcedimiento":"",
            "explicacionBreve": "",
        "pasosGuiados": [
          {
            "numeroPaso": 1,
            "accionPrincipal": "descripción clara del paso",
            "explicacion": "por qué se hace este paso",
            "resultadoParcial": "resultado numérico de este paso",
            "vinculoConcepto": ""
          }
          // TODOS los pasos hasta resolver completamente
        ],
        "conclusionPedagogica": "Resultado final: X = Y"



        ejemplosVisuales: [
          {
            titulo: string,
            autor: string,
            descripcion: string,
            tipo: string,
            query: string;
          }
        ]


        "apoyoGramatical": {
          "titulo": "",
          "idioma": "",
          "tipoOracion": "afirmativa | negativa | interrogativa",
          "piezas": [
            { "rol": "", "valores": [{ "texto": "", "correspondeA": "" }], "etiqueta": "", "color": "orange | blue | green | purple | pink | teal", "posicion": 1 }
          ],
          "reglas": [""],
          "ejemplos": [
            { "oracion": "", "traduccion": "" }
          ],
          "nota": ""
        }

        "apoyoVisual": {
          tipo: 'formula' | 'flujo' | 'nodos' | 'linea_tiempo' | 'ciclo' | 'reparto'
            | 'fraccion' | 'recta_numerica' | 'geometria' | 'agrupacion'
            | 'fuerzas' | 'molecula' | 'reaccion';

          "titulo": "",
          "elementos": [],
          "items": [],
          "asignatura": ""
        },
        "resumen": ""
      },


      "explicacionAlternativa1": {
        "objetivo": "Nivel 2: versión desarrollada en ${idioma}.",
        "intro": { "fraseEnganche": "", "cuerpo": "" },
        "conceptosClave": [
         {
            "nombre": "",
            "etiqueta": "",
            "explicacionSimple": "",
            "funcion": "",
            "uso": "",
            "necesidad": "",
            "formula": "",
            "elementos": "",
            "componentes": "",
            "miembros": "",
            "ejemploPedagogico": "",
            "practicaDirigida": "",
            "fragmentoEnOracion": "",
            "icono": "",
            "colorRamp": "gray",
            "tipoEntidad": "persona | lugar | evento | objeto | proceso",
            "fraseVisual": ""
          }
        ],

        "pasos": [],
        "visualSugerido": {},
        "chequeoCobertura": [],
        "analogia": "",
        "ejemplos": [],
        "apoyoGramatical": {
          "titulo": "",
          "idioma": "",
          "tipoOracion": "afirmativa | negativa | interrogativa",
          "piezas": [
            { "rol": "", "valores": [{ "texto": "", "correspondeA": "" }], "etiqueta": "", "color": "orange | blue | green | purple | pink | teal", "posicion": 1 }
          ],
          "reglas": [""],
          "ejemplos": [
            { "oracion": "", "traduccion": "" }
          ],
          "nota": ""
        }

        "apoyoVisual": {},
        "resumen": ""
      },
      "explicacionAlternativa2": {
        "objetivo": "Nivel 3: versión ampliada en ${idioma}.",
        "intro": { "fraseEnganche": "", "cuerpo": "" },
        "conceptosClave": [
         {
            "nombre": "",
            "etiqueta": "",
            "explicacionSimple": "",
            "funcion": "",
            "uso": "",
            "necesidad": "",
            "formula": "",
            "elementos": "",
            "componentes": "",
            "miembros": "",
            "ejemploPedagogico": "",
            "practicaDirigida": "",
            "fragmentoEnOracion": "",
            "icono": "",
            "colorRamp": "gray",
            "tipoEntidad": "persona | lugar | evento | objeto | proceso",
            "fraseVisual": ""
          }
        ],

        "pasos": [],
        "visualSugerido": {},
        "chequeoCobertura": [],
        "analogia": "",
        "ejemplos": [],

        "apoyoGramatical": {
          "titulo": "",
          "idioma": "",
          "tipoOracion": "afirmativa | negativa | interrogativa",
          "piezas": [
            { "rol": "", "valores": [{ "texto": "", "correspondeA": "" }], "etiqueta": "", "color": "orange | blue | green | purple | pink | teal", "posicion": 1 }
          ],
          "reglas": [""],
          "ejemplos": [
            { "oracion": "", "traduccion": "" }
          ],
          "nota": ""
        }

        "apoyoVisual": {},
        "resumen": ""
      },

       "pertinencia": {
          "importancia": "",
          "utilidadVida": "",
          "mundoReal": ""
        }


      "mapaPedagogico": {
        "contenidosEnsenados": [""],
        "contenidosEvaluables": [""]
      },
      "juegos": [
        {
          "tipo": "A | B | C | D | E",
          "instruccion": "Texto del juego"
        }
      ],
      "mensajesMotivacionales": [""],
      "mensajeCierre": "",
      "recomendaciones": [""]
    }
    `.trim();

    const prompt = [
        perfilBloque,
        '',
        'Genera una sesión de aprendizaje completa, clara y adaptada al perfil del niño.',
        `Nombre: ${nombre}`,
        `Edad: ${perfil.edad} años`,
        `Grado: ${perfil.grado}`,
        `Condición: ${condicion}`,
        `Asignatura: ${asignatura}`,
        `Tema: ${perfil.tema}`,
        `Objetivo de aprendizaje: ${perfil.objetivo}`,
        ...(perfil.recursoContexto ? [`Recurso o contexto pedagógico: ${perfil.recursoContexto}`] : []),
        `Idioma: ${idioma}`,
        '',
        'INSTRUCCIONES PEDAGÓGICAS OBLIGATORIAS:',
        `0. El "Objetivo de aprendizaje" delimita el alcance real de esta lección. Si el objetivo acota una porción del tema "${perfil.tema}", las reglas de completitud (1 a 11, "cubre TODO el tema") quedan subordinadas a ese objetivo: NO generes "conceptosClave", "ejemplos", "apoyoGramatical" ni "juegos" que excedan lo que el objetivo pide cubrir. Si el objetivo no acota nada (pide el tema completo), aplica las reglas de completitud sin restricción.`,
        `0b. Si se especifica un "Recurso o contexto pedagógico", úsalo SOLO para ambientar ejemplos y analogías dentro del contenido — nunca como concepto a evaluar en "conceptosClave" ni en los juegos, y nunca como parte del alcance del objetivo, salvo que el "Objetivo de aprendizaje" lo mencione explícitamente.`,
        ...(escenaGramatical ? [
          `0d. IMPORTANTE — ya existe una imagen de apoyo preparada para esta lección, que representa la escena: "${escenaGramatical.descripcion}". La oración de "apoyoGramatical.ejemplos[0].oracion" DEBE describir EXACTAMENTE esa escena — no inventes una escena distinta. Todos los demás ejemplos, "fragmentoEnOracion" y contenido relacionado deben ser coherentes con esa misma escena.`
        ] : []),
        `1. Antes de generar, identifica todo lo que el niño necesita aprender sobre "${perfil.tema}".`,
        `2. Descompón el tema en sus componentes, partes, etapas, miembros o elementos esenciales.`,
        `3. En "conceptosClave" debes incluir TODAS las partes fundamentales del tema. No devuelvas un solo concepto general si el tema puede dividirse pedagógicamente.`,
        `4. Cada objeto de "conceptosClave" debe representar una unidad enseñable, clara y visual.`,
        `5. Si el tema es una secuencia o ciclo, incluye cada etapa importante por separado.`,
        `6. Si el tema es una clasificación o estructura, incluye cada componente principal por separado.`,
        `7. Si el tema es una fórmula o procedimiento, incluye cada elemento indispensable por separado.`,
        `8. No omitas partes esenciales por simplificar demasiado.`,
        `9. SIEMPRE usa los "componentes", "miembros", "elementos" y "formula" de forma completa.`,
        `10. Ejemplos de completitud esperada:`,
        `   - "ciclo del agua" -> evaporación, condensación, precipitación, acumulación.`,
        `   - "sistema solar" -> Sol y todos los planetas principales; si aplica, también lunas, asteroides y cometas.`,
        `   - "suma de fracciones" -> numerador, denominador, denominador común, fracciones equivalentes, suma y simplificación si aplica.`,
        `   - "presente continuo" -> sujeto, verbo to be, verbo principal + ing, complemento o contexto.`,
        `   - "La gran Colombia " -> Todos los paises que fueron miembros, periodo de existencia, presidentes.`,
        `11. No simplifiques en exceso si el perfil permite mayor profundidad.`,
        `12. Genera lecciones estructuradas con andamiaje y adapta la carga cognitiva.`,
        `13. visualSugerido solo debe usarse si aporta comprensión real.`,
        `14. apoyoVisual es OBLIGATORIO a nivel de explicacion, explicacionAlternativa1 y explicacionAlternativa2. Nunca dentro de conceptosClave.`,
        `14b. "explicacionAlternativa1" debe tener los MISMOS conceptosClave que "explicacion" pero con explicacionSimple más detallada, más ejemploPedagogico. NUNCA vacío.`,
        `14c. "explicacionAlternativa2" debe tener los MISMOS conceptosClave que "explicacion" pero con máximo detalle, casos de uso reales, conexiones con otros temas. NUNCA vacío.`,
        `14d. Los tres niveles (explicacion, explicacionAlternativa1, explicacionAlternativa2) DEBEN tener conceptosClave completos. Está prohibido devolver conceptosClave vacío en cualquiera de los tres.`,
        `14e. Para asignatura matemáticas o física o química: usa preferentemente tipos "fraccion", "recta_numerica", "geometria", "agrupacion", "fuerzas", "molecula" o "reaccion" según el tema.`,
        `14f. Para asignatura artes o sociales: apoyoVisual puede omitirse (tipo "ninguna") porque se usan imágenes reales de Wikimedia.`,
        `14g. Para asignatura ciencias: usa tipos de ciclo, flujo o nodos para procesos; y deja que Wikimedia aporte la imagen real complementaria.`,
        `15. Genera EXACTAMENTE ${numJuegos} juegos.`,
        `16. Los juegos no pueden evaluar contenido que no haya sido enseñado.`,
        `17. "mapaPedagogico.contenidosEnsenados" debe reflejar exactamente lo enseñado en conceptosClave, pasos, ejemplos y apoyoVisual.`,
        `18. "ejemplosVisuales" DEBE contener entre 3 y 5 obras, artefactos o elementos visuales REALES Y ESPECÍFICOS del tema "${perfil.tema}" en la asignatura "${asignatura}".`,
        `19. Cada "titulo" debe ser el nombre EXACTO y conocido de una obra, escultura, manuscrito, pintura, artefacto o monumento real — como aparece en Wikipedia o Wikimedia Commons.`,
        `20. El campo "query" debe ser ese mismo nombre exacto, preferiblemente en el idioma en que está indexado en Wikimedia (inglés o español según corresponda).`,
        `21. NUNCA uses títulos genéricos como "Arte prehispánico I" o queries como "arte barroco pintura famosa". Siempre nombre específico.`,
        `22. Ejemplos para arte prehispánico: "Calendario Azteca", "Sacerdote huasteco del dios del viento", "Disco de la Muerte Maya", "Vasija Nazca", "Estela de Copán".`,
        `23. Ejemplos para arte barroco: "Las Meninas Velázquez", "La ronda nocturna Rembrandt", "Éxtasis de Santa Teresa Bernini".`,
        `24. Si el tema es científico o histórico, usa imágenes de fenómenos, mapas históricos, fotografías de experimentos o elementos reales buscables en Wikimedia.`,
        `25. "ejemplosVisuales" SOLO debe generarse si la asignatura es: artes, sociales, historia o ciencias. Para matemáticas, inglés, francés, lenguaje, física, química, ed_física y tecnología: devuelve "ejemplosVisuales": [] (arreglo vacío).`,
        `26. Para asignatura inglés o francés o lenguaje con temas gramaticales: usa tipo "estructura_oracion" en apoyoVisual, NO "formula".`,
        `27. "apoyoGramatical" es OBLIGATORIO si la asignatura es inglés, francés, español o lenguaje Y el tema es una estructura gramatical (tiempo verbal, tipo de oración, conjugación, etc.).`,
        `27b. Los valores de "apoyoGramatical" (piezas, reglas, ejemplos) deben corresponder EXCLUSIVAMENTE a la estructura gramatical del tema de ESTA lección. Nunca reutilices vocabulario, roles o ejemplos de otra estructura gramatical distinta a la indicada en "Tema" (ej. no mezcles presente perfecto con pasado simple, ni subjuntivo con indicativo, salvo que el tema lo pida explícitamente).`,
        `27c. Cuando la asignatura sea de idioma (inglés, francés, español, lenguaje) Y el tema sea una estructura gramatical (misma condición de la regla 27): "explicacionSimple" de cada conceptoClave relacionado con esa estructura DEBE ser una definición declarativa y funcional en una sola frase, sin metáfora, con sintaxis simple (ej. "El sujeto es quien realiza la acción de la oración"), seguida en la misma o siguiente frase de una heurística de detección accionable que el niño pueda aplicar (ej. "Pregúntate: ¿quién hace la acción?"). Nunca dejes que el niño infiera el rol solo a partir de un ejemplo sin definirlo antes.`,
        `27d. Bajo la misma condición de la regla 27c: "ejemploPedagogico" debe contener EXACTAMENTE 2 a 3 ejemplos concretos, contrastivos en superficie (vocabulario, sujeto o número distinto) pero idénticos en la estructura gramatical enseñada — nunca una sola oración a interpretar, nunca más de 3. Al menos uno de los ejemplos debe anclarse en una acción o situación concreta y reconocible, no abstracta.`,
        `27e. Bajo la misma condición: cada conceptoClave debe incluir "practicaDirigida", un micro-ejercicio de transformación dirigida de UNA sola variable (ej. "Cambia esta oración de presente a pasado: ...") — NUNCA producción abierta libre (ej. nunca "escribe una oración con..."). Si el ejercicio apela a la relevancia personal del niño (ej. "piensa en algo que hiciste ayer"), SIEMPRE incluye también 2 o 3 escenarios preseleccionados como alternativa, para quien no pueda generar una idea propia en el momento. Para cualquier asignatura que no sea de idioma, o temas no gramaticales, deja "practicaDirigida" vacío ("").`,
        `27f. Bajo la misma condición: "nombre" de cada conceptoClave DEBE usar exactamente el mismo término que "apoyoGramatical.piezas[].rol" para el rol equivalente (mismo idioma de redacción, mismo texto literal) — esto permite conectar cada concepto con su pieza gramatical correspondiente. Nunca uses sinónimos, traducciones o variantes de fraseo entre ambos campos.`,
        `27g. Bajo la misma condición: cada conceptoClave debe incluir "fragmentoEnOracion" — la palabra o frase EXACTA (subcadena literal, carácter por carácter, sin reformular) que aparece dentro de "apoyoGramatical.ejemplos[0].oracion" y que instancia el rol de ese concepto. Ej.: si la oración es "I will visit my parents", el concepto "Sujeto" → fragmentoEnOracion: "I"; "Auxiliar" → "will"; "Verbo principal" → "visit". Bajo esta misma condición, deja "ejemploPedagogico" vacío ("") — queda reemplazado por fragmentoEnOracion, para no generar contenido redundante que no se muestra.`,
        `28. Para "apoyoGramatical.piezas": incluye TODAS las partes de la estructura (sujeto, auxiliar, verbo principal, complemento, etc.) con sus valores reales del idioma.`,
        `28b. Cuando el rol de una pieza sea de tipo pronombre/sujeto, "piezas[].valores" DEBE incluir el paradigma pronominal personal COMPLETO del idioma que se enseña — para inglés, como mínimo: I, you, he, she, it, we, they (7 formas, sin omitir ninguna, especialmente "they"). Para otros idiomas, el paradigma equivalente completo.`,
        `29. "piezas[].valores[].texto" debe contener ejemplos concretos y reales del idioma — no descripciones abstractas. Cada "texto", SIN EXCEPCIÓN, debe incluir su traducción entre paréntesis al final, en el idioma de instrucción del niño (ej. "I (yo)", "you (tú)", "walked (caminó)") — nunca dejes un valor sin su traducción, ni siquiera algunos: debe ser 100% consistente en todos los valores de todas las piezas.`,
        `29b. "piezas[].valores[].correspondeA" se usa SOLO cuando los valores de esa pieza corresponden a distintos sujetos o condiciones (conjugación verbal, concordancia, alomorfos) — ej. pieza "verbo to be" con valores "am"/"is"/"are": cada uno debe llevar "correspondeA" con el sujeto exacto en el idioma enseñado ("I", "he / she / it", "you / we / they"), usando el mismo texto literal que la pieza de sujeto/pronombre equivalente, sin traducir de nuevo. Si varios valores comparten la misma condición (ej. "walks", "eats", "runs" con "he / she / it"), repite el mismo "correspondeA" en cada uno — el frontend los agrupa automáticamente. Si la pieza tiene valores libres sin condición (complemento, objeto), omite "correspondeA" o déjalo vacío en TODOS los valores de esa pieza — nunca parcialmente.`,
        `29c. La pieza de tipo sujeto/pronombre NUNCA debe llevar "correspondeA" en sus propios valores — jamás autorreferencial (ej. valor "you" con "correspondeA": "you" está PROHIBIDO). "correspondeA" representa una relación de concordancia que fluye DESDE la pieza que varía (verbo, auxiliar) HACIA el sujeto — nunca al revés. Deja "correspondeA" vacío u omitido en TODOS los valores de la pieza sujeto/pronombre, sin excepción.`,
        `29e. Si un auxiliar o verbo NO varía según el sujeto (ej. "did" en pasado simple interrogativo/negativo, invariante para I/you/he/she/it/we/they), esa pieza tampoco lleva "correspondeA" en ninguno de sus valores — no existe ninguna relación de concordancia real que representar. Nunca inventes una relación falsa solo para "completar" el campo: un campo vacío es preferible a una relación incorrecta, porque el Constructor de oraciones usa "correspondeA" para validar combinaciones — una relación falsa produce el rechazo de respuestas correctas.`,
        `30. "piezas[].etiqueta" debe explicar CUÁNDO o POR QUÉ se usa esa pieza — no solo nombrarla.`,
        `31. "apoyoGramatical.reglas" debe contener máximo 4 reglas claras, cortas y en el idioma de la lección.`,
        `32. "apoyoGramatical.ejemplos" debe contener entre 3 y 5 oraciones completas reales con su traducción.`,
        `33. "piezas[].color" debe rotar entre: "orange", "blue", "green", "purple", "pink", "teal" — uno distinto por pieza.`,
        `33b. "apoyoGramatical.tipoOracion" es OBLIGATORIO y debe ser "afirmativa", "negativa" o "interrogativa" según el tipo de oración que enseña el tema de esta lección. Si el tema no distingue tipo de oración explícitamente, usa "afirmativa" por defecto.`,
        `33c. "piezas[].posicion" es OBLIGATORIO y debe reflejar el orden gramatical REAL (1-indexado) de esa pieza dentro de "apoyoGramatical.ejemplos[0].oracion" — NUNCA el orden en que la pieza aparece en el array "piezas". Ej.: en la interrogativa "Do you like pizza?", "Auxiliar" (do) → posicion 1, "Sujeto" (you) → posicion 2, "Verbo principal" (like) → posicion 3, "Complemento" (pizza) → posicion 4.`,
        `33d. Cuando "tipoOracion" sea "negativa": "piezas" DEBE incluir una pieza de negación (rol "Negación" o equivalente en el idioma de la lección) con valores reales y traducidos (ej. "don't (no)", "doesn't (no)"), posicionada según el orden real del idioma enseñado (ej. inmediatamente después del auxiliar y antes del verbo principal).`,
        `33e. Cuando "tipoOracion" sea "interrogativa": el auxiliar (o el verbo invertido, según el idioma) debe tener "posicion": 1, antes del sujeto. Si la oración incluye palabra interrogativa (qué, dónde, cuándo, etc.), esa pieza debe tener "posicion": 1 y el resto de piezas se desplaza en consecuencia.`,
        `33f. Autoconsistencia obligatoria: el orden de las palabras en "apoyoGramatical.ejemplos[0].oracion" DEBE coincidir exactamente con el orden ascendente de "piezas[].posicion" de las piezas que instancian esa oración — nunca generes una "posicion" que contradiga el orden real de las palabras en el ejemplo.`,
        `34. Si la asignatura NO es de idioma: devuelve "apoyoGramatical": null.`,
        `35. "ejemplosVisuales" SOLO para asignaturas: artes, sociales, historia, ciencias. Para el resto: "ejemplosVisuales": [].`,
        `35. "ejemplosVisuales" es OBLIGATORIO y SIEMPRE debe tener entre 3 y 5 elementos para asignaturas: artes, sociales, historia, ciencias. NUNCA devolver array vacío para estas asignaturas.`,
        `35b. Cada elemento de "ejemplosVisuales" DEBE tener "titulo", "autor", "descripcion", "tipo" y "query" con valores reales — nunca strings vacíos.`,
        `35c. El "query" debe ser el nombre exacto buscable en Wikimedia Commons — específico, no genérico.`,
        `36. "pertinencia" va al nivel RAÍZ del JSON, no dentro de explicacion ni explicacionAlternativa. Es un campo único para toda la sesión.`,
        `37. "pertinencia.importancia": 2 frases simples sobre por qué este tema importa, para la edad del niño.`,
        `38. "pertinencia.utilidadVida": 2 frases concretas de cómo le sirve en su vida cotidiana.`,
        `39. "pertinencia.mundoReal": 1-2 ejemplos observables del tema en el mundo real.`,
        `40. Las tres respuestas de "pertinencia" usan lenguaje simple, positivo y motivador. Sin tecnicismos.`,
        `41. "pasosGuiados" en ejemplos de matemáticas, física y química DEBE contener TODOS los pasos necesarios para resolver el problema completamente, hasta obtener el resultado final.`,
        `42. NUNCA dejar un ejemplo matemático sin resolver. El último paso siempre debe mostrar el resultado final en "resultadoParcial".`,
        `43. Para multiplicación: incluir cada producto parcial por separado, luego la suma de productos parciales, luego el resultado final.`,
        `44. Para división: incluir cada paso de la división larga hasta obtener cociente y residuo.`,
        `45. Para fracciones: incluir simplificación si aplica.`,
        `46. "conclusionPedagogica" en ejemplos matemáticos SIEMPRE debe indicar el resultado final con el signo = y el valor. Ejemplo: "1234 × 5678 = 7,006,652"`,
        `47. Para fracciones usa tipo "fraccion". Para división larga usa tipo "reparto". NUNCA mezclar los dos.`,
        `48. El tipo "fraccion" solo muestra representaciones visuales de fracciones (círculos o rectángulos partidos). Nunca conceptos de división.`,

        '',
        'REGLAS ESPECÍFICAS PARA "conceptosClave":',
        `- Si el tema tiene partes visibles o nombrables, debes listarlas por separado.`,
        `- Si el tema tiene miembros de un conjunto, debes incluirlos completos cuando sean pedagógicamente necesarios.`,
        `- Si el tema tiene etapas, debes incluir la secuencia completa.`,
        `- Si el tema tiene una estructura, debes mostrar esa estructura completa.`,
        `- Evita conceptos vacíos, genéricos o redundantes.`,
        `- Cada concepto debe tener como mínimo: "nombre", "explicacionSimple", "icono" y una pista estructural útil entre "formula", "elementos", "componentes", "miembros", "uso" o "necesidad".`,
        `- "tipoEntidad" clasifica QUÉ ES el concepto para mejorar la búsqueda de su imagen: "persona" (figura real con nombre propio: Gaitán, Newton, un autor), "lugar" (sitio geográfico o edificio), "evento" (suceso puntual: batalla, revolución), "objeto" (cosa física, órgano, instrumento, artefacto), "proceso" (fenómeno, ciclo, procedimiento). Elige el más específico; usa "persona" únicamente cuando sea un nombre propio real, no un cargo o grupo.`,
        `- "fraseVisual" es OBLIGATORIA en inglés cuando "tipoEntidad" sea "evento" o "proceso" y el nombre del concepto sea abstracto o genérico (ej. "Causas", "Consecuencias", "Impacto", "Desarrollo", "Fermentación"). Debe describir una escena, lugar o momento concreto y fotografiable — 2 a 5 palabras — NUNCA una traducción o paráfrasis del nombre del concepto. Si el concepto ya es concreto y visual por sí mismo, deja "fraseVisual" vacío.`,
        '- Cada "conceptoClave" debe incluir "ejemploPedagogico":',
        '- Debe ser un ejemplo breve, concreto y útil para aterrizar el concepto.',
        '- Debe ser un ejemplo académico, concreto y aclaratorio del concepto.',
        '- No debe ser analogía ni metáfora.',
        '- No debe usar intereses del niño dentro de este campo, salvo que el tema lo requiera realmente.',
        '- Debe ayudar a estudiar el concepto con claridad y sin confusión.',
        '- No debe repetir la definición.',
        '- Debe ayudar al niño a visualizar o aplicar el concepto en contexto.',
        '- Si el concepto es lingüístico, usar ejemplos reales del idioma y su significado.',
        '- Si el concepto es científico, dar un dato o caso concreto que ayude a identificarlo.',
        '- Si el concepto es matemático, usar una situación simple con cantidades reales.',
        '- Si el concepto es una etapa de proceso, mostrar qué sucede en esa etapa con un caso entendible.',
        'Ejemplos de "ejemploPedagogico":',
        '- Sujeto -> "I = yo, you = tú, she = ella. Son quienes realizan la acción."',
        '- Verbo to be -> "I am, he is, they are. Cambia según quién hace la acción."',
        '- Sol -> "Es la estrella principal del sistema solar y nos da luz y calor."',
        '- Tierra -> "Es el planeta donde vivimos y tiene aire, agua y vida."',
        '- Júpiter -> "Es un gigante gaseoso y el planeta más grande del sistema solar."',
        '- Dividendo -> "Si repartes 12 dulces entre 4 amigos, 12 es el dividendo."',
        '- Evaporación -> "Cuando el sol calienta el agua del mar, parte sube como vapor."',
        '',
        'Ejemplos de "fraseVisual" (solo para tipoEntidad "evento" o "proceso"):',
        '- Concepto "Causas" (tema "El Bogotazo") -> "Bogotá riot 1948" (NO "causes of the event": sigue siendo abstracto, no es una escena buscable)',
        '- Concepto "Consecuencias" (tema "Revolución Industrial") -> "Industrial Revolution factory smoke"',
        '- Concepto "Fermentación" (tema "Producción de queso") -> "cheese fermentation vat"',
        '',
        'Responde SOLO con este JSON válido, sin texto fuera:',
        estructuraJson,
        '',
        'ESTRUCTURAS OBLIGATORIAS DE JUEGOS:',
        `TIPO B: { "tipo": "B", "instruccion": "...", "preguntas": [ { "pregunta": "...", "opciones": [ { "texto": "...", "correcta": true }, { "texto": "...", "correcta": false }, { "texto": "...", "correcta": false } ] } ] }`,
        `TIPO D: { "tipo": "D", "instruccion": "...", "items": [ { "texto": "...", "icono": "star", "esIntruso": false }, { "texto": "...", "icono": "cloud", "esIntruso": true } ] }`,
        `TIPO E: { "tipo": "E", "instruccion": "...", "actividad": "...", "tipoValidacion": "exacta | ia | confirmacion", "respuestaEsperada": "", "criterios": "", "mensajeMotor": "..." }`,

    ].join('\n');


    return prompt;
}


/** Genera la sesión de texto con GPT-4o */
/** Genera la sesión completa: texto JSON + imagen infográfica pedagógica autónoma de DALL-E */
export async function generarSesion(
    perfil: PerfilNino,
    escenaGramatical?: { url: string; descripcion: string } | null
): Promise<SesionGenerada> {
    
    const prompt = buildPrompt(perfil, escenaGramatical);

    console.log('🟡 buildPrompt length:', prompt.length);

  
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            max_tokens: 12000,
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

    // Log temporal para verificar infografiaPedagogicaUrl
    try {
        const parsed = JSON.parse(rawContent);
        console.log('🔵 infografiaPedagogicaUrl:', parsed?.infografiaPedagogicaUrl);
    } catch (e) { console.log('❌ parse error'); }

    try {
        const sesion = JSON.parse(rawContent) as SesionGenerada;
        console.log("🟢 ejemplosVisuales:", sesion.ejemplosVisuales);

        // La imagen de apoyo gramatical ya se eligió ANTES de generar esta
        // sesión (Paso B) — se adjunta aquí para que GramaticalBlock la use
        // directo, sin tener que buscarla ni generarla de nuevo.
        if (escenaGramatical) {
            sesion.pictogramaGramaticalUrl = escenaGramatical.url;
        }

        // Guardar en localStorage
        guardarSesionLocal({
            nombre: perfil.nombre, edad: perfil.edad, grado: perfil.grado, condicion: perfil.condicion,
            asignatura: perfil.asignatura, tema: perfil.tema, interes: perfil.interes,
            aciertos: 0, errores: 0, duracion: 0, emocionDelta: 0,
            infografiaPedagogicaUrl: sesion.infografiaPedagogicaUrl,
        });

        console.log('🎮 juegos generados:', sesion.juegos);
        return sesion;

    } catch (error) {
        console.error('🔴 JSON parse error:', error);
        console.error('🔴 rawContent completo:', rawContent);
        throw new Error('No se pudo interpretar la respuesta de la IA. Intenta nuevamente.');
    }
}

export async function pedirExplicacionAlternativa(
    perfil: PerfilNino,
    intentoNumero: number
): Promise<string> {
    
    const idiomaStr = perfil.idioma === 'es' ? 'español' : 'English';

    const prompt = `Explica "${perfil.tema}" de ${asignaturaLabels[perfil.asignatura] || perfil.asignatura} de forma ${intentoNumero === 1 ? 'más simple y concreta' : 'ultra-simple'}, ajustada según la condición del niño: ${condicionLabels[perfil.condicion] || perfil.condicion}. Edad: ${perfil.edad} años. Idioma: ${idiomaStr}. Solo el texto, sin formato ni JSON.`;
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            
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

/** Sugiere 3 objetivos de aprendizaje acotados para el tema, bajo demanda (no automático) */
export async function generarSugerenciasObjetivo(
    perfil: Pick<PerfilNino, 'nombre' | 'edad' | 'grado' | 'condicion' | 'asignatura' | 'tema' | 'perfilNeuroeducativo'>,
    idioma: Idioma
): Promise<string[]> {

    const idiomaStr = idioma === 'es' ? 'español' : 'English';
    const condicion = condicionLabels[perfil.condicion] || perfil.condicion;
    const asignatura = asignaturaLabels[perfil.asignatura] || perfil.asignatura;
    const nombre = perfil.nombre || 'el niño';

    const perfilOperativo = buildOperationalProfile(perfil.perfilNeuroeducativo);
    const perfilBloque = renderOperationalProfileBlock(nombre, perfilOperativo, condicion);

    const prompt = [
        perfilBloque,
        '',
        `Un adulto va a generar una lección de "${asignatura}" sobre el tema "${perfil.tema}" para ${nombre} (${perfil.edad} años, ${perfil.grado}, condición: ${condicion}).`,
        `Sugiere 3 posibles "objetivos de aprendizaje" breves en ${idiomaStr} que acoten qué parte del tema priorizar en esta lección puntual (no todo el tema tiene que cubrirse siempre).`,
        'Cada sugerencia debe ser una frase corta y accionable (máximo 20 palabras), del tipo "que identifique X, sin profundizar en Y" o "que reconozca X en situaciones cotidianas".',
        `Si el tema "${perfil.tema}" ya es breve o atómico (no se puede fragmentar más sin perder sentido), UNA de las 3 opciones debe ser explícitamente "cubrir el tema completo sin fragmentar artificialmente".`,
        'Responde SOLO con este JSON válido, sin texto adicional ni markdown: { "sugerencias": ["", "", ""] }',
    ].join('\n');

    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            max_tokens: 300,
            response_format: { type: 'json_object' },
            messages: [{ role: 'user', content: prompt }],
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Error de OpenAI (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content || '{}';

    try {
        const parsed = JSON.parse(rawContent);
        const sugerencias = Array.isArray(parsed?.sugerencias) ? parsed.sugerencias : [];
        return sugerencias.filter((s: unknown): s is string => typeof s === 'string' && s.trim().length > 0);
    } catch (error) {
        console.error('🔴 Error parseando sugerencias de objetivo:', error);
        return [];
    }
}

/**
 * Traduce al español una oración armada por el niño en el Constructor de
 * GramaticalBlock (idiomas) — una vez que ya se validó como correcta.
 * Produce una traducción real y natural, no una concatenación palabra por
 * palabra. Si la oración es interrogativa, usa apertura y cierre "¿...?".
 */
export async function traducirOracionArmada(
    oracionArmada: string,
    idiomaOrigen: string,
    tipoOracion?: TipoOracion
): Promise<string> {

    const instruccionSigno = tipoOracion === 'interrogativa'
        ? ' Es una pregunta: la traducción debe llevar apertura y cierre de interrogación ("¿...?").'
        : '';

    const prompt = `Traduce al español de forma natural y gramaticalmente correcta esta oración en ${idiomaOrigen}: "${oracionArmada}".${instruccionSigno} Responde SOLO con la traducción, sin comillas, sin explicación, sin markdown.`;

    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            max_tokens: 60,
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


/**
 * Genera una imagen específica con DALL-E 3 bajo demanda (On-the-fly)
 */
export async function generarImagenDalle(prompt: string): Promise<string> {
    

    const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
           
        },
        body: JSON.stringify({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            quality: "standard"
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Error de DALL-E (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.data[0].url;
}
//Función para contexto pedagógico de apoyo visual en GPT
export async function generarContenidoPedagogico(tema: string, idioma: string) {
    try {
        const prompt = `
Eres un experto en educación infantil.

Genera contenido pedagógico claro y simple para niños.

TEMA: ${tema}
IDIOMA: ${idioma}

Devuelve SOLO un JSON válido con esta estructura:

{
  "titulo": "",
  "definicion": "",
  "conceptos": ["", "", "", ""],
  "ejemplo": "",
  "resumen": ""
}

REGLAS:
- Todo en ${idioma}
- Lenguaje simple
- Frases cortas
- Sin párrafos largos
`;
        const API_URL = import.meta.env.VITE_BACKEND_URL;
        const response = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "Eres un generador de contenido educativo." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.3
            })
        });

        const data = await response.json();

        const texto = data.choices?.[0]?.message?.content;

        if (!texto) throw new Error("Respuesta vacía de OpenAI");

        // 🔧 Limpieza por si viene con ```json
        const limpio = texto.replace(/```json|```/g, "").trim();

        return JSON.parse(limpio);

    } catch (error) {
        console.error("Error generando contenido pedagógico:", error);
        return null;
    }
}

// ===============================
// WIKIMEDIA IMAGE SEARCH
// ===============================

export async function buscarImagenWikimedia(titulo: string): Promise<string | null> {

    try {

        const query = encodeURIComponent(titulo);

        const url =
            `https://commons.wikimedia.org/w/api.php` +
            `?action=query` +
            `&generator=search` +
            `&gsrsearch=${query}` +
            `&gsrnamespace=6` +
            `&gsrlimit=1` +
            `&prop=imageinfo` +
            `&iiprop=url` +
            `&iiurlwidth=1000` +
            `&format=json` +
            `&origin=*`;

        const res = await fetch(url);

        const data = await res.json();

        console.log("WIKIMEDIA RAW:", data);

        const pages = data?.query?.pages;

        if (!pages) return null;

        const firstKey = Object.keys(pages)[0];

        const firstPage = pages[firstKey];

        // 👇 usamos thumburl optimizada
        const imageUrl =
            firstPage?.imageinfo?.[0]?.thumburl ||
            firstPage?.imageinfo?.[0]?.url;

        return imageUrl || null;

    } catch (error) {

        console.error("Error Wikimedia:", error);

        return null;
    }
}

// ===============================
// WIKIMEDIA IMAGE SEARCH CONCEPTOS
// ===============================


export async function buscarImagenConcepto(query: string): Promise<string | null> {
    try {
        const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|mime&iiurlwidth=1000&format=json&origin=*`;
        const res = await fetch(url);
        const data = await res.json();
        const pages = data?.query?.pages;
        if (!pages) return null;
        const imagen = (Object.values(pages) as any[])
            .filter(p => {
                const mime = p?.imageinfo?.[0]?.mime ?? '';
                const u = (p?.imageinfo?.[0]?.thumburl ?? '').toLowerCase();
                return (mime.startsWith('image/jpeg') || mime.startsWith('image/png') || mime.startsWith('image/webp'))
                    && !u.includes('icon') && !u.includes('logo') && !u.includes('flag');
            })
            .map(p => p?.imageinfo?.[0]?.thumburl || p?.imageinfo?.[0]?.url)
            .filter(Boolean);
        return imagen[0] || null;
    } catch { return null; }
}


