const MAX_PROFILE_BLOCK_CHARS = 1400;


function trimBlockToMaxChars(text: string, maxChars: number): string {
    if (text.length <= maxChars) return text;

    const lines = text.split('\n');
    const kept: string[] = [];
    let total = 0;

    for (const line of lines) {
        const nextLength = total + line.length + 1;

        if (nextLength > maxChars) break;

        kept.push(line);
        total = nextLength;
    }

    while (kept.length && kept[kept.length - 1].trim() === '') {
        kept.pop();
    }

    if (!kept.length) {
        return truncateText(text, maxChars);
    }

    return kept.join('\n');
}


//Tipo nuevo para el perfil operativo clasificado
export type PerfilOperativoClasificado = {
    resumenBreve: string;
    fortalezasClave: string[];
    barrerasAprendizaje: string[];
    paraExplicar: string[];
    paraEjemplos: string[];
    paraJuegos: string[];
    evitar: string[];
};


function cleanText(text: string = ''): string {
    return text
        .replace(/�/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\.\s*\./g, '.')
        .trim();
}


//Helpers base de limpieza y recorte
function truncateText(text: string = '', maxLength: number): string {
    const clean = cleanText(text);
    if (clean.length <= maxLength) return clean;

    const sliced = clean.slice(0, maxLength - 1);
    const lastSpace = sliced.lastIndexOf(' ');

    if (lastSpace > maxLength * 0.6) {
        return sliced.slice(0, lastSpace).trimEnd() + '…';
    }

    return sliced.trimEnd() + '…';
}

