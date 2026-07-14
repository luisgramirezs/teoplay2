# TEOplay — Ficha Técnica y Visión de Evolución

*Documento de contexto permanente del proyecto. Léelo antes de proponer cambios de
arquitectura, modelo de datos o roadmap.*

---

## 1. ¿Qué es TEOplay?

TEOplay es una plataforma neuroeducativa que usa Inteligencia Artificial para generar
sesiones de aprendizaje personalizadas destinadas a niños con condiciones del
neurodesarrollo. La plataforma adapta cada lección al perfil cognitivo, emocional y
motivacional individual de cada niño, convirtiendo contenidos curriculares en
experiencias accesibles, inclusivas y significativas.

**Lema:** "Diseñado para que todos aprendan a su ritmo y se sientan capaces."

**Estado:** plataforma completamente funcional, en producción, con usuarios reales.
Desplegada en Firebase. **No es un proyecto nuevo.**

## 2. Población objetivo

Niños y niñas en edad escolar (preescolar a bachillerato) con:

- TEA — Trastorno del Espectro Autista
- TDAH — Déficit de Atención e Hiperactividad
- Síndrome de Down
- Dislexia
- Discalculia
- Disgrafía
- Dificultades de aprendizaje generales

Cada condición se analiza de forma independiente mediante el perfil neuroeducativo
individual. TEOplay no aplica protocolos genéricos: adapta en función del patrón de
aprendizaje de cada niño.

## 3. Arquitectura tecnológica actual

| Capa | Tecnología |
| --- | --- |
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| Backend / Auth | Firebase (Firestore + Authentication + Hosting) |
| IA generativa | OpenAI GPT-4o (contenido pedagógico + perfil neuroeducativo) |
| Apoyos visuales | Wikimedia API (imágenes por tema y concepto clave) |
| Apoyos en video | YouTube API (videos pedagógicos por tema) |
| Aprendizaje automático | Motor de ML propio — evoluciona el perfil con cada sesión |
| Despliegue | Render.com (teoplay2.onrender.com) |

## 4. Perfil Neuroeducativo IA (estado actual)

El perfil se construye en el onboarding y evoluciona con el uso:

- El adulto responsable completa un cuestionario estructurado sobre el niño.
- Puede adjuntar informes académicos, terapéuticos o documentos tipo PIAR.
- GPT-4o analiza los insumos y genera el perfil inicial con: fortalezas, barreras de
  aprendizaje, estrategias para explicar, para ejemplos, para juegos, y lista de
  elementos a evitar.
- Un motor de aprendizaje automático actualiza el perfil con cada sesión completada,
  detectando patrones de precisión, simplificaciones requeridas, trayectoria emocional
  y ritmo de aprendizaje.
- El perfil actualizado alimenta las recomendaciones para casa, colegio y terapia
  visibles en el dashboard de padres.

## 5. Flujo de una sesión completa

Estructura secuencial de 6 cápsulas de aprendizaje:

1. **Introducción** — contexto motivacional, frase de enganche, meta de la sesión.
2. **Conceptos clave** — cards numeradas con íconos, descripción y ejemplos.
3. **Ejemplos visuales** — imágenes vía Wikimedia + diagramación propia.
4. **Video del tema** — video seleccionado de YouTube como refuerzo audiovisual.
5. **Juego interactivo** — actividad generada por IA (5 tipos: clasificación, opción
   múltiple, memoria, intruso, producción).
6. **Resumen y cierre** — repaso de lo aprendido + medición emocional final.

Incluye 3 niveles de profundidad ("Saber más") y apoyos de accesibilidad: narración
por voz, lectura fácil, colores amigables, ajuste de tamaño, modo enfoque.

## 6. Panel de indicadores para padres (estado actual)

Accesible en tiempo real, por niño y por período (hoy / semana / mes / personalizado):

- Sesiones completadas y racha de días activos
- Precisión promedio en juegos (% aciertos)
- Duración promedio de sesión
- Trayectoria emocional: emoción al inicio vs. al final, delta emocional, tendencia
- Nivel de aprendizaje (inicio / proceso / logrado) y simplificaciones
- Asignaturas e intereses trabajados por sesión
- Historial de sesiones completo
- Perfil neuroeducativo con fortalezas y recomendaciones activas

