import React from "react";

export type ModuleType =
    | "intro"
    | "concept"
    | "visual"
    | "video"
    | "activity"
    | "summary";

export interface ModuleConfig {
    id: string;
    type: ModuleType;
    title: string;
    subtitle: string;
    emoji: string;
    color: string;
    bg: string;
    border: string;
    badgeBg: string;
    badgeText: string;
}

const MODULE_STYLES: Record<ModuleType, {
    emoji: string;
    color: string;
    bg: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    number: string;
    numberBg: string;
}> = {
    intro: {
        emoji: '📖',
        color: 'text-violet-700',
        bg: 'bg-violet-50',
        border: 'border-violet-200',
        badgeBg: 'bg-violet-100',
        badgeText: 'text-violet-700',
        number: 'text-white',
        numberBg: 'bg-violet-500',
    },
    concept: {
        emoji: '💡',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-700',
        number: 'text-white',
        numberBg: 'bg-amber-500',
    },
    visual: {
        emoji: '🎨',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-700',
        number: 'text-white',
        numberBg: 'bg-emerald-500',
    },
    video: {
        emoji: '▶️',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        badgeBg: 'bg-red-100',
        badgeText: 'text-red-700',
        number: 'text-white',
        numberBg: 'bg-red-500',
    },
    activity: {
        emoji: '🎮',
        color: 'text-pink-700',
        bg: 'bg-pink-50',
        border: 'border-pink-200',
        badgeBg: 'bg-pink-100',
        badgeText: 'text-pink-700',
        number: 'text-white',
        numberBg: 'bg-pink-500',
    },
    summary: {
        emoji: '⭐',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        badgeBg: 'bg-orange-100',
        badgeText: 'text-orange-700',
        number: 'text-white',
        numberBg: 'bg-orange-500',
    },
};

const MODULE_ORDER: ModuleType[] = ['intro', 'concept', 'visual', 'video', 'activity', 'summary'];

type Props = {
    module: {
        id: string;
        type: ModuleType;
        title: string;
        subtitle: string;
    };
    completed?: boolean;
    onClick: () => void;
};

export default function ModuleCard({ module, completed, onClick }: Props) {
    const style = MODULE_STYLES[module.type];
    const number = MODULE_ORDER.indexOf(module.type) + 1;

    return (
        <button
            onClick={onClick}
            className={`
                relative w-full text-left rounded-[28px] border-2 p-6
                transition-all duration-200 cursor-pointer
                hover:shadow-lg hover:-translate-y-0.5
                ${completed
                    ? 'border-emerald-300 bg-emerald-50/60'
                    : `${style.border} bg-white hover:${style.bg}`
                }
            `}
        >
            {/* Número */}
            <div className={`
                absolute top-5 left-5 w-8 h-8 rounded-full flex items-center justify-center
                text-sm font-black
                ${completed ? 'bg-emerald-500 text-white' : `${style.numberBg} ${style.number}`}
            `}>
                {completed ? '✓' : number}
            </div>

            {/* Emoji grande */}
            <div className={`
                w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4 mx-auto
                ${completed ? 'bg-emerald-100' : style.bg}
            `}>
                {completed ? '✅' : style.emoji}
            </div>

            {/* Texto */}
            <div className="text-center">
                <p className={`text-lg font-black mb-1 ${completed ? 'text-emerald-700' : style.color}`}>
                    {module.title}
                </p>
                <p className="text-sm font-medium text-slate-500 leading-snug">
                    {module.subtitle}
                </p>
            </div>

            {/* Badge estado */}
            <div className={`
                mt-4 mx-auto w-fit flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black
                ${completed
                    ? 'bg-emerald-100 text-emerald-700'
                    : `${style.badgeBg} ${style.badgeText}`
                }
            `}>
                <div className={`w-1.5 h-1.5 rounded-full ${completed ? 'bg-emerald-500' : 'bg-current opacity-50'}`} />
                {completed ? '✓ Completado' : 'Toca para explorar'}
            </div>
        </button>
    );
}
