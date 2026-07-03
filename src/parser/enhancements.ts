import Token from 'markdown-it/lib/token.mjs';
import { parseReaction, renderReactionCard, ChemicalReaction } from './chemistry.js';

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+?)\*\*/g, '$1')
    .replace(/\*([^*]+?)\*/g, '$1')
    .replace(/__([^_]+?)__/g, '$1')
    .replace(/_([^_]+?)_/g, '$1')
    .replace(/`([^`]+?)`/g, '$1')
    .replace(/::/g, '');
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface GlossaryEntry {
  term: string;
  definition: string;
}

export interface SummaryData {
  headings: { text: string; level: number }[];
  reactions: ChemicalReaction[];
  definitions: GlossaryEntry[];
  formulas: string[];
  keyPoints: string[];
}

/**
 * Scans markdown-it tokens to extract key concepts, reactions, definitions,
 * and formulas to automatically generate summary, glossary, and revision sections.
 */
export class DocumentEnhancer {
  private data: SummaryData = {
    headings: [],
    reactions: [],
    definitions: [],
    formulas: [],
    keyPoints: []
  };

  /**
   * Processes tokens to extract metadata.
   */
  public processTokens(tokens: Token[]): void {
    let currentContainerType: string | null = null;
    let isInsideDefinitionList = false;
    let currentTerm = '';
    
    for (let idx = 0; idx < tokens.length; idx++) {
      const token = tokens[idx];
      
      // Track headings
      if (token.type === 'heading_open') {
        const next = tokens[idx + 1];
        if (next && next.type === 'inline') {
          const level = parseInt(token.tag.substring(1), 10);
          this.data.headings.push({ text: next.content, level });
        }
      }
      
      // Track container types
      if (token.type === 'container_callout_open') {
        currentContainerType = token.info.split(' ')[0].replace('callout-', '').toLowerCase();
      } else if (token.type === 'container_callout_close') {
        currentContainerType = null;
      }
      
      // Collect key points from important/remember containers
      if (currentContainerType === 'important' || currentContainerType === 'remember') {
        if (token.type === 'inline' || token.type === 'text') {
          if (token.content && token.content.trim()) {
            this.data.keyPoints.push(stripMarkdown(token.content).trim());
          }
        }
      }

      // Collect formulas
      if (currentContainerType === 'formula') {
        if (token.type === 'inline' || token.type === 'text') {
          if (token.content && token.content.trim()) {
            this.data.formulas.push(token.content.trim());
          }
        }
      }
      if (token.type === 'math_block' || token.type === 'math_inline') {
        this.data.formulas.push(token.content.trim());
      }
      
      // Track description lists (dl, dt, dd)
      if (token.type === 'dl_open') {
        isInsideDefinitionList = true;
      } else if (token.type === 'dl_close') {
        isInsideDefinitionList = false;
      }
      
      if (isInsideDefinitionList) {
        if (token.type === 'dt_open') {
          const next = tokens[idx + 1];
          if (next && next.type === 'inline') {
            currentTerm = next.content;
          }
        } else if (token.type === 'dd_open' && currentTerm) {
          // Scan forward to find the next inline token containing the definition content
          let searchIdx = idx + 1;
          let definitionText = '';
          while (searchIdx < tokens.length && tokens[searchIdx].type !== 'dd_close') {
            if (tokens[searchIdx].type === 'inline') {
              definitionText = tokens[searchIdx].content;
              break;
            }
            searchIdx++;
          }
          
          if (definitionText) {
            const cleanTerm = stripMarkdown(currentTerm).trim();
            let cleanDef = stripMarkdown(definitionText).trim();
            
            // If the definition starts with the term (e.g. "खनिज (Minerals):"), strip it
            const escapedTerm = escapeRegExp(cleanTerm);
            const prefixRegex = new RegExp(`^${escapedTerm}\\s*[:：\\s]\\s*`, 'i');
            cleanDef = cleanDef.replace(prefixRegex, '');
            
            // Only add if not already present
            if (!this.data.definitions.some(d => d.term.toLowerCase() === cleanTerm.toLowerCase())) {
              this.data.definitions.push({
                term: cleanTerm,
                definition: cleanDef
              });
            }
            currentTerm = '';
          }
        }
      }

      // Auto-detect definitions in normal paragraphs:
      // Pattern: "X: Y" or "X refers to Y" or "X कहते हैं" or "X कहलाते हैं"
      if (token.type === 'inline' && !currentContainerType && !isInsideDefinitionList) {
        const text = token.content;
        
        // Check for Hindi definitions (e.g., "कठोर सतह से टकराने पर आवाज़ उत्पन्न करने को ध्वानिक कहते हैं।")
        const hindiDefMatch = text.match(/([^।\.]{2,20})\s+(?:को|को ही)\s+([^।\.]{2,50})\s+(?:कहते हैं|कहलाता है|कहलाते हैं)।/);
        if (hindiDefMatch) {
          const rawTerm = hindiDefMatch[2].replace(/["']/g, '').trim();
          const cleanTerm = stripMarkdown(rawTerm).trim();
          let cleanDef = stripMarkdown(text).trim();
          
          const escapedTerm = escapeRegExp(cleanTerm);
          const prefixRegex = new RegExp(`^${escapedTerm}\\s*[:：\\s]\\s*`, 'i');
          cleanDef = cleanDef.replace(prefixRegex, '');
          
          if (!this.data.definitions.some(d => d.term.toLowerCase() === cleanTerm.toLowerCase())) {
            this.data.definitions.push({
              term: cleanTerm,
              definition: cleanDef
            });
          }
        }
        
        // Check for English definitions ("X is defined as Y" or "X refers to Y")
        const engDefMatch = text.match(/([A-Z][a-zA-Z\s]{1,25})\s+(?:is defined as|refers to|is the process of)\s+([^।\.]+)/);
        if (engDefMatch) {
          const cleanTerm = stripMarkdown(engDefMatch[1]).trim();
          let cleanDef = stripMarkdown(text).trim();
          
          const escapedTerm = escapeRegExp(cleanTerm);
          const prefixRegex = new RegExp(`^${escapedTerm}\\s*[:：\\s]\\s*`, 'i');
          cleanDef = cleanDef.replace(prefixRegex, '');
          
          if (!this.data.definitions.some(d => d.term.toLowerCase() === cleanTerm.toLowerCase())) {
            this.data.definitions.push({
              term: cleanTerm,
              definition: cleanDef
            });
          }
        }
        
        // Auto-detect chemical reactions in inline texts or paragraphs
        if (text.includes('->') || text.includes('-->') || text.includes('==>')) {
          const rxn = parseReaction(text);
          if (rxn) {
            this.data.reactions.push(rxn);
          }
        }
      }
    }
  }

  /**
   * Generates automatically enhanced study sections (Summary, Glossary, Revision, Chemistry index)
   */
  public generateEnhancedSectionsHtml(): string {
    let html = '';
    
    // 1. Quick Revision Section (revision points, formulas)
    if (this.data.keyPoints.length > 0 || this.data.formulas.length > 0) {
      html += `
        <div class="page-break-before py-8 border-t-2 border-indigo-100" id="quick-revision-section">
          <h2 class="text-2xl font-bold text-slate-800 border-b-2 border-indigo-500 pb-2 mb-6 flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">⚡</span>
            त्वरित दोहराव (Quick Revision Sheet)
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${this.data.keyPoints.length > 0 ? `
              <div class="bg-amber-50/40 border border-amber-100 rounded-2xl p-6 shadow-sm break-inside-avoid">
                <h3 class="font-bold text-amber-800 text-lg mb-4 flex items-center gap-2">
                  <span>📌</span> महत्वपूर्ण तथ्य (Key Facts & Concepts)
                </h3>
                <ul class="space-y-3">
                  ${this.data.keyPoints.map(point => `
                    <li class="flex gap-2 text-sm text-slate-700">
                      <span class="text-amber-500 font-bold">•</span>
                      <span>${point}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
            
            ${this.data.formulas.length > 0 ? `
              <div class="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-6 shadow-sm break-inside-avoid">
                <h3 class="font-bold text-indigo-800 text-lg mb-4 flex items-center gap-2">
                  <span>🧮</span> प्रमुख सूत्र एवं समीकरण (Formulas & Equations)
                </h3>
                <div class="space-y-4">
                  ${this.data.formulas.map(formula => `
                    <div class="bg-white border border-indigo-50 p-3 rounded-xl shadow-xs text-center text-sm font-semibold text-slate-800 math-rendered break-inside-avoid">
                      ${formula.startsWith('$') ? formula : `$$${formula}$$`}
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    // 2. Glossary Section (Definitions index)
    if (this.data.definitions.length > 0) {
      // Deduplicate definitions
      const uniqueDefs = Array.from(new Map(this.data.definitions.map(d => [d.term.toLowerCase(), d])).values());
      
      html += `
        <div class="page-break-before py-8 border-t-2 border-indigo-100" id="glossary-section">
          <h2 class="text-2xl font-bold text-slate-800 border-b-2 border-indigo-500 pb-2 mb-6 flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">📖</span>
            शब्दावली एवं परिभाषाएं (Glossary & Definitions)
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${uniqueDefs.map(def => `
              <div class="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col break-inside-avoid hover:border-indigo-300 transition-colors">
                <span class="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2 text-md flex justify-between items-center">
                  <span>${def.term}</span>
                  <span class="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono uppercase">Definition</span>
                </span>
                <p class="text-sm text-slate-600 leading-relaxed">${def.definition}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // 3. Chemical Reactions Summary (if chemistry feature enabled)
    if (this.data.reactions.length > 0) {
      html += `
        <div class="page-break-before py-8 border-t-2 border-indigo-100" id="reactions-summary-section">
          <h2 class="text-2xl font-bold text-slate-800 border-b-2 border-indigo-500 pb-2 mb-6 flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">🧪</span>
            रासायनिक अभिक्रिया सारांश (Chemical Reactions Sheet)
          </h2>
          <div class="space-y-4">
            ${this.data.reactions.map((rxn, idx) => 
              renderReactionCard(rxn, `अभिक्रिया #${idx + 1}`, 'Auto-extracted')
            ).join('')}
          </div>
        </div>
      `;
    }

    // 4. Keyword Index
    if (this.data.definitions.length > 0) {
      const terms = Array.from(new Set(this.data.definitions.map(d => d.term))).sort();
      html += `
        <div class="page-break-before py-8 border-t-2 border-indigo-100" id="keyword-index-section">
          <h2 class="text-2xl font-bold text-slate-800 border-b-2 border-indigo-500 pb-2 mb-6 flex items-center gap-2">
            <span class="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">🔍</span>
            मुख्य शब्द अनुक्रमणिका (Keyword Index)
          </h2>
          <div class="flex flex-wrap gap-2 py-2">
            ${terms.map(term => `
              <span class="bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer shadow-xs transition-colors">
                ${term}
              </span>
            `).join('')}
          </div>
        </div>
      `;
    }

    return html;
  }
}
