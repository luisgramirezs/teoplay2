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

  // 1. Limpiamos los delimitadores \ ( y \ ) o \[ y \] que envía la IA
  let cleanText = text
    .replace(/\\\(|\\\)/g, '$')
    .replace(/\\\[|\\\]/g, '$');

  // 2. Si hay \frac pero no tiene delimitadores $, se los ponemos automáticamente
  cleanText = cleanText.replace(/(\\frac\{[^}]+\}\{[^}]+\})/g, '$$$1$$');

  // 3. Partimos por el delimitador $
  const parts = cleanText.split('$');

  return (
    <span className={className} style={{ fontSize }}>
      {parts.map((part, index) => {
        if (!part) return null;

        // Las posiciones impares son las expresiones matemáticas dentro de $
        if (index % 2 === 1 || part.startsWith('\\frac')) {
          return <InlineMath key={index} math={part.trim()} />;
        }

        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};