import { PerfilNino, SesionGenerada, ExplicacionBloque } from '@/types';
import { buildOperationalProfile, renderOperationalProfileBlock } from '../utils/profilePrompt';


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
        "intro": {
          "fraseEnganche": "Una sola frase que conecte el tema de forma concreta, cercana, sin tecnicismos.",
          "ejemploAncla": "Un ejemplo brevísimo en una sola oración que muestre el tema en acción usando el contexto del interés del niño.",
          "cuerpo": "Máximo 2 oraciones adicionales que presenten el tema. Sin saturar. Sin ideas compuestas. En ${idioma}."
        },


        "conceptosClave": [
          {
            "formula": "Formula o estructura cuando aplique, ejemplo para operaciones matemáticas o estructuras de oraciones en inglés u otro idioma",
            "elementos": "Desglose técnico obligatorio en formato 'Nombre: Definición corta'. CADA ELEMENTO DEBE IR EN UNA LÍNEA DISTINTA USANDO EL SALTO DE LÍNEA '\\n'. Reglas por asignatura: 1. Idiomas: Componentes de la estructura (Sujeto, Auxiliares, etc.) en el idioma de estudio. 2. Matemáticas: Variables y partes de la operación. 3. Historia: Factores clave. Formato: 'Nombre: Definición' (un par por renglón). Prohibido usar párrafos.",
            " - Idiomas (REGLA OBLIGATORIA): Genera una lista completa. ESTÁ PROHIBIDO AGRUPAR O RESUMIR. Debes crear una línea por cada variación importante.",
                    "-Ejemplo To Be: Debes generar 3 líneas distintas: una para 'I', otra para 'He/She/It' y otra para 'We/You/They'.",
                    "-Ejemplo Verbo -ing: Genera líneas distintas para: verbos normales, verbos que terminan en -e, y verbos que doblan consonante.",
                    "-Formato: 'Sujeto/Base : Auxiliar/Cambio + (Ejemplo corto)'. USA SIEMPRE EL SALTO DE LÍNEA '\n' AL FINAL DE CADA LÍNEA."" - Idiomas (REGLA OBLIGATORIA): Genera una lista completa. ESTÁ PROHIBIDO AGRUPAR O RESUMIR. Debes crear una línea por cada variación importante.",
                    "-Ejemplo To Be: Debes generar 3 líneas distintas: una para 'I', otra para 'He/She/It' y otra para 'We/You/They'.",
                    "-Ejemplo Verbo -ing: Genera líneas distintas para: verbos normales, verbos que terminan en -e, y verbos que doblan consonante.",
                    "-Formato: 'Sujeto/Base : Auxiliar/Cambio + (Ejemplo corto)'. USA SIEMPRE EL SALTO DE LÍNEA '\n' AL FINAL DE CADA LÍNEA.",
                "      -Matemáticas/Ciencias: Listar variables, partes de una operación o constantes (ej. Divisor, Radio, Masa).",
                "      -Historia/Sociales: Listar Factores Clave (Antecedentes, Personajes, Lugar) que permiten entender el suceso.",
                "      -Formato: Cada par debe ir en una línea nueva separado por dos puntos (:). Nunca agrupar en párrafos.",

            "uso": "Guía de aplicación paso a paso. CADA PASO DEBE IR EN UNA LÍNEA NUEVA CON EL SALTO DE LÍNEA '\n'. Reglas por asignatura:",
                "      -Idiomas: Reglas de transformación (ej: cuándo añadir -s, cómo cambiar el orden en preguntas).",
                "      -Matemáticas/Ciencias: El orden de la operación o cómo despejar (Paso 1, Paso 2...).",
                "      -Historia/Sociales: Cómo analizar el hecho o qué pasos seguir para identificar sus consecuencias.",
                "      -Formato: Instrucciones cortas en modo imperativo (ej: "1. Identifica el sujeto \n 2. Agrega el auxiliar").",

            "necesidad": "Contexto de uso y propósito real. CADA ESCENARIO DEBE IR EN UNA LÍNEA NUEVA CON EL SALTO DE LÍNEA '\n'. Reglas por asignatura:",
                "      -Idiomas: Situaciones específicas (ej: "Para hablar de lo que haces ahora mismo") o palabras clave que delatan el tiempo (ej: "Si ves la palabra 'Now'").",
                "      -Matemáticas: Cuándo aplicar la operación (ej: "Para repartir dulces en partes iguales").",
                "      -Historia: Relevancia actual o por qué estudiar este hecho ayuda a entender el presente.",
                "      -Formato: Frases cortas y empoderadoras que empiecen por "Úsalo para..." o "Identifícalo cuando...".",


            "nombre": "Nombre del concepto",
            "etiqueta": "Etapa 1 | Regla | Componente | Concepto central | vacío si no aplica",
            "funcion": "Qué es, para qué sirve o por qué es importante",
            "explicacionSimple": "Explicación clara, concreta y adaptada al niño",
            "icono": "nombre válido de Lucide Icons en camelCase",
            "colorRamp": "blue | green | amber | purple | teal | coral | pink | gray"
          }
        ],


        "pasos": [""],
        "visualSugerido": {
          "tipo": "secuencia | diagrama | comparacion | formula | ninguna",
          "icono": "nombre del icono Lucide en camelCase, por ejemplo: droplets, sun, flask, music, divide",
          "colorRamp": "blue | green | amber | purple | teal | coral | pink | gray",
          "descripcion": "Qué muestra el visual en una línea",
          "justificacionPedagogica": "Por qué este visual ayuda a comprender"
        },


        "chequeoCobertura": [""],
        "analogia": "Analogía breve y útil en ${idioma}.",





        "ejemplos": [
          {
            "enunciado": "Tienes 12 frijoles y 4 hojas. ¿Cuántos frijoles van en cada hoja si los repartes igual?",
            "requiereProcedimiento": true,
            "explicacionBreve": "Usar objetos reales permite que el niño comprenda la operación antes de escribirla.",
            "pasosGuiados": [
              {
                "numeroPaso": 1,
                "accionPrincipal": "Consigue los materiales físicos antes de empezar.",
                "explicacion": "El niño necesita tener los objetos en la mano para entender con el cuerpo, no solo con la mente.",
                "resultadoParcial": "El niño tiene los materiales listos frente a él.",
                "vinculoConcepto": "Nombre del concepto clave al que conecta este paso.",
                "exploracionConcreta": {
                  "aplica": true,
                  "materiales": ["12 frijoles", "4 hojas de papel"],
                  "instrucciones": [
                    "Cuenta los frijoles uno por uno hasta llegar a 12.",
                    "Pon las 4 hojas separadas sobre la mesa."
                  ],
                  "conclusion": "El niño entiende que los frijoles son el total y las hojas son los grupos."
                }
              },
              {
                "numeroPaso": 2,
                "accionPrincipal": "Reparte los frijoles uno a uno en cada hoja.",
                "explicacion": "Repartir físicamente conecta la acción de dividir con el concepto de distribución igual.",
                "resultadoParcial": "Cada hoja tiene la misma cantidad de frijoles.",
                "vinculoConcepto": "Nombre del concepto clave al que conecta este paso.",
                "exploracionConcreta": {
                  "aplica": true,
                  "materiales": ["12 frijoles", "4 hojas de papel"],
                  "instrucciones": [
                    "Pon 1 frijol en cada hoja.",
                    "Repite hasta que no queden frijoles."
                  ],
                  "conclusion": "El niño ve que cada hoja recibió exactamente 3 frijoles."
                }
              }
            ],
            "visualSugerido": {
              "tipo": "secuencia | diagrama | comparacion | formula | ninguna",
              "icono": "nombre del icono Lucide en camelCase, por ejemplo: droplets, sun, flask, music, divide",
              "colorRamp": "blue | green | amber | purple | teal | coral | pink | gray",
              "descripcion": "Qué muestra el visual en una línea",
              "justificacionPedagogica": "Por qué este visual ayuda a comprender"
            },
            "conclusionPedagogica": "Qué consolidó el niño con este ejemplo"
          }
        ],
        "apoyoVisual": {
          "tipo": "formula | flujo | nodos | linea_tiempo | ciclo | reparto",
          "titulo": "Título breve del diagrama",
          "elementos": ["elemento 1", "elemento 2", "elemento 3"],
          "asignatura": "matematicas | ingles | lenguaje | ciencias | historia | sociales"
        },
        "resumen": "Idea final breve para recordar en ${idioma}."
      },
      "explicacionAlternativa1": {
        "objetivo": "Nivel 2: versión desarrollada en ${idioma}.",
        "intro": {
          "fraseEnganche": "Una sola frase que conecte el tema con el interés motivacional del niño. Concreta, cercana, sin tecnicismos.",
          "ejemploAncla": "Un ejemplo brevísimo en una sola oración que muestre el tema en acción usando el contexto del interés del niño.",
          "cuerpo": "Máximo 2 oraciones adicionales que presenten el tema. Sin saturar. Sin ideas compuestas. En ${idioma}."
        },
        "conceptosClave": [
          {
            "formula": "Formula o estructura cuando aplique, ejemplo para operaciones matemáticas o estructuras de oraciones en inglés u otro idioma",
            "elementos": "Desglose técnico obligatorio en formato 'Nombre: Definición corta'. CADA ELEMENTO DEBE IR EN UNA LÍNEA DISTINTA USANDO EL SALTO DE LÍNEA '\\n'. Reglas por asignatura: 1. Idiomas: Componentes de la estructura (Sujeto, Auxiliares, etc.) en el idioma de estudio. 2. Matemáticas: Variables y partes de la operación. 3. Historia: Factores clave. Formato: 'Nombre: Definición' (un par por renglón). Prohibido usar párrafos.",
                "      -Idiomas: Listar TODOS los componentes de la estructura (Sujeto/Pronombres, Verbos Auxiliares, Conjugaciones, Complementos). Los nombres de los elementos y sus ejemplos DEBEN estar en el idioma que se estudia (ej. inglés).",
                "      -Matemáticas/Ciencias: Listar variables, partes de una operación o constantes (ej. Divisor, Radio, Masa).",
                "      -Historia/Sociales: Listar Factores Clave (Antecedentes, Personajes, Lugar) que permiten entender el suceso.",
                "      -Formato: Cada par debe ir en una línea nueva separado por dos puntos (:). Nunca agrupar en párrafos.",

            "uso": "Guía de aplicación paso a paso. CADA PASO DEBE IR EN UNA LÍNEA NUEVA CON EL SALTO DE LÍNEA '\n'. Reglas por asignatura:",
                "      -Idiomas: Reglas de transformación (ej: cuándo añadir -s, cómo cambiar el orden en preguntas).",
                "      -Matemáticas/Ciencias: El orden de la operación o cómo despejar (Paso 1, Paso 2...).",
                "      -Historia/Sociales: Cómo analizar el hecho o qué pasos seguir para identificar sus consecuencias.",
                "      -Formato: Instrucciones cortas en modo imperativo (ej: "1. Identifica el sujeto \n 2. Agrega el auxiliar").",

            "necesidad": "Contexto de uso y propósito real. CADA ESCENARIO DEBE IR EN UNA LÍNEA NUEVA CON EL SALTO DE LÍNEA '\n'. Reglas por asignatura:",
                "      -Idiomas: Situaciones específicas (ej: "Para hablar de lo que haces ahora mismo") o palabras clave que delatan el tiempo (ej: "Si ves la palabra 'Now'").",
                "      -Matemáticas: Cuándo aplicar la operación (ej: "Para repartir dulces en partes iguales").",
                "      -Historia: Relevancia actual o por qué estudiar este hecho ayuda a entender el presente.",
                "      -Formato: Frases cortas y empoderadoras que empiecen por "Úsalo para..." o "Identifícalo cuando...".",


            "nombre": "Nombre del concepto",
            "etiqueta": "Etapa 1 | Regla | Componente | Concepto central | vacío si no aplica",
            "funcion": "Qué es, para qué sirve o por qué es importante",
            "explicacionSimple": "Explicación clara, concreta y adaptada al niño",
            "icono": "nombre válido de Lucide Icons en camelCase",
            "colorRamp": "blue | green | amber | purple | teal | coral | pink | gray"
          }
        ],








        "pasos": [""],
        "visualSugerido": {
          "tipo": "secuencia | diagrama | comparacion | formula | ninguna",
          "icono": "nombre del icono Lucide en camelCase, por ejemplo: droplets, sun, flask, music, divide",
          "colorRamp": "blue | green | amber | purple | teal | coral | pink | gray",
          "descripcion": "Qué muestra el visual en una línea",
          "justificacionPedagogica": "Por qué este visual ayuda a comprender"
        },
        "chequeoCobertura": [""],
        "analogia": "Analogía breve y útil en ${idioma}.",
        "ejemplos": [
          {
            "enunciado": "Tienes 12 frijoles y 4 hojas. ¿Cuántos frijoles van en cada hoja si los repartes igual?",
            "requiereProcedimiento": true,
            "explicacionBreve": "Usar objetos reales permite que el niño comprenda la operación antes de escribirla.",
            "pasosGuiados": [
              {
                "numeroPaso": 1,
                "accionPrincipal": "Consigue los materiales físicos antes de empezar.",
                "explicacion": "El niño necesita tener los objetos en la mano para entender con el cuerpo, no solo con la mente.",
                "resultadoParcial": "El niño tiene los materiales listos frente a él.",
                "vinculoConcepto": "Nombre del concepto clave al que conecta este paso.",
                "exploracionConcreta": {
                  "aplica": true,
                  "materiales": ["12 frijoles", "4 hojas de papel"],
                  "instrucciones": [
                    "Cuenta los frijoles uno por uno hasta llegar a 12.",
                    "Pon las 4 hojas separadas sobre la mesa."
                  ],
                  "conclusion": "El niño entiende que los frijoles son el total y las hojas son los grupos."
                }
              },
              {
                "numeroPaso": 2,
                "accionPrincipal": "Reparte los frijoles uno a uno en cada hoja.",
                "explicacion": "Repartir físicamente conecta la acción de dividir con el concepto de distribución igual.",
                "resultadoParcial": "Cada hoja tiene la misma cantidad de frijoles.",
                "vinculoConcepto": "Nombre del concepto clave al que conecta este paso.",
                "exploracionConcreta": {
                  "aplica": true,
                  "materiales": ["12 frijoles", "4 hojas de papel"],
                  "instrucciones": [
                    "Pon 1 frijol en cada hoja.",
                    "Repite hasta que no queden frijoles."
                  ],
                  "conclusion": "El niño ve que cada hoja recibió exactamente 3 frijoles."
                }
              }            ],
            "visualSugerido": {
              "tipo": "secuencia | diagrama | comparacion | formula | ninguna",
              "icono": "nombre del icono Lucide en camelCase, por ejemplo: droplets, sun, flask, music, divide",
              "colorRamp": "blue | green | amber | purple | teal | coral | pink | gray",
              "descripcion": "Qué muestra el visual en una línea",
              "justificacionPedagogica": "Por qué este visual ayuda a comprender"
            },
            "conclusionPedagogica": "Qué consolidó el niño con este ejemplo"
          }
        ],
        "apoyoVisual": {
          "tipo": "formula | flujo | nodos | linea_tiempo | ciclo | reparto",
          "titulo": "Título breve del diagrama",
          "elementos": ["elemento 1", "elemento 2", "elemento 3"],
          "asignatura": "matematicas | ingles | lenguaje | ciencias | historia | sociales"
        },
        "resumen": "Idea final breve para recordar en ${idioma}."
      },
      "explicacionAlternativa2": {
        "objetivo": "Nivel 3: versión ampliada en ${idioma}.",
        "intro": {
          "fraseEnganche": "Una sola frase que conecte el tema con el interés motivacional del niño. Concreta, cercana, sin tecnicismos.",
          "ejemploAncla": "Un ejemplo brevísimo en una sola oración que muestre el tema en acción usando el contexto del interés del niño.",
          "cuerpo": "Máximo 2 oraciones adicionales que presenten el tema. Sin saturar. Sin ideas compuestas. En ${idioma}."
        },


        "conceptosClave": [
          {
            "formula": "Formula o estructura cuando aplique, ejemplo para operaciones matemáticas o estructuras de oraciones en inglés u otro idioma",
            "elementos": "Desglose técnico obligatorio en formato 'Nombre: Definición corta'. CADA ELEMENTO DEBE IR EN UNA LÍNEA DISTINTA USANDO EL SALTO DE LÍNEA '\\n'. Reglas por asignatura: 1. Idiomas: Componentes de la estructura (Sujeto, Auxiliares, etc.) en el idioma de estudio. 2. Matemáticas: Variables y partes de la operación. 3. Historia: Factores clave. Formato: 'Nombre: Definición' (un par por renglón). Prohibido usar párrafos.",
                "      -Idiomas: Listar TODOS los componentes de la estructura (Sujeto/Pronombres, Verbos Auxiliares, Conjugaciones, Complementos). Los nombres de los elementos y sus ejemplos DEBEN estar en el idioma que se estudia (ej. inglés).",
                "      -Matemáticas/Ciencias: Listar variables, partes de una operación o constantes (ej. Divisor, Radio, Masa).",
                "      -Historia/Sociales: Listar Factores Clave (Antecedentes, Personajes, Lugar) que permiten entender el suceso.",
                "      -Formato: Cada par debe ir en una línea nueva separado por dos puntos (:). Nunca agrupar en párrafos.",

            "uso": "Guía de aplicación paso a paso. CADA PASO DEBE IR EN UNA LÍNEA NUEVA CON EL SALTO DE LÍNEA '\n'. Reglas por asignatura:",
                "      -Idiomas: Reglas de transformación (ej: cuándo añadir -s, cómo cambiar el orden en preguntas).",
                "      -Matemáticas/Ciencias: El orden de la operación o cómo despejar (Paso 1, Paso 2...).",
                "      -Historia/Sociales: Cómo analizar el hecho o qué pasos seguir para identificar sus consecuencias.",
                "      -Formato: Instrucciones cortas en modo imperativo (ej: "1. Identifica el sujeto \n 2. Agrega el auxiliar").",

            "necesidad": "Contexto de uso y propósito real. CADA ESCENARIO DEBE IR EN UNA LÍNEA NUEVA CON EL SALTO DE LÍNEA '\n'. Reglas por asignatura:",
                "      -Idiomas: Situaciones específicas (ej: "Para hablar de lo que haces ahora mismo") o palabras clave que delatan el tiempo (ej: "Si ves la palabra 'Now'").",
                "      -Matemáticas: Cuándo aplicar la operación (ej: "Para repartir dulces en partes iguales").",
                "      -Historia: Relevancia actual o por qué estudiar este hecho ayuda a entender el presente.",
                "      -Formato: Frases cortas y empoderadoras que empiecen por "Úsalo para..." o "Identifícalo cuando...".",


            "nombre": "Nombre del concepto",
            "etiqueta": "Etapa 1 | Regla | Componente | Concepto central | vacío si no aplica",
            "funcion": "Qué es, para qué sirve o por qué es importante",
            "explicacionSimple": "Explicación clara, concreta y adaptada al niño",
            "icono": "nombre válido de Lucide Icons en camelCase",
            "colorRamp": "blue | green | amber | purple | teal | coral | pink | gray"
          }
        ],


        "pasos": [""],
        "visualSugerido": {
          "tipo": "secuencia | diagrama | comparacion | formula | ninguna",
          "icono": "nombre del icono Lucide en camelCase, por ejemplo: droplets, sun, flask, music, divide",
          "colorRamp": "blue | green | amber | purple | teal | coral | pink | gray",
          "descripcion": "Qué muestra el visual en una línea",
          "justificacionPedagogica": "Por qué este visual ayuda a comprender"
        },
        "chequeoCobertura": [""],
        "analogia": "Analogía breve y útil en ${idioma}.",
        "ejemplos": [
          {
            "enunciado": "Tienes 12 frijoles y 4 hojas. ¿Cuántos frijoles van en cada hoja si los repartes igual?",
            "requiereProcedimiento": true,
            "explicacionBreve": "Usar objetos reales permite que el niño comprenda la operación antes de escribirla.",
            "pasosGuiados": [
              {
                "numeroPaso": 1,
                "accionPrincipal": "Consigue los materiales físicos antes de empezar.",
                "explicacion": "El niño necesita tener los objetos en la mano para entender con el cuerpo, no solo con la mente.",
                "resultadoParcial": "El niño tiene los materiales listos frente a él.",
                "vinculoConcepto": "Nombre del concepto clave al que conecta este paso.",
                "exploracionConcreta": {
                  "aplica": true,
                  "materiales": ["12 frijoles", "4 hojas de papel"],
                  "instrucciones": [
                    "Cuenta los frijoles uno por uno hasta llegar a 12.",
                    "Pon las 4 hojas separadas sobre la mesa."
                  ],
                  "conclusion": "El niño entiende que los frijoles son el total y las hojas son los grupos."
                }
              },
              {
                "numeroPaso": 2,
                "accionPrincipal": "Reparte los frijoles uno a uno en cada hoja.",
                "explicacion": "Repartir físicamente conecta la acción de dividir con el concepto de distribución igual.",
                "resultadoParcial": "Cada hoja tiene la misma cantidad de frijoles.",
                "vinculoConcepto": "Nombre del concepto clave al que conecta este paso.",
                "exploracionConcreta": {
                  "aplica": true,
                  "materiales": ["12 frijoles", "4 hojas de papel"],
                  "instrucciones": [
                    "Pon 1 frijol en cada hoja.",
                    "Repite hasta que no queden frijoles."
                  ],
                  "conclusion": "El niño ve que cada hoja recibió exactamente 3 frijoles."
                }
              }            ],
            "visualSugerido": {
              "tipo": "secuencia | diagrama | comparacion | formula | ninguna",
              "icono": "nombre del icono Lucide en camelCase, por ejemplo: droplets, sun, flask, music, divide",
              "colorRamp": "blue | green | amber | purple | teal | coral | pink | gray",
              "descripcion": "Qué muestra el visual en una línea",
              "justificacionPedagogica": "Por qué este visual ayuda a comprender"
            },
            "conclusionPedagogica": "Qué consolidó el niño con este ejemplo"
          }
        ],
        "apoyoVisual": {
          "tipo": "formula | flujo | nodos | linea_tiempo | ciclo | reparto",
          "titulo": "Título breve del diagrama",
          "elementos": ["elemento 1", "elemento 2", "elemento 3"],
          "asignatura": "matematicas | ingles | lenguaje | ciencias | historia | sociales"
        },
        "resumen": "Idea final breve para recordar en ${idioma}."
      },
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
        '2. La explicación principal debe enseñar exactamente ese contenido y los juegos solo pueden evaluar lo ya enseñado.',
        '3. No introduzcas en ejemplos o juegos nombres, partes, autores, categorías, pasos o datos que no hayan sido explicados antes.',
        '4. En TEOplay, adaptar no es quitar contenido esencial: es cambiar la forma de enseñarlo según el perfil neuroeducativo del niño.',
        '5. No generes explicaciones escolares genéricas. Genera mediaciones pedagógicas claras, concretas, guiadas y de baja carga cognitiva.',
        '6. conceptosClave, pasos y chequeoCobertura deben incluir todos los elementos esenciales que el tema necesite. No los reduzcas artificialmente.',
        '7. Si el tema incluye listas, partes, autores, categorías, etapas, órganos, organelos, planetas, continentes, figuras, tipos o componentes esenciales, debes nombrarlos y explicarlos con cobertura suficiente para el nivel escolar.',
        '8. Si luego un elemento específico aparece en ejemplos o juegos, ese elemento debe haber sido enseñado antes de forma explícita.',
        '9. visualSugerido solo debe usarse si aporta comprensión real. Si no aporta, usa tipo "ninguna" y deja icono, colorRamp y descripcion vacíos. Nunca uses imágenes externas, URLs, DALL-E ni Wikimedia.',
        '10. Tipos de visual permitidos: "secuencia" para procesos o ciclos con orden claro; "diagrama" para estructuras o relaciones entre partes; "comparacion" para contrastar dos elementos; "formula" para mostrar una regla o estructura gramatical o matemática; "ninguna" cuando no haya ganancia real de comprensión.',
        '10b. Para icono usa siempre un nombre válido de Lucide Icons en camelCase (ejemplos: droplets, sun, music, divide, flask, leaf, calculator, bookOpen, arrowRight). El frontend lo renderizará directamente. No inventes nombres de iconos.',
        '10c. Para colorRamp elige el color que mejor represente el contenido: blue para agua o ciencia, green para naturaleza, amber para calor o cocina, purple para gramática o lenguaje, teal para ciclos o biología, coral para matemáticas, gray para conceptos neutros.',
        '10d. apoyoVisual es un campo OBLIGATORIO a nivel de explicacion, explicacionAlternativa1 y explicacionAlternativa2. NUNCA lo pongas dentro de conceptosClave.',
        '10e. Tipos de apoyoVisual según asignatura y tipoLeccion:',
        '    - matematicas procedimiento_matematico: usa "reparto" para divisiones con objetos. Usa "formula" para operaciones con fórmula fija (área, perímetro, ecuaciones).',
        '    - matematicas clasificacion_conceptual: usa "nodos" donde el nodo central es la categoría principal y los hijos son los tipos con su característica clave.',
        '    - ingles o lenguaje formula_gramatical: usa "formula" para estructura gramatical.',
        '    - ingles o lenguaje clasificacion_conceptual: usa "nodos" para comparar tiempos verbales o categorías.',
        '    - ciencias clasificacion_conceptual: usa "nodos" donde el nodo central es el concepto y los hijos son sus partes o tipos.',
        '    - ciencias secuencia_biologica: usa "ciclo" para procesos con etapas ordenadas.',
        '    - ciencias observacion_experimental: usa "flujo" para cadenas de causa-efecto.',
        '    - historia o sociales: usa "linea_tiempo" con formato "fecha: evento corto".',
        '    - descripcion_conceptual: usa "nodos" con el concepto central y sus atributos principales.',
        '10f. Para el campo "elementos" de apoyoVisual sigue estas reglas:',
        '    - tipo "formula": cada elemento sigue el formato "Nombre del componente: operador_o_símbolo : valor_o_ejemplo". El operador puede ser +, -, ×, ÷, =. Ejemplo: "Base: × : b", "Altura: ÷2 : h", "Área: = : A".',
        '    - tipo "nodos": el primer elemento es el nodo central. Los demás son nodos hijo con formato "Nombre: descripción corta".',
        '    - tipo "reparto": exactamente 3 strings numéricos: [total, grupos, porGrupo]. Ejemplo: ["12", "4", "3"].',
        '    - tipo "ciclo": cada elemento es una etapa. Formato "Nombre de etapa".',
        '    - tipo "flujo": cada elemento es un paso en orden. Formato "Acción o resultado".',
        '    - tipo "linea_tiempo": formato "fecha o período: evento corto".',
        '10g. Para "elementos" en tipo "nodos", si el tema incluye formas geométricas, partículas, organismos o elementos visualizables, agrega al final de cada elemento hijo el nombre del icono Lucide que mejor lo represente entre paréntesis. Ejemplo: "Triángulo equilátero: 3 lados iguales (triangle)", "Electrón: carga negativa (zap)", "Núcleo: centro del átomo (circle)". Si no hay icono apropiado, omite los paréntesis.',


        '11. Antes de generar la lección, determina el tipoLeccion según el tema:',
        '    - procedimiento_matematico: el tema requiere seguir pasos de cálculo (divisiones, fracciones, ecuaciones).',
        '    - observacion_experimental: el tema se comprende mejor observando o manipulando fenómenos físicos (ciclo del agua, estados de la materia, fotosíntesis).',
        '    - formula_gramatical: el tema es una regla de lenguaje con estructura fija (presente progresivo, pasado simple, tipos de oraciones).',
        '    - clasificacion_conceptual: el tema organiza elementos en categorías o grupos (tipos de animales, sistemas del cuerpo, partes de una célula).',
        '    - secuencia_biologica: el tema es un proceso biológico con etapas ordenadas (digestión, reproducción, ciclo celular).',
        '    - descripcion_conceptual: el tema es un conjunto de ideas o definiciones sin procedimiento ni secuencia fija (valores, biomas, culturas).',
        '12. El tipoLeccion determina cómo se construye el bloque de ejemplo:',
        '    - procedimiento_matematico: requiereProcedimiento = true siempre. Los pasos siguen la operación. exploracionConcreta usa objetos contables del entorno.',
        '    - observacion_experimental: requiereProcedimiento = true. Los pasos son de observación guiada. exploracionConcreta usa materiales del hogar para reproducir el fenómeno.',
        '    - formula_gramatical: requiereProcedimiento = true. Los pasos construyen la estructura lingüística. exploracionConcreta usa el cuerpo, acciones físicas o escritura.',
        '    - clasificacion_conceptual: requiereProcedimiento = false. El ejemplo muestra cómo clasificar con claridad. Sin pasos guiados.',
        '    - secuencia_biologica: requiereProcedimiento = true. Los pasos siguen las etapas del proceso. exploracionConcreta usa dibujo, recorte o manipulación.',
        '    - descripcion_conceptual: requiereProcedimiento = false. El ejemplo contextualiza el concepto. Sin pasos guiados.',
        '13. La intro de cada nivel debe tener exactamente tres partes: fraseEnganche, ejemploAncla y cuerpo.',
        '14. fraseEnganche debe usar el interés motivacional del niño para conectar emocionalmente con el tema. No es decorativa: es el puente entre lo que el niño ya ama y lo que va a aprender.',
        '14b. ejemploAncla debe mostrar el tema funcionando en una sola oración, usando el contexto del interés del niño cuando sea posible. Es el primer contacto concreto con el contenido.',
        '14c. cuerpo no puede superar 2 oraciones. Cada oración debe tener una sola idea. Sin explicaciones largas, sin listas, sin tecnicismos en esta parte.',
        '14d. La intro no enseña: prepara al niño para aprender. Todo el contenido real va en conceptosClave y ejemplos.',
        '15. Las 3 explicaciones deben mantener el mismo foco conceptual: Nivel 1 esencial, Nivel 2 desarrollado, Nivel 3 ampliado. Cambia profundidad y andamiaje, no el tema.',
        '15b. Cada concepto clave debe incluir icono y colorRamp para que el frontend lo renderice con identidad visual propia.',
        '15c. Asigna un colorRamp diferente a cada concepto cuando el tema tenga etapas o partes distintas. Si los conceptos son del mismo tipo o nivel, pueden compartir colorRamp.',
        '15d. Usa etiqueta cuando el concepto tenga un orden claro (Etapa 1, Etapa 2), una categoría (Regla, Componente, Fórmula) o un rol especial (Concepto central). Si no aplica, deja etiqueta como cadena vacía.',
        '15e. El icono de cada concepto debe representar visualmente su significado. No uses el mismo icono para todos. Elige desde Lucide Icons: sun, droplets, cloud, arrowDown, beaker, music, divide, bookOpen, calculator, leaf, flask, globe, heart, star, zap, layers, repeat, checkCircle, alertCircle, info.',
        '15f. La explicacionSimple debe estar escrita directamente para el niño, no para un adulto. Usa frases cortas, una idea por oración, lenguaje concreto y sin tecnicismos no explicados previamente.',
        '16. TEOplay le enseña directamente al niño. Usa lenguaje claro, cercano, concreto y guiado. No des por obvios pasos mentales ni razonamientos intermedios.',
        '17. El bloque ejemplos no es decorativo: debe consolidar el aprendizaje con una experiencia pedagógica concreta.',
        '18. Cada ejemplo debe ayudar a comprender, practicar, observar, manipular, aplicar, comparar, registrar, construir o contextualizar contenido ya enseñado.',
        '19. Usa requiereProcedimiento = true cuando el tema necesite que el niño siga una secuencia guiada para comprender (operaciones matemáticas, experimentos, construcción de oraciones, procesos con pasos). Si es false, pasosGuiados debe ser exactamente [].',
        '19b. Cada paso guiado debe contener exactamente una acción principal. Si un paso necesita dos acciones, divídelo en dos pasos separados.',
        '19c. accionPrincipal no puede superar una oración. explicacion no puede superar dos oraciones. resultadoParcial no puede superar una oración. Sin ideas compuestas en ninguno de estos campos.',
        '19d. vinculoConcepto es obligatorio. Cada paso debe conectar explícitamente con un concepto ya enseñado en conceptosClave. No puede quedar vacío.',
        '19e. Las instrucciones dentro de exploracionConcreta deben ser acciones físicas simples, una por ítem, sin explicaciones adicionales dentro de la instrucción misma. La explicación va en el campo explicacion del paso, no dentro de la instrucción física.',
        '19f. La conclusion de exploracionConcreta debe describir en una oración qué comprensión concreta obtuvo el niño al manipular los materiales. No es un resumen del paso: es el insight físico que se lleva.',
        '19g. La carga cognitiva total de cada paso debe ser mínima. Si el perfil del niño indica baja tolerancia a instrucciones largas, prioriza frases de 5 a 8 palabras en accionPrincipal e instrucciones.',
        '20. Si requiereProcedimiento = true, antes de escribir los pasos evalúa: ¿qué experiencia del mundo físico permite que el niño comprenda este concepto con las manos? Elige materiales concretos, accesibles y seguros del entorno del niño (cocina, casa, patio, sala de clases). Diseña cada paso alrededor de esa experiencia real.',
        '21. exploracionConcreta debe existir en cada pasoGuiado. Si el paso tiene acción física posible, completa todos sus campos: aplica:true, materiales (lista de objetos reales), instrucciones (pasos físicos simples), conclusion (qué entendió el niño al hacerlo). Si el paso es puramente mental o de observación sin manipulación, usa {"aplica": false, "materiales": [], "instrucciones": [], "conclusion": ""}.',
        '22. Los materiales de exploracionConcreta deben ser coherentes con el perfil del niño: sus intereses, su entorno habitual y su condición. No uses materiales abstractos, tecnológicos o inaccesibles.',
        '23. visualSugerido debe existir siempre en cada ejemplo. Si no aporta comprensión real, usa tipo = "ninguna".',
        '24. Los ejemplos de los tres niveles deben reforzar los mismos conceptos centrales. Solo cambia andamiaje, claridad, profundidad y desarrollo del razonamiento.',
        `25. Debes generar EXACTAMENTE ${numJuegos} juegos.`,
        '26. Elige tipos de juego según el contenido enseñado. Cada juego debe estar completo, alineado con la explicación principal y con estructura válida para renderizarse.',
        '27. Los juegos no pueden evaluar contenido no enseñado, no pueden quedar incompletos y deben distribuirse entre varios contenidos cuando la lección abarque más de un elemento importante.',
        '28. Mantén toda la sesión ajustada al perfil neuroeducativo operativo del niño: explicación, ejemplos, visuales, juegos, mensajes, secuencia, carga cognitiva y nivel de apoyo.',
        //////
        
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
        //`TIPO A: { "tipo": "A", "instruccion": "...", "categoria1": { "nombre": "...", "icono": "star" }, "categoria2": { "nombre": "...", "icono": "circle" }, "items": [ { "texto": "...", "icono": "zap", "categoriaCorrecta": 1 } ] }`,
        `TIPO B: { "tipo": "B", "instruccion": "...", "preguntas": [ { "pregunta": "...", "opciones": [ { "texto": "...", "correcta": true }, { "texto": "...", "correcta": false }, { "texto": "...", "correcta": false } ] } ] }`,
        //`TIPO C: { "tipo": "C", "instruccion": "...", "tarjetas": [ { "pregunta": "...", "respuesta": "...", "pista": "...", "alternativas": [] } ] }`,
        `TIPO D: { "tipo": "D", "instruccion": "...", "items": [ { "texto": "...", "icono": "star", "esIntruso": false }, { "texto": "...", "icono": "cloud", "esIntruso": true } ] }`,
        `TIPO E: { "tipo": "E", "instruccion": "...", "actividad": "...", "tipoValidacion": "exacta | ia | confirmacion", "respuestaEsperada": "", "criterios": "", "mensajeMotor": "..." }`,
    ].join('\n');


    console.log('🟣 perfilBloque length:', perfilBloque.length);
    console.log('🟣 prompt total length:', prompt.length);
    console.log('🟡 buildPrompt preview:', prompt.slice(0, 2500));

    return prompt;


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
            max_tokens: 6000,
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

    // Log temporal para verificar apoyoVisual
    try {
        const parsed = JSON.parse(rawContent);
        console.log('🔵 apoyoVisual nivel 1:', JSON.stringify(parsed?.explicacion?.apoyoVisual));
        console.log('🔵 apoyoVisual nivel 2:', JSON.stringify(parsed?.explicacionAlternativa1?.apoyoVisual));
        console.log('🔵 apoyoVisual nivel 3:', JSON.stringify(parsed?.explicacionAlternativa2?.apoyoVisual));
    } catch (e) { console.log('❌ parse error'); }



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
    //const interes = interesLabels[perfil.interes] || perfil.interes;
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
                    : visualTipo === 'formula'
                        ? 'Create a clean visual representation of the grammatical or mathematical rule, showing its structure clearly.'
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
        visualTipo === 'secuencia' || visualTipo === 'diagrama'
            ? `Use the child's neuroeducational profile and condition "${condicion}" only if it helps the topic logically and does not distract from the academic goal.`
            : `Do not force the child's neuroeducational profile "${condicion}" into the image unless it clearly improves understanding.`;

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
/** Genera la sesión completa: solo texto — imágenes externas desactivadas */
export async function generarSesion(perfil: PerfilNino): Promise<SesionGenerada> {
    const apiKey = getApiKey();

    // 1. Generar sesión de texto
    const sesion = await generarSesionTexto(perfil, apiKey);

    // 2. Imágenes externas desactivadas — el sistema usa iconos y visuales propios
    // DALL-E y Wikimedia no se usan. imagenUrl queda undefined siempre.

    // 3. Guardar en localStorage
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

    // 4. Devolver sesión sin imagenUrl
    return {
        ...sesion,
        imagenUrl: undefined,
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

