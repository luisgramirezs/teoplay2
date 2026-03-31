import React, { useState, useRef } from 'react';
import { JuegoB, JuegoResult, PerfilNino, ExplicacionBloque, PreguntaB } from '@/types';

interface GameTypeBProps {
  game: JuegoB;
  perfil: PerfilNino;
  explicacion: ExplicacionBloque | string;
  onComplete: (result: JuegoResult) => void;
  onCorrect: () => void;
  onWrong: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizarPreguntas(game: JuegoB): PreguntaB[] {
  // Nuevo formato: array de preguntas
  if (Array.isArray(game.preguntas) && game.preguntas.length > 0) {
    return game.preguntas;
  }
  // Fallback legacy: una sola pregunta
  if (game.pregunta && Array.isArray(game.opciones)) {
    return [{
      pregunta: game.pregunta,
      opciones: game.opciones.map(o => ({ texto: o.texto, correcta: o.correcta })),
    }];
  }
  return [];
}

function buscarTipRelevante(
  explicacion: ExplicacionBloque | string,
  preguntaTexto: string
): { paso: string; ejemplo: string | null } {
  if (typeof explicacion === 'string') return { paso: explicacion, ejemplo: null };

  const pasos = explicacion.pasos || [];
  const ejemplos = explicacion.ejemplos || [];
  const palabras = preguntaTexto.toLowerCase().split(' ').filter(p => p.length > 3);

  let mejorPaso = pasos[0] || explicacion.resumen || '';
  let mejorScore = 0;
  pasos.forEach(paso => {
    const score = palabras.filter(p => paso.toLowerCase().includes(p)).length;
    if (score > mejorScore) { mejorScore = score; mejorPaso = paso; }
  });

  let mejorEjemplo: string | null = null;
  let mejorScoreEj = 0;
  ejemplos.forEach(ej => {
    const texto = `${ej.original} ${ej.traduccion}`.toLowerCase();
    const score = palabras.filter(p => texto.includes(p)).length;
    if (score > mejorScoreEj) {
      mejorScoreEj = score;
      mejorEjemplo = ej.traduccion ? `${ej.original} → ${ej.traduccion}` : ej.original;
    }
  });

  if (!mejorEjemplo && ejemplos.length > 0) {
    const ej = ejemplos[0];
    mejorEjemplo = ej.traduccion ? `${ej.original} → ${ej.traduccion}` : ej.original;
  }

  return { paso: mejorPaso, ejemplo: mejorEjemplo };
}

const MENSAJES_ANIMO = [
  '¡Casi! Tú puedes lograrlo 💪',
  '¡Ups, vuelve a intentarlo! Tú eres capaz 🌟',
  '¡No te rindas! Cada intento te hace más inteligente 🧠',
  '¡Sigue adelante! Estás aprendiendo 🚀',
];

// ── Componente ────────────────────────────────────────────────────────────────

const GameTypeB: React.FC<GameTypeBProps> = ({
  game, perfil, explicacion, onComplete, onCorrect, onWrong
}) => {
  const preguntas = normalizarPreguntas(game);
  const totalPreguntas = preguntas.length;

  const [preguntaIdx, setPreguntaIdx]     = useState(0);
  const [selected, setSelected]           = useState<number | null>(null);
  const [feedback, setFeedback]           = useState<'correct' | 'wrong' | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [revealed, setRevealed]           = useState(false);

  const totalAciertos = useRef(0);
  const totalErrores  = useRef(0);
  const totalIntentos = useRef(0);
  const intentosEnPreguntaActual = useRef(0);
  const aninoIndex = useRef(Math.floor(Math.random() * MENSAJES_ANIMO.length));

  const isDown   = perfil.condicion === 'down';
  const isTEA    = perfil.condicion === 'tea';
  const fontSize = isDown ? 'text-lg' : 'text-base';

  const preguntaActual = preguntas[preguntaIdx];

  if (!preguntaActual) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground font-bold">Cargando preguntas…</p>
      </div>
    );
  }

  const tipData = buscarTipRelevante(explicacion, preguntaActual.pregunta);

  const handleSelect = (idx: number) => {
    if (feedback === 'correct' || revealed || showErrorModal || showSuccessModal) return;

    totalIntentos.current++;
    intentosEnPreguntaActual.current++;
    setSelected(idx);

    const opcion = preguntaActual.opciones[idx];

    if (opcion.correcta) {
      totalAciertos.current++;
      setFeedback('correct');
      onCorrect();
      // Avanzar tras breve pausa
      setTimeout(() => {
        const esUltima = preguntaIdx >= totalPreguntas - 1;
        if (esUltima) {
          setShowSuccessModal(true);
        } else {
          setPreguntaIdx(i => i + 1);
          setSelected(null);
          setFeedback(null);
          setRevealed(false);
          intentosEnPreguntaActual.current = 0;
          aninoIndex.current = Math.floor(Math.random() * MENSAJES_ANIMO.length);
        }
      }, 900);
    } else {
      totalErrores.current++;
      setFeedback('wrong');
      onWrong();

      if (intentosEnPreguntaActual.current >= 2) {
        // Revelar respuesta correcta tras 2 intentos fallidos
        setTimeout(() => {
          setRevealed(true);
          setFeedback(null);
          setSelected(null);
        }, 700);
      } else {
        // Mostrar modal con tip
        setTimeout(() => {
          setShowErrorModal(true);
          setFeedback(null);
          setSelected(null);
        }, 500);
      }
    }
  };

  const handleCerrarErrorModal = () => {
    setShowErrorModal(false);
  };

  const handleRevealedContinue = () => {
    const esUltima = preguntaIdx >= totalPreguntas - 1;
    if (esUltima) {
      setShowSuccessModal(true);
    } else {
      setPreguntaIdx(i => i + 1);
      setSelected(null);
      setFeedback(null);
      setRevealed(false);
      intentosEnPreguntaActual.current = 0;
      aninoIndex.current = Math.floor(Math.random() * MENSAJES_ANIMO.length);
    }
  };

  const handleFinalizar = () => {
    onComplete({
      tipo: 'B',
      aciertos: totalAciertos.current,
      errores: totalErrores.current,
      intentos: totalIntentos.current,
    });
  };

  const resumenFinal = typeof explicacion !== 'string' && explicacion.resumen
    ? explicacion.resumen
    : `Respondiste ${totalAciertos.current} de ${totalPreguntas} preguntas correctamente`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-3xl border border-border shadow-lg p-6">

        {/* Instrucción */}
        <p className={`font-black text-foreground text-center mb-2 ${isDown ? 'text-2xl' : 'text-xl'}`}>
          {game.instruccion}
        </p>

        {/* Progreso de preguntas */}
        {totalPreguntas > 1 && (
          <div className="flex gap-1.5 justify-center mb-5">
            {preguntas.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i < preguntaIdx ? 'w-8 bg-teo-green' :
                  i === preguntaIdx ? 'w-12 bg-primary' :
                  'w-8 bg-muted'
                }`}
              />
            ))}
          </div>
        )}

        {/* Pregunta actual */}
        <div className={`mb-6 p-4 bg-muted/20 rounded-2xl text-center ${!isTEA ? 'animate-fade-in' : ''}`}>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-wide mb-2">
            Pregunta {preguntaIdx + 1} de {totalPreguntas}
          </p>
          <p className={`font-black text-foreground leading-snug ${isDown ? 'text-2xl' : 'text-xl'}`}>
            {preguntaActual.pregunta}
          </p>
        </div>

        {/* Opciones — sin íconos */}
        <div className="space-y-3">
          {preguntaActual.opciones.map((op, idx) => {
            let cls = `w-full flex items-center gap-3 px-5 py-4 rounded-2xl border-2 font-bold text-left transition-all cursor-pointer ${fontSize} `;

            if (revealed && op.correcta) {
              cls += 'border-teo-green bg-teo-green/20 text-foreground';
            } else if (selected === idx) {
              if (feedback === 'correct') cls += 'border-teo-green bg-teo-green/20 text-foreground';
              else if (feedback === 'wrong') cls += 'border-red-400 bg-red-50 text-foreground';
              else cls += 'border-primary bg-primary/10 text-foreground';
            } else {
              cls += 'border-border bg-card text-foreground hover:border-primary/60 hover:bg-primary/5';
            }

            const letra = String.fromCharCode(65 + idx); // A, B, C

            return (
              <button
                key={idx}
                type="button"
                className={cls}
                onClick={() => handleSelect(idx)}
                disabled={feedback === 'correct' || revealed || showSuccessModal}
              >
                {/* Letra indicadora */}
                <span className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-black ${
                  revealed && op.correcta ? 'border-teo-green bg-teo-green text-white' :
                  selected === idx && feedback === 'correct' ? 'border-teo-green bg-teo-green text-white' :
                  selected === idx && feedback === 'wrong' ? 'border-red-400 bg-red-100 text-red-600' :
                  'border-current'
                }`}>
                  {revealed && op.correcta ? '✓' :
                   selected === idx && feedback === 'correct' ? '✓' :
                   selected === idx && feedback === 'wrong' ? '✗' :
                   letra}
                </span>
                <span className="flex-1">{op.texto}</span>
              </button>
            );
          })}
        </div>

        {/* Botón continuar tras revelar respuesta */}
        {revealed && (
          <div className="mt-5">
            <p className="text-center text-sm text-muted-foreground font-semibold mb-3">
              La respuesta correcta está marcada en verde ✅
            </p>
            <button
              type="button"
              onClick={handleRevealedContinue}
              className="child-btn w-full bg-primary text-primary-foreground font-black text-lg py-4 rounded-2xl cursor-pointer"
            >
              {preguntaIdx < totalPreguntas - 1 ? 'Siguiente pregunta ➜' : 'Ver resumen ➜'}
            </button>
          </div>
        )}
      </div>

      {/* ── Modal de ERROR con tip contextual ── */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-teo-orange/40 shadow-2xl p-6 max-w-sm w-full animate-bounce-in">

            <div className="text-center mb-4">
              <div className="text-5xl mb-2">🤔</div>
              <p className="text-lg font-black text-foreground">
                {MENSAJES_ANIMO[aninoIndex.current]}
              </p>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4 mb-5 space-y-2">
              <p className="text-[11px] font-black text-amber-600 uppercase tracking-wide">
                💡 Recuerda esto
              </p>
              <p className="text-sm font-semibold text-foreground leading-relaxed">
                {tipData.paso}
              </p>
              {tipData.ejemplo && (
                <div className="mt-2 pt-2 border-t border-amber-200">
                  <p className="text-[11px] font-black text-amber-500 uppercase tracking-wide mb-1">
                    📌 Ejemplo
                  </p>
                  <p className="text-sm font-medium text-foreground/80 leading-relaxed">
                    {tipData.ejemplo}
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

      {/* ── Modal de ÉXITO final ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-teo-green/40 shadow-2xl p-6 max-w-sm w-full animate-bounce-in text-center">

            <div className="text-6xl mb-3">🏆</div>
            <p className="text-xl font-black text-foreground mb-2">
              ¡Excelente{perfil.nombre ? `, ${perfil.nombre}` : ''}!
            </p>
            <p className="text-sm text-muted-foreground font-semibold mb-5">
              Respondiste {totalAciertos.current} de {totalPreguntas} preguntas correctamente
            </p>

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

export default GameTypeB;
