// TEOplay — TypeScript Types

export type Condicion =
  | 'tea'
  | 'tdah'
  | 'down'
  | 'dislexia'
  | 'discalculia'
  | 'disgrafia'
  | 'general'
  | 'ninguna';

export type Interes =
  | 'dinosaurios'
  | 'espacio'
  | 'arte'
  | 'deportes'
  | 'animales'
  | 'videojuegos'
  | 'musica'
  | 'oceano'
  | 'superheroes';

export type Asignatura =
  | 'matematicas'
  | 'lenguaje'
  | 'ingles'
  | 'ciencias'
  | 'historia'
  | 'arte'
  | 'ed_fisica'
  | 'sociales';

export type Idioma = 'es' | 'en';

export type TipoJuego = 'A' | 'B' | 'C' | 'D' | 'E';

export type AppScreen = 'config' | 'session' | 'report';
export type SessionPhase = 1 | 2 | 3 | 4;

/** Perfil del niño — nombre/edad/grado/condición persisten en localStorage */
export interface PerfilNino {
  nombre: string;
  edad: number;
  grado: string;
  condicion: Condicion;
  interes: Interes; // Set by child during session
  asignatura: Asignatura;
  tema: string;
  idioma: Idioma;
  perfilNeuroeducativo?: import('@/components/OnboardingWizard').PerfilNeuroeducativo;
  id:string;
}

/** Solo los campos que persisten entre sesiones */
export interface PerfilPersistente {
  nombre: string;
  edad: number;
  grado: string;
  condicion: Condicion;
}

// Game JSON types from Claude
export interface GameItemA {
  texto: string;
  icono: string;
  categoriaCorrecta: 1 | 2;
}

export interface JuegoA {
  tipo: 'A';
  instruccion: string;
  categoria1: { nombre: string; icono: string };
  categoria2: { nombre: string; icono: string };
  items: GameItemA[];
}

export interface OpcionB {
  texto: string;
  correcta: boolean;
}

export interface PreguntaB {
  pregunta: string;
  opciones: OpcionB[];
}

export interface JuegoB {
  tipo: 'B';
  instruccion: string;
  preguntas: PreguntaB[];
  // Legacy fallback
  pregunta?: string;
  opciones?: OpcionB[];
}

export interface TarjetaMemoria {
  pregunta: string;       // Lo que aparece al frente de la tarjeta
  respuesta: string;      // Respuesta exacta esperada (corta y directa)
  pista?: string;         // Pista opcional si el niño se bloquea
  alternativas?: string[]; // Variantes aceptables de la respuesta
}

export interface JuegoC {
  tipo: 'C';
  instruccion: string;
  tarjetas: TarjetaMemoria[];
}

export interface ItemD {
  texto: string;
  icono: string;
  esIntruso: boolean;
}

export interface JuegoD {
  tipo: 'D';
  instruccion: string;
  items: ItemD[];
}

export interface ItemE {
  texto: string;
  icono: string;
  orden: number;
}

export interface JuegoE {
    tipo: 'E';
    instruccion: string;
    actividad: string;
    tipoValidacion: 'exacta' | 'ia' | 'confirmacion';
    respuestaEsperada?: string;
    criterios?: string;
    mensajeMotor?: string;
}

export type Juego = JuegoA | JuegoB | JuegoC | JuegoD | JuegoE;

// ── Nuevos tipos para explicación estructurada ────────────────────────────────

export interface EjemploItem {
  original: string;
  traduccion: string;
}

export interface ExplicacionBloque {
  intro: string;
  pasos: string[];
  analogia: string;
  ejemplos: EjemploItem[];
  resumen: string;
}

// ── Reforzamiento híbrido (digital + físico) ──────────────────────────────────

export interface OpcionVerificacion {
  texto: string;
  correcta: boolean;
}

export interface VerificacionDigital {
  pregunta: string;
  opciones: OpcionVerificacion[];
}

export interface ReforzamientoItem {
  tipo: 'digital' | 'fisico' | 'hibrido';
  instruccion: string;
  contexto?: string;
  verificacion?: VerificacionDigital;
}

export interface Reforzamiento {
  titulo: string;
  descripcion: string;
  actividades: ReforzamientoItem[];
}

// ── Sesión generada completa ──────────────────────────────────────────────────

export interface SesionGenerada {
  numeroJuegos: number;
  explicacion: ExplicacionBloque | string;
  explicacionAlternativa1: ExplicacionBloque | string;
  explicacionAlternativa2: ExplicacionBloque | string;
  reforzamiento: Reforzamiento;
  juegos: Juego[];
  mensajesMotivacionales: string[];
  mensajeCierre: string;
  recomendaciones: string[];
  imagenUrl?: string;
  imagenPedagogicaUrl?: string;
}