## 7. Asignaturas e idiomas soportados

- **Asignaturas:** Matemáticas, Lenguaje, Inglés, Ciencias Naturales, Historia,
  Sociales, Arte, Ed. Física
- **Idiomas de sesión:** Español, Inglés
- **Intereses motivacionales:** Dinosaurios, Espacio, Arte, Deportes, Animales,
  Videojuegos, Música, Océano, Superhéroes

## 8. Modelo de usuarios actual (pre-evolución)

Confirmado como punto de partida real (a verificar en detalle contra el código en Fase 1):

- Un adulto se registra con **un rol**: padre/madre de familia, docente, o terapeuta.
- Ese adulto puede registrar **varios niños**.
- **No existe hoy** un concepto de múltiples adultos vinculados a un mismo niño.
  Este es el cambio central que introduce la evolución hacia el perfil colaborativo.

## 9. Estado actual y roadmap heredado

**Completado / en producción:**
- Perfil neuroeducativo con IA + motor de aprendizaje automático
- Generación de sesiones completas (6 cápsulas) con GPT-4o
- Panel de indicadores con trayectoria emocional y métricas de aprendizaje
- Apoyos visuales (Wikimedia) y de video (YouTube)
- 5 tipos de juegos interactivos generados por IA
- Diseño de interfaz inclusivo con apoyos de accesibilidad
- Reporte exportable en PDF por sesión

**En evaluación / roadmap original:**
- Integración con terapeutas (acceso a panel, notas clínicas, alertas)
- Módulo para docentes y colegios
- Modelo de negocio: freemium, suscripción familiar, licencia institucional

---

# VISIÓN DE EVOLUCIÓN

## 10. De plataforma que adapta a plataforma colaborativa

TEOplay posee hoy un Perfil Neuroeducativo Dinámico que constituye el núcleo de toda
la plataforma. Este componente **no debe reemplazarse. Debe fortalecerse.**

La siguiente etapa consiste en evolucionar TEOplay desde una plataforma que adapta
contenidos educativos hacia una **plataforma colaborativa de inteligencia
neuroeducativa**. El Perfil Neuroeducativo debe dejar de alimentarse únicamente de
las interacciones dentro de TEOplay y empezar a enriquecerse con información
proveniente de todos los actores del proceso del estudiante: familia, docentes,
terapeutas, especialistas médicos, y el propio estudiante mediante el uso de TEOplay.

**El objetivo no es construir múltiples perfiles. Es mantener un único Perfil
Neuroeducativo Vivo** que represente la mejor comprensión posible sobre cómo aprende
y evoluciona el estudiante.

## 11. Filosofía del producto

TEOplay no pretende convertirse en:
- Una Historia Clínica Electrónica.
- Un sistema administrativo escolar.
- Un software de gestión terapéutica.

Su propósito es ser una plataforma de inteligencia neuroeducativa capaz de conservar,
integrar y analizar el conocimiento acumulado sobre el proceso de aprendizaje del
estudiante, para facilitar mejores decisiones educativas, terapéuticas y familiares.

**Misión principal:** evitar que cada nuevo profesional deba comenzar desde cero a
conocer al estudiante.

**Nota de diseño (visión a futuro, no Fase 2):** se contempla integrar más adelante
un chatbot especializado que permita a los actores interactuar conversacionalmente
con el conocimiento acumulado del estudiante. El Perfil Neuroeducativo Vivo debe
diseñarse desde ahora como una **capa de conocimiento consultable** — no solo como
registros para mostrar en un dashboard — para que sirva igual de bien a una interfaz
humana y a un chatbot basado en LLM sin rediseñar el modelo más adelante.

Ese chatbot sería un asesor de primer nivel exclusivo del niño consultado (no un
chat genérico tipo ChatGPT): responde solo con base en el perfil neuroeducativo
del estudiante en cuestión, y tiene límites explícitos — **no da diagnósticos, no
indica ni sugiere medicación**. Su función es orientar con recomendaciones
prácticas de primer nivel (rutinas, estrategias de apoyo), no sustituir criterio
profesional.

