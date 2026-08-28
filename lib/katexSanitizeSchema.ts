import { defaultSchema } from 'rehype-sanitize';

/**
 * Schemat sanityzacji dla treści lekcji/zadań (rehype-sanitize) uruchamiany PO
 * rehype-katex. Blokuje realne wektory XSS (script, event-handlery, złe protokoły
 * w href/src — to zostaje z defaultSchema), ale przepuszcza wyjście KaTeX
 * (klasy + inline style na span/div) oraz podstawowe formatowanie treści.
 * Uwaga: nawet jeśli jakiś tag MathML wypadnie, widoczna część wzoru (spany HTML
 * KaTeX) i tak zostaje wyrenderowana — MathML to tylko warstwa dla czytników.
 */
const base = defaultSchema;

export const katexSanitizeSchema = {
  ...base,
  attributes: {
    ...base.attributes,
    // pozwól na klasy, inline-style i aria-hidden na dowolnym elemencie
    '*': [
      ...(base.attributes?.['*'] ?? []),
      'className',
      'class',
      'style',
      'ariaHidden',
      'aria-hidden',
    ],
    math: ['xmlns'],
    annotation: ['encoding'],
    svg: ['xmlns', 'width', 'height', 'viewBox', 'preserveAspectRatio', 'style'],
    path: ['d', 'style'],
    line: ['x1', 'x2', 'y1', 'y2', 'style'],
  },
  tagNames: [
    ...(base.tagNames ?? []),
    // MathML generowany przez KaTeX
    'math',
    'semantics',
    'annotation',
    'mrow',
    'mi',
    'mo',
    'mn',
    'ms',
    'mtext',
    'mspace',
    'msup',
    'msub',
    'msubsup',
    'mfrac',
    'msqrt',
    'mroot',
    'mover',
    'munder',
    'munderover',
    'mtable',
    'mtr',
    'mtd',
    'mpadded',
    'mphantom',
    'menclose',
    'mstyle',
    // SVG dla rozciąganych symboli KaTeX
    'svg',
    'path',
    'line',
    'g',
  ],
};
