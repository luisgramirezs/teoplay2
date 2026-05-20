/**
 * ClaudeVisualBlock.tsx
 *
 * Genera SVG pedagógico llamando a GPT-4o.
 * Soporta tipos: nodos | ciclo | linea_tiempo | flujo | formula | reparto
 * + tipos matemáticos: fraccion | recta_numerica | geometria | agrupacion
 * + tipos físicos/químicos: fuerzas | molecula | reaccion
 */

import React, { useEffect, useRef, useState } from 'react';
import type { ApoyoVisualLeccion } from '@/types';

// ─── Paletas por condición ────────────────────────────────────────────────────

const PALETAS_CONDICION: Record<string, {
  main: string; mainText: string; sec: string; secText: string;
  connector: string; bg: string; border: string; accentText: string;
  nota: string;
}> = {
  tea: {
    main: '#5b8dee', mainText: '#ffffff', sec: '#e8eeff', secText: '#1e3a8a',
    connector: '#93c5fd', bg: '#f0f4ff', border: '#bfdbfe', accentText: '#1d4ed8',
    nota: 'Usa colores suaves y desaturados. Sin gradientes. Máximo 3 colores. Formas predecibles y simétricas. Sin elementos decorativos. Tipografía grande y clara.',
  },
  tdah: {
    main: '#f59e0b', mainText: '#ffffff', sec: '#fef3c7', secText: '#92400e',
    connector: '#fcd34d', bg: '#fffbeb', border: '#fde68a', accentText: '#b45309',
    nota: 'Usa colores vivos pero organizados. Jerarquía visual fuerte. Máximo 4 elementos por pantalla. Señales de flujo claras (flechas, números). Sin texto decorativo.',
  },
  down: {
    main: '#ec4899', mainText: '#ffffff', sec: '#fce7f3', secText: '#831843',
    connector: '#f9a8d4', bg: '#fff0f9', border: '#fbcfe8', accentText: '#9d174d',
    nota: 'Usa formas muy grandes y simples. Alto contraste. Texto muy grande (mínimo 16px). Máximo 4 nodos. Íconos grandes y reconocibles. Sin texto técnico.',
  },
  dislexia: {
    main: '#0ea5e9', mainText: '#ffffff', sec: '#e0f2fe', secText: '#0c4a6e',
    connector: '#7dd3fc', bg: '#f0faff', border: '#bae6fd', accentText: '#0369a1',
    nota: 'Usa fuente sin serifa. Interlineado amplio. Texto corto por elemento. Alto contraste fondo-texto. Evita columnas de texto largas.',
  },
  discalculia: {
    main: '#f97316', mainText: '#ffffff', sec: '#ffedd5', secText: '#7c2d12',
    connector: '#fdba74', bg: '#fff7ed', border: '#fed7aa', accentText: '#c2410c',
    nota: 'Usa representaciones concretas (puntos, barras) ANTES de símbolos abstractos. Relaciona cada número con su representación visual. Colores cálidos y amigables. Muestra el proceso paso a paso con andamiaje visual.',
  },
  disgrafia: {
    main: '#10b981', mainText: '#ffffff', sec: '#d1fae5', secText: '#064e3b',
    connector: '#6ee7b7', bg: '#ecfdf5', border: '#a7f3d0', accentText: '#047857',
    nota: 'Prioriza imágenes sobre texto. Usa íconos descriptivos. Si hay texto, muy corto (2-4 palabras). Formas amigables y redondeadas.',
  },
  general: {
    main: '#6366f1', mainText: '#ffffff', sec: '#eef2ff', secText: '#312e81',
    connector: '#a5b4fc', bg: '#f5f3ff', border: '#c7d2fe', accentText: '#4338ca',
    nota: 'Diseño limpio y pedagógico. Equilibrio entre texto e imagen. Jerarquía visual clara.',
  },
  ninguna: {
    main: '#6366f1', mainText: '#ffffff', sec: '#eef2ff', secText: '#312e81',
    connector: '#a5b4fc', bg: '#f5f3ff', border: '#c7d2fe', accentText: '#4338ca',
    nota: 'Diseño limpio y pedagógico. Equilibrio entre texto e imagen. Jerarquía visual clara.',
  },
};

