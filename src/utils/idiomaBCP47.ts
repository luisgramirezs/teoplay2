// src/utils/idiomaBCP47.ts
import { normalizarTexto } from '@/utils/wikimediaQueryDictionary';

// ─── Idioma del apoyoGramatical → tag BCP-47 (síntesis de voz) ──────────────
// apoyoGramatical.idioma es texto libre en español (ej. "inglés") — nunca se
// usa perfil.idioma (idioma de interfaz del niño) para narrar contenido en el
// idioma que se está enseñando, o se pronunciaría con acento/fonética errónea.
const IDIOMA_A_BCP47: Record<string, string> = {
  ingles: 'en-US',
  frances: 'fr-FR',
  espanol: 'es-ES',
  portugues: 'pt-PT',
};

export function mapIdiomaABCP47(idioma: string): string {
  return IDIOMA_A_BCP47[normalizarTexto(idioma)] ?? 'en-US';
}
