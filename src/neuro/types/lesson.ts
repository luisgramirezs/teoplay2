export type ModuleType =
    | "intro"
    | "concept"
    | "visual"
    | "video"
    | "activity"
    | "summary";

export type LessonSlide = {
    id: string;
    title: string;
    description?: string;
    image?: string;
};

export type LessonModule = {
    id: string;

    title: string;

    subtitle: string;

    type: ModuleType;

    completed?: boolean;

    slides: LessonSlide[];
};