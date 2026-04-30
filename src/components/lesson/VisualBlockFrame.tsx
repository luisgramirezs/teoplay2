import React from 'react';

type VisualBlockFrameProps = {
    title?: string;
    subtitle?: string;
    typeLabel?: string;
    hint?: string;
    children: React.ReactNode;
};

const VisualBlockFrame: React.FC<VisualBlockFrameProps> = ({
    title,
    subtitle,
    typeLabel,
    hint,
    children,
}) => {
    return (
        <div className="rounded-2xl bg-white/70 border border-slate-200 p-4 md:p-5 shadow-sm">
            {(title || subtitle || typeLabel) && (
                <div className="mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                        {typeLabel && (
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">
                                {typeLabel}
                            </span>
                        )}
                        {title && (
                            <h4 className="text-base md:text-lg font-black text-slate-800">
                                {title}
                            </h4>
                        )}
                    </div>

                    {subtitle && (
                        <p className="mt-2 text-sm text-slate-600 font-medium">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}

            <div>{children}</div>

            {hint && (
                <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
                    {hint}
                </div>
            )}
        </div>
    );
};

export default VisualBlockFrame;