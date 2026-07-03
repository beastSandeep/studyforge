import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
// @ts-ignore
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import { StudyForgeConfig } from '../types.js';

const baseCssTemplate = `
@theme {
  --color-brand-primary: var(--sf-primary);
  --color-brand-secondary: var(--sf-secondary);
  --color-brand-accent: var(--sf-accent);
  --color-brand-danger: var(--sf-danger);
  --color-brand-warning: var(--sf-warning);
  --color-brand-success: var(--sf-success);
  --color-brand-info: var(--sf-info);
  --font-sans: 'Inter', 'Noto Sans Devanagari', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

@utility page-break-before {
  page-break-before: always;
  break-before: page;
}

@utility page-break-after {
  page-break-after: always;
  break-after: page;
}

@utility break-inside-avoid {
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}

@layer base {
  body {
    font-family: 'Inter', 'Noto Sans Devanagari', sans-serif;
    color: #1e293b;
    line-height: 1.75;
    background-color: #ffffff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  p {
    margin-top: 0;
    margin-bottom: 1.25rem;
  }
  
  ul, ol {
    margin-bottom: 1.25rem;
    padding-left: 1.5rem;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Inter', 'Noto Sans Devanagari', sans-serif;
    font-weight: 700;
  }
  
  /* Task List Styles */
  ul.contains-task-list {
    list-style-type: none;
    padding-left: 1.25rem;
  }
  
  li.task-list-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }
  
  input[type="checkbox"] {
    width: 1rem;
    height: 1rem;
    accent-color: var(--sf-color-secondary, #4f46e5);
  }
}

@media print {
  body {
    background-color: #ffffff;
    font-size: 11pt;
  }
  
  /* Avoid breaking elements inside PDF pages */
  .break-inside-avoid, 
  .callout-card, 
  .reaction-card,
  .table-of-contents,
  pre, 
  table, 
  tr,
  blockquote {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  
  a {
    text-decoration: none;
    color: inherit;
  }
}

/* Custom premium styling for elements */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-size: 0.9em;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  page-break-inside: avoid;
  break-inside: avoid;
}

th {
  background-color: var(--sf-color-primary, #1e3a8a);
  color: white;
  text-align: left;
  font-weight: 600;
  padding: 10px 14px;
}

td {
  padding: 10px 14px;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
}

tr:nth-child(even) {
  background-color: #f8fafc;
}

tr:last-child td {
  border-bottom: 2px solid var(--sf-color-primary, #1e3a8a);
}

.anchor-link {
  text-decoration: none;
  font-weight: bold;
}

/* Description Lists (Glossary Terms) styling */
dl {
  margin: 1.5rem 0;
  border-radius: 16px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  page-break-inside: avoid;
  break-inside: avoid;
}

dt {
  font-weight: 800;
  color: var(--sf-color-primary, #1e3a8a);
  font-size: 1.05em;
  margin-top: 1.25rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px dashed #cbd5e1;
}

dt:first-of-type {
  margin-top: 0;
}

dd {
  margin-left: 0;
  padding: 0.5rem 0 0.5rem 0.5rem;
  color: #334155;
  font-size: 0.95em;
  line-height: 1.6;
}

/* Math Blocks & Equations Scroll protection */
.math-block {
  display: block !important;
  width: 100% !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  white-space: nowrap !important;
  text-align: center !important;
  padding: 10px 0;
}

.math-block .katex-display {
  display: inline-block !important;
  margin: 0 !important;
  text-align: center !important;
  white-space: nowrap !important;
  min-width: 100% !important;
}

.math-block .katex {
  white-space: nowrap !important;
}

@media print {
  .math-block {
    font-size: 0.76rem !important; /* Scale down so long equations fit on A4 */
    white-space: normal !important;
    overflow-x: visible !important;
  }
  .math-block .katex-display {
    white-space: normal !important;
    overflow-x: visible !important;
    display: block !important;
  }
  .math-block .katex {
    white-space: normal !important;
  }
}

/* Custom styles for Footnotes */
.footnotes {
  margin-top: 3rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  font-size: 0.85em;
  color: #64748b;
  page-break-inside: avoid;
}

.footnotes-list {
  padding-left: 1.5rem;
}

.footnote-item {
  margin-bottom: 0.5rem;
}

.footnote-backref {
  color: var(--sf-color-secondary, #4f46e5);
  text-decoration: none;
  font-weight: bold;
}
`;

/**
 * Compiles Tailwind CSS dynamically for the generated HTML.
 * Customizes Tailwind colors and fonts based on config using Tailwind CSS v4 directives.
 */
export async function compileCss(htmlContent: string, config: StudyForgeConfig): Promise<string> {
  const primaryColor = config.colors?.primary || '#1e3a8a';
  const secondaryColor = config.colors?.secondary || '#4f46e5';
  const accentColor = config.colors?.accent || '#f59e0b';
  const dangerColor = config.colors?.danger || '#ef4444';
  const warningColor = config.colors?.warning || '#f97316';
  const successColor = config.colors?.success || '#10b981';
  const infoColor = config.colors?.info || '#06b6d4';
  
  // Write htmlContent to a temporary file so Tailwind CSS v4 can scan it
  const tmpDir = path.join(process.cwd(), '.studyforge_tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  const tmpHtmlPath = path.join(tmpDir, 'temp_scan.html');
  fs.writeFileSync(tmpHtmlPath, htmlContent, 'utf8');

  // Format path with forward slashes for Tailwind CSS @source directive
  const cleanHtmlPath = tmpHtmlPath.replace(/\\/g, '/');

  // Inject CSS variables for non-Tailwind elements and theme colors
  const cssVariables = `
    :root {
      --sf-color-primary: ${primaryColor};
      --sf-color-secondary: ${secondaryColor};
      --sf-color-accent: ${accentColor};
      
      --sf-primary: ${primaryColor};
      --sf-secondary: ${secondaryColor};
      --sf-accent: ${accentColor};
      --sf-danger: ${dangerColor};
      --sf-warning: ${warningColor};
      --sf-success: ${successColor};
      --sf-info: ${infoColor};
    }
  `;

  // Construct full CSS containing import, source directive, variables, and templates
  const cssSourceInput = `
@import "tailwindcss";
@source "${cleanHtmlPath}";
${cssVariables}
${baseCssTemplate}
`;

  try {
    const result = await postcss([
      tailwindcss(),
      autoprefixer()
    ]).process(cssSourceInput, { from: undefined });
    
    // Clean up temporary file
    try {
      if (fs.existsSync(tmpHtmlPath)) {
        fs.unlinkSync(tmpHtmlPath);
      }
      if (fs.existsSync(tmpDir)) {
        fs.rmdirSync(tmpDir);
      }
    } catch (_) {}
    
    return result.css;
  } catch (error) {
    console.error('Tailwind compilation error, falling back to uncompiled CSS:', error);
    
    // Try cleaning up anyway
    try {
      if (fs.existsSync(tmpHtmlPath)) fs.unlinkSync(tmpHtmlPath);
      if (fs.existsSync(tmpDir)) fs.rmdirSync(tmpDir);
    } catch (_) {}

    return cssVariables + baseCssTemplate;
  }
}
