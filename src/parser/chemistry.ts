/**
 * Formats a chemical formula string (e.g., H2O, Ca(OH)2, Na+, Mg2+, SO4^2-) into beautiful HTML with subscripts and superscripts.
 */
export function formatChemicalFormula(formula: string): string {
  // Replace charges like ^2+, ^-, ^2- or 2+, +, 2- at the end of a group
  // Match patterns like Na+, Mg2+, SO4^2-, Cl-
  let html = formula;

  // Handle superscripts for charges
  // Matches e.g., ^2+, ^+, ^-, ^2-
  html = html.replace(/\^([0-9]*[+-])/g, '<sup>$1</sup>');
  
  // Matches trailing charges like Na+ or Mg2+ when not preceded by ^
  // We check for chemical elements followed by + or - or digits then + or -
  html = html.replace(/([A-Za-z\)]+)([0-9]*[+-])/g, (match, p1, p2) => {
    // If it's a number followed by +/-, it's a charge (e.g. 2+)
    // If it's just +/- like Na+, it's a charge
    return `${p1}<sup>${p2}</sup>`;
  });

  // Handle subscripts for quantities (e.g., H2O, Ca(OH)2)
  // Matches letters/parentheses followed by numbers
  // But avoid matching numbers inside <sup> tags we just created
  // To be safe, we can parse using a regex that ignores tags.
  // A simpler way: replace numbers that are NOT inside tags.
  // We can match numbers that are preceded by a letter or closing parenthesis
  // and NOT followed by a tag closing or charge.
  html = html.replace(/([A-Za-z\)]+)([0-9]+)(?!([^<]*>))/g, '$1<sub>$2</sub>');

  return html;
}

/**
 * Parses a reaction line (e.g. "2H2 + O2 --[Heat]--> 2H2O")
 * into reactants, products, and conditions.
 */
export interface ChemicalReaction {
  reactants: string[];
  products: string[];
  condition?: string;
  type?: string;
  title?: string;
}

export function parseReaction(line: string): ChemicalReaction | null {
  // Match arrow with optional conditions in brackets, like:
  // --> or -> or --[Condition]--> or -[Condition]->
  const arrowRegex = /--?(?:\[(.*?)\])?-->?/;
  const match = line.match(arrowRegex);
  
  if (!match) return null;
  
  const condition = match[1] || undefined;
  const parts = line.split(arrowRegex);
  const reactantsPart = parts[0].trim();
  const productsPart = parts[2].trim();
  
  const parseSide = (side: string) => {
    return side.split('+').map(item => {
      item = item.trim();
      // Match coefficient if any, e.g. "2H2O" -> coefficient: "2", formula: "H2O"
      const coefMatch = item.match(/^([0-9\/\.]+)?\s*(.*)$/);
      if (coefMatch) {
        const coef = coefMatch[1] ? `<span class="reaction-coef text-indigo-600 font-bold mr-1">${coefMatch[1]}</span>` : '';
        const formula = formatChemicalFormula(coefMatch[2]);
        return `<span class="chemical-item inline-flex items-center px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-800 shadow-sm">${coef}${formula}</span>`;
      }
      return formatChemicalFormula(item);
    });
  };

  return {
    reactants: parseSide(reactantsPart),
    products: parseSide(productsPart),
    condition
  };
}

/**
 * Formats a list of chemical reactions into a beautiful HTML component.
 */
export function renderReactionCard(reaction: ChemicalReaction, title?: string, type?: string): string {
  const titleHtml = title ? `<div class="reaction-card-title text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">${title}</div>` : '';
  const typeHtml = type ? `<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm ml-auto">${type}</span>` : '';
  
  const conditionHtml = reaction.condition 
    ? `<div class="reaction-condition text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 rounded px-2 py-0.5 max-w-max my-1">${reaction.condition}</div>` 
    : '';

  return `
    <div class="reaction-card p-5 my-6 bg-gradient-to-br from-indigo-50/30 to-slate-50 border border-indigo-100 rounded-2xl shadow-sm break-inside-avoid">
      <div class="flex items-center justify-between border-b border-indigo-50 pb-2 mb-4">
        ${titleHtml}
        ${typeHtml}
      </div>
      <div class="flex flex-wrap items-center gap-3 py-2 justify-center sm:justify-start">
        <div class="flex flex-wrap items-center gap-2">
          ${reaction.reactants.join(' <span class="text-indigo-400 font-semibold text-lg">+</span> ')}
        </div>
        
        <div class="flex flex-col items-center justify-center min-w-[60px] px-2">
          ${conditionHtml}
          <div class="w-full flex items-center justify-center relative my-1">
            <svg class="w-12 h-6 text-indigo-500 fill-current" viewBox="0 0 24 24">
              <path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42L16.86 11H5v2z"/>
            </svg>
          </div>
        </div>
        
        <div class="flex flex-wrap items-center gap-2">
          ${reaction.products.join(' <span class="text-indigo-400 font-semibold text-lg">+</span> ')}
        </div>
      </div>
    </div>
  `;
}
