import { useState } from "react";

import {
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";

type Props = {
    module: any;

    onClose: () => void;

    onComplete: (moduleId: string) => void;
};

export default function LessonModal({
    module,
    onClose,
    onComplete,
}: Props) {
    const [currentSlide, setCurrentSlide] =
        useState(0);

    const slide = module.slides[currentSlide];

    const hasNext =
        currentSlide < module.slides.length - 1;

    const hasPrev = currentSlide > 0;

    return (
        <div
            className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/20
        p-6
        backdrop-blur-sm
      "
        >
            <div
                className="
          relative
          w-full
          max-w-4xl
          rounded-[40px]
          bg-white
          p-10
          shadow-2xl
        "
            >
                {/* cerrar */}
                <button
                    onClick={() => {
                        onComplete(module.id);
                        onClose();
                    }}
                    className="
            absolute
            right-6
            top-6
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-slate-100
          "
                >
                    <X />
                </button>

                {/* progreso */}
                <div className="mb-8">
                    <p className="text-lg text-slate-500">
                        {currentSlide + 1} de{" "}
                        {module.slides.length}
                    </p>
                </div>

                {/* contenido */}
                <div className="space-y-8">
                    <div>
                        <h2 className="text-4xl font-bold">
                            {slide.title}
                        </h2>

                        <p
                            className="
                mt-6
                text-2xl
                leading-relaxed
                text-slate-700
              "
                        >
                            {slide.description}
                        </p>
                    </div>

                    {/* navegación */}
                    <div
                        className="
              flex
              items-center
              justify-between
              pt-8
            "
                    >
                        <button
                            disabled={!hasPrev}
                            onClick={() =>
                                setCurrentSlide((prev) => prev - 1)
                            }
                            className="
                flex
                min-h-[64px]
                items-center
                gap-3
                rounded-2xl
                bg-slate-100
                px-6
                text-xl
                font-semibold
                disabled:opacity-30
              "
                        >
                            <ChevronLeft />
                            Anterior
                        </button>

                        {hasNext ? (
                            <button
                                onClick={() =>
                                    setCurrentSlide((prev) => prev + 1)
                                }
                                className="
                  flex
                  min-h-[64px]
                  items-center
                  gap-3
                  rounded-2xl
                  bg-emerald-500
                  px-6
                  text-xl
                  font-bold
                  text-white
                "
                            >
                                Siguiente
                                <ChevronRight />
                            </button>
                        ) : (
                            <button
                                onClick={onClose}
                                className="
                  min-h-[64px]
                  rounded-2xl
                  bg-blue-500
                  px-8
                  text-xl
                  font-bold
                  text-white
                "
                            >
                                Entendido
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}