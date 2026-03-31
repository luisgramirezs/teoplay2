import React, { useState, useRef } from 'react';
import { JuegoA, JuegoResult, PerfilNino, ExplicacionBloque } from '@/types';
import { DynamicIcon } from '@/components/DynamicIcon';


interface GameTypeAProps {
    game: JuegoA;
    perfil: PerfilNino;
    explicacion: ExplicacionBloque | string;
    onComplete: (result: JuegoResult) => void;
    onCorrect: () => void;
    onWrong: () => void;
}

interface CardState {
    item: JuegoA['items'][0];
    placed: 1 | 2 | null;
    feedback: 'correct' | 'wrong' | null;
}

interface FeedbackModal {
    categoriaCorrecta: 1 | 2;
    itemTexto: string;
}

/** Busca el paso más relevante para una categoría */
function buscarTipRelevante(
    explicacion: ExplicacionBloque | string,
    categoriaTexto: string
): { paso: string; ejemplo: string | null } {
    if (typeof explicacion === 'string') return { paso: explicacion, ejemplo: null };

    const pasos = explicacion.pasos || [];
    const ejemplos = explicacion.ejemplos || [];
    const palabrasCat = categoriaTexto.toLowerCase().split(' ').filter(p => p.length > 3);

    // Busca el paso más relevante
    let mejorPaso = pasos[0] || explicacion.resumen || '';
    let mejorScorePaso = 0;
    pasos.forEach(paso => {
        const score = palabrasCat.filter(p => paso.toLowerCase().includes(p)).length;
        if (score > mejorScorePaso) { mejorScorePaso = score; mejorPaso = paso; }
    });

    // Busca el ejemplo más relevante
    let mejorEjemplo: string | null = null;
    let mejorScoreEj = 0;
    ejemplos.forEach(ej => {
        const texto = `${ej.original} ${ej.traduccion}`.toLowerCase();
        const score = palabrasCat.filter(p => texto.includes(p)).length;
        if (score > mejorScoreEj) {
            mejorScoreEj = score;
            mejorEjemplo = ej.traduccion
                ? `${ej.original} → ${ej.traduccion}`
                : ej.original;
        }
    });

    // Si no hay match por palabras, toma el primer ejemplo
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

const GameTypeA: React.FC<GameTypeAProps> = ({
    game, perfil, explicacion, onComplete, onCorrect, onWrong
}) => {
    const [cards, setCards] = useState<CardState[]>(
        game.items.map(item => ({ item, placed: null, feedback: null }))
    );
    const [dragging, setDragging] = useState<number | null>(null);
    const [dropHover, setDropHover] = useState<1 | 2 | null>(null);
    const [feedbackModal, setFeedbackModal] = useState<FeedbackModal | null>(null);
    const [aninoIndex] = useState(() => Math.floor(Math.random() * MENSAJES_ANIMO.length));
    const [showSuccess, setShowSuccess] = useState(false);
    const errorsRef = useRef(0);
    const attemptsRef = useRef(0);
    const correctRef = useRef(0);

    const isDown = perfil.condicion === 'down';
    const fontSize = isDown ? 'text-lg' : 'text-base';

    const placedIn1 = cards.filter(c => c.placed === 1);
    const placedIn2 = cards.filter(c => c.placed === 2);
    const unplaced = cards.filter(c => c.placed === null);
    const allPlaced = unplaced.length === 0;

    const handleDrop = (zona: 1 | 2) => {
        if (dragging === null) return;
        attemptsRef.current++;
        setDropHover(null);

        const card = cards[dragging];
        const isCorrect = card.item.categoriaCorrecta === zona;

        if (isCorrect) {
            correctRef.current++;
            onCorrect();
            setCards(prev =>
                prev.map((c, i) => i === dragging ? { ...c, placed: zona, feedback: 'correct' } : c)
            );
        } else {
            errorsRef.current++;
            onWrong();
            // Marca feedback wrong temporalmente
            setCards(prev =>
                prev.map((c, i) => i === dragging ? { ...c, feedback: 'wrong' } : c)
            );
            // Muestra modal con tip contextual
            setFeedbackModal({
                categoriaCorrecta: card.item.categoriaCorrecta,
                itemTexto: card.item.texto,
            });
            // Limpia feedback visual después de un momento
            setTimeout(() => {
                setCards(prev =>
                    prev.map((c, i) => i === dragging ? { ...c, feedback: null } : c)
                );
            }, 600);
        }
        setDragging(null);
    };

    const handleComplete = () => {
        onComplete({
            tipo: 'A',
            aciertos: correctRef.current,
            errores: errorsRef.current,
            intentos: attemptsRef.current,
        });
    };

    const catCorrecta = feedbackModal
        ? (feedbackModal.categoriaCorrecta === 1 ? game.categoria1 : game.categoria2)
        : null;

    const tipData = feedbackModal && catCorrecta
        ? buscarTipRelevante(explicacion, catCorrecta.nombre)
        : null;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-3xl border border-border shadow-lg p-6">

                {/* Instrucción */}
                <p className={`font-black text-foreground text-center mb-6 ${isDown ? 'text-2xl' : 'text-xl'}`}>
                    {game.instruccion}
                </p>
                <p className="text-center text-sm font-semibold text-muted-foreground mb-6">
                    👆 Arrastra cada elemento a la categoría correcta
                </p>

                {/* Banco de tarjetas sin clasificar */}
                {!allPlaced && (
                    <div className="flex flex-wrap gap-3 justify-center mb-6 min-h-[80px] p-3 bg-muted/30 rounded-2xl">
                        {unplaced.map(cardState => {
                            const realIdx = cards.indexOf(cardState);
                            return (
                                <div
                                    key={realIdx}
                                    draggable
                                    onDragStart={() => setDragging(realIdx)}
                                    onDragEnd={() => { setDragging(null); setDropHover(null); }}
                                    className={`drag-card flex items-center gap-2 px-5 py-3 bg-card border-2 rounded-xl font-bold shadow-sm cursor-grab active:cursor-grabbing transition-all ${fontSize} ${cardState.feedback === 'wrong'
                                            ? 'feedback-wrong border-teo-red scale-95'
                                            : dragging === realIdx
                                                ? 'border-primary opacity-60 scale-95'
                                                : 'border-border hover:border-primary/60 hover:scale-105'
                                        }`}
                                >
                                    <DynamicIcon name={cardState.item.icono} className="w-6 h-6 text-primary" />
                                    <span>{cardState.item.texto}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Zonas de drop */}
                <div className="grid grid-cols-2 gap-4">
                    {([1, 2] as const).map(zona => {
                        const cat = zona === 1 ? game.categoria1 : game.categoria2;
                        const zonCards = zona === 1 ? placedIn1 : placedIn2;
                        return (
                            <div
                                key={zona}
                                onDragOver={e => { e.preventDefault(); setDropHover(zona); }}
                                onDragLeave={() => setDropHover(null)}
                                onDrop={() => handleDrop(zona)}
                                className={`drop-zone border-2 rounded-2xl p-4 min-h-[160px] transition-all ${dropHover === zona
                                        ? 'drag-over-active border-primary bg-primary/5 scale-[1.02]'
                                        : 'border-dashed border-border'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <DynamicIcon name={cat.icono} className="w-6 h-6 text-primary" />
                                    <span className={`font-black text-foreground ${isDown ? 'text-base' : 'text-sm'}`}>
                                        {cat.nombre}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {zonCards.map((c, i) => (
                                        <div
                                            key={i}
                                            className={`flex items-center gap-1.5 px-3 py-2 bg-teo-green/20 border border-teo-green rounded-xl font-bold text-foreground ${fontSize}`}
                                        >
                                            <DynamicIcon name={c.item.icono} className="w-4 h-4 text-teo-green" />
                                            <span>{c.item.texto}</span>
                                        </div>
                                    ))}
                                    {zonCards.length === 0 && (
                                        <p className="text-xs text-muted-foreground font-medium">Arrastra aquí…</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Botón finalizar */}

                {allPlaced && !showSuccess && (
                    <div style={{ display: 'none' }} ref={(() => { setTimeout(() => setShowSuccess(true), 300); return undefined; }) as never} />
                )}
            </div>

            {/* Modal de feedback por error */}
            {feedbackModal && catCorrecta && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border-2 border-teo-orange/40 shadow-2xl p-6 max-w-sm w-full animate-bounce-in">

                        {/* Emoji y mensaje de ánimo */}
                        <div className="text-center mb-4">
                            <div className="text-5xl mb-2">🤔</div>
                            <p className="text-lg font-black text-foreground">
                                {MENSAJES_ANIMO[aninoIndex]}
                            </p>
                        </div>

                        {/* Tip contextual */}
                        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4 mb-5 space-y-2">
                            <p className="text-[11px] font-black text-amber-600 uppercase tracking-wide">
                                💡 Recuerda sobre "{catCorrecta.nombre}"
                            </p>
                            <p className="text-sm font-semibold text-foreground leading-relaxed">
                                {tipData?.paso}
                            </p>
                            {tipData?.ejemplo && (
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


                        {/* Botón cerrar */}
                        <button
                            onClick={() => setFeedbackModal(null)}
                            className="child-btn w-full bg-primary text-white font-black py-3 rounded-2xl cursor-pointer text-base"
                        >
                            ¡Entendido, lo intento de nuevo! 💪
                        </button>
                    </div>
                </div>
            )}
       


             {showSuccess && (
                  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border-2 border-teo-green/40 shadow-2xl p-6 max-w-sm w-full text-center">
                      <div className="text-6xl mb-3">🏆</div>
                      <p className="text-xl font-black text-foreground mb-4">
                        ¡Excelente trabajo{perfil.nombre ? `, ${perfil.nombre}` : ''}!
                      </p>
                      <div className="bg-teo-green/10 border border-teo-green/30 rounded-2xl p-4 mb-5">
                        <p className="text-[11px] font-black text-teo-green uppercase tracking-wide mb-1">
                          ⭐ Lo que aprendiste:
                        </p>
                        <p className="text-sm font-semibold text-foreground leading-relaxed">
                          {typeof explicacion !== 'string' && explicacion.resumen
                            ? explicacion.resumen
                            : `Ahora sabes clasificar los elementos de "${game.categoria1.nombre}" y "${game.categoria2.nombre}"`
                          }
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

export default GameTypeA;