**Matiz importante para el diseño de las 6 dimensiones (aplica ya, no solo al
futuro chatbot):** el dato subyacente de cada dimensión es el mismo para todos
los actores, pero la forma de comunicarlo debe adaptarse a quién lo consulta —
no es lo mismo explicarle a una familia cómo va su hijo que explicárselo a un
fonoaudiólogo, un terapeuta ocupacional o un docente. Mismo contenido, distinto
lenguaje/tono/nivel técnico según la audiencia. Esto probablemente implique
generar (o adaptar vía IA) el resumen de cada dimensión en el momento de la
consulta según el rol de quien pregunta, en vez de guardar un texto separado y
pre-redactado por cada rol (evita el costo de mantener versiones sincronizadas).

**Pieza pendiente identificada (no implementada, capturar para fase futura):**
hoy la subida de informe/PDF solo ocurre una vez, durante el onboarding inicial.
Pero informes reales como el PIAR (actualizado típicamente cada bimestre) o
reportes de seguimiento terapéutico (cada ~3 meses) cambian con el tiempo. Falta
un mecanismo para que la familia pueda subir informes actualizados después del
onboarding, en cualquier momento, como otra fuente que enriquezca el perfil
vivo — hoy no existe ningún punto de la app para hacer esto fuera del wizard
inicial. Evaluar cómo encaja esto con el mecanismo de "calcular al consultar"
ya definido (un informe nuevo cuenta como evidencia nueva, igual que una
observación de un especialista).

**Requisito confirmado para el módulo de dimensiones — exportar a PDF:** el
módulo debe incluir un botón para descargar el perfil neuroeducativo completo
en PDF, organizado por dimensión (resumen general + resumen de cada una de las
6 dimensiones con su estado actual). Utilidad concreta: una familia puede
generarlo y compartirlo con un especialista nuevo para que vea de un vistazo
el valor de la plataforma antes de integrarse a ella. Nota técnica: ya existe
un exportador de PDF en el proyecto (`pdfExport.ts`), pero está enfocado en el
reporte de una sesión individual — habrá que construir una variante nueva
para el perfil por dimensiones, no reutilizar el existente tal cual.

**Tres refinamientos adicionales confirmados para el módulo de dimensiones:**