// ─── Instrucciones por tipo ───────────────────────────────────────────────────

const INSTRUCCIONES_TIPO: Record<string, string> = {
  // ── Tipos generales existentes ──
  nodos: `Genera un diagrama de nodos tipo mapa mental.
- El primer elemento de "elementos" es el nodo central (más grande, color main).
- Los demás son nodos hijos conectados con líneas al central.
- Cada nodo hijo muestra: nombre (bold) + descripción corta debajo.
- Usa posicionamiento radial o rejilla simétrica según la cantidad de hijos.
- Líneas conectoras del color "connector". Sin flechas decorativas extras.`,

  ciclo: `Genera un diagrama de ciclo circular o en cadena horizontal.
- Cada elemento es una etapa numerada.
- Conecta las etapas con flechas curvas (→) o en disposición circular con flecha final que vuelve al inicio.
- Cada etapa: número (bold, color main) + título + descripción corta.
- Incluye al final una flecha que indica "vuelve a empezar".`,

  linea_tiempo: `Genera una línea de tiempo vertical u horizontal.
- Cada elemento sigue formato "fecha: evento".
- Coloca los puntos de tiempo en orden, conectados por una línea.
- Cada punto: círculo numerado (color main) + fecha destacada (bold) + descripción del evento.
- Alterna lado izquierdo/derecho si es vertical para mayor legibilidad.`,

  flujo: `Genera un diagrama de flujo secuencial (top-down).
- Cada elemento es un paso en orden.
- El primer paso usa color main. Los demás usan color sec.
- Conecta con flechas entre pasos.
- Cada paso: número + título + descripción breve.`,

  formula: `Genera un visual de fórmula o estructura.
- Cada elemento sigue formato "Nombre: símbolo o valor".
- Muestra los componentes horizontalmente separados por el operador correspondiente (+, =, →).
- Cada componente: caja con color propio + nombre arriba (pequeño) + valor o símbolo grande abajo.
- Usa colores distintos para cada componente (main, sec, connector).`,

  reparto: `Genera un visual de reparto o división.
- Los elementos son exactamente 3 strings numéricos: [total, grupos, porGrupo].
- Muestra en la parte superior los puntos totales agrupados (total).
- Luego una flecha con "÷ grupos".
- Luego los grupos resultantes con porGrupo puntos cada uno.
- Usa círculos o cuadrados simples para representar cantidades.`,

  // ── Tipos matemáticos nuevos ──
  fraccion: `Genera un visual pedagógico de fracciones.
- Dibuja UN círculo o rectángulo por cada fracción en "elementos".
- Divide la figura en "denominador" partes iguales.
- Colorea "numerador" partes con color main. Las demás con color sec (más claro).
- Muestra la fracción como texto grande debajo: numerador/denominador.
- Etiqueta "numerador" y "denominador" con flechas o líneas simples.
- Si hay varias fracciones, organízalas en fila centrada con espacio entre ellas.
- NUNCA mostrar conceptos de división (dividendo, divisor, cociente, residuo) en este tipo.
- El SVG debe ser centrado y usar todo el ancho disponible con viewBox="0 0 600 300".`,

  recta_numerica: `Genera una recta numérica pedagógica.
- Dibuja una línea horizontal con marcas en los números indicados en "elementos".
- El número principal o resultado se resalta con un círculo grande en color main.
- Los números intermedios usan círculos más pequeños en color sec.
- Muestra flechas de "saltos" si los items incluyen operaciones (suma, resta).
- Incluye el número 0 siempre que sea relevante.
- Etiqueta cada marca con su valor numérico debajo de la línea.`,

  geometria: `Genera un visual de figura geométrica o conjunto de figuras.
- Dibuja cada figura indicada en "elementos" con sus propiedades visuales.
- Etiqueta los lados, ángulos o áreas si están en los items.
- Usa color main para el relleno suave (opacidad 0.2) y color main para el borde.
- Muestra la fórmula del área o perímetro si está en los items como texto debajo.
- Si hay múltiples figuras, organízalas en fila con sus nombres debajo.`,

  agrupacion: `Genera un visual de agrupación, multiplicación o división con representación concreta.
- Dibuja grupos de objetos (círculos o cuadrados) que representen la operación.
- Ejemplo: para 3×4, dibuja 3 grupos de 4 objetos cada uno.
- Usa color main para los objetos, color sec para los contenedores de grupo.
- Muestra la operación matemática en texto grande debajo: "3 × 4 = 12".
- Incluye una flecha o llave que agrupe todos los objetos con el total.`,

  // ── Tipos físicos/químicos ──
  fuerzas: `Genera un diagrama de fuerzas o movimiento.
- Dibuja el objeto central (cuerpo, vehículo, etc.) en el centro.
- Representa cada fuerza como una flecha desde o hacia el objeto.
- La longitud de la flecha es proporcional a la magnitud si está en los items.
- Etiqueta cada flecha con el nombre de la fuerza y su valor.
- Usa colores distintos para fuerzas opuestas (main vs sec).`,

  molecula: `Genera un diagrama de molécula o enlace químico simplificado.
- Representa cada átomo como un círculo con su símbolo en el centro.
- Los enlaces son líneas entre átomos (simple, doble o triple según los items).
- Usa color main para el átomo principal y colores distintos para los demás.
- Muestra la fórmula química debajo en texto grande.
- Mantén el diseño simple y limpio, sin decoraciones innecesarias.`,

  reaccion: `Genera un diagrama de reacción química simplificada.
- Muestra reactantes a la izquierda, productos a la derecha.
- Una flecha central (→) separa ambos lados. Si es reversible, usa (⇌).
- Cada molécula se representa como un círculo con su fórmula.
- Usa color main para reactantes y color sec para productos.
- Si los items incluyen condiciones (temperatura, catalizador), muéstralas sobre la flecha.`,


  estructura_oracion: `Genera un visual de estructura gramatical en cadena horizontal.
- Cada elemento es un componente de la oración (Sujeto, Verbo to be, Verbo+ing, Complemento).
- Muestra los componentes como bloques de colores distintos conectados con "+" entre ellos.
- Bajo cada bloque escribe su nombre gramatical en texto pequeño (etiqueta).
- El último bloque no lleva "+".
- NO uses el signo "=". La estructura es aditiva, no una ecuación.
- Ejemplo visual: [Sujeto] + [Verbo to be] + [Verbo+ing] + [Complemento]`,

};

