/**
 * wikimediaQueryDictionary.ts
 *
 * Diccionario de traducción español → query optimizado para Wikimedia Commons.
 * Organizado por asignatura. Cubre conceptos del currículo escolar colombiano.
 *
 * Uso:
 *   import { buildConceptoWikimediaQuery } from '@/utils/wikimediaQueryDictionary';
 */

// ── Ciencias Naturales ────────────────────────────────────────────────────────
const CIENCIAS: Record<string, string> = {
    // Sistema nervioso
    'cerebro': 'human brain anatomy',
    'médula espinal': 'spinal cord anatomy',
    'neurona': 'neuron diagram',
    'nervio': 'nerve fiber',
    'sistema nervioso': 'nervous system diagram',
    'sistema nervioso central': 'central nervous system diagram',
    'sistema nervioso periférico': 'peripheral nervous system',

    // Sistema circulatorio
    'corazón': 'human heart anatomy',
    'sangre': 'blood cells microscope',
    'arteria': 'artery cross section',
    'vena': 'vein anatomy',
    'glóbulo rojo': 'red blood cell',
    'glóbulo blanco': 'white blood cell',
    'sistema circulatorio': 'circulatory system diagram',
    'pulso': 'heartbeat pulse',

    // Sistema respiratorio
    'pulmón': 'human lung anatomy',
    'pulmones': 'human lungs anatomy',
    'tráquea': 'trachea anatomy',
    'bronquio': 'bronchi lung diagram',
    'diafragma': 'diaphragm breathing',
    'sistema respiratorio': 'respiratory system diagram',
    'respiración': 'respiration diagram',

    // Sistema digestivo
    'estómago': 'human stomach anatomy',
    'intestino': 'intestine anatomy',
    'intestino delgado': 'small intestine anatomy',
    'intestino grueso': 'large intestine anatomy',
    'hígado': 'human liver anatomy',
    'páncreas': 'pancreas anatomy',
    'sistema digestivo': 'digestive system diagram',
    'digestión': 'digestion process diagram',

    // Sistema óseo y muscular
    'hueso': 'human bone structure',
    'esqueleto': 'human skeleton diagram',
    'músculo': 'muscle fiber anatomy',
    'articulación': 'joint anatomy diagram',
    'sistema óseo': 'skeletal system diagram',
    'sistema muscular': 'muscular system diagram',
    'columna vertebral': 'vertebral column spine',

    // Célula
    'célula': 'animal cell diagram',
    'célula vegetal': 'plant cell diagram',
    'célula animal': 'animal cell diagram',
    'membrana celular': 'cell membrane diagram',
    'núcleo celular': 'cell nucleus diagram',
    'mitocondria': 'mitochondria diagram',
    'cloroplasto': 'chloroplast diagram',
    'citoplasma': 'cytoplasm cell',
    'vacuola': 'vacuole cell diagram',
    'ribosoma': 'ribosome diagram',
    'pared celular': 'plant cell wall diagram',

    // Ecosistemas
    'ecosistema': 'ecosystem diagram',
    'cadena alimentaria': 'food chain diagram',
    'red trófica': 'food web diagram',
    'bioma': 'world biomes map',
    'selva': 'tropical rainforest',
    'desierto': 'desert ecosystem',
    'bosque': 'forest ecosystem',
    'océano': 'ocean ecosystem',
    'pradera': 'grassland ecosystem',
    'depredador': 'predator prey relationship',
    'presa': 'prey animal',
    'productor': 'plant producer ecosystem',
    'consumidor': 'consumer ecosystem',
    'descomponedor': 'decomposer fungi bacteria',
    'valles': 'valleys',
    'llanuras': 'plains',
    'mesetas': 'plateaus',
    'montañas': 'mountains',
    'cordillera de los andes': 'Andes mountain range',

      

    // Ciclos naturales
    'ciclo del agua': 'water cycle diagram',
    'ciclo hidrológico': 'hydrological cycle diagram',
    'evaporación': 'evaporation water cycle',
    'condensación': 'condensation water cycle',
    'precipitación': 'precipitation rain diagram',
    'ciclo del carbono': 'carbon cycle diagram',
    'ciclo del nitrógeno': 'nitrogen cycle diagram',
    'fotosíntesis': 'photosynthesis diagram',
    'respiración celular': 'cellular respiration diagram',
    'volcán': 'augustine volcano Jan 24 2006',
    'magma': 'volcano magma',
    'erupción': 'Kilauea Volcanic Eruption Big Island Hawaii 2018 (31212271237).jpg',
    'erupción volcánica': 'Kilauea Volcanic Eruption Big Island Hawaii 2018 (31212271237).jpg',
    'volcanes': 'earth volcanoes',

    // Materia y estados
    'átomo': 'atom structure diagram',
    'molécula': 'molecule structure',
    'estado sólido': 'solid state matter',
    'estado líquido': 'liquid state matter',
    'estado gaseoso': 'gas state matter',
    'cambio de estado': 'states of matter change diagram',
    'fusión': 'melting solid liquid',
    'evaporación térmica': 'vaporization boiling',
    'solidificación': 'solidification freezing',

    // Plantas
    'planta': 'plant parts diagram',
    'raíz': 'plant root diagram',
    'tallo': 'plant stem diagram',
    'hoja': 'leaf structure diagram',
    'flor': 'flower parts diagram',
    'fruto': 'fruit anatomy',
    'semilla': 'seed germination diagram',
    'germinación': 'seed germination stages',
    'polinización': 'pollination diagram',

    // Animales
    'mamífero': 'mammal characteristics',
    'reptil': 'reptile anatomy',
    'anfibio': 'amphibian lifecycle',
    'ave': 'bird anatomy',
    'pez': 'fish anatomy',
    'insecto': 'insect body parts',
    'arácnido': 'spider anatomy',
    'invertebrado': 'invertebrate animals',
    'vertebrado': 'vertebrate animals',
    'metamorfosis': 'butterfly metamorphosis diagram',

    // Física básica
    'fuerza': 'force physics diagram',
    'gravedad': 'gravity force diagram',
    'fricción': 'friction force diagram',
    'energía': 'energy types diagram',
    'energía cinética': 'kinetic energy diagram',
    'energía potencial': 'potential energy diagram',
    'luz': 'light spectrum diagram',
    'sonido': 'sound wave diagram',
    'calor': 'heat transfer diagram',
    'electricidad': 'electricity circuit diagram',
    'magnetismo': 'magnetism field lines',
    'imán': 'magnet poles diagram',

    // Astronomía
    'sistema solar': 'Solar System graphic by NASA (wide).png',
    'sol': 'Solar Orbiter’s widest high-res view of the Sun ESA508430.jpg',
    'planeta': 'Montage of Our Solar System.jpg',
    'luna': 'FullMoon2010.jpg',
    'tierra': 'The Blue Marble (5052124705).jpg',
    'órbita': 'orbit solar system',
    'eclipse': 'solar lunar eclipse diagram',
    'estrella': 'star life cycle',
    'galaxia': 'galaxy milky way',
    'marte': 'Mars',
    'venus': 'Venus globe.jpg',
    'mercurio': 'Mercury in color - Prockter07 centered.jpg',
    'júpiter': '790106-0203 Voyager 58M to 31M reduced.gif',
    'saturno': 'Saturn in Natural Colors.jpg',
    'urano': 'Uranus2.jpg',
    'neptuno': 'Neptune Full.jpg',
    'plutón': 'Pluto-01 Stern 03 Pluto Color TXT.jpg',
};

