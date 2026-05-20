import React, { useState } from 'react';
import { JuegoE, JuegoResult, PerfilNino } from '@/types';
import {
    PencilLine,
    Send
} from 'lucide-react';

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
    game,
    perfil,
    onComplete,
    onCorrect,
    onWrong
}) => {

    const [respuesta, setRespuesta] =
        useState('');

    const [estado, setEstado] =
        useState<
            'esperando'
            | 'verificando'
            | 'correcto'
            | 'incorrecto'
            | 'confirmado'
        >('esperando');

    const [feedbackIA, setFeedbackIA] =
        useState<string | null>(null);

    const [intentos, setIntentos] =
        useState(0);

    const [errores, setErrores] =
        useState(0);

    const [showSuccess, setShowSuccess] =
        useState(false);

    const [aninoIndex] = useState(
        () =>
            Math.floor(
                Math.random() *
                MENSAJES_ANIMO.length
            )
    );

    const isDown =
        perfil.condicion === 'down';

    const fontSize =
        isDown
            ? 'text-xl'
            : 'text-base';



    /**
     * VALIDACIÓN SEMÁNTICA FLEXIBLE
     * Para preguntas abiertas:
     * historia, ciencias, lenguaje, reflexión, etc.
     */
    const verificarConIA = async (
        respuestaAlumno: string
    ) => {

        setEstado('verificando');

        try {

            const API_URL = import.meta.env.VITE_BACKEND_URL;

            const res = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                    body: JSON.stringify({

                        model: 'gpt-4o-mini',

                        /**
                         * Baja aleatoriedad
                         * para hacer la evaluación
                         * más consistente.
                         */
                        temperature: 0.2,

                        messages: [
                            {
                                role: 'user',

                                content: `
Eres un evaluador educativo para niños.

Evalúa la respuesta de manera FLEXIBLE y SEMÁNTICA.

IMPORTANTE:
- La respuesta NO necesita coincidir literalmente con la respuesta esperada.
- Debes evaluar si el niño comprendió correctamente la idea principal.
- Acepta respuestas expresadas con palabras diferentes.
- Acepta respuestas resumidas.
- Ignora pequeños errores ortográficos.
- Ignora diferencias gramaticales simples.
- Considera correcta cualquier respuesta que demuestre comprensión del tema.

Actividad:
"${game.actividad}"

Criterios de evaluación:
"${game.criterios || 'Evalúa si la respuesta demuestra comprensión del tema'}"

Respuesta esperada de referencia:
"${game.respuestaEsperada || ''}"

Respuesta del niño:
"${respuestaAlumno}"

Responde SOLO con este JSON:

{
  "correcto": true,
  "feedback": "Mensaje corto y amigable"
}

o

{
  "correcto": false,
  "feedback": "Mensaje corto indicando qué puede mejorar"
}
`
                            }
                        ]
                    }),
                }
            );

            const data =
                await res.json();

            const raw =
                data.choices?.[0]
                    ?.message?.content || '{}';

            const parsed = JSON.parse(
                raw
                    .replace(
                        /```json|```/g,
                        ''
                    )
                    .trim()
            );

            setFeedbackIA(
                parsed.feedback || ''
            );

            if (parsed.correcto) {

                setEstado('correcto');

                onCorrect();

                setTimeout(() => {
                    setShowSuccess(true);
                }, 500);

            } else {

                setEstado('incorrecto');

                setErrores(
                    (e) => e + 1
                );

                onWrong();
            }

        } catch (error) {

            console.error(error);

            /**
             * Fallback:
             * si falla la IA,
             * permitimos continuar.
             */
            setEstado('confirmado');

            setTimeout(() => {
                setShowSuccess(true);
            }, 500);
        }
    };

    /**
     * VALIDACIÓN GENERAL
     */
    const handleVerificar = () => {

        if (!respuesta.trim()) return;

        const nuevosIntentos =
            intentos + 1;

        setIntentos(nuevosIntentos);

        /**
         * VALIDACIÓN EXACTA
         * Solo para resultados numéricos o términos únicos (ej: "8", "H2O", "fotosíntesis").
         * Frases o respuestas abiertas → IA semántica aunque vengan marcadas como 'exacta'.
         */
        if (
            game.tipoValidacion === 'exacta'
        ) {
            const esperada = game.respuestaEsperada?.trim() || '';

            // Exacta estricta: número/símbolo, o término sin espacios de máx 20 chars
            const esEstrictamenteExacta =
                /^[\d\s\+\-\*\/\.\,\%\=]+$/.test(esperada) ||
                (!esperada.includes(' ') && esperada.length <= 20);

            if (esEstrictamenteExacta) {
                if (respuesta.trim().toLowerCase() === esperada.toLowerCase()) {
                    setEstado('correcto');
                    onCorrect();
                    setTimeout(() => setShowSuccess(true), 500);
                } else {
                    setEstado('incorrecto');
                    setErrores((e) => e + 1);
                    onWrong();
                }
            } else {
                // Respuesta es una frase → validar semánticamente con IA
                verificarConIA(respuesta);
            }

            /**
             * VALIDACIÓN SEMÁNTICA
             */
        } else if (
            game.tipoValidacion === 'ia'
        ) {

            verificarConIA(respuesta);

            /**
             * SOLO CONFIRMAR
             */
        } else {

            setEstado('confirmado');

            setTimeout(() => {
                setShowSuccess(true);
            }, 500);
        }
    };

    const handleComplete = () => {

        onComplete({
            tipo: 'E',
            aciertos: 100,
            errores: 0,
            intentos
        });
    };

    return (

        <div className="max-w-2xl mx-auto">

            <div
                className="
                    bg-card
                    rounded-3xl
                    border
                    border-border
                    shadow-lg
                    p-6
                "
            >

                {/* Título */}
                <p
                    className={`
                        font-black
                        text-foreground
                        text-center
                        mb-2
                        ${isDown
                            ? 'text-2xl'
                            : 'text-xl'
                        }
                    `}
                >
                    {game.instruccion}
                </p>

                <p
                    className="
                        text-center
                        text-sm
                        font-semibold
                        text-muted-foreground
                        mb-6
                    "
                >
                    ✏️ {
                        game.mensajeMotor ||
                        'Toma tu cuaderno y lápiz'
                    }
                </p>

                {/* Actividad */}
                <div
                    className="
                        bg-amber-50
                        border-2
                        border-amber-300
                        rounded-2xl
                        p-5
                        mb-6
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                            mb-3
                        "
                    >

                        <div
                            className="
                                w-10
                                h-10
                                rounded-xl
                                bg-amber-200
                                flex
                                items-center
                                justify-center
                                flex-shrink-0
                            "
                        >
                            <PencilLine
                                className="
                                    w-5
                                    h-5
                                    text-amber-700
                                "
                            />
                        </div>

                        <p
                            className="
                                text-[11px]
                                font-black
                                text-amber-600
                                uppercase
                                tracking-wide
                            "
                        >
                            📒 Tu actividad
                        </p>

                    </div>

                    <p
                        className={`
                            font-black
                            text-foreground
                            leading-relaxed
                            ${isDown
                                ? 'text-xl'
                                : 'text-lg'
                            }
                        `}
                    >
                        {game.actividad}
                    </p>

                </div>

                {/* Respuesta */}
                {(estado === 'esperando' ||
                    estado === 'incorrecto') && (

                        <div className="space-y-3">

                            <p
                                className={`
                                font-bold
                                text-foreground
                                ${fontSize}
                            `}
                            >
                                {
                                    game.tipoValidacion === 'confirmacion'
                                        ? '¿Ya terminaste la actividad?'
                                        : '¿Cuál fue tu respuesta?'
                                }
                            </p>

                            {game.tipoValidacion !== 'confirmacion' && (

                                <>
                                    <textarea
                                        value={respuesta}

                                        onChange={(e) =>
                                            setRespuesta(
                                                e.target.value
                                            )
                                        }

                                        placeholder="
Escribe aquí tu respuesta...
"

                                        className={`
                                        w-full
                                        border-2
                                        border-border
                                        rounded-2xl
                                        p-4
                                        font-semibold
                                        text-foreground
                                        resize-none
                                        focus:outline-none
                                        focus:border-primary
                                        transition-colors
                                        ${fontSize}
                                    `}

                                        rows={
                                            game.tipoValidacion === 'ia'
                                                ? 3
                                                : 1
                                        }
                                    />

                                    {/* PISTA */}
                                    {game.pista && (

                                        <details className="mt-3">

                                            <summary
                                                className="
                                                cursor-pointer
                                                text-sm
                                                font-bold
                                                text-primary
                                            "
                                            >
                                                💡 Ver pista
                                            </summary>

                                            <div
                                                className="
                                                mt-2
                                                rounded-2xl
                                                border
                                                border-blue-200
                                                bg-blue-50
                                                p-4
                                            "
                                            >
                                                <p
                                                    className="
                                                    text-sm
                                                    font-semibold
                                                    text-blue-800
                                                    leading-relaxed
                                                "
                                                >
                                                    {game.pista}
                                                </p>
                                            </div>

                                        </details>
                                    )}
                                </>
                            )}

                            {/* Error */}
                            {estado === 'incorrecto' && (

                                <div
                                    className="
                                    bg-red-50
                                    border-l-4
                                    border-red-400
                                    rounded-r-xl
                                    p-3
                                "
                                >
                                    <p
                                        className="
                                        text-sm
                                        font-bold
                                        text-red-700
                                    "
                                    >
                                        {
                                            feedbackIA ||
                                            MENSAJES_ANIMO[
                                            aninoIndex
                                            ]
                                        }
                                    </p>
                                </div>
                            )}

                            {/* Botón */}
                            <button

                                onClick={
                                    game.tipoValidacion === 'confirmacion'
                                        ? () => {
                                            setEstado('confirmado');

                                            setTimeout(() => {
                                                setShowSuccess(true);
                                            }, 500);
                                        }
                                        : handleVerificar
                                }

                                disabled={
                                    game.tipoValidacion !== 'confirmacion'
                                    && !respuesta.trim()
                                }

                                className="
                                child-btn
                                w-full
                                bg-primary
                                text-white
                                font-black
                                py-4
                                rounded-2xl
                                cursor-pointer
                                flex
                                items-center
                                justify-center
                                gap-2
                                disabled:opacity-50
                            "
                            >

                                <Send className="w-5 h-5" />

                                {
                                    game.tipoValidacion === 'confirmacion'
                                        ? '✅ ¡Sí, terminé!'
                                        : 'Verificar respuesta'
                                }

                            </button>

                        </div>
                    )}

                {/* Verificando */}
                {estado === 'verificando' && (

                    <div className="text-center py-6">

                        <div
                            className="
                                text-4xl
                                mb-3
                                animate-pulse
                            "
                        >
                            🤔
                        </div>

                        <p
                            className="
                                font-bold
                                text-muted-foreground
                            "
                        >
                            Revisando tu respuesta...
                        </p>

                    </div>
                )}
            </div>

            {/* Modal éxito */}
            {showSuccess && (

                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        bg-black/50
                        flex
                        items-center
                        justify-center
                        p-4
                    "
                >

                    <div
                        className="
                            bg-white
                            rounded-3xl
                            border-2
                            border-teo-green/40
                            shadow-2xl
                            p-6
                            max-w-sm
                            w-full
                            text-center
                        "
                    >

                        <div className="text-6xl mb-3">
                            🏆
                        </div>

                        <p
                            className="
                                text-xl
                                font-black
                                text-foreground
                                mb-2
                            "
                        >
                            ¡Excelente trabajo
                            {
                                perfil.nombre
                                    ? `, ${perfil.nombre}`
                                    : ''
                            }
                            !
                        </p>

                        {feedbackIA && (

                            <p
                                className="
                                    text-sm
                                    font-semibold
                                    text-muted-foreground
                                    mb-4
                                    leading-relaxed
                                "
                            >
                                {feedbackIA}
                            </p>
                        )}

                        {estado === 'confirmado' && (

                            <div
                                className="
                                    bg-blue-50
                                    border
                                    border-blue-200
                                    rounded-xl
                                    p-3
                                    mb-4
                                "
                            >
                                <p
                                    className="
                                        text-xs
                                        font-bold
                                        text-blue-600
                                    "
                                >
                                    📋 Tu docente revisará esta actividad
                                </p>
                            </div>
                        )}

                        <div
                            className="
                                bg-teo-green/10
                                border
                                border-teo-green/30
                                rounded-2xl
                                p-4
                                mb-5
                            "
                        >

                            <p
                                className="
                                    text-[11px]
                                    font-black
                                    text-teo-green
                                    uppercase
                                    tracking-wide
                                    mb-1
                                "
                            >
                                ⭐ Lo que practicaste
                            </p>

                            <p
                                className="
                                    text-sm
                                    font-semibold
                                    text-foreground
                                    leading-relaxed
                                "
                            >
                                {game.actividad}
                            </p>

                        </div>

                        <button
                            onClick={handleComplete}

                            className="
                                child-btn
                                w-full
                                bg-teo-green
                                text-white
                                font-black
                                py-3
                                rounded-2xl
                                cursor-pointer
                                text-base
                            "
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