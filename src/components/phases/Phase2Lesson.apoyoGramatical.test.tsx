import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { normalizar } from "./Phase2Lesson";
import GramaticalBlock from "../lesson/GramaticalBlock";

const rawSesionGramatical = {
  objetivo: "Presente simple, tercera persona",
  intro: "Hoy vemos cómo cambia el verbo con he/she/it.",
  pasos: ["Identifica el sujeto", "Agrega -s al verbo"],
  conceptosClave: [],
  analogia: "",
  ejemplos: [],
  resumen: "",
  apoyoGramatical: {
    titulo: "Presente simple — 3ra persona",
    idioma: "inglés",
    piezas: [
      {
        rol: "Sujeto",
        valores: [{ texto: "She" }, { texto: "He" }, { texto: "It" }],
        etiqueta: "3ra persona singular",
        color: "blue",
      },
      {
        rol: "Verbo principal + s",
        valores: [
          { texto: "walks", correspondeA: "he / she / it" },
          { texto: "eats", correspondeA: "he / she / it" },
          { texto: "runs", correspondeA: "he / she / it" },
        ],
        etiqueta: "Se agrega -s al verbo",
        color: "orange",
      },
      {
        rol: "Complemento",
        valores: [{ texto: "to school" }, { texto: "an apple" }, { texto: "fast" }],
        etiqueta: "Completa la acción",
        color: "green",
      },
    ],
    reglas: ["Con he/she/it el verbo termina en -s."],
    ejemplos: [{ oracion: "She walks to school.", traduccion: "Ella camina a la escuela." }],
    nota: "",
  },
};

const conceptosClaveFixture = [
  {
    nombre: "Sujeto",
    formula: "",
    elementos: "",
    componentes: "",
    miembros: "",
    uso: "",
    necesidad: "",
    ejemploPedagogico: "",
    explicacionSimple: "Quien realiza la acción.",
    fragmentoEnOracion: "She",
  },
  {
    nombre: "Verbo principal + s",
    formula: "",
    elementos: "",
    componentes: "",
    miembros: "",
    uso: "",
    necesidad: "",
    ejemploPedagogico: "",
    explicacionSimple: "La acción que se realiza.",
    fragmentoEnOracion: "walks",
  },
];

describe("normalizar() — apoyoGramatical", () => {
  it("propaga apoyoGramatical al bloque normalizado (regresión del bug donde llegaba undefined)", () => {
    const bloque = normalizar(rawSesionGramatical);

    expect(bloque.apoyoGramatical).not.toBeNull();
    expect(bloque.apoyoGramatical?.piezas).toHaveLength(3);
    expect(bloque.apoyoGramatical?.piezas[0]).toEqual({
      rol: "Sujeto",
      valores: [{ texto: "She" }, { texto: "He" }, { texto: "It" }],
      etiqueta: "3ra persona singular",
      color: "blue",
    });
  });

  it("devuelve apoyoGramatical: null si la sesión no trae la clave", () => {
    const bloque = normalizar({ objetivo: "", intro: "", pasos: [] });
    expect(bloque.apoyoGramatical).toBeNull();
  });
});

describe("GramaticalBlock — montaje con datos reales de normalizar()", () => {
  it("renderiza la Segunda Sección (Fórmula, Veamos un ejemplo, Recuerda, Ejemplo completo + cierre)", () => {
    const bloque = normalizar(rawSesionGramatical);
    expect(bloque.apoyoGramatical).not.toBeNull();

    render(<GramaticalBlock apoyoGramatical={bloque.apoyoGramatical!} conceptos={conceptosClaveFixture} />);

    // Pieza 1 — Fórmula con íconos y pregunta guía
    expect(screen.getAllByText("Sujeto").length).toBeGreaterThan(0);
    expect(screen.getAllByText("¿Quién?").length).toBeGreaterThan(0);

    // Pieza 2 — Veamos un ejemplo (fragmento real vía fragmentoEnOracion)
    expect(screen.getByText("Veamos un ejemplo")).toBeInTheDocument();
    expect(screen.getAllByText("She").length).toBeGreaterThan(0);
    expect(screen.getAllByText("walks").length).toBeGreaterThan(0);

    // Pieza 3 — ¡Recuerda! (grupos de Cambio 1)
    expect(screen.getByText("¡Recuerda!")).toBeInTheDocument();
    expect(screen.getByText(/walks \/ eats \/ runs → he \/ she \/ it/)).toBeInTheDocument();

    // Pieza 4 — Ejemplo completo interlineado + cierre con roles reales
    expect(screen.getByText("Ejemplo completo")).toBeInTheDocument();
    expect(screen.getByText(/Unimos Sujeto \+ Verbo principal \+ s \+ Complemento en el orden correcto/)).toBeInTheDocument();

    // Reglas importantes ya no se renderiza (reemplazada por las piezas nuevas)
    expect(screen.queryByText(/Con he\/she\/it el verbo termina en -s\./)).not.toBeInTheDocument();
  });

  it("no renderiza nada si apoyoGramatical no tiene piezas (evita placeholder vacío)", () => {
    const { container } = render(
      <GramaticalBlock apoyoGramatical={{ titulo: "", idioma: "", piezas: [], reglas: [], ejemplos: [] }} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
