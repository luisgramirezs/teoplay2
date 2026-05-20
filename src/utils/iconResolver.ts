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
    BadgeDollarSign,
    Banknote,
    Beaker,
    Book,
    BookOpen,
    Bone,
    Bookmark,
    Brain,
    Briefcase,
    Building,
    Building2,
    Calculator,
    Calendar,
    Circle,
    CircleHelp,
    Cloud,
    CloudRain,
    CloudSun,
    Clock3,
    Compass,
    Computer,
    Cpu,
    Crown,
    Divide,
    Dna,
    Droplets,
    Ear,
    Equal,
    Eye,
    FlaskConical,
    Flower2,
    Footprints,
    Gavel,
    Gem,
    GitBranch,
    Globe,
    GraduationCap,
    Hand,
    Hash,
    Heart,
    History,
    Info,
    Landmark,
    Languages,
    Leaf,
    Lightbulb,
    ListTree,
    Map,
    MessageSquare,
    MessagesSquare,
    Microscope,
    Minus,
    Moon,
    Mountain,
    MoveDiagonal,
    Music,
    NotebookPen,
    Orbit,
    Paintbrush,
    Palette,
    PenTool,
    Pencil,
    PencilRuler,
    Percent,
    Plus,
    Quote,
    Radiation,
    RefreshCw,
    Repeat,
    Rocket,
    Route,
    Ruler,
    Scale,
    School,
    Search,
    Shield,
    Shapes,
    Sigma,
    Snowflake,
    Sparkles,
    Speech,
    SpellCheck,
    Square,
    Star,
    Sun,
    Swords,
    Text,
    Thermometer,
    ThermometerSun,
    Timer,
    Triangle,
    Trees,
    Trophy,
    Users,
    Vote,
    Waves,
    Wind,
    Workflow,
    Wrench,
    Zap,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Resultado visual
// ─────────────────────────────────────────────────────────────
export type ResolvedVisual =
    | {
        type: "icon";
        icon: LucideIcon;
    }
    | {
        type: "letter";
        letter: string;
    };