// ── Historia y Ciencias Sociales ──────────────────────────────────────────────
const HISTORIA: Record<string, string> = {
    // Colombia
    'independencia de colombia': 'Colombian independence 1810',
    'batalla de boyacá': 'Battle of Boyacá 1819',
    'simón bolívar': 'Simón Bolívar portrait',
    'francisco de paula santander': 'Francisco Santander Colombia',
    'gran colombia': 'Gran Colombia map 1819',
    'conquista española': 'Spanish conquest Americas',
    'colonia española': 'Spanish colonial Americas',
    'virreinato': 'Viceroyalty New Granada map',
    'constitución colombia': 'Colombian constitution 1991',
    'bogotá': 'Bogotá Colombia capital',
    'cartagena colonial': 'Cartagena colonial walls',
    'muiscas': 'Muisca indigenous Colombia',

    // Culturas precolombinas
    'azteca': 'Aztec civilization',
    'maya': 'Maya civilization',
    'inca': 'Inca civilization Machu Picchu',
    'calendario azteca': 'Aztec Sun Stone calendar',
    'machu picchu': 'Machu Picchu Peru',
    'tenochtitlán': 'Tenochtitlan Aztec city',
    'pirámide maya': 'Maya pyramid Chichen Itza',
    'quipu': 'Inca quipu accounting',

    // Historia universal
    'revolución francesa': 'French Revolution 1789',
    'revolución industrial': 'Industrial Revolution factory',
    'primera guerra mundial': 'World War I trench',
    'segunda guerra mundial': 'World War II map',
    'edad media': 'Medieval castle Middle Ages',
    'renacimiento': 'Renaissance painting Italy',
    'ilustración': 'Enlightenment philosophy',
    'imperialismo': 'European imperialism map Africa',
    'colonialismo': 'European colonialism map',
    'esclavitud': 'slavery historical',
    'revolución americana': 'American Revolution 1776',

    // Geografía
    'mapa de colombia': 'Colombia map',
    'mapa de suramérica': 'South America map',
    'mapa de latinoamérica': 'Latin America map',
    'mapa mundi': 'world map political',
    'continentes': 'world continents map',
    'océanos': 'world oceans map',
    'cordillera de los andes': 'Andes mountain range',
    'río amazonas': 'Amazon River',
    'río magdalena': 'Magdalena River Colombia',
    'selva amazónica': 'Amazon rainforest',
    'caribe': 'Caribbean map',
    'pacifico': 'Pacific Ocean map',

    // Gobierno y sociedad
    'democracia': 'democracy government diagram',
    'poder ejecutivo': 'executive power government',
    'poder legislativo': 'legislative power congress',
    'poder judicial': 'judicial power court',
    'congreso': 'congress parliament building',
    'presidencia': 'president government',
    'constitución': 'constitution document',
    'derechos humanos': 'human rights declaration',
    'ciudadanía': 'citizenship rights',
    'municipio': 'municipality government Colombia',
    'departamento': 'Colombia departments map',
};

