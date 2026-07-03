#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import http from 'http';
import chokidar from 'chokidar';
import { loadConfig, initConfig } from '../config.js';
import { parseMarkdown } from '../parser/index.js';
import { compileCss } from '../styles/compiler.js';
import { generateFullHtml } from '../layouts/index.js';
import { generatePdf } from '../renderer/pdf.js';
import { startDevServer } from './serve.js';

const program = new Command();

program
  .name('studyforge')
  .description('StudyForge: Convert Markdown (.md) into premium educational print-quality study material')
  .version('1.0.0');

// Initialize project
program
  .command('init')
  .description('Initialize a new StudyForge project configuration and sample notes')
  .action(async () => {
    const cwd = process.cwd();
    
    // Create config
    initConfig(cwd);
    
    // Create sample notes.md if not exists
    const sampleNotesPath = path.join(cwd, 'notes.md');
    if (!fs.existsSync(sampleNotesPath)) {
      const sampleNotes = `# रासायनिक अभिक्रियाएँ एवं समीकरण (Chemical Reactions & Equations)
**कक्षा 10 - विज्ञान (अध्याय 1)**

यह एक नमूना फ़ाइल है जो StudyForge की क्षमताओं को दर्शाती है।

::: table-of-contents
:::

## 1. रासायनिक अभिक्रिया (Chemical Reactions)
जब दो या दो से अधिक पदार्थ परस्पर क्रिया करके नए गुणों वाले नए पदार्थों का निर्माण करते हैं, तो उसे रासायनिक अभिक्रिया (Chemical Reaction) कहते हैं।

> [!NOTE] अभिकारक एवं उत्पाद (Reactants & Products)
> * **अभिकारक (Reactants):** ऐसे पदार्थ जो किसी रासायनिक अभिक्रिया में हिस्सा लेते हैं।
> * **उत्पाद (Products):** ऐसे पदार्थ जिनका निर्माण रासायनिक अभिक्रिया में होता है।

### रासायनिक समीकरण का संतुलन (Balancing Chemical Equations)
द्रव्यमान संरक्षण के नियम (Law of Conservation of Mass) के अनुसार, किसी भी रासायनिक अभिक्रिया में द्रव्यमान का न तो निर्माण होता है और न ही विनाश। इसलिए दोनों तरफ तत्वों के परमाणुओं की संख्या समान होनी चाहिए।

$$ 3\\text{Fe} + 4\\text{H}_2\\text{O} \\rightarrow \\text{Fe}_3\\text{O}_4 + 4\\text{H}_2 $$

---

## 2. रासायनिक अभिक्रियाओं के प्रकार (Types of Chemical Reactions)

### 2.1 संयोजन अभिक्रिया (Combination Reaction)
ऐसी अभिक्रिया जिसमें दो या दो से अधिक अभिकारक मिलकर एकल उत्पाद (single product) बनाते हैं।

::: reaction Title="संयोजन अभिक्रिया: कोयले का दहन" Type="संयोजन"
C + O2 --[दहन (Combustion)]--> CO2
:::

> [!TIP] दैनिक जीवन में उदाहरण
> चूने (Calcium Oxide) की पानी के साथ अभिक्रिया भी एक संयोजन अभिक्रिया है जिससे बुझा हुआ चूना बनता है और अत्यधिक ऊष्मा उत्पन्न होती है:
> CaO + H2O -> Ca(OH)2 + Heat

### 2.2 विस्थापन अभिक्रिया (Displacement Reaction)
जब अधिक अभिक्रियाशील तत्व कम अभिक्रियाशील तत्व को उसके लवण विलयन से विस्थापित कर देता है।

::: reaction Title="आयरन और कॉपर सल्फेट की अभिक्रिया" Type="विस्थापन"
Fe + CuSO4 -> FeSO4 + Cu
:::

> [!WARNING] महत्वपूर्ण अवलोकन (Observation)
> इस अभिक्रिया में कॉपर सल्फेट का नीला रंग धीरे-धीरे हल्का (हरा) हो जाता है और लोहे की कील पर भूरे रंग की तांबे की परत चढ़ जाती है।

---

## 3. संक्षारण एवं विकृतगंधिता (Corrosion & Rancidity)

धातु:: वायु और नमी के संपर्क में आने पर संक्षारित होती है। (जैसे लोहे पर जंग लगना)।
विकृतगंधिता:: वसायुक्त और तैलीय खाद्य सामग्री हवा के संपर्क में आकर उपचयित (oxidise) हो जाती है जिससे उनका स्वाद और गंध बदल जाते हैं।

> [!IMPORTANT] परीक्षा उपयोगी तथ्य (Exam Point)
> चिप्स की थैली में उपचयन (oxidation) को रोकने के लिए **नाइट्रोजन (Nitrogen) गैस** भरी जाती है।

---

## 4. उदाहरण आरेख (Conceptual Chart)

यहाँ एक माइंड मैप दर्शाया गया है:

\`\`\`mermaid
graph TD
    A[रासायनिक अभिक्रिया] --> B[संयोजन]
    A --> C[अपघटन / वियोजन]
    A --> D[विस्थापन]
    A --> E[द्विविस्थापन]
    A --> F[उपचयन एवं अपचयन]
    
    C --> C1[ऊष्मीय अपघटन]
    C --> C2[विद्युत अपघटन]
    C --> C3[प्रकाशीय अपघटन]
\`\`\`
`;
      fs.writeFileSync(sampleNotesPath, sampleNotes, 'utf8');
      console.log(`Created sample notes at: ${sampleNotesPath}`);
    }
    
    console.log('\n🎉 Project initialized successfully!');
    console.log('Run "studyforge build notes.md" to compile PDF & HTML.');
    console.log('Run "studyforge watch notes.md" to start editing with live-preview!');
  });

