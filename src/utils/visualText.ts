export const normalizeVisualText = (value?: string): string => {
    if (!value) return '';

    return value
        .replace(/�/g, 'ó')
        .replace(/\s+/g, ' ')
        .trim();
};

export const splitVisualParts = (value?: string): string[] => {
    return normalizeVisualText(value)
        .split(':')
        .map((part) => part.trim())
        .filter(Boolean);
};

const normalizeForComparison = (value?: string): string => {
    return normalizeVisualText(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

export const isWeakVisualDetail = (title?: string, detail?: string): boolean => {
    const safeTitle = normalizeForComparison(title);
    const safeDetail = normalizeForComparison(detail);

    if (!safeDetail) return true;
    if (!safeTitle) return false;

    return safeTitle === safeDetail;
};

export const getVisualDetailOrNull = (title?: string, detail?: string): string | null => {
    const safeDetail = normalizeVisualText(detail);

    if (isWeakVisualDetail(title, safeDetail)) {
        return null;
    }

    return safeDetail;
};

export const getSafeVisualFallback = (type: 'timeline' | 'cycle' | 'formula' | 'nodes' | 'flow' | 'reparto' | 'generic'): string => {
    switch (type) {
        case 'timeline':
            return 'Este evento necesita una explicación más específica para entenderse mejor.';

        case 'cycle':
            return 'Este paso del ciclo necesita una explicación más específica para entender qué ocurre aquí.';

        case 'formula':
            return 'Esta parte de la fórmula necesita una explicación más específica para entender qué representa.';

        case 'reparto':
            return 'Este elemento necesita una explicación más específica para comprender cómo funciona el reparto.';

        case 'flow':
            return 'Este paso necesita una explicación más específica para entender qué sucede en esta parte del proceso.';

        case 'nodes':
            return 'Este elemento necesita una explicación más específica para comprender mejor su función en el mapa visual.';

        default:
            return 'Este elemento necesita una explicación más específica para entenderse mejor.';
    }
};