// ── Matemáticas ───────────────────────────────────────────────────────────────
const MATEMATICAS: Record<string, string> = {
    'fracción': 'fraction diagram visual',
    'fracciones': 'fractions visual representation',
    'numerador': 'numerator fraction diagram',
    'denominador': 'denominator fraction diagram',
    'número entero': 'integer number line',
    'número natural': 'natural numbers',
    'número decimal': 'decimal number diagram',
    'recta numérica': 'number line diagram',
    'suma': 'addition math diagram',
    'resta': 'subtraction math diagram',
    'multiplicación': 'multiplication diagram',
    'división': 'division diagram',
    'potencia': 'exponent power math',
    'raíz cuadrada': 'square root diagram',
    'triángulo': 'triangle geometry',
    'círculo': 'circle geometry diagram',
    'cuadrado': 'square geometry',
    'rectángulo': 'rectangle geometry',
    'área': 'area geometry formula',
    'perímetro': 'perimeter geometry',
    'volumen': 'volume geometry diagram',
    'ángulo': 'angle geometry diagram',
    'ángulo recto': 'right angle 90 degrees',
    'porcentaje': 'percentage diagram',
    'probabilidad': 'probability diagram',
    'estadística': 'statistics graph chart',
    'gráfica de barras': 'bar graph chart',
    'gráfica circular': 'pie chart diagram',
    'ecuación': 'equation algebra',
    'variable': 'variable algebra x',
    'conjunto': 'set theory Venn diagram',
    'simetría': 'symmetry diagram',
    'patrón': 'math pattern sequence',
};

