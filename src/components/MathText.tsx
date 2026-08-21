// src/components/MathText.tsx
import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

interface MathTextProps {
  text: string;
  fontSize?: string;
  className?: string;
}

export const MathText: React.FC<MathTextProps> = ({ text, fontSize, className = '' }) => {
  if (!text) return null;

  // Detecta fragmentos entre $ ... $ o busca patrones \frac{a}{b} y potencias
  const parts = text.split(/(\$[^\$]+\$|\\frac\{[^}]+\}\{[^}]+\}|\d+\^\d+)/g);

  return (
    <span className={className} style={{ fontSize }}>
      {parts.map((part, index) => {
        if (!part) return null;

        if (part.startsWith('$') && part.endsWith('$')) {
          return <InlineMath key={index} math={part.slice(1, -1)} />;
        }

        if (part.startsWith('\\frac') || part.includes('^')) {
          return <InlineMath key={index} math={part} />;
        }

        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};