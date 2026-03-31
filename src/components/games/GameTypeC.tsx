import React, { useState, useRef, useEffect } from 'react';
import { JuegoC, JuegoResult, PerfilNino, ExplicacionBloque } from '@/types';
import { RotateCcw } from 'lucide-react';

interface GameTypeCProps {
  game: JuegoC;
  perfil: PerfilNino;
  explicacion: ExplicacionBloque | string;
  onComplete: (result: JuegoResult) => void;
  onCorrect: () => void;
  onWrong: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Validación inteligente de respuesta
// ─────────────────────────────────────────────────────────────────────────────

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[^a-z0-9\s]/g, '')                       // quitar puntuación
    .trim()
    .replace(/\s+/g, ' ');
}

function validarRespuesta(
  respuestaUsuario: string,
  respuestaCorrecta: string,
  alternativas: string[] = []
): { correcta: boolean; parcial: boolean } {
  const usuario = normalizar(respuestaUsuario);
  const correcta = normalizar(respuestaCorrecta);

  if (!usuario) return { correcta: false, parcial: false };

  // Exacta o alternativa exacta
  if (usuario === correcta) return { correcta: true, parcial: false };
  if (alternativas.some(a => normalizar(a) === usuario)) return { correcta: true, parcial: false };

  // La respuesta correcta está contenida en lo que escribió (o viceversa)
  if (correcta.includes(usuario) && usuario.length >= correcta.length * 0.7) return { correcta: true, parcial: false };
  if (usuario.includes(correcta)) return { correcta: true, parcial: false };

  // Distancia de edición simple (Levenshtein) para typos
  const dist = levenshtein(usuario, correcta);
  const maxLen = Math.max(usuario.length, correcta.length);
  const similarity = 1 - dist / maxLen;

  if (similarity >= 0.85) return { correcta: true, parcial: false };    // muy similar → correcto
  if (similarity >= 0.6)  return { correcta: false, parcial: true };    // parcial → pista
  return { correcta: false, parcial: false };
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[m][n];
}

// ─────────────────────────────────────────────────────────────────────────────
// Flip card CSS — en línea para no depender de CSS externo
// ─────────────────────────────────────────────────────────────────────────────

const flipStyle: React.CSSProperties = {
  perspective: '1000px',
};

const cardInnerStyle = (flipped: boolean): React.CSSProperties => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
  transformStyle: 'preserve-3d',
  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
});

const cardFaceStyle = (back: boolean): React.CSSProperties => ({
  position: 'absolute',
  inset: 0,
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  transform: back ? 'rotateY(180deg)' : 'rotateY(0deg)',
  borderRadius: '20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '28px 24px',
});

const MENSAJES_ANIMO = [
  '¡Casi! Tú puedes lograrlo 💪',
  '¡Sigue intentando! Cada error te enseña 🌟',
  '¡No te rindas! Estás aprendiendo 🧠',
  '¡Eso estuvo cerca! Inténtalo de nuevo 🚀',
];

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

