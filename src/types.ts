export interface StudyForgeColors {
  primary: string;
  secondary: string;
  accent: string;
  danger: string;
  warning: string;
  success: string;
  info: string;
  background: string;
  text: string;
  border: string;
}

export interface StudyForgeFonts {
  hindi: string;
  english: string;
  code: string;
  math: string;
}

export interface StudyForgePdfConfig {
  format: 'A4' | 'Letter' | 'A3' | 'A5';
  landscape: boolean;
  margin: {
    top: string;
    bottom: string;
    left: string;
    right: string;
  };
  displayHeaderFooter: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  printBackground: boolean;
  quality: number; // DPI, default 300
}

export interface StudyForgeFeatures {
  autoEnhance: boolean;
  mermaid: boolean;
  math: boolean;
  syntaxHighlighting: 'shiki' | 'prism' | 'none';
  toc: boolean;
  glossary: boolean;
  revisionPage: boolean;
  chemistry: boolean;
}

export interface StudyForgeConfig {
  theme: 'light' | 'dark' | 'book';
  colors: Partial<StudyForgeColors>;
  fonts: Partial<StudyForgeFonts>;
  pdf: Partial<StudyForgePdfConfig>;
  features: Partial<StudyForgeFeatures>;
  title?: string;
  subtitle?: string;
  author?: string;
  headerText?: string;
  customCss?: string;
}