// ─── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `Eres un diseñador de recursos educativos visuales especializado en neurodiversidad infantil.
Tu única tarea es generar código SVG pedagógico válido, limpio y auto-contenido.

REGLAS ABSOLUTAS:
1. Responde ÚNICAMENTE con el código SVG. Sin texto antes ni después. Sin markdown. Sin bloques de código.
2. El SVG debe comenzar con <svg y terminar con </svg>.
3. Usa viewBox="0 0 600 400" como base. Ajusta el alto si hay muchos elementos (máximo viewBox height: 900).
4. Toda la información pedagógica importante de "items" debe estar presente en el SVG.
5. Usa SOLO colores del objeto "paleta" que recibirás. Sin colores externos.
6. Texto legible: mínimo 13px descripciones, 15px títulos, 18px elemento central.
7. No uses <image>, no uses URLs externas. Solo formas SVG nativas (rect, circle, path, text, line, polygon).
8. Ningún texto debe quedar cortado. Usa <tspan> para wrapping si es necesario.
9. Añade role="img" y aria-label descriptivo al <svg>.
10. Cada elemento debe ser visualmente distinguible.
11. Para tipos matemáticos: prioriza representación concreta antes que simbólica.
12. Usa animate o animateTransform SOLO si el tipo lo requiere explícitamente. Mantenlo sutil.`;
}

function buildUserPrompt(
  apoyoVisual: ApoyoVisualLeccion,
  condicion: string,
  paleta: typeof PALETAS_CONDICION[string]
): string {
  const instruccion = INSTRUCCIONES_TIPO[apoyoVisual.tipo] ?? INSTRUCCIONES_TIPO.nodos;

  const itemsStr = Array.isArray(apoyoVisual.items) && apoyoVisual.items.length > 0
    ? JSON.stringify(apoyoVisual.items, null, 2)
    : 'No hay items. Usa solo "elementos".';

  return `Genera un SVG pedagógico de tipo "${apoyoVisual.tipo}" para niños con condición: ${condicion}.

