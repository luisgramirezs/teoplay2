import { describe, it, expect, vi, beforeEach } from "vitest";
import { normalizarTexto } from "@/utils/wikimediaQueryDictionary";

type DocCall = { collection: string; id: string };
const docCalls: DocCall[] = [];

vi.mock("firebase/firestore", () => ({
  doc: vi.fn((_db: unknown, collection: string, id: string) => {
    docCalls.push({ collection, id });
    return { collection, id };
  }),
  getDoc: vi.fn(async () => ({ exists: () => false, data: () => undefined })),
  setDoc: vi.fn(async () => {}),
  runTransaction: vi.fn(
    async (
      _db: unknown,
      updateFn: (tx: {
        get: (ref: unknown) => Promise<{ exists: () => boolean; data: () => Record<string, unknown> }>;
        set: (ref: unknown, data: unknown, opts?: unknown) => void;
      }) => Promise<boolean>
    ) => {
      const tx = {
        get: async () => ({ exists: () => false, data: () => ({}) }),
        set: () => {},
      };
      return updateFn(tx);
    }
  ),
  serverTimestamp: vi.fn(() => "MOCK_TIMESTAMP"),
}));

vi.mock("firebase/storage", () => ({
  ref: vi.fn((_storage: unknown, path: string) => ({ path })),
  uploadString: vi.fn(async () => {}),
  getDownloadURL: vi.fn(async () => "https://example.com/fake.png"),
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
  storage: {},
}));

global.fetch = vi.fn(async () => ({
  ok: true,
  json: async () => ({ data: [{ b64_json: "ZmFrZS1iYXNlNjQ=" }] }),
})) as unknown as typeof fetch;

// Fórmula de clave de caché tal como existía ANTES del refactor del Bloque 5
// (construirClaveCache(asignatura, tema, concepto) original, sin prefijo de
// contexto). No se importa del servicio: se reimplementa aquí de forma
// independiente para que la prueba detecte una regresión aunque alguien
// vuelva a tocar construirClaveCache() más adelante.
function claveEsperadaPreRefactor(asignatura: string, tema: string, concepto: string): string {
  return [asignatura, tema, concepto]
    .map(normalizarTexto)
    .join("__")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

describe("obtenerOGenerarApoyoVisualCiencias — regresión de clave de caché (Bloque 5)", () => {
  beforeEach(() => {
    docCalls.length = 0;
    vi.clearAllMocks();
  });

  it("usa exactamente la misma clave (doc id en apoyoVisualIA) que producía el piloto antes de generalizar el servicio", async () => {
    const { obtenerOGenerarApoyoVisualCiencias } = await import("./apoyoVisualIAService");

    const asignatura = "ciencias";
    const tema = "El ciclo del agua";
    const concepto = { nombre: "Evaporación", explicacionSimple: "x" };
    const objetivo = "Entender el ciclo del agua";

    await obtenerOGenerarApoyoVisualCiencias(asignatura, tema, concepto, objetivo);

    const claveEsperada = claveEsperadaPreRefactor(asignatura, tema, concepto.nombre);
    const llamadasApoyoVisualIA = docCalls.filter((c) => c.collection === "apoyoVisualIA");

    expect(llamadasApoyoVisualIA.length).toBeGreaterThan(0);
    for (const llamada of llamadasApoyoVisualIA) {
      expect(llamada.id).toBe(claveEsperada);
    }
  });

  it("la ruta de Storage sigue siendo apoyoVisualIA/{clave}.png, sin subcarpeta de contexto", async () => {
    const { ref } = await import("firebase/storage");
    const { obtenerOGenerarApoyoVisualCiencias } = await import("./apoyoVisualIAService");

    const asignatura = "ciencias";
    const tema = "El ciclo del agua";
    const concepto = { nombre: "Condensación", explicacionSimple: "x" };
    const objetivo = "Entender el ciclo del agua";

    await obtenerOGenerarApoyoVisualCiencias(asignatura, tema, concepto, objetivo);

    const claveEsperada = claveEsperadaPreRefactor(asignatura, tema, concepto.nombre);
    expect(ref).toHaveBeenCalledWith(expect.anything(), `apoyoVisualIA/${claveEsperada}.png`);
  });

  it("reservarCupoGeneracion sigue usando el doc id limitesGeneracion/ciencias-{fecha}", async () => {
    const { obtenerOGenerarApoyoVisualCiencias } = await import("./apoyoVisualIAService");

    const asignatura = "ciencias";
    const tema = "El ciclo del agua";
    const concepto = { nombre: "Precipitación", explicacionSimple: "x" };
    const objetivo = "Entender el ciclo del agua";

    await obtenerOGenerarApoyoVisualCiencias(asignatura, tema, concepto, objetivo);

    const fecha = new Date().toISOString().slice(0, 10);
    const llamadaLimite = docCalls.find((c) => c.collection === "limitesGeneracion");

    expect(llamadaLimite).toBeDefined();
    expect(llamadaLimite?.id).toBe(`ciencias-${fecha}`);
  });
});
