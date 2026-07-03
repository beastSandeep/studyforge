import MarkdownIt from 'markdown-it';
// @ts-ignore
import markdownItAnchor from 'markdown-it-anchor';
// @ts-ignore
import markdownItContainer from 'markdown-it-container';
// @ts-ignore
import markdownItTableOfContents from 'markdown-it-table-of-contents';
// @ts-ignore
import markdownItTaskLists from 'markdown-it-task-lists';
// @ts-ignore
import markdownItAttrs from 'markdown-it-attrs';
// @ts-ignore
import markdownItFootnote from 'markdown-it-footnote';
// @ts-ignore
import markdownItDeflist from 'markdown-it-deflist';
// @ts-ignore
import { full as markdownItEmoji } from 'markdown-it-emoji';
import { preprocessCallouts } from './preprocessor.js';
import { renderCalloutCard, cardStyles } from '../components/cards.js';
import { DocumentEnhancer } from './enhancements.js';
import { StudyForgeConfig } from '../types.js';
import { createHighlighter } from 'shiki';

export interface ParseResult {
  html: string;
  headings: { text: string; level: number }[];
  enhancementsHtml: string;
}

/**
 * Parses markdown to HTML and extracts metadata for StudyForge study materials.
 */
export async function parseMarkdown(markdown: string, config: StudyForgeConfig): Promise<ParseResult> {
  // 1. Preprocess callouts (Obisidan callout notation > [!NOTE] -> ::: callout-note)
  const preprocessed = preprocessCallouts(markdown);

  // 2. Setup Shiki Syntax Highlighting
  let highlighter: any = null;
  if (config.features?.syntaxHighlighting !== 'none') {
    try {
      highlighter = await createHighlighter({
        themes: ['github-light', 'github-dark'],
        langs: ['javascript', 'typescript', 'python', 'html', 'css', 'json', 'bash', 'yaml', 'markdown', 'sql', 'cpp', 'c']
      });
    } catch (e) {
      console.warn('Failed to load Shiki syntax highlighter, falling back to plain code blocks:', e);
    }
  }

  // 3. Initialize Markdown-It
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: (code, lang) => {
      if (highlighter) {
        try {
          const theme = config.theme === 'dark' ? 'github-dark' : 'github-light';
          return highlighter.codeToHtml(code, { lang, theme });
        } catch (e) {
          // Fallback if language not loaded
          return '';
        }
      }
      return ''; // fallback to default markdown-it escaping
    }
  });

  // Custom fence rule for Mermaid
  const defaultFence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens: any[], idx: number, options: any, env: any, self: any) => {
    const token = tokens[idx];
    const info = token.info ? token.info.trim() : '';
    const lang = info.split(' ')[0];
    
    if (lang === 'mermaid') {
      return `<div class="mermaid break-inside-avoid my-6 flex justify-center bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">${token.content}</div>\n`;
    }
    
    return defaultFence ? defaultFence(tokens, idx, options, env, self) : '';
  };

  // 4. Register Markdown-It Plugins
  md.use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: 'before',
      class: 'anchor-link text-indigo-400/40 hover:text-indigo-500 mr-2 transition-colors',
      symbol: '#'
    })
  });
  
  md.use(markdownItTableOfContents, {
    includeLevel: [1, 2, 3],
    containerClass: 'table-of-contents my-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-xs break-inside-avoid',
    containerHeaderHtml: '<div class="toc-header text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">विषय सूची (Table of Contents)</div>'
  });

  md.use(markdownItTaskLists, { label: true, labelAfter: true });
  md.use(markdownItAttrs);
  md.use(markdownItFootnote);
  md.use(markdownItDeflist);
  md.use(markdownItEmoji);

  // Register Callout Containers
  md.use(markdownItContainer, 'callout', {
    validate: (params: string) => {
      const type = params.trim().split(' ')[0];
      return type.startsWith('callout-');
    },
    render: (tokens: any[], idx: number) => {
      const info = tokens[idx].info.trim();
      const m = info.match(/^callout-(\w+)(.*)$/);
      if (tokens[idx].nesting === 1 && m) {
        const type = m[1].toLowerCase();
        const title = m[2] ? m[2].trim() : '';
        return renderCalloutCard(type, title);
      } else {
        return '</div></div>\n';
      }
    }
  });

  // 5. Parse Tokens to extract structure for Document Enhancer
  const tokens = md.parse(preprocessed, {});
  const enhancer = new DocumentEnhancer();
  enhancer.processTokens(tokens);

  // 6. Render to HTML
  const rawHtml = md.renderer.render(tokens, md.options, {});

  // 7. Generate automatic enhanced sections (Summary, Glossary, Revision sheet, Chemistry reactions)
  const enhancementsHtml = config.features?.autoEnhance !== false 
    ? enhancer.generateEnhancedSectionsHtml() 
    : '';

  return {
    html: rawHtml,
    headings: (enhancer as any).data.headings,
    enhancementsHtml
  };
}