function dedupe(items: string[]): string[] {
    const seen = new Set<string>();

    return items.filter(item => {
        const key = cleanText(item).toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function normalizeList(
    items: string[] = [],
    maxItems: number,
    maxItemLength: number
): string[] {
    return dedupe(items.map(i => truncateText(i, maxItemLength))).slice(0, maxItems);
}


//Función de clasificación de estrategias

type EstrategiasClasificadas = {
    paraExplicar: string[];
    paraEjemplos: string[];
    paraJuegos: string[];
    evitar: string[];
};

function classifyStrategies(estrategias: string[] = []): EstrategiasClasificadas {
    const items = dedupe(estrategias.map(e => cleanText(e)).filter(Boolean));

    const paraExplicar: string[] = [];
    const paraEjemplos: string[] = [];
    const paraJuegos: string[] = [];
    const evitar: string[] = [];

    for (const item of items) {
        const lower = item.toLowerCase();

        const isEvitar =
            lower.includes('evitar') ||
            lower.includes('no usar') ||
            lower.includes('no exigir') ||
            lower.includes('no depender') ||
            lower.includes('reducir') ||
            lower.includes('disminuir') ||
            lower.includes('limitar');

        if (isEvitar) {
            evitar.push(item);
            continue;
        }

        const isJuego =
            lower.includes('juego') ||
            lower.includes('dinámica') ||
            lower.includes('lúd') ||
            lower.includes('motiv') ||
            lower.includes('particip') ||
            lower.includes('interacción');

        const isEjemplo =
            lower.includes('material') ||
            lower.includes('objeto') ||
            lower.includes('visual') ||
            lower.includes('concreto') ||
            lower.includes('manipul') ||
            lower.includes('observ') ||
            lower.includes('explor') ||
            lower.includes('ejemplo') ||
            lower.includes('práctic') ||
            lower.includes('paso a paso') ||
            lower.includes('experiencial') ||
            lower.includes('actividad') ||
            lower.includes('proyecto') ||
            lower.includes('aplic') ||
            lower.includes('cocina') ||
            lower.includes('hacer') ||
            lower.includes('tecnología asistiva') ||
            lower.includes('tableta') ||
            lower.includes('app') ||
            lower.includes('recurso');

        const isExplicacion =
            lower.includes('lenguaje') ||
            lower.includes('instrucci') ||
            lower.includes('explic') ||
            lower.includes('frase') ||
            lower.includes('secuencia') ||
            lower.includes('anticip') ||
            lower.includes('apoyo visual') ||
            lower.includes('claro') ||
            lower.includes('concreto') ||
            lower.includes('carga cognitiva') ||
            lower.includes('andamiaje');

        const isAppliedSupport =
            lower.includes('práctic') ||
            lower.includes('experiencial') ||
            lower.includes('actividad') ||
            lower.includes('proyecto') ||
            lower.includes('material') ||
            lower.includes('visual') ||
            lower.includes('manipul') ||
            lower.includes('explor') ||
            lower.includes('cocina') ||
            lower.includes('tecnología asistiva') ||
            lower.includes('tableta') ||
            lower.includes('app');

        if (isJuego) {
            paraJuegos.push(item);
        }

        if (isEjemplo || isAppliedSupport) {
            paraEjemplos.push(item);
        }

        if (isExplicacion || (!isJuego && !isEjemplo && !isAppliedSupport)) {
            paraExplicar.push(item);
        }
    }

    return {
        paraExplicar: normalizeList(paraExplicar, 5, 100),
        paraEjemplos: normalizeList(paraEjemplos, 5, 100),
        paraJuegos: normalizeList(paraJuegos, 4, 100),
        evitar: normalizeList(evitar, 4, 100),
    };
}

//Función para construir el perfil operativo clasificado

type PerfilNeuroeducativo = {
    resumen?: string;
    fortalezas?: string[];
    retos?: string[];
    estrategias?: string[];
};

export function buildOperationalProfile(
    pn?: PerfilNeuroeducativo
): PerfilOperativoClasificado | null {
    if (!pn) return null;

    const clasificacion = classifyStrategies(pn.estrategias || []);

    const fortalezasClave = normalizeList(pn.fortalezas || [], 4, 100);
    const barrerasAprendizaje = normalizeList(pn.retos || [], 4, 110);
    const paraEjemplos = clasificacion.paraEjemplos;
    const paraJuegos = clasificacion.paraJuegos;
    //const evitar = clasificacion.evitar;
    let evitar = clasificacion.evitar;
    let paraExplicar = clasificacion.paraExplicar;


    if (evitar.length === 0) {
        const inferidasParaEvitar: string[] = [];

        if (
            barrerasAprendizaje.some(item =>
                item.toLowerCase().includes('comunicación') ||
                item.toLowerCase().includes('verbal')
            )
        ) {
            inferidasParaEvitar.push(
                'No depender de respuestas verbales largas.'
            );
        }

        if (
            barrerasAprendizaje.some(item =>
                item.toLowerCase().includes('frustración')
            )
        ) {
            inferidasParaEvitar.push(
                'Evitar explicaciones largas o con demasiadas ideas a la vez.'
            );
        }

        if (
            barrerasAprendizaje.some(item =>
                item.toLowerCase().includes('interacción social')
            )
        ) {
            inferidasParaEvitar.push(
                'No exigir interacción social espontánea como requisito para aprender.'
            );
        }

        if (inferidasParaEvitar.length === 0) {
            inferidasParaEvitar.push(
                'Evitar sobrecarga verbal y actividades poco guiadas.'
            );
        }

        evitar = normalizeList(inferidasParaEvitar, 4, 110);
    }

    if (paraExplicar.length === 0) {
        const inferidasParaExplicar: string[] = [];

        if (barrerasAprendizaje.some(item =>
            item.toLowerCase().includes('comunicación') ||
            item.toLowerCase().includes('verbal') ||
            item.toLowerCase().includes('frustración')
        )) {
            inferidasParaExplicar.push(
                'Usar lenguaje claro, concreto y de baja carga verbal.'
            );
        }

        if (paraEjemplos.some(item =>
            item.toLowerCase().includes('práctic') ||
            item.toLowerCase().includes('experiencial') ||
            item.toLowerCase().includes('cocina')
        )) {
            inferidasParaExplicar.push(
                'Explicar con apoyo de situaciones prácticas y ejemplos conectados con sus intereses.'
            );
        }

        if (fortalezasClave.some(item =>
            item.toLowerCase().includes('aprende rápidamente') ||
            item.toLowerCase().includes('inteligencia') ||
            item.toLowerCase().includes('números') ||
            item.toLowerCase().includes('inglés')
        )) {
            inferidasParaExplicar.push(
                'Mantener el contenido esencial y permitir una explicación con buena profundidad cuando el tema lo permita.'
            );
        }

        if (inferidasParaExplicar.length === 0) {
            inferidasParaExplicar.push(
                'Explicar paso a paso, con frases cortas y una idea por vez.'
            );
        }

        paraExplicar = normalizeList(inferidasParaExplicar, 4, 110);
    }

    return {
        resumenBreve: truncateText(pn.resumen || '', 180),
        fortalezasClave,
        barrerasAprendizaje,
        paraExplicar,
        paraEjemplos,
        paraJuegos,
        evitar,
    };
}


export function renderOperationalProfileBlock(
    nombre: string,
    perfilOperativo: PerfilOperativoClasificado | null,
    condicion?: string
): string {
    if (!perfilOperativo) {
        return [
            'No hay perfil neuroeducativo individualizado.',
            `Adapta la sesión según edad, grado, tema y condición (${condicion || 'no especificada'}), sin estereotipos.`
        ].join('\n');
    }

    const fortalezas = perfilOperativo.fortalezasClave.slice(0, 3);
    const barreras = perfilOperativo.barrerasAprendizaje.slice(0, 2);
    const paraExplicar = perfilOperativo.paraExplicar.slice(0, 2);
    const paraEjemplos = perfilOperativo.paraEjemplos.slice(0, 2);
    const paraJuegos = perfilOperativo.paraJuegos.slice(0, 1);
    const evitar = perfilOperativo.evitar.slice(0, 2);

    const lines: string[] = [
        'PERFIL NEUROEDUCATIVO OPERATIVO — PRIORIDAD MÁXIMA',
        `Este perfil fue creado específicamente para ${nombre}.`,
        'Adapta la lección primero según este perfil individual, luego según edad, grado y tema.',
    ];

    if (fortalezas.length) {
        lines.push('', 'Fortalezas clave:');
        fortalezas.forEach(item => lines.push(`- ${item}`));
    }

    if (barreras.length) {
        lines.push('', 'Barreras relevantes:');
        barreras.forEach(item => lines.push(`- ${item}`));
    }

    if (paraExplicar.length) {
        lines.push('', 'Para explicar:');
        paraExplicar.forEach(item => lines.push(`- ${item}`));
    }

    if (paraEjemplos.length) {
        lines.push('', 'Para ejemplos y actividades:');
        paraEjemplos.forEach(item => lines.push(`- ${item}`));
    }

    if (paraJuegos.length) {
        lines.push('', 'Para juegos:');
        paraJuegos.forEach(item => lines.push(`- ${item}`));
    }

    if (evitar.length) {
        lines.push('', 'Evitar:');
        evitar.forEach(item => lines.push(`- ${item}`));
    }

    lines.push(
        '',
        'Reglas:',
        '- No simplifiques en exceso si el perfil permite mayor profundidad.',
        '- Si requiere más apoyo, simplifica la forma de enseñar, no el contenido esencial.',
        '- Usa este perfil para ajustar lenguaje, pasos, ejemplos, juegos y carga cognitiva.'
    );

    const block = lines.join('\n');
    return trimBlockToMaxChars(block, MAX_PROFILE_BLOCK_CHARS);
}
