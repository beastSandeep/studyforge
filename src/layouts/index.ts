import { StudyForgeConfig } from '../types.js';

/**
 * Transforms standard HTML elements into premium textbook-like components.
 * e.g., converts <h1> to Chapter Banners, <h2> to styled Section Headers.
 */
export function enhanceHtmlComponents(html: string, config: StudyForgeConfig): string {
  let enhanced = html;

  // 1. Convert H1 to a gorgeous Chapter Banner
  // Matches: <h1>Title</h1> or <h1 id="id">Title</h1>
  enhanced = enhanced.replace(/<h1(?:\s+id="[^"]*")?\s*>(.*?)<\/h1>/gi, (match, title) => {
    const subtitle = config.subtitle || 'StudyForge Premium Series';
    const author = config.author ? `<div class="text-xs text-indigo-100 mt-2 font-medium">By ${config.author}</div>` : '';
    
    return `
      <div class="chapter-banner my-6 rounded-3xl p-8 flex flex-col justify-center min-h-[180px] shadow-lg break-inside-avoid relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-750 to-purple-800 text-white">
        <!-- Decorative subtle background shapes -->
        <div class="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10"></div>
        <div class="absolute right-10 bottom-0 w-24 h-24 bg-white/5 rounded-full -mr-5 -mb-5"></div>
        
        <span class="text-xs uppercase tracking-widest text-indigo-200 font-extrabold mb-2">${subtitle}</span>
        <h1 class="text-3xl font-extrabold text-white leading-tight drop-shadow-sm">${title}</h1>
        <div class="w-16 h-1 bg-amber-400 rounded-full mt-4"></div>
        ${author}
      </div>
    `;
  });

  // 2. Convert H2 to styled Section Headers
  // Matches: <h2>Title</h2>
  enhanced = enhanced.replace(/<h2(?:\s+id="[^"]*")?\s*>(.*?)<\/h2>/gi, (match, title) => {
    return `
      <h2 class="text-3xl font-extrabold text-brand-primary border-b-2 border-brand-primary/20 pb-2.5 mt-16 mb-6 flex items-center gap-3 break-inside-avoid">
        <span class="w-3 h-9 bg-brand-primary rounded-lg inline-block"></span>
        <span class="text-brand-primary tracking-tight">${title}</span>
      </h2>
    `;
  });

  // 3. Convert H3 to styled Subsection Headers
  // Matches: <h3>Title</h3>
  enhanced = enhanced.replace(/<h3(?:\s+id="[^"]*")?\s*>(.*?)<\/h3>/gi, (match, title) => {
    return `
      <h3 class="text-2xl font-bold text-brand-secondary mt-12 mb-4 flex items-center gap-2.5 break-inside-avoid">
        <span class="text-brand-secondary font-extrabold">✦</span>
        <span class="text-brand-secondary font-bold">${title}</span>
      </h3>
    `;
  });

  // 4. Convert H4 to styled H4 Headers
  enhanced = enhanced.replace(/<h4(?:\s+id="[^"]*")?\s*>(.*?)<\/h4>/gi, (match, title) => {
    return `
      <h4 class="text-lg font-bold text-indigo-900 mt-8 mb-3 flex items-center gap-2 break-inside-avoid">
        <span class="w-2.5 h-2.5 bg-brand-accent rounded-full inline-block"></span>
        <span class="text-indigo-900 font-bold">${title}</span>
      </h4>
    `;
  });

  // 5. Style standard tables automatically
  // (We already styled tables in CSS, but we can add wrapper divs for responsive scroll and break protection)
  enhanced = enhanced.replace(/<table>([\s\S]*?)<\/table>/gi, (match, content) => {
    return `<div class="table-container my-6 overflow-x-auto rounded-xl border border-slate-200 shadow-xs break-inside-avoid"><table>${content}</table></div>`;
  });

  return enhanced;
}

/**
 * Compiles the final HTML document by combining layout, custom fonts, math, mermaid and content.
 */
export function generateFullHtml(
  contentHtml: string,
  enhancementsHtml: string,
  compiledCss: string,
  config: StudyForgeConfig
): string {
  const transformedContent = enhanceHtmlComponents(contentHtml, config);
  const mathEnabled = config.features?.math !== false;
  const mermaidEnabled = config.features?.mermaid !== false;

  return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title || 'StudyForge Notes'}</title>
  
  <!-- Premium Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+Devanagari:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  ${mathEnabled ? `
  <!-- KaTeX CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  ` : ''}
  
  <!-- Compiled Tailwind and Book Styles -->
  <style>
    ${compiledCss}
  </style>
  
  ${config.customCss ? `<style>${config.customCss}</style>` : ''}
</head>
<body class="bg-white text-slate-800 antialiased p-6 sm:p-12 max-w-4xl mx-auto">

  <!-- Document Main Wrapper -->
  <div class="studyforge-document">
    
    <!-- Main Content -->
    <main class="studyforge-content prose prose-slate max-w-none">
      ${transformedContent}
    </main>
    
    <!-- Automatic Enhancements (Summary, Glossary, Revision Sheet) -->
    <section class="studyforge-enhancements mt-12">
      ${enhancementsHtml}
    </section>
    
  </div>

  ${mermaidEnabled ? `
  <!-- Mermaid.js rendering engine -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.2.4/dist/mermaid.min.js"></script>
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
        flowchart: { useMaxWidth: false, htmlLabels: true }
      });
    });
  </script>
  ` : ''}
</body>
</html>`;
}
