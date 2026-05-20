import React from "react";
import { BookOpen, Eye } from "lucide-react";

export interface ObraArte {
    titulo: string;
    autor: string;
    query: string;
}

interface ExamplesBlockProps {
    obras: ObraArte[];
    onSelect: (obra: ObraArte) => void;
    selectedIndex?: number | null;
}

const ExamplesBlock: React.FC<ExamplesBlockProps> = ({
    obras,
    onSelect,
    selectedIndex = null,
}) => {
    if (!obras || obras.length === 0) {
        return (
            <div className="p-4 rounded-2xl border border-dashed bg-slate-50 text-center">
                <p className="text-sm font-semibold text-slate-400">
                    No hay obras disponibles para este tema.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {obras.map((obra, idx) => {
                const isSelected = selectedIndex === idx;

                return (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => onSelect(obra)}
                        className={`relative group text-left rounded-2xl border-2 p-3 transition-all cursor-pointer bg-white hover:shadow-md overflow-hidden
                            ${isSelected ? "border-teal-500 bg-teal-50" : "border-slate-200 hover:border-teal-300"}`}
                    >
                        <div className="flex items-center gap-3">
                            {/* Thumbnail placeholder */}
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">🖼️</span>
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-black text-slate-800 leading-tight line-clamp-2">
                                    {obra.titulo}
                                </p>
                                <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">
                                    {obra.autor}
                                </p>
                                <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-lg bg-teal-50 border border-teal-200 text-[10px] font-black text-teal-700">
                                    <Eye className="w-3 h-3" /> Ver imagen
                                </span>
                            </div>

                            {isSelected && (
                                <div className="w-3 h-3 rounded-full bg-teal-500 flex-shrink-0" />
                            )}
                        </div>
                    </button>                );
            })}
        </div>
    );
};

export default ExamplesBlock;