// HTML Compile
program
  .command('html <file>')
  .description('Compile Markdown (.md) to a beautiful styled HTML file')
  .option('-o, --output <output>', 'Output HTML path')
  .option('-c, --config <config>', 'Custom configuration file path')
  .action(async (file, options) => {
    try {
      const config = await loadConfig(options.config);
      const filePath = path.resolve(process.cwd(), file);
      
      if (!fs.existsSync(filePath)) {
        console.error(`Input file not found: ${filePath}`);
        process.exit(1);
      }

      const mdContent = fs.readFileSync(filePath, 'utf8');
      console.log(`Parsing ${file}...`);
      
      const parseResult = await parseMarkdown(mdContent, config);
      console.log('Compiling Tailwind CSS dynamic styles...');
      
      const compiledCss = await compileCss(parseResult.html + parseResult.enhancementsHtml, config);
      const fullHtml = generateFullHtml(parseResult.html, parseResult.enhancementsHtml, compiledCss, config);
      
      const outputName = options.output || file.replace(/\.md$/, '.html');
      const outputPath = path.resolve(process.cwd(), outputName);
      
      fs.writeFileSync(outputPath, fullHtml, 'utf8');
      console.log(`✨ Successfully generated HTML at: ${outputPath}`);
    } catch (err) {
      console.error('Failed to compile HTML:', err);
      process.exit(1);
    }
  });

// PDF Compile
program
  .command('pdf <file>')
  .description('Compile Markdown (.md) to a premium print-quality PDF')
  .option('-o, --output <output>', 'Output PDF path')
  .option('-c, --config <config>', 'Custom configuration file path')
  .action(async (file, options) => {
    try {
      const config = await loadConfig(options.config);
      const filePath = path.resolve(process.cwd(), file);
      
      if (!fs.existsSync(filePath)) {
        console.error(`Input file not found: ${filePath}`);
        process.exit(1);
      }

      const mdContent = fs.readFileSync(filePath, 'utf8');
      console.log(`Compiling HTML contents for PDF...`);
      
      const parseResult = await parseMarkdown(mdContent, config);
      const compiledCss = await compileCss(parseResult.html + parseResult.enhancementsHtml, config);
      const fullHtml = generateFullHtml(parseResult.html, parseResult.enhancementsHtml, compiledCss, config);
      
      const outputName = options.output || file.replace(/\.md$/, '.pdf');
      const outputPath = path.resolve(process.cwd(), outputName);
      
      console.log('Rendering print PDF in headless Chromium (Puppeteer)...');
      await generatePdf(fullHtml, { outputPath, config });
      console.log(`✨ Successfully exported PDF at: ${outputPath}`);
    } catch (err) {
      console.error('Failed to compile PDF:', err);
      process.exit(1);
    }
  });

