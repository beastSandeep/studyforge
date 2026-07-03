import katex from 'katex';

/**
 * Compiles LaTeX formulas using KaTeX.
 * Handles Devanagari (Hindi) and English text gracefully.
 */
function processMathBlocksAndInline(text: string): string {
  let processed = text;

  // 1. Process block math: $$ formula $$
  processed = processed.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
    try {
      const cleanFormula = formula.trim();
      const html = katex.renderToString(cleanFormula, {
        displayMode: true,
        throwOnError: false,
        strict: false
      });
      return `\n<div class="math-block my-6 break-inside-avoid flex justify-center overflow-x-auto py-2">${html}</div>\n`;
    } catch (e) {
      console.warn('KaTeX block rendering warning:', e);
      return match;
    }
  });

  // 2. Process inline math: $ formula $
  // Matches $ followed by non-new-line characters up to next $, ensuring we don't match empty $$
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
    try {
      const cleanFormula = formula.trim();
      const html = katex.renderToString(cleanFormula, {
        displayMode: false,
        throwOnError: false,
        strict: false
      });
      return html;
    } catch (e) {
      console.warn('KaTeX inline rendering warning:', e);
      return match;
    }
  });

  return processed;
}

/**
 * Preprocesses markdown to compile LaTeX math blocks outside code blocks.
 */
export function preprocessMath(markdown: string): string {
  // Split by code blocks to avoid rendering math inside code
  const parts = markdown.split(/(```[\s\S]*?```)/g);
  for (let idx = 0; idx < parts.length; idx++) {
    const part = parts[idx];
    if (!part.startsWith('```')) {
      parts[idx] = processMathBlocksAndInline(part);
    }
  }
  return parts.join('');
}

/**
 * Preprocesses markdown content.
 * Converts Obsidian callouts and double-colon definitions, then compiles LaTeX math.
 */
export function preprocessCallouts(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const result: string[] = [];
  
  let i = 0;
  let insideCodeBlock = false;
  
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Toggle code block state
    if (trimmed.startsWith('```')) {
      insideCodeBlock = !insideCodeBlock;
      result.push(line);
      i++;
      continue;
    }
    
    if (insideCodeBlock) {
      result.push(line);
      i++;
      continue;
    }
    
    // Check if line is a double-colon definition (e.g. Term:: Definition)
    const defMatch = line.match(/^([^:\n`]+?)\s*::\s*([^`\n]+)$/);
    if (defMatch) {
      result.push(defMatch[1].trim());
      result.push(`: ${defMatch[2].trim()}`);
      i++;
      continue;
    }
    
    // Check if line is a bulleted bold definition (e.g. - **Term**: Definition, * **Term**: Definition, or 1. **Term**: Definition)
    const bulletDefMatch = line.match(/^(?:[*-]|\d+\.)\s+\*\*([^*:\n]+?)\*\*:\s*([^`\n]+)$/);
    if (bulletDefMatch) {
      result.push(bulletDefMatch[1].trim());
      result.push(`: ${bulletDefMatch[2].trim()}`);
      i++;
      continue;
    }
    
    // Check if line starts a blockquote with a callout tag
    // e.g. > [!NOTE] My Title
    const calloutMatch = trimmed.match(/^>\s*\[\!(NOTE|TIP|IMPORTANT|WARNING|CAUTION|QUESTION|SUCCESS|INFO|REMEMBER|EXAMPLE|FORMULA|REACTION|MINDMAP|SUMMARY|REVISION|EXAM|DEFINITION)\]\s*(.*)$/i);
    
    if (calloutMatch) {
      const type = calloutMatch[1].toLowerCase();
      const title = calloutMatch[2].trim();
      
      const calloutLines: string[] = [];
      
      // Collect all contiguous blockquote lines
      i++;
      while (i < lines.length) {
        const nextLine = lines[i];
        const nextTrimmed = nextLine.trim();
        
        if (nextTrimmed.startsWith('>')) {
          // Strip the leading '>' and optional space
          const content = nextLine.replace(/^\s*>\s?/, '');
          calloutLines.push(content);
          i++;
        } else if (nextTrimmed === '') {
          // If it's a blank line, check if the line after it is a blockquote line
          if (i + 1 < lines.length && lines[i + 1].trim().startsWith('>')) {
            calloutLines.push('');
            i++;
          } else {
            break;
          }
        } else {
          break;
        }
      }
      
      // Output as custom container
      result.push(`::: callout-${type}${title ? ' ' + title : ''}`);
      result.push(...calloutLines);
      result.push(':::');
    } else {
      result.push(line);
      i++;
    }
  }
  
  // Re-join lines
  const compiledCalloutsText = result.join('\n');
  
  // Compile all LaTeX math blocks using KaTeX preprocessor
  return preprocessMath(compiledCalloutsText);
}
