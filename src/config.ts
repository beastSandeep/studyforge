import fs from 'fs';
import path from 'path';
import { createJiti } from 'jiti';
import { StudyForgeConfig } from './types.js';
import { defaultConfig } from './themes/default.js';

/**
 * Resolves the configuration by looking for studyforge.config.ts/js
 * in the current working directory, loading it, and merging it with defaults.
 */
export async function loadConfig(customConfigPath?: string): Promise<Required<StudyForgeConfig>> {
  const cwd = process.cwd();
  let resolvedConfig: Partial<StudyForgeConfig> = {};
  
  const possiblePaths = customConfigPath 
    ? [path.resolve(cwd, customConfigPath)]
    : [
        path.join(cwd, 'studyforge.config.ts'),
        path.join(cwd, 'studyforge.config.js'),
        path.join(cwd, 'studyforge.config.json')
      ];

  let foundPath: string | null = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      foundPath = p;
      break;
    }
  }

  if (foundPath) {
    try {
      if (foundPath.endsWith('.json')) {
        const fileContent = fs.readFileSync(foundPath, 'utf8');
        resolvedConfig = JSON.parse(fileContent);
      } else {
        // Load TypeScript/JavaScript config dynamically using jiti
        const jiti = createJiti(import.meta.url);
        const module = await jiti.import(foundPath) as any;
        resolvedConfig = module.default || module;
      }
      console.log(`Loaded configuration from: ${foundPath}`);
    } catch (e) {
      console.error(`Failed to parse configuration file at ${foundPath}:`, e);
      console.log('Falling back to default configuration.');
    }
  } else {
    if (customConfigPath) {
      console.warn(`Configuration file not found at: ${customConfigPath}`);
    }
  }

  // Merge loaded configuration with defaultConfig recursively
  return mergeConfigs(defaultConfig, resolvedConfig);
}

/**
 * Simple helper to merge config objects deep-wise
 */
function mergeConfigs(
  def: Required<StudyForgeConfig>,
  custom: Partial<StudyForgeConfig>
): Required<StudyForgeConfig> {
  return {
    theme: custom.theme ?? def.theme,
    title: custom.title ?? def.title,
    subtitle: custom.subtitle ?? def.subtitle,
    author: custom.author ?? def.author,
    headerText: custom.headerText ?? def.headerText,
    customCss: custom.customCss ?? def.customCss,
    colors: { ...def.colors, ...custom.colors },
    fonts: { ...def.fonts, ...custom.fonts },
    pdf: { ...def.pdf, ...custom.pdf },
    features: { ...def.features, ...custom.features }
  };
}

/**
 * Creates a default configuration file in the workspace
 */
export function initConfig(dir: string): void {
  const configPath = path.join(dir, 'studyforge.config.ts');
  if (fs.existsSync(configPath)) {
    console.warn(`Configuration file already exists at: ${configPath}`);
    return;
  }

  const template = `import { StudyForgeConfig } from './src/types.js';

const config: StudyForgeConfig = {
  theme: 'light',
  title: 'StudyForge Premium Notes',
  subtitle: 'Class 10 Science Series',
  author: 'Your Name / Institution',
  colors: {
    primary: '#1e3a8a',    // Deep Royal Blue
    secondary: '#4f46e5',  // Vibrant Indigo
    accent: '#f59e0b',     // Amber
  },
  fonts: {
    hindi: "'Noto Sans Devanagari', sans-serif",
    english: "'Inter', sans-serif"
  },
  features: {
    autoEnhance: true,      // Automatically generate Glossary, revision sheets
    mermaid: true,          // Support diagrams
    math: true,             // Support LaTeX equations
    chemistry: true         // Format reactions and element badges
  }
};

export default config;
`;

  fs.writeFileSync(configPath, template, 'utf8');
  console.log(`Created default configuration file at: ${configPath}`);
}