// ─────────────────────────────────────────────────────────────
// Normalización fuerte
// ─────────────────────────────────────────────────────────────
function normalize(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[_-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// ─────────────────────────────────────────────────────────────
// Fallback letra
// ─────────────────────────────────────────────────────────────
function fallbackLetter(name: string): string {
    return name?.trim()?.charAt(0)?.toUpperCase() || "?";
}

// ─────────────────────────────────────────────────────────────
// Íconos principales
// ─────────────────────────────────────────────────────────────
const iconMap: Record<string, LucideIcon> = {
    // Básicos
    info: Info,
    ayuda: CircleHelp,
    buscar: Search,
    favorito: Bookmark,
    estrella: Star,
    idea: Lightbulb,

    // Matemáticas
    matematicas: Calculator,
    matemáticas: Calculator,
    suma: Plus,
    resta: Minus,
    division: Divide,
    división: Divide,
    multiplicacion: Calculator,
    multiplicación: Calculator,
    porcentaje: Percent,
    ecuacion: Sigma,
    ecuación: Sigma,
    geometria: Shapes,
    geometría: Shapes,
    regla: Ruler,
    compas: Compass,
    compás: Compass,
    triangulo: Triangle,
    triángulo: Triangle,
    cuadrado: Square,
    circulo: Circle,
    círculo: Circle,

    // Ciencia
    ciencia: Microscope,
    laboratorio: FlaskConical,
    experimento: Beaker,
    microscopio: Microscope,
    atomo: Atom,
    átomo: Atom,
    molecula: Atom,
    molécula: Atom,
    quimica: FlaskConical,
    química: FlaskConical,
    fisica: Zap,
    física: Zap,
    energia: Zap,
    energía: Zap,
    gravedad: Orbit,
    temperatura: Thermometer,
    calor: ThermometerSun,
    electricidad: Zap,
    radiacion: Radiation,
    radiación: Radiation,

    // Biología
    biologia: Dna,
    biología: Dna,
    adn: Dna,
    genetica: Dna,
    genética: Dna,
    celula: Microscope,
    célula: Microscope,
    organelo: Microscope,
    nucleo: Atom,
    núcleo: Atom,
    cerebro: Brain,
    corazon: Heart,
    corazón: Heart,
    ojo: Eye,
    oido: Ear,
    oído: Ear,
    mano: Hand,
    pie: Footprints,
    hueso: Bone,
    bebe: Baby,
    bebé: Baby,

    // Naturaleza
    naturaleza: Leaf,
    planta: Leaf,
    hoja: Leaf,
    flor: Flower2,
    bosque: Trees,
    montaña: Mountain,
    montana: Mountain,
    agua: Droplets,
    lluvia: CloudRain,
    nube: Cloud,
    clima: CloudSun,
    viento: Wind,
    nieve: Snowflake,
    mar: Waves,
    oceano: Waves,
    océano: Waves,
    planeta: Globe,
    tierra: Globe,
    mapa: Map,

    // Gobierno / civismo
    gobierno: Landmark,
    presidencia: Crown,
    presidente: Crown,
    alcaldia: Building2,
    alcaldía: Building2,
    alcalde: Building2,
    democracia: Vote,
    voto: Vote,
    ley: Scale,
    justicia: Gavel,
    tribunal: Gavel,
    corte: Shield,
    constitucion: Book,
    constitución: Book,
    congreso: Building,
    senado: Users,
    ciudadania: Users,
    ciudadanía: Users,
    politica: Landmark,
    política: Landmark,

    // Historia
    historia: History,
    guerra: Swords,
    revolucion: Rocket,
    revolución: Rocket,
    independencia: FlagFallback(),
    imperio: Crown,
    colonia: Building,
    cultura: Gem,

    // Lenguaje
    lenguaje: Languages,
    idioma: Languages,
    español: Languages,
    ingles: Languages,
    inglés: Languages,
    lectura: BookOpen,
    libro: BookOpen,
    escritura: PenTool,
    redaccion: NotebookPen,
    redacción: NotebookPen,
    texto: Text,
    palabra: Text,
    cita: Quote,
    ortografia: SpellCheck,
    ortografía: SpellCheck,
    hablar: Speech,
    conversacion: MessagesSquare,
    conversación: MessagesSquare,
    mensaje: MessageSquare,
    audio: AudioLines,
    musica: Music,
    música: Music,

    // Tecnología
    tecnologia: Cpu,
    tecnología: Cpu,
    computadora: Computer,
    programacion: Cpu,
    programación: Cpu,
    software: Cpu,
    robot: Wrench,
    algoritmo: GitBranch,
    internet: Globe,

    // Arte
    arte: Palette,
    pintura: Paintbrush,
    dibujo: Pencil,
    diseño: PenTool,
    diseno: PenTool,
    color: Palette,

    // Educación
    educacion: GraduationCap,
    educación: GraduationCap,
    escuela: School,
    colegio: School,
    universidad: GraduationCap,
    maestro: Users,
    profesor: Users,
    estudiante: BookOpen,
    tarea: NotebookPen,

    // Economía
    economia: BadgeDollarSign,
    economía: BadgeDollarSign,
    dinero: Banknote,
    comercio: Briefcase,
    mercado: Briefcase,
    banco: Building2,
    ahorro: Banknote,

    // Emociones
    emocion: Heart,
    emoción: Heart,
    alegria: Sparkles,
    alegría: Sparkles,
    tristeza: CloudRain,
    amistad: Users,
    empatía: Heart,
    empatia: Heart,

    // Tiempo / procesos
    tiempo: Clock3,
    calendario: Calendar,
    fecha: Calendar,
    duracion: Timer,
    duración: Timer,
    proceso: Workflow,
    secuencia: ArrowRight,
    paso: ArrowRight,
    cambio: RefreshCw,
    ciclo: Repeat,
    clasificacion: ListTree,
    clasificación: ListTree,
    recorrido: Route,
};

// ─────────────────────────────────────────────────────────────
// Grupos semánticos
// ─────────────────────────────────────────────────────────────
const semanticGroups: Array<{
    matcher: RegExp;
    icon: LucideIcon;
}> = [
        // Matemáticas
        {
            matcher:
                /(suma|resta|division|multiplicacion|fraccion|ecuacion|geometr|triangulo|circulo|cuadrado|numero|porcentaje)/,
            icon: Calculator,
        },

        // Biología
        {
            matcher:
                /(celula|organelo|tejido|mitocondria|cloroplasto|vacuola|citoplasma|biologia|adn|genetica|célula|átomo)/,
            icon: Microscope,
        },

        // Gobierno
        {
            matcher:
                /(gobierno|presidente|congreso|senado|democracia|constitucion|ley|tribunal|justicia|politica)/,
            icon: Landmark,
        },

        // Lenguaje
        {
            matcher:
                /(gramatica|verbo|sujeto|idioma|lectura|escritura|lenguaje|texto|palabra)/,
            icon: Languages,
        },

        // Naturaleza
        {
            matcher:
                /(agua|evaporacion|lluvia|clima|planta|bosque|naturaleza|rio|oceano|mar)/,
            icon: Leaf,
        },

        // Tecnología
        {
            matcher:
                /(computadora|internet|software|programacion|robot|algoritmo|tecnologia)/,
            icon: Cpu,
        },

        // Arte
        {
            matcher:
                /(arte|pintura|dibujo|escultura|diseño|diseno|color)/,
            icon: Palette,
        },

        // Música
        {
            matcher:
                /(musica|ritmo|melodia|instrumento|cancion)/,
            icon: Music,
        },

        // Historia
        {
            matcher:
                /(historia|guerra|independencia|revolucion|imperio|cultura)/,
            icon: History,
        },

        // Educación
        {
            matcher:
                /(educacion|escuela|colegio|universidad|profesor|maestro|estudiante|aprendizaje)/,
            icon: GraduationCap,
        },

        // Economía
        {
            matcher:
                /(economia|dinero|mercado|comercio|banco|ahorro)/,
            icon: BadgeDollarSign,
        },
    ];

// ─────────────────────────────────────────────────────────────
// Coincidencia parcial
// ─────────────────────────────────────────────────────────────
function resolvePartialMatch(
    normalized: string
): LucideIcon | null {
    for (const [key, icon] of Object.entries(iconMap)) {
        const normalizedKey = normalize(key);

        if (
            normalized.includes(normalizedKey) ||
            normalizedKey.includes(normalized)
        ) {
            return icon;
        }
    }

    return null;
}

// ─────────────────────────────────────────────────────────────
// Coincidencia semántica
// ─────────────────────────────────────────────────────────────
function resolveSemanticMatch(
    normalized: string
): LucideIcon | null {
    for (const group of semanticGroups) {
        if (group.matcher.test(normalized)) {
            return group.icon;
        }
    }

    return null;
}

// ─────────────────────────────────────────────────────────────
// Resolver principal
// ─────────────────────────────────────────────────────────────
export function resolveVisual(
    name?: string
): ResolvedVisual {
    if (!name) {
        return {
            type: "icon",
            icon: Info,
        };
    }

    const normalized = normalize(name);

    // Exacto
    const exact =
        iconMap[normalized] ||
        iconMap[name];

    if (exact) {
        return {
            type: "icon",
            icon: exact,
        };
    }



    // Semántico
    const semantic =
        resolveSemanticMatch(normalized);

    if (semantic) {
        return {
            type: "icon",
            icon: semantic,
        };
    }

    // Último fallback → letra
    return {
        type: "letter",
        letter: fallbackLetter(name),
    };
}

// ─────────────────────────────────────────────────────────────
// Compatibilidad legacy
// Si aún tienes componentes viejos.
// ─────────────────────────────────────────────────────────────
export function resolveLucideIcon(
    name?: string
): LucideIcon {
    const resolved = resolveVisual(name);

    if (resolved.type === "icon") {
        return resolved.icon;
    }

    return Info;
}

// ─────────────────────────────────────────────────────────────
// Fallback seguro para iconos inexistentes
// ─────────────────────────────────────────────────────────────
function FlagFallback(): LucideIcon {
    return Trophy;
}