// ── Inglés / Francés ──────────────────────────────────────────────────────────
const IDIOMAS: Record<string, string> = {
    // Tiempos verbales
    'present simple': 'present simple tense diagram',
    'present continuous': 'present continuous tense',
    'present perfect': 'present perfect tense timeline',
    'past simple': 'past simple tense diagram',
    'past continuous': 'past continuous tense',
    'future simple': 'future simple will diagram',
    'going to': 'going to future plans',
    'conditional': 'conditional sentences diagram',

    // Gramática inglés
    'pronoun': 'English pronouns chart',
    'noun': 'noun examples English',
    'adjective': 'adjective English examples',
    'verb': 'verb tense English chart',
    'adverb': 'adverb English diagram',
    'preposition': 'preposition English diagram',
    'article': 'article English a an the',
    'vocabulary': 'English vocabulary visual',

    // Vocabulario temático
    'family': 'family members illustration',
    'animals': 'animals English vocabulary',
    'food': 'food vocabulary English',
    'colors': 'colors English chart',
    'numbers': 'numbers English visual',
    'body parts': 'body parts English diagram',
    'school': 'school vocabulary English',
    'house': 'house rooms vocabulary',
    'clothes': 'clothes vocabulary English',
    'weather': 'weather vocabulary English',
    'seasons': 'four seasons illustration',
    'transportation': 'transportation vocabulary',
    'jobs': 'jobs occupations English',

    // Francés
    'présent': 'présent indicatif français',
    'passé composé': 'passé composé français',
    'imparfait': 'imparfait français',
    'futur simple': 'futur simple français',
    'genre': 'genre masculin féminin français',
    'article défini': 'article défini français',
};

// ── Lenguaje y Literatura ─────────────────────────────────────────────────────
const LENGUAJE: Record<string, string> = {
    'sujeto': 'subject predicate sentence diagram',
    'predicado': 'predicate sentence diagram',
    'sustantivo': 'noun examples diagram',
    'verbo': 'verb tense diagram',
    'adjetivo': 'adjective noun modifier',
    'adverbio': 'adverb modifier diagram',
    'oración': 'sentence structure diagram',
    'párrafo': 'paragraph structure writing',
    'cuento': 'short story structure diagram',
    'novela': 'novel structure diagram',
    'poema': 'poem poetry structure',
    'narrador': 'narrator story types',
    'personaje': 'character story types',
    'trama': 'plot story structure diagram',
    'sinónimo': 'synonyms antonyms diagram',
    'antónimo': 'antonyms opposites diagram',
    'metáfora': 'metaphor literary figure',
    'símil': 'simile literary comparison',
    'mayúscula': 'uppercase alphabet',
    'puntuación': 'punctuation marks diagram',
    'ortografía': 'spelling rules diagram',
    'prefijo': 'prefix word parts diagram',
    'sufijo': 'suffix word parts diagram',
    'comunicación': 'communication model diagram',
    'emisor': 'sender receiver communication',
    'receptor': 'communication model diagram',
    'mensaje': 'message communication diagram',
};

// ── Arte ──────────────────────────────────────────────────────────────────────
const ARTE: Record<string, string> = {
    'color primario': 'primary colors mixing',
    'color secundario': 'secondary colors mixing',
    'círculo cromático': 'color wheel chromatic',
    'pintura': 'painting art technique',
    'acuarela': 'watercolor painting technique',
    'óleo': 'oil painting canvas',
    'escultura': 'sculpture art',
    'perspectiva': 'perspective drawing art',
    'proporción': 'proportion art figure',
    'composición': 'art composition rule thirds',
    'barroco': 'Baroque art painting',
    'renacimiento artístico': 'Renaissance art painting',
    'impresionismo': 'Impressionism painting Monet',
    'arte abstracto': 'abstract art painting',
    'arte precolombino': 'pre-Columbian art',
    'arte prehispánico': 'pre-Hispanic art Mesoamerica',
    'muralismo': 'Mexican muralism Diego Rivera',
    'fotografía': 'photography technique',
    'música': 'music notes staff',
    'ritmo': 'rhythm music notation',
    'melodía': 'melody music',
    'instrumento': 'musical instruments',
    'danza': 'dance movement',
    'teatro': 'theater stage performance',
};