// Full Build (both HTML and PDF)
program
  .command('build <file>')
  .description('Compile Markdown (.md) to both HTML and PDF formats')
  .option('-c, --config <config>', 'Custom configuration file path')
  .action(async (file, options) => {
    const start = Date.now();
    try {
      const config = await loadConfig(options.config);
      const filePath = path.resolve(process.cwd(), file);
      
      if (!fs.existsSync(filePath)) {
        console.error(`Input file not found: ${filePath}`);
        process.exit(1);
      }

      const mdContent = fs.readFileSync(filePath, 'utf8');
      console.log(`[1/4] Parsing Markdown AST...`);
      const parseResult = await parseMarkdown(mdContent, config);
      
      console.log(`[2/4] Compiling responsive Tailwind CSS styles...`);
      const compiledCss = await compileCss(parseResult.html + parseResult.enhancementsHtml, config);
      const fullHtml = generateFullHtml(parseResult.html, parseResult.enhancementsHtml, compiledCss, config);
      
      const htmlPath = path.resolve(process.cwd(), file.replace(/\.md$/, '.html'));
      const pdfPath = path.resolve(process.cwd(), file.replace(/\.md$/, '.pdf'));
      
      console.log(`[3/4] Writing HTML output...`);
      fs.writeFileSync(htmlPath, fullHtml, 'utf8');
      
      console.log(`[4/4] Printing PDF via Puppeteer...`);
      await generatePdf(fullHtml, { outputPath: pdfPath, config });
      
      console.log(`\n🎉 Build completed in ${((Date.now() - start) / 1000).toFixed(2)}s!`);
      console.log(`📄 HTML: ${htmlPath}`);
      console.log(`📕 PDF:  ${pdfPath}`);
    } catch (err) {
      console.error('Failed to build documents:', err);
      process.exit(1);
    }
  });

// Watch and Hot-Reload preview
program
  .command('watch <file>')
  .description('Watch Markdown file and hot-reload local browser preview on change')
  .option('-p, --port <port>', 'Preview server port', '3000')
  .option('-c, --config <config>', 'Custom configuration file path')
  .action(async (file, options) => {
    const port = parseInt(options.port, 10);
    const config = await loadConfig(options.config);
    const filePath = path.resolve(process.cwd(), file);
    
    if (!fs.existsSync(filePath)) {
      console.error(`Input file not found: ${filePath}`);
      process.exit(1);
    }

    const htmlPath = path.resolve(process.cwd(), file.replace(/\.md$/, '.html'));
    
    // Initial build function
    const rebuild = async () => {
      try {
        console.log(`\nFile change detected. Recompiling...`);
        const mdContent = fs.readFileSync(filePath, 'utf8');
        const parseResult = await parseMarkdown(mdContent, config);
        const compiledCss = await compileCss(parseResult.html + parseResult.enhancementsHtml, config);
        const fullHtml = generateFullHtml(parseResult.html, parseResult.enhancementsHtml, compiledCss, config);
        
        fs.writeFileSync(htmlPath, fullHtml, 'utf8');
        console.log(`HTML updated. Reloading preview...`);
        return true;
      } catch (err) {
        console.error('Rebuild failed:', err);
        return false;
      }
    };

    // Run initial build
    await rebuild();

    // Start Dev Server
    const devServer = startDevServer(htmlPath, port);

    // Setup file watcher
    const watcher = chokidar.watch([filePath, path.join(process.cwd(), 'studyforge.config.ts')], {
      persistent: true,
      ignoreInitial: true
    });

    watcher.on('change', async (changedPath) => {
      console.log(`Modified: ${changedPath}`);
      const success = await rebuild();
      if (success) {
        devServer.broadcastReload();
      }
    });

    // Handle process termination gracefully
    process.on('SIGINT', () => {
      console.log('\nStopping dev server and watcher...');
      watcher.close();
      devServer.close();
      process.exit(0);
    });
  });