export interface JuegoResult {
  tipo: TipoJuego;
  aciertos: number;
  errores: number;
  intentos: number;
}

export interface SessionData {
    
  perfil: PerfilNino | null;
  sesionGenerada: SesionGenerada | null;
  emocionInicio: { valor: number | null; timestamp: number | null };
  emocionFin: { valor: number | null; timestamp: number | null };
  deltaEmocional: number | null;
  simplificaciones: number;
  tiempoInicio: number | null;
  tiempoFin: number | null;
  tiempoFase2: number | null;
  errores: string[];
  juegos: JuegoResult[];
  porcentajeAciertos: number | null;
  nivelLogro: 'inicio' | 'proceso' | 'logrado' | null;
  
}

export const CONDICIONES: Record<Condicion, { label: string; descripcion: string; color: string }> = {
  tea: { label: 'TEA', descripcion: 'Trastorno del Espectro Autista', color: 'bg-blue-50 border-blue-200' },
  tdah: { label: 'TDAH', descripcion: 'Déficit de Atención e Hiperactividad', color: 'bg-yellow-50 border-yellow-200' },
  down: { label: 'Síndrome de Down', descripcion: 'Síndrome de Down', color: 'bg-pink-50 border-pink-200' },
  dislexia: { label: 'Dislexia', descripcion: 'Dificultad en lectura y escritura', color: 'bg-purple-50 border-purple-200' },
  discalculia: { label: 'Discalculia', descripcion: 'Dificultad con los números', color: 'bg-orange-50 border-orange-200' },
  disgrafia: { label: 'Disgrafía', descripcion: 'Dificultad en la escritura', color: 'bg-green-50 border-green-200' },
  general: { label: 'Dificultad general', descripcion: 'Dificultad de aprendizaje general', color: 'bg-gray-50 border-gray-200' },
  ninguna: { label: 'Ninguna', descripcion: 'No reporta condición', color: 'bg-black-50 border-black-200' },
};

export const INTERESES: Record<Interes, { label: string; emoji: string; color: string }> = {
  dinosaurios: { label: 'Dinosaurios', emoji: '🦕', color: 'bg-green-100 border-green-300' },
  espacio: { label: 'Espacio', emoji: '🚀', color: 'bg-indigo-100 border-indigo-300' },
  arte: { label: 'Arte', emoji: '🎨', color: 'bg-pink-100 border-pink-300' },
  deportes: { label: 'Deportes', emoji: '⚽', color: 'bg-emerald-100 border-emerald-300' },
  animales: { label: 'Animales', emoji: '🐾', color: 'bg-amber-100 border-amber-300' },
  videojuegos: { label: 'Videojuegos', emoji: '🎮', color: 'bg-violet-100 border-violet-300' },
  musica: { label: 'Música', emoji: '🎵', color: 'bg-cyan-100 border-cyan-300' },
  oceano: { label: 'Océano', emoji: '🌊', color: 'bg-sky-100 border-sky-300' },
  superheroes: { label: 'Superhéroes', emoji: '🦸', color: 'bg-red-100 border-red-300' },
};

export const ASIGNATURAS: Record<Asignatura, { label: string; emoji: string }> = {
  matematicas: { label: 'Matemáticas', emoji: '🔢' },
  lenguaje: { label: 'Lenguaje', emoji: '📖' },
  ingles: { label: 'Inglés', emoji: '🌍' },
  ciencias: { label: 'Ciencias', emoji: '🔬' },
  historia: { label: 'Historia', emoji: '🏛️' },
  arte: { label: 'Arte', emoji: '🎨' },
  ed_fisica: { label: 'Ed. Física', emoji: '🏃' },
  sociales: { label: 'Sociales', emoji: '👥' },
};

export const GRADOS = [
  'Kinder',
  '1° Básico', '2° Básico', '3° Básico', '4° Básico',
  '5° Básico', '6° Básico', '7° Básico', '8° Básico', '9° Básico',
];

export const EMOCIONES = [
  { valor: 1, emoji: '😢', label: 'Muy mal', color: '#ef4444' },
  { valor: 2, emoji: '😟', label: 'Mal', color: '#f97316' },
  { valor: 3, emoji: '😐', label: 'Regular', color: '#eab308' },
  { valor: 4, emoji: '🙂', label: 'Bien', color: '#22c55e' },
  { valor: 5, emoji: '😄', label: '¡Muy bien!', color: '#06b6d4' },
];

export const PERFIL_STORAGE_KEY = 'teoplay_perfil';
export const PERFILES_STORAGE_KEY = 'teoplay_perfiles';
export const PERFIL_ACTIVO_KEY = 'teoplay_perfil_activo';