TÍTULO DEL VISUAL: "${apoyoVisual.titulo}"

INSTRUCCIONES DE TIPO:
${instruccion}

ELEMENTOS (datos del diagrama):
${JSON.stringify(apoyoVisual.elementos, null, 2)}

ITEMS CON DESCRIPCIÓN PEDAGÓGICA:
${itemsStr}

PALETA DE COLORES A USAR (OBLIGATORIO usar SOLO estos colores):
${JSON.stringify({ main: paleta.main, mainText: paleta.mainText, sec: paleta.sec, secText: paleta.secText, connector: paleta.connector, bg: paleta.bg }, null, 2)}

NOTA PEDAGÓGICA PARA CONDICIÓN "${condicion}":
${paleta.nota}

SOBRE LOS ITEMS:
- "title": nombre corto visible en el diagrama.
- "description": explicación pedagógica — inclúyela como texto pequeño debajo del título o como <title> SVG.
- "meta": dato adicional (fecha, categoría) — muéstralo como badge pequeño.
- Si hay más de 6 items: reduce font-size y aumenta viewBox height.

Genera SOLO el SVG. Nada más.`;
}

// ─── Llamada a la API ─────────────────────────────────────────────────────────

async function generarSVG(
  apoyoVisual: ApoyoVisualLeccion,
  condicion: string
): Promise<string> {
  const paleta = PALETAS_CONDICION[condicion] ?? PALETAS_CONDICION.general;

  
    // ─── Llamada a la API ─────────────────────────────────────────────────────────

    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, 90000);

    let response: Response;

    try {

        response = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                max_tokens: 3000,
                temperature: 0.3,
                messages: [
                    { role: 'system', content: buildSystemPrompt() },
                    { role: 'user', content: buildUserPrompt(apoyoVisual, condicion, paleta) },
                ],
            }),
            signal: controller.signal,
        });

    } catch (err: any) {

        if (
            err.name === 'AbortError' ||
            err.message?.includes('Failed to fetch')
        ) {

            await new Promise(resolve => setTimeout(resolve, 3000));

            response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    max_tokens: 3000,
                    temperature: 0.3,
                    messages: [
                        { role: 'system', content: buildSystemPrompt() },
                        { role: 'user', content: buildUserPrompt(apoyoVisual, condicion, paleta) },
                    ],
                }),
            });

        } else {
            throw err;
        }

    } finally {
        clearTimeout(timeout);
    }

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Error API (${response.status}): ${err}`);
  }

  const data = await response.json();
  const raw: string = data.choices?.[0]?.message?.content ?? '';

  // Extraer SVG — tolera texto extra antes/después
  const svgMatch = raw.match(/<svg[\s\S]*?<\/svg>/i);
  if (!svgMatch) throw new Error('La respuesta no contiene SVG válido.');

  return svgMatch[0];
}

// ─── UI auxiliar ──────────────────────────────────────────────────────────────

