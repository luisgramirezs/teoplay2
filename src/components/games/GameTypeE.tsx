import React, { useState } from 'react';
import { JuegoE, JuegoResult, PerfilNino } from '@/types';
import { PencilLine, CheckCircle, Send } from 'lucide-react';

interface GameTypeEProps {
    game: JuegoE;
    perfil: PerfilNino;
    onComplete: (result: JuegoResult) => void;
    onCorrect: () => void;
    onWrong: () => void;
}

const MENSAJES_ANIMO = [
    '¡Casi! Revisa tu respuesta e inténtalo de nuevo 💪',
    '¡Ups! Vuelve a tu cuaderno y verifica 🧐',
    '¡No te rindas! Estás aprendiendo 🚀',
];

const GameTypeE: React.FC<GameTypeEProps> = ({
    game, perfil, onComplete, onCorrect, onWrong
}) => {
    const [respuesta, setRespuesta] = useState('');
    const [estado, setEstado] = useState<'esperando' | 'verificando' | 'correcto' | 'incorrecto' | 'confirmado'>('esperando');
    const [feedbackIA, setFeedbackIA] = useState<string | null>(null);
    const [intentos, setIntentos] = useState(0);
    const [errores, setErrores] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [aninoIndex] = useState(() => Math.floor(Math.random() * MENSAJES_ANIMO.length));

    const isDown = perfil.condicion === 'down';
    const isTEA = perfil.condicion === 'tea';
    const fontSize = isDown ? 'text-xl' : 'text-base';

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    const verificarConIA = async (respuestaAlumno: string) => {
        setEstado('verificando');
        try {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    max_tokens: 150,
                    messages: [{
                        role: 'user',
                        content: `Eres un evaluador educativo para niños. Evalúa esta respuesta de forma simple y amigable.
Actividad: "${game.actividad}"
Criterios de evaluación: "${game.criterios || 'Evalúa si la respuesta es coherente con la actividad'}"
Respuesta del niño: "${respuestaAlumno}"

Responde SOLO con este JSON:
{
  "correcto": true o false,
  "feedback": "Mensaje corto y amigable de máximo 2 oraciones explicando si está bien o qué mejorar"
}`
                    }],
                }),
            });
            const data = await res.json();
            const raw = data.choices?.[0]?.message?.content || '{}';
            const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());

            setFeedbackIA(parsed.feedback || '');
            if (parsed.correcto) {
                setEstado('correcto');
                onCorrect();
                setTimeout(() => setShowSuccess(true), 500);
            } else {
                setEstado('incorrecto');
                setErrores(e => e + 1);
                onWrong();
            }
        } catch {
            // Si falla la IA, tratamos como confirmación
            setEstado('confirmado');
            setTimeout(() => setShowSuccess(true), 500);
        }
    };

    const handleVerificar = () => {
        if (!respuesta.trim()) return;
        const nuevosIntentos = intentos + 1;
        setIntentos(nuevosIntentos);

        if (game.tipoValidacion === 'exacta') {
            const esperada = game.respuestaEsperada?.trim().toLowerCase() || '';
            const dada = respuesta.trim().toLowerCase();
            if (dada === esperada) {
                setEstado('correcto');
                onCorrect();
                setTimeout(() => setShowSuccess(true), 500);
            } else {
                setEstado('incorrecto');
                setErrores(e => e + 1);
                onWrong();
            }
        } else if (game.tipoValidacion === 'ia') {
            verificarConIA(respuesta);
        } else {
            // confirmacion
            setEstado('confirmado');
            setTimeout(() => setShowSuccess(true), 500);
        }
    };

    const handleReintentar = () => {
        setEstado('esperando');
        setFeedbackIA(null);
    };

    const handleComplete = () => {
        const aciertos = estado === 'correcto' || estado === 'confirmado' ? 1 : 0;
        onComplete({ tipo: 'E', aciertos:100, errores:0, intentos });

    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-3xl border border-border shadow-lg p-6">

                {/* Instrucción */}
                <p className={`font-black text-foreground text-center mb-2 ${isDown ? 'text-2xl' : 'text-xl'}`}>
                    {game.instruccion}
                </p>
                <p className="text-center text-sm font-semibold text-muted-foreground mb-6">
                    ✏️ {game.mensajeMotor || 'Toma tu cuaderno y lápiz'}
                </p>

                {/* Tarjeta de actividad */}
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center flex-shrink-0">
                            <PencilLine className="w-5 h-5 text-amber-700" />
                        </div>
                        <p className="text-[11px] font-black text-amber-600 uppercase tracking-wide">
                            📒 Tu actividad en el cuaderno
                        </p>
                    </div>
                    <p className={`font-black text-foreground leading-relaxed ${isDown ? 'text-xl' : 'text-lg'}`}>
                        {game.actividad}
                    </p>
                </div>

                {/* Campo de respuesta */}
                {(estado === 'esperando' || estado === 'incorrecto') && (
                    <div className="space-y-3">
                        <p className={`font-bold text-foreground ${fontSize}`}>
                            {game.tipoValidacion === 'confirmacion'
                                ? '¿Ya terminaste la actividad?'
                                : '¿Cuál fue tu respuesta?'
                            }
                        </p>

                        {game.tipoValidacion !== 'confirmacion' && (
                            <textarea
                                value={respuesta}
                                onChange={e => setRespuesta(e.target.value)}
                                placeholder="Escribe aquí tu respuesta..."
                                className={`w-full border-2 border-border rounded-2xl p-4 font-semibold text-foreground resize-none focus:outline-none focus:border-primary transition-colors ${fontSize}`}
                                rows={game.tipoValidacion === 'ia' ? 3 : 1}
                            />
                        )}

                        {/* Feedback de error */}
                        {estado === 'incorrecto' && (
                            <div className="bg-red-50 border-l-4 border-red-400 rounded-r-xl p-3">
                                <p className="text-sm font-bold text-red-700">
                                    {feedbackIA || MENSAJES_ANIMO[aninoIndex]}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={game.tipoValidacion === 'confirmacion'
                                ? () => { setEstado('confirmado'); setTimeout(() => setShowSuccess(true), 500); }
                                : handleVerificar
                            }
                            disabled={game.tipoValidacion !== 'confirmacion' && !respuesta.trim()}
                            className="child-btn w-full bg-primary text-white font-black py-4 rounded-2xl cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                            {game.tipoValidacion === 'confirmacion' ? '✅ ¡Sí, terminé!' : 'Verificar respuesta'}
                        </button>
                    </div>
                )}

                {/* Verificando con IA */}
                {estado === 'verificando' && (
                    <div className="text-center py-6">
                        <div className="text-4xl mb-3 animate-pulse">🤔</div>
                        <p className="font-bold text-muted-foreground">Revisando tu respuesta...</p>
                    </div>
                )}

            </div>

            {/* Modal de éxito */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border-2 border-teo-green/40 shadow-2xl p-6 max-w-sm w-full text-center">
                        <div className="text-6xl mb-3">🏆</div>
                        <p className="text-xl font-black text-foreground mb-2">
                            ¡Excelente trabajo{perfil.nombre ? `, ${perfil.nombre}` : ''}!
                        </p>
                        {feedbackIA && (
                            <p className="text-sm font-semibold text-muted-foreground mb-4 leading-relaxed">
                                {feedbackIA}
                            </p>
                        )}
                        {estado === 'confirmado' && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                                <p className="text-xs font-bold text-blue-600">
                                    📋 Tu docente revisará esta actividad
                                </p>
                            </div>
                        )}
                        <div className="bg-teo-green/10 border border-teo-green/30 rounded-2xl p-4 mb-5">
                            <p className="text-[11px] font-black text-teo-green uppercase tracking-wide mb-1">
                                ⭐ Lo que practicaste
                            </p>
                            <p className="text-sm font-semibold text-foreground leading-relaxed">
                                {game.actividad}
                            </p>
                        </div>
                        <button
                            onClick={handleComplete}
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

export default GameTypeE;
