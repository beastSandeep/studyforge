import { StudyForgeConfig } from '../types.js';

export const defaultConfig: Required<StudyForgeConfig> = {
  theme: 'light',
  title: 'StudyForge Notes',
  subtitle: 'Premium educational material',
  author: 'StudyForge Generator',
  headerText: 'StudyForge premium study notes',
  colors: {
    primary: '#1e3a8a',    // Deep Royal Blue
    secondary: '#4f46e5',  // Vibrant Indigo
    accent: '#f59e0b',     // Amber
    danger: '#ef4444',     // Red
    warning: '#f97316',    // Orange
    success: '#10b981',    // Emerald Green
    info: '#06b6d4',       // Cyan
    background: '#ffffff', // White
    text: '#1e293b',       // Slate-800
    border: '#e2e8f0'      // Slate-200
  },
  fonts: {
    hindi: "'Noto Sans Devanagari', sans-serif",
    english: "'Inter', sans-serif",
    code: "'JetBrains Mono', monospace",
    math: "'KaTeX_Main', 'Noto Sans Devanagari', sans-serif"
  },
  pdf: {
    format: 'A4',
    landscape: false,
    margin: {
      top: '24mm',
      bottom: '24mm',
      left: '20mm',
      right: '20mm'
    },
    displayHeaderFooter: true,
    printBackground: true,
    quality: 300,
    headerTemplate: `
      <div style="font-size: 8px; color: #94a3b8; width: 100%; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; display: flex; justify-content: space-between; font-family: 'Inter', sans-serif; padding-left: 20mm; padding-right: 20mm;">
        <span><span class="title"></span> | <span class="subtitle"></span></span>
        <span>StudyForge premium study notes</span>
      </div>
    `,
    footerTemplate: `
      <div style="font-size: 8px; color: #94a3b8; width: 100%; border-top: 1px solid #e2e8f0; padding-top: 5px; display: flex; justify-content: space-between; font-family: 'Inter', sans-serif; padding-left: 20mm; padding-right: 20mm;">
        <span>© <span class="author"></span></span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `
  },
  features: {
    autoEnhance: true,
    mermaid: true,
    math: true,
    syntaxHighlighting: 'shiki',
    toc: true,
    glossary: true,
    revisionPage: true,
    chemistry: true
  },
  customCss: ''
};