// General static serve
program
  .command('serve')
  .description('Serve all generated HTML study sheets in the current directory')
  .option('-p, --port <port>', 'Server port', '8080')
  .action((options) => {
    const port = parseInt(options.port, 10);
    const cwd = process.cwd();
    
    const server = http.createServer((req, res) => {
      let fileUrl = req.url || '';
      if (fileUrl === '/') fileUrl = '/index.html';
      
      const filePath = path.join(cwd, fileUrl);
      
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const mimeTypes: Record<string, string> = {
          '.html': 'text/html; charset=utf-8',
          '.css': 'text/css',
          '.js': 'application/javascript',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.svg': 'image/svg+xml'
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        res.end(fs.readFileSync(filePath));
      } else {
        // If index.html doesn't exist, list all HTML files in directory
        if (fileUrl === '/index.html') {
          const files = fs.readdirSync(cwd).filter(f => f.endsWith('.html'));
          let html = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>StudyForge Notes Directory</title>
              <meta charset="utf-8">
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
              <style>
                body { font-family: 'Inter', sans-serif; background: #f8fafc; color: #1e293b; padding: 40px; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
                h1 { font-size: 24px; font-weight: 700; margin-bottom: 20px; color: #0f172a; }
                ul { list-style: none; padding: 0; }
                li { margin-bottom: 12px; }
                a { color: #4f46e5; text-decoration: none; font-weight: 500; font-size: 16px; display: block; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; transition: all 0.2s; }
                a:hover { background: #f5f3ff; border-color: #c084fc; transform: translateY(-1px); }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>📚 StudyForge Notes Library</h1>
                ${files.length === 0 ? '<p>No study sheets compiled yet. Run "studyforge build &lt;file.md&gt;" first.</p>' : '<ul>' + files.map(f => `<li><a href="/${f}">📄 ${f}</a></li>`).join('') + '</ul>'}
              </div>
            </body>
            </html>
          `;
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(html);
        } else {
          res.writeHead(404);
          res.end('File Not Found');
        }
      }
    });

    server.listen(port, () => {
      console.log(`\n📚 StudyForge Library Dashboard running at: http://localhost:${port}`);
      console.log(`Press Ctrl+C to stop.`);
    });
  });

// Print active theme config
program
  .command('theme')
  .description('Print details of the active color palette and typography theme')
  .option('-c, --config <config>', 'Custom configuration file path')
  .action(async (options) => {
    const config = await loadConfig(options.config);
    console.log('\n🎨 --- StudyForge Active Theme Configuration ---');
    console.log(`Theme Layout Presets: ${config.theme.toUpperCase()}`);
    console.log('\nColors Palette:');
    Object.entries(config.colors).forEach(([name, val]) => {
      console.log(`  - ${name.padEnd(12)}: ${val}`);
    });
    console.log('\nTypography Fonts:');
    Object.entries(config.fonts).forEach(([name, val]) => {
      console.log(`  - ${name.padEnd(12)}: ${val}`);
    });
    console.log('\nPDF Margin Settings:');
    Object.entries(config.pdf.margin || {}).forEach(([name, val]) => {
      console.log(`  - ${name.padEnd(12)}: ${val}`);
    });
    console.log('--------------------------------------------------\n');
  });

// Export command
program
  .command('export')
  .description('Export all built HTML/PDF materials to a specific folder')
  .argument('<output-dir>', 'Destination output directory')
  .action((outputDir) => {
    const cwd = process.cwd();
    const dest = path.resolve(cwd, outputDir);
    
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(cwd).filter(f => f.endsWith('.html') || f.endsWith('.pdf'));
    
    if (files.length === 0) {
      console.log('No compiled HTML or PDF study sheets found to export.');
      return;
    }
    
    files.forEach(f => {
      const srcFile = path.join(cwd, f);
      const destFile = path.join(dest, f);
      fs.copyFileSync(srcFile, destFile);
      console.log(`Exported: ${f} -> ${destFile}`);
    });
    console.log(`\n✨ Successfully exported ${files.length} documents to: ${dest}`);
  });

program.parse(process.argv);
