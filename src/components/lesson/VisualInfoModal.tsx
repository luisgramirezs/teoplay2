import React from 'react';
import { resolveLucideIcon } from '@/utils/iconResolver';

type VisualInfoModalProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    icon?: string;
    colorRamp?: string;
    extra?: React.ReactNode;
};

const colorMap: Record<string, string> = {
    teal: 'border-teal-300 bg-teal-50 text-teal-700',
    orange: 'border-orange-300 bg-orange-50 text-orange-700',
    purple: 'border-purple-300 bg-purple-50 text-purple-700',
    violet: 'border-violet-300 bg-violet-50 text-violet-700',
    amber: 'border-amber-300 bg-amber-50 text-amber-700',
    sky: 'border-sky-300 bg-sky-50 text-sky-700',
    pink: 'border-pink-300 bg-pink-50 text-pink-700',
    green: 'border-green-300 bg-green-50 text-green-700',
};

const VisualInfoModal: React.FC<VisualInfoModalProps> = ({
    open,
    onClose,
    title,
    description,
    icon,
    colorRamp = 'teal',
    extra,
}) => {
    if (!open) return null;

    const IconComponent = resolveLucideIcon(icon || title);
    const colorClass = colorMap[colorRamp] || colorMap.teal;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-[2rem] bg-white shadow-2xl border-4 p-6 relative border-teal-200">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-lg"
                    aria-label="Cerrar"
                >
                    ×
                </button>

                <div className="mb-4 flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border ${colorClass}`}>
                        <IconComponent size={24} strokeWidth={2} />
                    </div>

                    <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] font-black text-slate-500">
                            Saber más
                        </p>
                        <h4 className="text-2xl font-black text-slate-800 mt-1">
                            {title}
                        </h4>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                    <p className="text-slate-700 font-medium leading-relaxed text-sm">
                        {description || 'Este elemento forma parte de este tema importante.'}
                    </p>
                    {extra && <div className="mt-3">{extra}</div>}
                </div>

                <div className="mt-5 flex justify-center">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-full font-black shadow-sm transition-colors bg-slate-800 text-white"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VisualInfoModal;