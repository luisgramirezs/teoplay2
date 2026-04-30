import type { LucideIcon } from "lucide-react";
import {
    Activity,
    ArrowDown,
    ArrowLeftRight,
    ArrowRight,
    ArrowUp,
    ArrowUpDown,
    Atom,
    AudioLines,
    Baby,
    Beaker,
    BookOpen,
    Bone,
    Bookmark,
    Brain,
    Calculator,
    Calendar,
    Circle,
    CircleHelp,
    Cloud,
    CloudRain,
    CloudSun,
    Clock3,
    Compass,
    Divide,
    Dna,
    Droplets,
    Ear,
    Equal,
    Eye,
    FlaskConical,
    Flower2,
    Footprints,
    GitBranch,
    Globe,
    Hand,
    Hash,
    Heart,
    History,
    Info,
    Languages,
    Leaf,
    Lightbulb,
    ListTree,
    MessageSquare,
    MessagesSquare,
    Microscope,
    Minus,
    Moon,
    Mountain,
    MoveDiagonal,
    NotebookPen,
    Orbit,
    PenTool,
    Pencil,
    PencilRuler,
    Percent,
    Plus,
    Quote,
    Radiation,
    RefreshCw,
    Repeat,
    Route,
    Ruler,

    Search,
    Shapes,
    Sigma,
    Snowflake,
    Sparkles,
    Speech,
    SpellCheck,
    Square,
    Star,
    Sun,
    Text,
    Thermometer,
    ThermometerSun,
    Timer,
    Triangle,
    Trees,
    Waves,
    Wind,
    Workflow,
    Zap,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Mapa directo y alias semánticos
// Aquí puedes ampliar por dominios cuando lo necesites.
// ─────────────────────────────────────────────────────────────
const iconMap: Record<string, LucideIcon> = {
    // Fallbacks básicos
    info: Info,
    Info,
    search: Search,
    Search,
    lightbulb: Lightbulb,
    Lightbulb,
    circlehelp: CircleHelp,
    circleHelp: CircleHelp,
    CircleHelp,
    bookmark: Bookmark,
    Bookmark,
    star: Star,
    Star,

    // Matemáticas
    calculator: Calculator,
    Calculator,
    divide: Divide,
    Divide,
    division: Divide,
    división: Divide,
    divisor: Divide,
    dividendo: Divide,
    cociente: Calculator,
    residuo: Calculator,
    resto: Calculator,
    plus: Plus,
    Plus,
    suma: Plus,
    adicionar: Plus,
    minus: Minus,
    Minus,
    resta: Minus,
    equal: Equal,
    Equal,
    igual: Equal,
    igualdad: Equal,
    percent: Percent,
    Percent,
    porcentaje: Percent,
    sigma: Sigma,
    Sigma,
    hash: Hash,
    Hash,
    numero: Hash,
    número: Hash,
    ruler: Ruler,
    Ruler,
    pencilruler: PencilRuler,
    pencilRuler: PencilRuler,
    PencilRuler,
    compass: Compass,
    Compass,
    arrowleftright: ArrowLeftRight,
    arrowLeftRight: ArrowLeftRight,
    ArrowLeftRight,
    arrowupdown: ArrowUpDown,
    arrowUpDown: ArrowUpDown,
    ArrowUpDown,
    movediagonal: MoveDiagonal,
    moveDiagonal: MoveDiagonal,
    MoveDiagonal,

    // Geometría
    triangle: Triangle,
    Triangle,
    triangulo: Triangle,
    triángulo: Triangle,
    circle: Circle,
    Circle,
    circulo: Circle,
    círculo: Circle,
    square: Square,
    Square,
    cuadrado: Square,
    rectangulo: Square,
    rectángulo: Square,
    shapes: Shapes,
    Shapes,
    figura: Shapes,
    figuras: Shapes,
    geometria: Shapes,
    geometría: Shapes,

    // Agua, clima y naturaleza
    droplets: Droplets,
    Droplets,
    gota: Droplets,
    gotas: Droplets,
    agua: Droplets,
    vacuola: Droplets,
    vacúola: Droplets,

    cloud: Cloud,
    Cloud,
    nube: Cloud,
    nubes: Cloud,
    condensacion: Cloud,
    condensación: Cloud,

    cloudrain: CloudRain,
    cloudRain: CloudRain,
    CloudRain,
    lluvia: CloudRain,
    precipitacion: CloudRain,
    precipitación: CloudRain,

    cloudsun: CloudSun,
    cloudSun: CloudSun,
    CloudSun,
    evaporacion: CloudSun,
    evaporación: CloudSun,

    sun: Sun,
    Sun,
    sol: Sun,
    cloroplasto: Sun,

    moon: Moon,
    Moon,
    luna: Moon,

    snowflake: Snowflake,
    Snowflake,
    nieve: Snowflake,

    wind: Wind,
    Wind,
    viento: Wind,

    leaf: Leaf,
    Leaf,
    hoja: Leaf,
    hojas: Leaf,
    planta: Leaf,
    vegetal: Leaf,
    "célula vegetal": Leaf,
    "celula vegetal": Leaf,

    flower2: Flower2,
    Flower2,
    flor: Flower2,

    trees: Trees,
    Trees,
    arbol: Trees,
    árbol: Trees,
    árboles: Trees,
    arboles: Trees,

    mountain: Mountain,
    Mountain,
    montaña: Mountain,
    montana: Mountain,

    waves: Waves,
    Waves,
    mar: Waves,
    olas: Waves,
    acumulacion: Waves,
    acumulación: Waves,

    globe: Globe,
    Globe,
    mundo: Globe,
    planeta: Globe,
    tierra: Globe,

    // Ciencia, laboratorio y materia
    flaskconical: FlaskConical,
    flaskConical: FlaskConical,
    FlaskConical,
    flask: FlaskConical,
    experimento: FlaskConical,
    laboratorio: FlaskConical,

    beaker: Beaker,
    Beaker,
    vaso: Beaker,

    microscope: Microscope,
    Microscope,
    microscopio: Microscope,
    observacion: Microscope,
    observación: Microscope,
    celula: Microscope,
    célula: Microscope,
    citoplasma: Microscope,

    thermometer: Thermometer,
    Thermometer,
    termometro: Thermometer,
    termómetro: Thermometer,
    temperatura: Thermometer,

    thermometersun: ThermometerSun,
    thermometerSun: ThermometerSun,
    ThermometerSun,
    calor: ThermometerSun,

    zap: Zap,
    Zap,
    electricidad: Zap,
    energia: Zap,
    energía: Zap,

    atom: Atom,
    Atom,
    atomo: Atom,
    átomo: Atom,
    particula: Atom,
    partícula: Atom,
    particulas: Atom,
    partículas: Atom,
    nucleo: Atom,
    núcleo: Atom,

    radiation: Radiation,
    Radiation,
    radiacion: Radiation,
    radiación: Radiation,

    orbit: Orbit,
    Orbit,
    orbita: Orbit,
    órbita: Orbit,
    sistemaSolar: Orbit,
    sistemasolar: Orbit,
    "sistema solar": Orbit,

    sparkles: Sparkles,
    Sparkles,
    brillo: Sparkles,

    // Biología y cuerpo
    dna: Dna,
    Dna,
    adn: Dna,
    genetica: Dna,
    genética: Dna,
    herencia: Dna,

    heart: Heart,
    Heart,
    corazon: Heart,
    corazón: Heart,



    brain: Brain,
    Brain,
    cerebro: Brain,

    eye: Eye,
    Eye,
    ojo: Eye,
    vista: Eye,

    ear: Ear,
    Ear,
    oreja: Ear,
    oído: Ear,
    oido: Ear,
    escuchar: Ear,

    hand: Hand,
    Hand,
    mano: Hand,
    manos: Hand,

    footprints: Footprints,
    Footprints,
    pie: Footprints,
    pies: Footprints,
    caminar: Footprints,

    bone: Bone,
    Bone,
    hueso: Bone,
    huesos: Bone,

    baby: Baby,
    Baby,
    bebe: Baby,
    bebé: Baby,
    reproduccion: Baby,
    reproducción: Baby,

    activity: Activity,
    Activity,
    movimiento: Activity,
    actividad: Activity,

    // Lenguaje e idiomas
    bookopen: BookOpen,
    bookOpen: BookOpen,
    BookOpen,
    libro: BookOpen,
    lectura: BookOpen,

    languages: Languages,
    Languages,
    idioma: Languages,
    ingles: Languages,
    inglés: Languages,
    lenguaje: Languages,
    gramatica: Languages,
    gramática: Languages,
    verbo: Languages,
    sujeto: Languages,
    'oracion gramatical': Languages,
    'oración gramatical': Languages,

    pencil: Pencil,
    Pencil,
    lapiz: Pencil,
    lápiz: Pencil,
    escribir: Pencil,

    pentool: PenTool,
    penTool: PenTool,
    PenTool,
    escritura: PenTool,
    redaccion: PenTool,
    redacción: PenTool,

    notebookpen: NotebookPen,
    notebookPen: NotebookPen,
    NotebookPen,
    cuaderno: NotebookPen,
    oracion: NotebookPen,
    oración: NotebookPen,

    messagesquare: MessageSquare,
    messageSquare: MessageSquare,
    MessageSquare,
    mensaje: MessageSquare,
    dialogo: MessageSquare,
    diálogo: MessageSquare,

    messagessquare: MessagesSquare,
    messagesSquare: MessagesSquare,
    MessagesSquare,
    conversacion: MessagesSquare,
    conversación: MessagesSquare,

    text: Text,
    Text,
    texto: Text,
    palabra: Text,
    palabras: Text,

    quote: Quote,
    Quote,
    cita: Quote,
    frase: Quote,

    spellcheck: SpellCheck,
    spellCheck: SpellCheck,
    SpellCheck,
    ortografia: SpellCheck,
    ortografía: SpellCheck,

    speech: Speech,
    Speech,
    hablar: Speech,
    habla: Speech,

    audiolines: AudioLines,
    audioLines: AudioLines,
    AudioLines,
    audio: AudioLines,
    sonido: AudioLines,
    musica: AudioLines,
    música: AudioLines,

    // Tiempo, secuencia y procesos
    arrowright: ArrowRight,
    arrowRight: ArrowRight,
    ArrowRight,
    siguiente: ArrowRight,
    paso: ArrowRight,
    secuencia: ArrowRight,

    arrowdown: ArrowDown,
    arrowDown: ArrowDown,
    ArrowDown,
    bajar: ArrowDown,

    arrowup: ArrowUp,
    arrowUp: ArrowUp,
    ArrowUp,
    subir: ArrowUp,

    refreshcw: RefreshCw,
    refreshCw: RefreshCw,
    RefreshCw,
    cambio: RefreshCw,
    transformacion: RefreshCw,
    transformación: RefreshCw,

    repeat: Repeat,
    Repeat,
    ciclo: Repeat,
    repetir: Repeat,

    clock3: Clock3,
    Clock3,
    tiempo: Clock3,
    hora: Clock3,

    timer: Timer,
    Timer,
    duracion: Timer,
    duración: Timer,

    calendar: Calendar,
    Calendar,
    fecha: Calendar,
    calendario: Calendar,

    history: History,
    History,
    historia: History,
    pasado: History,

    route: Route,
    Route,
    recorrido: Route,
    camino: Route,

    gitbranch: GitBranch,
    gitBranch: GitBranch,
    GitBranch,
    clasificacion: GitBranch,
    clasificación: GitBranch,
    ramas: GitBranch,

    workflow: Workflow,
    Workflow,
    proceso: Workflow,
    pasos: Workflow,

    listtree: ListTree,
    listTree: ListTree,
    ListTree,
    categorias: ListTree,
    categorías: ListTree,
    organizacion: ListTree,
    organización: ListTree,
};

// ─────────────────────────────────────────────────────────────
// Fallback semántico por dominio
// Si no encuentra match exacto, intenta una categoría visual útil.
// ─────────────────────────────────────────────────────────────
function resolveSemanticFallback(name: string): LucideIcon {
    const lower = name.toLowerCase();

    // Biología / célula / organelos
    if (
        /(c[eé]lula|organelo|membrana|pared celular|cloroplasto|vacuola|citoplasma|n[úu]cleo|biolog|tejido|mitocondria)/.test(lower)
    ) {
        return Microscope;
    }

    // Matemáticas / geometría
    if (
        /(divisi[óo]n|fracci[óo]n|suma|resta|multiplicaci[óo]n|ecuaci[óo]n|porcentaje|tri[áa]ngulo|cuadrado|c[ií]rculo|geometr|figura|lado|v[ée]rtice)/.test(lower)
    ) {
        return Shapes;
    }

    // Lenguaje / gramática / idiomas
    if (
        /(gram[aá]tica|verbo|oraci[óo]n|sujeto|idioma|ingl[eé]s|lenguaje|lectura|escritura)/.test(lower)
    ) {
        return Languages;
    }

    // Procesos / secuencias / ciclos
    if (
        /(ciclo|etapa|proceso|secuencia|paso|transformaci[óo]n)/.test(lower)
    ) {
        return Workflow;
    }

    // Naturaleza / clima / agua
    if (
        /(agua|evaporaci[óo]n|condensaci[óo]n|lluvia|nube|sol|planta|hoja|naturaleza)/.test(lower)
    ) {
        return Leaf;
    }

    return Info;
}

// ─────────────────────────────────────────────────────────────
// Resolver final
// ─────────────────────────────────────────────────────────────
export function resolveLucideIcon(name?: string): LucideIcon {
    if (!name) return Info;

    const clean = name.trim();
    const compact = clean.replace(/[\s_-]/g, "");
    const lower = compact.toLowerCase();

    return (
        iconMap[clean] ||
        iconMap[compact] ||
        iconMap[lower] ||
        resolveSemanticFallback(clean)
    );
}