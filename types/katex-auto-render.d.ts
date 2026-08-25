declare module 'katex/contrib/auto-render' {
  export interface RenderMathOptions {
    delimiters?: { left: string; right: string; display: boolean }[];
    throwOnError?: boolean;
    ignoredTags?: string[];
    errorColor?: string;
  }
  export default function renderMathInElement(
    element: HTMLElement,
    options?: RenderMathOptions
  ): void;
}

declare module '@/seo/cities.js' {
  const cities: {
    slug: string;
    name: string;
    locative: string;
    mieszkancy: string;
    uczelnie?: string[];
    dzielnice?: string[];
    akcent: string;
  }[];
  export default cities;
}