const SkeletonVisual: React.FC<{ titulo: string }> = ({ titulo }) => (
  <div className="w-full rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden">
    <div className="px-4 py-3 border-b border-slate-100 bg-white flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-slate-200 animate-pulse" />
      <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
    </div>
    <div className="p-4 flex flex-col items-center gap-3">
      <p className="text-xs font-bold text-slate-400 animate-pulse">
        Generando visual para "{titulo}"…
      </p>
      <div className="w-full h-[220px] bg-slate-100 rounded-xl animate-pulse" />
    </div>
  </div>
);

const ErrorFallback: React.FC<{ mensaje: string; onRetry: () => void }> = ({ mensaje, onRetry }) => (
  <div className="w-full rounded-2xl border border-red-100 bg-red-50 p-4 flex flex-col items-center gap-3 text-center">
    <p className="text-xs font-black text-red-500 uppercase tracking-wide">No se pudo generar el visual</p>
    <p className="text-xs text-slate-500 font-medium max-w-xs">{mensaje}</p>
    <button
      type="button"
      onClick={onRetry}
      className="px-4 py-2 rounded-xl bg-red-100 text-red-700 font-black text-xs hover:bg-red-200 transition-colors cursor-pointer"
    >
      Reintentar
    </button>
  </div>
);

// ─── Componente principal ─────────────────────────────────────────────────────

interface ClaudeVisualBlockProps {
  apoyoVisual: ApoyoVisualLeccion;
  condicion?: string;
}

const ClaudeVisualBlock: React.FC<ClaudeVisualBlockProps> = ({
  apoyoVisual,
  condicion = 'general',
}) => {
  const [svg, setSvg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const cacheKey = useRef<string>('');
  const currentKey = `${apoyoVisual.tipo}::${apoyoVisual.titulo}::${condicion}`;

  useEffect(() => {
    if (cacheKey.current === currentKey && svg) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    generarSVG(apoyoVisual, condicion)
      .then((result) => {
        if (cancelled) return;
        cacheKey.current = currentKey;
        setSvg(result);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[ClaudeVisualBlock]', err);
        setError(err?.message ?? 'Error desconocido');
        setLoading(false);
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey, retryCount]);

  const handleRetry = () => {
    cacheKey.current = '';
    setSvg(null);
    setRetryCount(c => c + 1);
  };

  if (loading) return <SkeletonVisual titulo={apoyoVisual.titulo} />;
  if (error) return <ErrorFallback mensaje={error} onRetry={handleRetry} />;
  if (!svg) return null;

  const paleta = PALETAS_CONDICION[condicion] ?? PALETAS_CONDICION.general;

  return (
    <div className="w-full rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div
        className="px-4 py-3 border-b border-slate-100 flex items-center gap-2"
        style={{ backgroundColor: paleta.bg }}
      >
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: paleta.main }} />
        <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: paleta.accentText }}>
          {apoyoVisual.titulo}
        </p>
        <span
          className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: paleta.sec, color: paleta.secText }}
        >
          {apoyoVisual.tipo.replace('_', ' ')}
        </span>
      </div>

      {/* SVG */}
      <div
        className="w-full p-3 flex justify-center"
        style={{ overflowX: 'auto' }}
        dangerouslySetInnerHTML={{
            __html: svg.replace(
                /<svg/,
                '<svg style="max-width:100%;height:auto"'
            )
        }}
        aria-label={`Diagrama pedagógico: ${apoyoVisual.titulo}`}
      />

   
      {/* Footer hint */}
      {(apoyoVisual as any).instruccionVisual && (
        <div
          className="px-4 py-2.5 border-t border-slate-100 flex items-center gap-2"
          style={{ backgroundColor: paleta.bg }}
        >
          <span className="text-base">👆</span>
          <p className="text-[11px] font-bold" style={{ color: paleta.accentText }}>
            {(apoyoVisual as any).instruccionVisual}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClaudeVisualBlock;