1. **Indicador de progreso (no calificación):** mostrar un porcentaje/indicador
   cuantitativo únicamente en las dimensiones donde ya existe un dato real y
   con sentido (Aprendizaje académico vía precisión de sesiones; Regulación
   emocional vía trayectoria emocional) — no inventar un número en dimensiones
   sin métrica cuantitativa real (Comunicación, Autonomía, Salud). Principio de
   encuadre obligatorio: el número nunca se presenta como nota/calificación —
   siempre se acompaña de una redacción que lo enmarca como evolución/ajuste de
   estrategia, nunca como juicio sobre la capacidad del niño (ej. un valor bajo
   se explica como "hay que ajustar las estrategias aplicadas", no como "le va
   mal").

2. **Recomendaciones integradas por dimensión:** en vez de una lista de
   recomendaciones genérica y separada (como existe hoy en
   `SesionGenerada.recomendaciones`/`PerfilNeuroeducativo.recomendaciones`),
   cada tarjeta de dimensión debe incluir su propia recomendación puntual y
   accionable, generada junto con su resumen — no un texto genérico flotando
   aparte.

3. **Canal de aprendizaje predominante (estilo DUA):** indicar si se percibe
   una preferencia por canal visual, auditivo o kinestésico. **Aún no
   confirmado si hay señal aprovechable hoy** — pendiente de que Claude Code
   revise si el desempeño ya varía de forma aprovechable entre los 5 tipos de
   juego existentes (clasificación, opción múltiple, memoria, intruso,
   producción) antes de comprometerse a esta pieza como "barata"; si no hay
   señal explotable, requeriría instrumentar algo nuevo, a evaluar aparte.

**Estructura final consolidada del módulo de dimensiones:**

- **Centro/principal:** las 6 tarjetas de dimensión (resumen narrativo +
  recomendación puntual integrada donde aplique).
- **Panel aparte, pequeño (no saturar):** 3 indicadores categóricos, simples
  de entender —
  - **Emoción predominante:** dos fuentes complementarias — cuantitativa
    (ya existe: emoción antes/después de cada sesión de lección) y
    cualitativa (lo que un actor describe en su retroalimentación, ej.
    "estuvo alterado por cambios de rutina") — ambas alimentan la misma
    dimensión sin competir.
  - **Nivel de comprensión:** Alto/Medio/Bajo (candidato: ya existe
    `dashboardMetrics.nivelAprendizaje`, verificar si aplica directo o
    necesita ajuste para representar un período, no solo una sesión).
  - **Autonomía:** derivada de señales de sesión (las dos señales de bajo
    costo ya identificadas: `pedirExplicacionAlternativa`, finalización de
    juego abierto) + el onboarding ya reformulado.
  - Análisis cruzado por asignatura/estrategia pedagógica (como existía en
    la versión institucional anterior) queda explícitamente pospuesto para
    una fase futura — no es parte de este alcance.
- **Barra de acciones, condicionada por rol:**
  - Flexibilizar clase — familia y docente.
  - Ficha de retroalimentación — todos los actores vinculados.
  - Subir informe — todos los actores vinculados (no restringido solo a
    familia): un informe subido es simplemente otro tipo de evidencia, igual
    que una observación de texto libre, y dispara el mismo mecanismo de
    "hay algo nuevo, recalcular al consultar". Esto evita el cuello de
    botella de que todo informe deba pasar primero por la familia (ej. el
    terapeuta sube directo su informe de seguimiento trimestral, el colegio
    sube directo el PIAR actualizado).
  - Descargar perfil en PDF — todos los actores vinculados.

## 12. Dimensiones del Perfil Neuroeducativo

El perfil organiza el conocimiento del estudiante en seis dimensiones. Cada una
consolida información de todos los actores autorizados y ofrece una vista clara,
resumida y accionable.

**1. Aprendizaje y desempeño académico**
Estilo y canales de aprendizaje predominantes, estrategias pedagógicas exitosas,
dificultades académicas, ajustes/flexibilizaciones efectivas, nivel de progreso,
recomendaciones educativas.

**2. Comunicación e interacción social**
Formas de comunicación predominantes, interacción con pares y adultos, participación
en actividades, fortalezas comunicativas, barreras observadas, estrategias de apoyo.

**3. Regulación emocional y comportamiento**
Regulación emocional, conductas observadas, factores desencadenantes, estrategias de
autorregulación, motivadores, recomendaciones por contexto.

**4. Autonomía y funcionamiento cotidiano**
Organización, rutinas, autonomía en actividades, seguimiento de instrucciones,
habilidades funcionales, oportunidades de fortalecimiento.

**5. Salud, desarrollo e intervención**
Solo información funcional relevante para el proceso educativo (no reemplaza una
Historia Clínica Electrónica): objetivos de intervención, recomendaciones de
especialistas, restricciones funcionales relevantes, seguimiento de terapias,
aspectos del desarrollo que impactan el aprendizaje.

**6. Intereses, fortalezas y motivadores**
Intereses predominantes, habilidades sobresalientes, motivadores efectivos,
preferencias, contextos de mejor desempeño, recursos que favorecen el aprendizaje.

Toda nueva evidencia registrada en la plataforma debe enriquecer una o varias de
estas dimensiones.

## 13. Decisiones de diseño ya tomadas

Estas decisiones fueron acordadas antes de iniciar Fase 1/2 y son punto de partida
obligatorio para el diseño técnico:

1. **Modelo de vínculo adulto-estudiante:** hoy es 1 adulto (rol único: padre/madre,
   docente o terapeuta) → N niños registrados por él. La evolución introduce un
   vínculo muchos-a-muchos: varios adultos con distintos roles pueden estar vinculados
   al mismo estudiante.

2. **Formato de las observaciones/evidencia:** formulario mixto — campos
   estructurados (actor que observa, fecha, dimensión sugerida opcional, nivel de
   relevancia) + un campo de texto libre. La IA (mismo motor que ya arma el perfil
   inicial) analiza el texto libre y clasifica la evidencia en una o varias de las 6
   dimensiones automáticamente. El actor que registra la observación no necesita saber
   de antemano en qué dimensión clasificarla.

3. **Prioridad:** alta. El perfil colaborativo se considera la base habilitadora para
   el resto del roadmap (integración terapeutas, módulo docentes, futuro chatbot) —
   no un módulo paralelo o secundario.

4. **Modelo de acceso/invitación:** el adulto que registró originalmente al niño
   controla quién más tiene acceso. Se vincula a nuevos actores (docente, terapeuta)
   por invitación explícita (correo o código), no por solicitud abierta ni acceso
   automático vía colegio.

5. **Modelo de permisos por rol (confirmado, base para las reglas de Fase 3):**

   | Acción | Familia | Docente/Terapeuta vinculado |
   | --- | --- | --- |
   | Ver perfil neuroeducativo (6 dimensiones completas) | ✅ | ✅ |
   | Generar sesiones de aprendizaje con el niño | ✅ | ✅ |
   | Editar datos del niño (condición, intereses, etc.) | ✅ | ❌ |
   | Invitar a nuevos actores | ✅ | ❌ |
   | Crear observaciones sobre el niño | ✅ | ✅ |

   Familia = dueño total (equivalente al dueño único de hoy). Docente/terapeuta =
   colaborador operativo: puede trabajar con el niño y ver el perfil completo, pero
   no puede modificar la identidad del niño ni decidir quién más tiene acceso.

   **No hay restricción de dimensiones por rol** — todo actor vinculado ve las 6
   dimensiones completas. La granularidad de permisos está en editar vs. no editar
   al niño, y en invitar vs. no invitar, no en qué parte del perfil puede ver.

## 14. Mapa técnico de evolución — 5 fases

**Fase 1 — Comprensión de la arquitectura actual**
Revisar arquitectura, modelo de datos, Firebase, identificar puntos de extensión.
Evitar cualquier reingeniería innecesaria.

**Fase 2 — Diseño de la evolución**
Diseñar el modelo del Perfil Neuroeducativo Vivo, el modelo de evidencia, las nuevas
estructuras de datos, la relación actores-observaciones-perfil, el flujo completo de
información. (Ver borrador de modelo de datos en sección 15.)

**Fase 3 — Implementación incremental**
Incorporar nuevas estructuras, adaptar servicios existentes, mantener compatibilidad
con producción, no romper funcionalidades existentes, cambios modulares.

**Fase 4 — Inteligencia Neuroeducativa**
Recomendaciones personalizadas según rol del usuario, evolución automática del
perfil a partir de evidencia disponible, detección de patrones, resúmenes
inteligentes, apoyo a decisiones educativas/terapéuticas/familiares.

**Fase 5 — Consolidación**
Optimización, refactorización solo si es estrictamente necesaria, pruebas
funcionales y técnicas, documentación técnica, preparación para futuras evoluciones.

## 15. Borrador de modelo de datos propuesto (Fase 2 — sujeto a validación en Fase 1)

**Advertencia:** este es un borrador conceptual hecho sin ver el código ni el esquema
real de Firestore. Debe contrastarse y ajustarse contra la estructura existente antes
de implementar nada. No crear estas colecciones a ciegas.

```
students/{studentId}
  - datos actuales del niño (igual que hoy)

studentLinks/{linkId}
  - studentId
  - userId (adulto vinculado)
  - role: "familia" | "docente" | "terapeuta"
  - status: "activo" | "invitado" | "revocado"
  - canEdit: boolean     // true solo si role == "familia"
  - canInvite: boolean   // true solo si role == "familia"
  - invitedBy: userId
  - createdAt

observations/{observationId}
  - studentId
  - authorId (userId de quien observa)
  - authorRole: "familia" | "docente" | "terapeuta"
  - structuredFields: { relevancia, dimensionSugerida?, ... }
  - freeText: string
  - classifiedDimensions: string[]   // resultado de la IA
  - createdAt

neuroeducationalProfile/{studentId}
  dimensions:
    aprendizajeYDesempeno:   { summary, evidenceRefs[], updatedAt }
    comunicacionSocial:      { summary, evidenceRefs[], updatedAt }
    regulacionEmocional:     { summary, evidenceRefs[], updatedAt }
    autonomiaCotidiana:      { summary, evidenceRefs[], updatedAt }
    saludDesarrollo:         { summary, evidenceRefs[], updatedAt }
    interesesFortalezas:     { summary, evidenceRefs[], updatedAt }
```

**Principio de diseño:** cada dimensión guarda un resumen narrativo (consumible por
dashboard y por un futuro chatbot) más referencias trazables a las observaciones/
evidencia que lo sustentan (`evidenceRefs`) — nunca solo un texto plano sin
trazabilidad a la fuente.

**Preguntas abiertas para Fase 1 (verificar contra el código real):**
- ¿Cómo se llama hoy la colección de estudiantes y qué campos tiene exactamente?
- ¿Existe ya alguna función/servicio que analice texto libre con GPT-4o, para
  reutilizar el mismo patrón/prompt en `observations`?
- ¿Las reglas de seguridad de Firestore actuales permiten fácilmente añadir
  `studentLinks` sin romper las reglas existentes basadas en "dueño del documento"?

---

## 17. Patrones reutilizables de la versión institucional anterior

TEOplay tuvo una versión anterior orientada a colegios (super-admin → rector →
docentes) que no prosperó comercialmente, pero dejó piezas de diseño ya validadas
en producción real que son directamente relevantes para esta evolución. No se
trata de ideas nuevas — son patrones que ya funcionaron una vez y conviene adaptar
en vez de rediseñar desde cero:

1. **Códigos de invitación** (`codigos_invitacion`, ya existe en Firestore): el
   super-admin generaba un código para que un rector se validara la primera vez.
   Patrón reutilizable para: la familia genera un código de invitación con un rol
   específico (docente/terapeuta), y el especialista lo canjea para vincularse
   directo a un alumno vía `studentLinks` — mismo mecanismo, jerarquía más simple
   (sin rector de por medio).

2. **Observación docente estructurada con patrones**: en la versión institucional,
   los docentes registraban actividades realizadas (qué, para qué asignatura) y
   observaciones de **emoción, comprensión y autonomía**, que alimentaban el
   perfil del niño. Esto es, en esencia, el mismo modelo de `observations` +
   clasificación por dimensión que se diseñó en la sección 13-15 — ya fue
   validado en un contexto real. Vale la pena revisar cómo estaba modelado ese
   módulo antes de diseñar `observations` desde cero.

3. **Transferencias** (`transferencias`, ya existe en Firestore): al cambiar un
   niño de colegio, se generaba un código de transferencia que revocaba el
   acceso del colegio anterior y otorgaba acceso al nuevo, preservando el
   contexto acumulado. Es el mismo problema de fondo que revocar/transferir un
   `studentLinks` (ej. cuando cambia de terapeuta) — mismo patrón, aplicado hoy
   a un caso más simple (familia-especialista en vez de colegio-colegio).

4. **Módulo de formación docente** (infografías + video por condición): no es
   parte del alcance inmediato de esta evolución (perfil colaborativo), pero
   queda registrado como pieza existente y reutilizable para una fase futura,
   si se retoma el interés institucional.

**Antes de implementar cualquier pieza nueva relacionada con invitación,
observaciones o transferencia de acceso, revisar primero cómo está construida
la versión institucional equivalente — es más rápido adaptar que rediseñar.**

## 18. Flujo de invitación familia → especialista (acordado, listo para implementar)

**Principio rector:** la familia siempre es dueña de los datos. El especialista
invitado nunca tiene más control que consulta + aporte de observaciones sobre
UN niño específico — nunca acceso general a todos los hijos de una familia, y
nunca la posibilidad de auto-registrarse como dueño de un niño.

**Flujo paso a paso:**

1. La familia entra al módulo del niño específico (no un módulo general — si
   tiene varios hijos, elige cuál) y pulsa "Invitar especialista", eligiendo el
   rol (docente/terapeuta).
2. TEOplay genera un código de un solo uso (formato tipo `TEO-XXXX-YYYY`) y
   crea de inmediato el `studentLinks` correspondiente con `status: 'invitado'`,
   ya atado a ese `studentId` y ese `role` — sin `userId` todavía, porque no se
   sabe aún quién lo canjeará.
3. La familia comparte el código por el medio que prefiera (WhatsApp, correo,
   etc.) — TEOplay NO envía el código automáticamente en esta primera versión;
   no hace falta automatizar ese paso todavía.
4. El especialista se registra o inicia sesión en TEOplay, y en un campo de
   "Tengo un código de invitación" lo ingresa.
5. TEOplay busca el `studentLinks` con ese código, valida que esté `invitado`
   (no usado ni vencido), y lo actualiza: asigna el `userId` real del
   especialista y cambia `status` a `activo`. El código queda invalidado
   (uso único).
6. Desde ese momento, el especialista ve únicamente ese niño, con permisos de
   colaborador (ver perfil completo en las 6 dimensiones, generar lecciones,
   aportar observaciones) — sin poder editar datos del niño ni invitar a nadie
   más (ver tabla de permisos en sección 13).

**Gestión del vínculo por parte de la familia:**
- La familia puede **desvincular** a un especialista en cualquier momento
  (cambia `status` a `revocado`) — pierde acceso de inmediato.
- La familia puede **invitar a un especialista nuevo** para reemplazar al
  anterior (nuevo código, nuevo `studentLinks`) — es simplemente una nueva
  invitación, no requiere un mecanismo especial de "transferencia".

**Explícitamente fuera de alcance por ahora (anotado para revisar más
adelante, no antes):** un especialista actuando como usuario principal /
dueño de los datos de un niño (ej. terapeuta registrando directamente a un
niño sin que la familia lo haya hecho primero). Se descarta por ahora porque
introduce un problema real de consentimiento y control de datos sensibles de
menores que merece su propio diseño con calma — no se resuelve de paso.

**Nota técnica de implementación (hallazgo de la exploración de TEOplay_IA):**
el `create` de `studentLinks` en las reglas actuales exige que quien crea el
documento ya tenga un link activo sobre ese `studentId` — por eso es la
familia (que ya tiene su link activo) quien crea el `studentLinks` en estado
`invitado` en el paso 2, y el canje del código en el paso 5 es un `update`
sobre ese documento ya existente (asignar `userId` + cambiar `status`), no un
`create` nuevo. Esto evita tener que resolver el canje con Cloud Functions o
privilegios elevados — se mantiene como escritura directa del cliente,
cubierta por las reglas ya existentes de `allow update` en `studentLinks`
(revisar si esa regla ya permite esta actualización o si necesita ajustarse
para permitir que el especialista, sin link previo, actualice un documento
que ya existe pero que no le pertenece todavía — esto es lo primero a
diseñar en la próxima sesión).

## 20. Diseño visual de referencia para el módulo de dimensiones

Luis compartió un mockup de referencia (layout tipo dashboard con sidebar,
tarjetas de dimensión con ícono/color propio, barras de progreso, y paneles
laterales de información general/actividad reciente/recomendaciones). **El
concepto visual y la estética se adoptan como referencia real de diseño** —
tarjetas por dimensión con color e ícono distintivo, jerarquía clara de
información, tono amigable. **El contenido y la funcionalidad se ajustan al
alcance ya acordado en las secciones 18-19**, no al mockup literal:

- Las 6 tarjetas de dimensión sí, con el estilo visual del mockup (color/ícono
  propio, resumen narrativo).
- Las barras de porcentaje del mockup se muestran **solo** en las dimensiones
  donde existe una métrica cuantitativa real (Aprendizaje académico, Regulación
  emocional) — no en las 6 por igual, y siempre encuadradas como progreso/
  ajuste de estrategia, nunca como calificación.
- El panel "Recomendaciones destacadas" del mockup (lista aparte) se reemplaza
  por una recomendación integrada dentro de cada tarjeta de dimensión, no un
  panel separado.
- El panel "Actividad reciente" del mockup es una buena idea a evaluar más
  adelante, alimentado por observaciones/informes reales subidos — no es parte
  del alcance inmediato.
- Módulos del sidebar del mockup que no existen ni están planeados (Reportes,
  Comunicaciones, Documentos, Configuración como secciones separadas) no forman
  parte de este alcance — quedan fuera por ahora.
- El botón "Agregar nueva observación" del mockup sí se adopta, junto con
  "Flexibilizar clase", "Subir informe" y "Descargar perfil en PDF" (ver
  sección 18 para las reglas de qué rol ve cada botón).

## 21. Módulo de dimensiones — diseño final aprobado, listo para implementar

**Es la pantalla principal** a la que llega cualquier usuario (familia,
docente, terapeuta) al validarse en TEOplay.

**Estructura:**
- Encabezado: foto/nombre/edad/grado/condición del niño + fecha de última
  actualización general.
- Centro: 6 tarjetas de dimensión (color/ícono propio por dimensión), cada una
  con resumen narrativo + recomendación puntual **adaptada al actor
  conectado** (mismo dato de fondo, distinto enfoque/lenguaje si es
  familia/casa, docente/colegio o terapeuta/terapia — mismo mecanismo de
  "resumen canónico + lente por rol al consultar" ya acordado en la sección 20).
  Solo las dimensiones 1 (Aprendizaje) y 3 (Regulación emocional) muestran un
  indicador de progreso tipo barra, siempre encuadrado como evolución/ajuste
  de estrategia, nunca como calificación.
- **Clic en una tarjeta → modal con el detalle completo de esa dimensión**,
  mostrando al final la fecha exacta en que esa dimensión específica fue
  actualizada por última vez (cada dimensión tiene su propio timestamp, no
  solo uno general del perfil).
- Panel lateral, 3 indicadores simples: emoción predominante (reutilizando el
  widget "Trayectoria emocional" ya existente en el dashboard), nivel de
  comprensión Alto/Medio/Bajo (reutilizando `nivelAprendizaje` ya existente),
  autonomía (derivada de simplificaciones + señales de sesión ya
  identificadas).
- **Cápsula de recomendaciones consolidadas**, debajo de los 3 indicadores en
  el mismo panel lateral: resumen de 2-3 recomendaciones tomadas de las
  dimensiones, tituladas según el rol conectado ("Recomendaciones para la
  familia" / "para el colegio" / "para la terapia") — mismas recomendaciones
  que ya aparecen dentro de cada tarjeta, solo consolidadas para acceso rápido.
- Barra de acciones inferior, condicionada por rol:

  | Acción | Familia | Docente | Terapeuta |
  |---|---|---|---|
  | Flexibilizar clase | ✅ | ✅ | ❌ |
  | Ficha de retroalimentación | ✅ | ✅ | ✅ |
  | Subir informe | ✅ | ✅ | ✅ |
  | Descargar perfil en PDF | ✅ | ✅ | ✅ |
  | Invitar especialista | ✅ | ❌ | ❌ |

**Mecanismo de actualización:** cálculo bajo demanda al abrir el módulo — se
revisa si hay evidencia nueva desde la última vez (sesión, observación,
informe) y solo entonces se recalculan las dimensiones afectadas. No existe
motor de servidor automático (no hay backend propio).

**Explícitamente fuera de alcance de esta primera versión (documentado, no
descartado):**
- Canal de aprendizaje predominante estilo DUA (visual/auditivo/kinestésico),
  incluida la variante de que podría variar por asignatura — pospuesto por
  complejidad, a evaluar en fase futura.
- Panel de "Actividad reciente" tipo feed.
- Análisis cruzado por asignatura/estrategia pedagógica (como en la versión
  institucional anterior).
- Chatbot asesor del niño (ver sección 20).



## 22. Forma de trabajo acordada



- Sesiones de ~60 minutos, cada una con un entregable concreto.
- Evolución incremental: preservar estabilidad, no reingeniería.
- El asistente actúa como Director Técnico: cuestiona decisiones, identifica riesgos,
  propone alternativas, mantiene visión de arquitectura consistente.
- No asumir información no verificada: si falta contexto del sistema real (código,
  Firestore, reglas, servicios), se debe solicitar explícitamente antes de proponer
  cambios.

*TEOplay · by Parquetrópolis · 2026 · teoplay2.onrender.com*
