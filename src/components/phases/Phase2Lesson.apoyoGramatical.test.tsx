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
  it("renderiza las piezas gramaticales reales, no un placeholder vacío", () => {
    const bloque = normalizar(rawSesionGramatical);
    expect(bloque.apoyoGramatical).not.toBeNull();

    render(<GramaticalBlock apoyoGramatical={bloque.apoyoGramatical!} />);

    expect(screen.getByText("Sujeto")).toBeInTheDocument();
    expect(screen.getAllByText("She").length).toBeGreaterThan(0);
    expect(screen.getByText("Verbo principal + s")).toBeInTheDocument();
    // Valores condicionados (correspondeA compartido) se agrupan en una sola tarjetita.
    expect(screen.getByText("walks / eats / runs")).toBeInTheDocument();
    expect(screen.getAllByText("he / she / it").length).toBeGreaterThan(0);
    expect(screen.getByText("Usa cada opción según corresponda")).toBeInTheDocument();
    expect(screen.getByText(/Con he\/she\/it el verbo termina en -s\./)).toBeInTheDocument();
  });

  it("no renderiza nada si apoyoGramatical no tiene piezas (evita placeholder vacío)", () => {
    const { container } = render(
      <GramaticalBlock apoyoGramatical={{ titulo: "", idioma: "", piezas: [], reglas: [], ejemplos: [] }} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