const GameTypeC: React.FC<GameTypeCProps> = ({
  game, perfil, explicacion, onComplete, onCorrect, onWrong
}) => {
  const tarjetas = game.tarjetas || [];
  const total = tarjetas.length;

  const [rondaIdx, setRondaIdx]           = useState(0);
  const [flipped, setFlipped]             = useState(false);
  const [inputValue, setInputValue]       = useState('');
  const [estado, setEstado]               = useState<'escribiendo' | 'correcto' | 'parcial' | 'incorrecto' | 'revelado'>('escribiendo');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [intentosEnRonda, setIntentosEnRonda] = useState(0);
  const [mostrarPista, setMostrarPista]   = useState(false);

  const totalAciertos = useRef(0);
  const totalErrores  = useRef(0);
  const totalIntentos = useRef(0);
  const aninoIdx      = useRef(Math.floor(Math.random() * MENSAJES_ANIMO.length));
  const inputRef      = useRef<HTMLInputElement>(null);

  const isTEA    = perfil.condicion === 'tea';
  const isDown   = perfil.condicion === 'down';
  const fontSize = isDown ? '20px' : '16px';

  const tarjetaActual = tarjetas[rondaIdx];

  useEffect(() => {
    if (!flipped && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 600);
    }
  }, [rondaIdx, flipped]);

  if (!tarjetaActual) {
    return <div className="flex items-center justify-center p-8"><p className="text-muted-foreground">Cargando tarjetas…</p></div>;
  }

  const handleVerificar = () => {
    if (!inputValue.trim() || estado !== 'escribiendo') return;

    totalIntentos.current++;
    const nuevoIntento = intentosEnRonda + 1;
    setIntentosEnRonda(nuevoIntento);

    const { correcta, parcial } = validarRespuesta(
      inputValue,
      tarjetaActual.respuesta,
      tarjetaActual.alternativas
    );

    if (correcta) {
      totalAciertos.current++;
      setEstado('correcto');
      setFlipped(true);
      onCorrect();
    } else if (parcial && nuevoIntento === 1) {
      // Primer intento parcial → pista y retry
      setEstado('parcial');
      setMostrarPista(true);
    } else {
      totalErrores.current++;
      onWrong();
      aninoIdx.current = Math.floor(Math.random() * MENSAJES_ANIMO.length);

      if (nuevoIntento >= 2) {
        // Revelar respuesta tras 2 intentos
        setEstado('revelado');
        setFlipped(true);
      } else {
        setEstado('incorrecto');
        setShowErrorModal(true);
      }
    }
  };

  const handleCerrarErrorModal = () => {
    setShowErrorModal(false);
    setEstado('escribiendo');
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleSiguiente = () => {
    const esUltima = rondaIdx >= total - 1;
    if (esUltima) {
      setShowSuccessModal(true);
    } else {
      setRondaIdx(i => i + 1);
      setFlipped(false);
      setInputValue('');
      setEstado('escribiendo');
      setIntentosEnRonda(0);
      setMostrarPista(false);
    }
  };

  const handleFinalizar = () => {
    onComplete({
      tipo: 'C',
      aciertos: totalAciertos.current,
      errores: totalErrores.current,
      intentos: totalIntentos.current,
    });
  };

  const resumenFinal = typeof explicacion !== 'string' && explicacion.resumen
    ? explicacion.resumen
    : `Completaste ${totalAciertos.current} de ${total} tarjetas correctamente`;

  const colorEstado =
    estado === 'correcto' ? '#22c55e' :
    estado === 'parcial'  ? '#f59e0b' :
    estado === 'incorrecto' || estado === 'revelado' ? '#ef4444' :
    '#6366f1';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-3xl border border-border shadow-lg p-6">

        {/* Instrucción */}
        <p className={`font-black text-foreground text-center mb-2 ${isDown ? 'text-2xl' : 'text-xl'}`}>
          {game.instruccion}
        </p>
        <p className="text-center text-sm font-semibold text-muted-foreground mb-5">
          🃏 Lee la pregunta, escribe tu respuesta y voltea la tarjeta
        </p>

        {/* Progreso */}
        <div className="flex gap-1.5 justify-center mb-6">
          {tarjetas.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${
              i < rondaIdx ? 'w-8 bg-teo-green' :
              i === rondaIdx ? 'w-12 bg-primary' :
              'w-8 bg-muted'
            }`} />
          ))}
        </div>

        {/* Tarjeta flip */}
        <div style={{ ...flipStyle, height: '200px', marginBottom: '24px' }}>
          <div style={cardInnerStyle(flipped)}>

            {/* FRENTE — pregunta */}
            <div style={{
              ...cardFaceStyle(false),
              background: 'linear-gradient(135deg, hsl(270 68% 58% / 0.12), hsl(270 68% 58% / 0.05))',
              border: `2px solid hsl(270 68% 58% / 0.3)`,
            }}>
              <span className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: '#7c3aed', opacity: 0.7 }}>
                Ronda {rondaIdx + 1} de {total}
              </span>
              <p className="font-black text-foreground text-center leading-relaxed" style={{ fontSize: isDown ? '22px' : '19px' }}>
                {tarjetaActual.pregunta}
              </p>
              {!flipped && (
                <span className="absolute bottom-4 text-xs font-bold text-muted-foreground opacity-60">
                  ✏️ Escribe abajo tu respuesta
                </span>
              )}
            </div>

            {/* DORSO — respuesta */}
            <div style={{
              ...cardFaceStyle(true),
              background: estado === 'revelado'
                ? 'linear-gradient(135deg, hsl(0 84% 60% / 0.10), hsl(0 84% 60% / 0.05))'
                : 'linear-gradient(135deg, hsl(142 71% 45% / 0.12), hsl(142 71% 45% / 0.05))',
              border: `2px solid ${estado === 'revelado' ? 'hsl(0 84% 60% / 0.3)' : 'hsl(142 71% 45% / 0.3)'}`,
            }}>
              <span className="text-xs font-black uppercase tracking-widest mb-3" style={{
                color: estado === 'revelado' ? '#ef4444' : '#22c55e', opacity: 0.8
              }}>
                {estado === 'revelado' ? '📖 Respuesta correcta' : '✅ ¡Correcto!'}
              </span>
              <p className="font-black text-foreground text-center" style={{ fontSize: '28px' }}>
                {tarjetaActual.respuesta}
              </p>
              {estado === 'revelado' && (
                <p className="text-sm text-muted-foreground font-semibold mt-3 text-center">
                  Tu respuesta: "{inputValue}"
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Zona de escritura */}
        {!flipped && (
          <div className={`space-y-3 ${!isTEA ? 'animate-fade-in' : ''}`}>
            {mostrarPista && tarjetaActual.pista && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-base flex-shrink-0">💡</span>
                <p className="text-sm font-semibold text-amber-800">{tarjetaActual.pista}</p>
              </div>
            )}

            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => {
                  setInputValue(e.target.value);
                  if (estado !== 'escribiendo') setEstado('escribiendo');
                }}
                onKeyDown={e => { if (e.key === 'Enter') handleVerificar(); }}
                placeholder="Escribe tu respuesta aquí…"
                className="w-full px-5 py-4 rounded-2xl border-2 font-bold text-foreground bg-white outline-none transition-all"
                style={{
                  fontSize,
                  borderColor: colorEstado,
                  boxShadow: `0 0 0 3px ${colorEstado}22`,
                }}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>

            {estado === 'parcial' && (
              <p className="text-center text-sm font-bold text-amber-600">
                🤔 Casi… revisa la pista e intenta de nuevo
              </p>
            )}

            <button
              type="button"
              onClick={handleVerificar}
              disabled={!inputValue.trim()}
              className="child-btn w-full bg-primary text-primary-foreground font-black text-lg py-4 rounded-2xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ✅ Verificar respuesta
            </button>

            {!mostrarPista && tarjetaActual.pista && intentosEnRonda === 0 && (
              <button
                type="button"
                onClick={() => setMostrarPista(true)}
                className="w-full py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                💡 Ver pista
              </button>
            )}
          </div>
        )}

        {/* Botón siguiente (tras voltear) */}
        {flipped && (
          <button
            type="button"
            onClick={handleSiguiente}
            className={`child-btn w-full font-black text-lg py-4 rounded-2xl cursor-pointer ${!isTEA ? 'animate-fade-in' : ''} ${
              estado === 'revelado'
                ? 'bg-primary text-primary-foreground'
                : 'bg-teo-green text-white'
            }`}
          >
            {rondaIdx < total - 1 ? 'Siguiente tarjeta ➜' : '🏆 Ver mi resultado'}
          </button>
        )}
      </div>

      {/* ── Modal ERROR ── */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-teo-orange/40 shadow-2xl p-6 max-w-sm w-full animate-bounce-in">
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">🤔</div>
              <p className="text-lg font-black text-foreground">
                {MENSAJES_ANIMO[aninoIdx.current]}
              </p>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4 mb-5 space-y-2">
              <p className="text-[11px] font-black text-amber-600 uppercase tracking-wide">
                💡 Recuerda
              </p>
              <p className="text-sm font-semibold text-foreground leading-relaxed">
                {tarjetaActual.pista ||
                  (typeof explicacion !== 'string' && explicacion.pasos?.[0]) ||
                  (typeof explicacion !== 'string' && explicacion.resumen) ||
                  'Repasa la lección e inténtalo de nuevo'}
              </p>
              {typeof explicacion !== 'string' && explicacion.ejemplos?.[0] && (
                <div className="mt-2 pt-2 border-t border-amber-200">
                  <p className="text-[11px] font-black text-amber-500 uppercase tracking-wide mb-1">📌 Ejemplo</p>
                  <p className="text-sm font-medium text-foreground/80">
                    {explicacion.ejemplos[0].traduccion
                      ? `${explicacion.ejemplos[0].original} → ${explicacion.ejemplos[0].traduccion}`
                      : explicacion.ejemplos[0].original}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleCerrarErrorModal}
              className="child-btn w-full bg-primary text-white font-black py-3 rounded-2xl cursor-pointer text-base"
            >
              ¡Entendido, lo intento de nuevo! 💪
            </button>
          </div>
        </div>
      )}

      {/* ── Modal ÉXITO FINAL ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-teo-green/40 shadow-2xl p-6 max-w-sm w-full animate-bounce-in text-center">
            <div className="text-6xl mb-3">🏆</div>
            <p className="text-xl font-black text-foreground mb-1">
              ¡Excelente{perfil.nombre ? `, ${perfil.nombre}` : ''}!
            </p>
            <p className="text-sm text-muted-foreground font-semibold mb-5">
              Completaste {totalAciertos.current} de {total} tarjetas correctamente
            </p>

            {/* Mini score visual */}
            <div className="flex justify-center gap-2 mb-5">
              {tarjetas.map((_, i) => (
                <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                  i < totalAciertos.current
                    ? 'bg-teo-green text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {i < totalAciertos.current ? '✓' : '○'}
                </div>
              ))}
            </div>

            <div className="bg-teo-green/10 border border-teo-green/30 rounded-2xl p-4 mb-5 text-left">
              <p className="text-[11px] font-black text-teo-green uppercase tracking-wide mb-1">
                ⭐ Lo que aprendiste:
              </p>
              <p className="text-sm font-semibold text-foreground leading-relaxed">
                {resumenFinal}
              </p>
            </div>

            <button
              type="button"
              onClick={handleFinalizar}
              className="child-btn w-full bg-teo-green text-white font-black py-3 rounded-2xl cursor-pointer text-base"
            >
              ¡Seguimos! 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameTypeC;