// ── Educación Física ──────────────────────────────────────────────────────────
const ED_FISICA: Record<string, string> = {
    'calentamiento': 'warm up exercise stretching',
    'estiramiento': 'stretching exercise',
    'resistencia': 'endurance running exercise',
    'fuerza muscular': 'strength training exercise',
    'flexibilidad': 'flexibility yoga stretching',
    'coordinación': 'coordination exercise children',
    'equilibrio': 'balance exercise',
    'atletismo': 'athletics track field',
    'fútbol': 'football soccer field diagram',
    'baloncesto': 'basketball court diagram',
    'voleibol': 'volleyball court diagram',
    'natación': 'swimming technique',
    'postura': 'posture correct body position',
    'respiración deportiva': 'breathing exercise sport',
};

// ── Tecnología e Informática ──────────────────────────────────────────────────
const TECNOLOGIA: Record<string, string> = {
    'computador': 'computer parts diagram',
    'hardware': 'computer hardware components',
    'software': 'software computer diagram',
    'procesador': 'CPU processor diagram',
    'memoria ram': 'RAM memory computer',
    'disco duro': 'hard drive storage',
    'internet': 'internet network diagram',
    'red': 'computer network diagram',
    'algoritmo': 'algorithm flowchart diagram',
    'programación': 'programming code blocks',
    'robótica': 'robotics robot diagram',
    'circuito': 'electronic circuit diagram',
    'inteligencia artificial': 'artificial intelligence diagram',
};

// ── Unión de todos los diccionarios ──────────────────────────────────────────

const TODOS: Record<string, Record<string, string>> = {
    ciencias: CIENCIAS,
    historia: HISTORIA,
    sociales: HISTORIA,
    matematicas: MATEMATICAS,
    ingles: IDIOMAS,
    frances: IDIOMAS,
    lenguaje: LENGUAJE,
    arte: ARTE,
    artes: ARTE,
    ed_fisica: ED_FISICA,
    tecnologia: TECNOLOGIA,
};

// ── Función principal ─────────────────────────────────────────────────────────

export function buildConceptoWikimediaQuery(
    asignatura: string,
    tema: string,
    concepto: string
): string {
    const a = asignatura.toLowerCase().trim();
    const c = concepto.toLowerCase().trim();
    const diccionario = TODOS[a] ?? {};

    // 1. Búsqueda exacta
    if (diccionario[c]) {
        // Para sociales/historia: agrega el tema como contexto geográfico
        const base = diccionario[c];
        if (['sociales', 'historia'].includes(a)) return `${base} ${tema}`;
        return base;
    }

    // 2. Búsqueda parcial
    const parcial = Object.keys(diccionario).find(k => c.includes(k) || k.includes(c));
    if (parcial) {
        const base = diccionario[parcial];
        if (['sociales', 'historia'].includes(a)) return `${base} ${tema}`;
        return base;
    }

    // 3. Fallback — siempre incluye el tema para dar contexto
    const fallbacks: Record<string, string> = {
        ciencias: `${concepto} biology science diagram`,
        historia: `${concepto} ${tema}`,
        sociales: `${concepto} ${tema}`,        // ← "Poder Judicial Colombia"
        matematicas: `${concepto} math diagram`,
        ingles: `${concepto} English`,
        frances: `${concepto} français`,
        lenguaje: `${concepto} language diagram`,
        arte: `${concepto} art`,
        artes: `${concepto} art`,
        ed_fisica: `${concepto} exercise sport`,
        tecnologia: `${concepto} technology diagram`,
    };

    return fallbacks[a] ?? `${concepto} ${tema}`;
}