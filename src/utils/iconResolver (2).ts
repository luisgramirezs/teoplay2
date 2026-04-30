import {
    Divide,
    Droplets,
    Cloud,
    CloudRain,
    CloudSun,
    Sun,
    Leaf,
    Calculator,
    BookOpen,
    Languages,
    FlaskConical,
    Orbit,
    Heart,
    Brain,
    ArrowRight,
    Info,
    Triangle,
    Shapes,
    
    type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
    divide: Divide,
    Divide,
    droplets: Droplets,
    Droplets,
    cloud: Cloud,
    Cloud,
    cloudrain: CloudRain,
    cloudRain: CloudRain,
    CloudRain,
    cloudsun: CloudSun,
    cloudSun: CloudSun,
    CloudSun,
    sun: Sun,
    Sun,
    leaf: Leaf,
    Leaf,
    calculator: Calculator,
    Calculator,
    bookopen: BookOpen,
    bookOpen: BookOpen,
    BookOpen,
    languages: Languages,
    Languages,
    flaskconical: FlaskConical,
    flaskConical: FlaskConical,
    FlaskConical,
    orbit: Orbit,
    Orbit,
    heart: Heart,
    Heart,
    brain: Brain,
    Brain,
    arrowright: ArrowRight,
    arrowRight: ArrowRight,
    ArrowRight,
    info: Info,
    Info,
    Triangle,
    Shapes,
    
};

export function resolveLucideIcon(name?: string): LucideIcon {
    if (!name) return Info;

    const clean = name.trim();
    return iconMap[clean] || iconMap[clean.replace(/[\s_-]/g, "")] || Info;
}