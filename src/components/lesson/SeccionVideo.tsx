import React from 'react';

interface Props {
    videoYoutube: { videoId: string; titulo: string; canal: string } | null;
    loadingVideo: boolean;
    tema: string;
}

export default function SeccionVideo({ videoYoutube, loadingVideo, tema }: Props) {
    return (
        <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-xl">▶️</div>
                <div>
                    <p className="text-sm font-black text-slate-800">Video del tema</p>
                    <p className="text-xs font-medium text-slate-500">{tema}</p>
                </div>
            </div>
            {loadingVideo ? (
                <div className="w-full h-48 rounded-2xl bg-slate-100 animate-pulse flex items-center justify-center">
                    <p className="text-xs text-slate-400 font-bold">Buscando video…</p>
                </div>
            ) : videoYoutube ? (
                <div className="space-y-2">
                    <div className="relative w-full rounded-2xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                            className="absolute inset-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${videoYoutube.videoId}?rel=0&modestbranding=1`}
                            title={videoYoutube.titulo}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                    <p className="text-[11px] font-bold text-slate-600 line-clamp-2">{videoYoutube.titulo}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{videoYoutube.canal}</p>
                </div>
            ) : (
                <div className="w-full h-48 rounded-2xl bg-slate-50 flex flex-col items-center justify-center gap-2">
                    <span className="text-3xl">🎬</span>
                    <p className="text-sm font-bold text-slate-400">No encontramos video para este tema</p>
                </div>
            )}
        </div>
    );
}