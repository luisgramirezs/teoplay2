import { LessonModule } from "../types/lesson";

export const mockLesson: LessonModule[] = [
    {
        id: "intro",

        title: "Introducción",

        subtitle: "¿Qué aprenderemos?",

        type: "intro",

        slides: [
            {
                id: "intro-1",

                title: "Bienvenido",

                description:
                    "Hoy aprenderemos sobre el sistema solar de forma divertida.",
            },
        ],
    },

    {
        id: "concepts",

        title: "Conceptos clave",

        subtitle: "Aprendamos paso a paso",

        type: "concept",

        slides: [
            {
                id: "concept-1",

                title: "El Sol",

                description:
                    "El Sol es la estrella principal del sistema solar.",
            },

            {
                id: "concept-2",

                title: "Mercurio",

                description:
                    "Mercurio es el planeta más cercano al Sol.",
            },

            {
                id: "concept-3",

                title: "Venus",

                description:
                    "Venus es un planeta muy caliente.",
            },
        ],
    },

    {
        id: "visuals",

        title: "Ejemplos visuales",

        subtitle: "Observemos imágenes",

        type: "visual",

        slides: [
            {
                id: "visual-1",

                title: "Los planetas",

                description:
                    "Cada planeta tiene características diferentes.",
            },
        ],
    },

    {
        id: "video",

        title: "Video",

        subtitle: "Miremos juntos",

        type: "video",

        slides: [
            {
                id: "video-1",

                title: "Video educativo",

                description:
                    "Aquí aparecerá el video del tema.",
            },
        ],
    },

    {
        id: "activity",

        title: "Juego",

        subtitle: "Practiquemos juntos",

        type: "activity",

        slides: [
            {
                id: "activity-1",

                title: "Mini desafío",

                description:
                    "Selecciona el planeta más cercano al Sol.",
            },

            {
                id: "activity-2",

                title: "Muy bien",

                description:
                    "Ahora identifica cuál planeta es conocido por sus anillos.",
            },
        ],
    },

    {
        id: "summary",

        title: "Resumen",

        subtitle: "Recordemos lo aprendido",

        type: "summary",

        slides: [
            {
                id: "summary-1",

                title: "¡Excelente trabajo!",

                description:
                    "Hoy aprendiste sobre el sistema solar y sus planetas.",
            },

            {
                id: "summary-2",

                title: "Lo más importante",

                description:
                    "El Sol es el centro del sistema solar y los planetas giran alrededor de él.",
            },
        ],
    },
];