import React from "react";

const InfografiaPedagogica: React.FC<{
    contenido: any;
    imagenUrl: string;
}> = ({ contenido, imagenUrl }) => {

    if (!contenido) return null;

    return (
        <div className="w-full h-full flex flex-col items-center p-4 gap-4 bg-white">

            {/* 🧠 TÍTULO */}
            <h2 className="text-xl font-black text-primary text-center">
                {contenido.titulo}
            </h2>

            {/* 📘 DEFINICIÓN */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                <p className="text-sm font-semibold text-blue-800">
                    {contenido.definicion}
                </p>
            </div>

            {/* 🌞 DIAGRAMA CENTRAL (SIMULADO) */}
            <div className="relative w-full flex flex-wrap justify-center gap-2 py-4">

                {/* Centro */}
                <div className="px-4 py-2 bg-yellow-200 text-yellow-900 font-black rounded-full shadow">
                    ☀️ Sol
                </div>

                {/* Conceptos */}
                {contenido.conceptos?.map((c: string, i: number) => (
                    <div
                        key={i}
                        className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full"
                    >
                        {c}
                    </div>
                ))}

            </div>

            {/* 🖼 IMAGEN (AHORA ES SECUNDARIA) */}
            <img
                src={imagenUrl}
                alt="Ilustración educativa"
                className="w-full max-h-[160px] object-contain opacity-80"
            />

            {/* 💡 EJEMPLO */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-xs font-bold text-green-700 mb-1">Ejemplo</p>
                <p className="text-sm text-green-900">{contenido.ejemplo}</p>
            </div>

            {/* ⭐ RESUMEN */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <p className="text-xs font-bold text-yellow-700 mb-1">Recuerda</p>
                <p className="text-sm text-yellow-900">{contenido.resumen}</p>
            </div>

        </div>
    );
};

export default InfografiaPedagogica;