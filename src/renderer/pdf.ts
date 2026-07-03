import puppeteer from 'puppeteer';
import { StudyForgeConfig } from '../types.js';

export interface GeneratePdfOptions {
  outputPath: string;
  config: StudyForgeConfig;
}

/**
 * Uses Puppeteer to render compiled HTML into a high-quality, print-ready PDF.
 */
export async function generatePdf(htmlContent: string, options: GeneratePdfOptions): Promise<void> {
  const { outputPath, config } = options;
  
  // 1. Launch Headless Chromium browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // 2. Set the HTML content of the page
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0' as any // Wait until all images, fonts, and scripts are loaded
    });

    // 3. Wait for Mermaid or any client-side JS rendering to finish
    const hasMermaid = htmlContent.includes('mermaid.js') || htmlContent.includes('class="mermaid"');
    if (hasMermaid) {
      // Evaluate script in browser to wait for mermaid rendering to complete
      await page.evaluate(async () => {
        // Wait for all mermaid blocks to be rendered
        // Mermaid replaces the innerText with SVG, so we check for presence of svg elements
        let rendered = false;
        let attempts = 0;
        while (!rendered && attempts < 20) {
          const mermaidBlocks = document.querySelectorAll('.mermaid');
          const allProcessed = Array.from(mermaidBlocks).every(
            block => block.querySelector('svg') !== null
          );
          if (allProcessed || mermaidBlocks.length === 0) {
            rendered = true;
          } else {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
        }
      });
    }

    // 4. Set media type to print to apply CSS @media print styles
    await page.emulateMediaType('print');

    // 5. Build header and footer templates by injecting custom config variables
    let headerTemplate = config.pdf?.headerTemplate || '';
    let footerTemplate = config.pdf?.footerTemplate || '';

    // Replace custom tokens in templates
    const authorName = config.author || 'StudyForge';
    const subtitleText = config.subtitle || 'Study Notes';
    const headerText = config.headerText || 'StudyForge premium study notes';
    
    headerTemplate = headerTemplate
      .replace(/StudyForge premium study notes/gi, headerText)
      .replace(/<span class="subtitle"><\/span>/gi, `<span>${subtitleText}</span>`)
      .replace(/<span class="title"><\/span>/gi, `<span class="title"></span>`); // Let Puppeteer replace this
      
    footerTemplate = footerTemplate
      .replace(/<span class="author"><\/span>/gi, `<span>${authorName}</span>`);

    // 6. Generate PDF with Puppeteer print settings
    const margin = config.pdf?.margin || {
      top: '20mm',
      bottom: '20mm',
      left: '15mm',
      right: '15mm'
    };

    await page.pdf({
      path: outputPath,
      format: (config.pdf?.format || 'A4') as any,
      landscape: config.pdf?.landscape || false,
      printBackground: config.pdf?.printBackground !== false,
      displayHeaderFooter: config.pdf?.displayHeaderFooter !== false,
      headerTemplate: headerTemplate || undefined,
      footerTemplate: footerTemplate || undefined,
      margin: {
        top: margin.top,
        bottom: margin.bottom,
        left: margin.left,
        right: margin.right
      }
    });

  } finally {
    // 7. Ensure browser closes safely
    await browser.close();
  }
}
