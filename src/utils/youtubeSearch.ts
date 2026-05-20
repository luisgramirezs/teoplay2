export async function buscarVideoYoutube(tema: string, idioma: string): Promise<{
    videoId: string;
    titulo: string;
    canal: string;
} | null> {
    const key = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (!key) return null;

    const q = encodeURIComponent(`${tema} para niños explicación`);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&videoEmbeddable=true&safeSearch=strict&relevanceLanguage=${idioma === 'es' ? 'es' : 'en'}&maxResults=1&key=${key}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const item = data?.items?.[0];
        if (!item) return null;
        return {
            videoId: item.id.videoId,
            titulo: item.snippet.title,
            canal: item.snippet.channelTitle,
        };
    } catch {
        return null;
    }
}