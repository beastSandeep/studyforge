import { StudyForgeConfig } from "./src/types.js";

const config: StudyForgeConfig = {
  theme: "light",
  title: "Metals and Non-Metals",
  subtitle: "Class 10 Science Series",
  author: "Sandeep Singh / Sandeep Institution",
  headerText: "Custom Premium Chemistry Study Notes",
  colors: {
    primary: "#1e3a8a", // Deep Royal Blue
    secondary: "#4f46e5", // Vibrant Indigo
    accent: "#f59e0b", // Amber
  },
  fonts: {
    hindi: "'Noto Sans Devanagari', sans-serif",
    english: "'Inter', sans-serif",
  },
  features: {
    autoEnhance: true, // Automatically generate Glossary, revision sheets
    mermaid: true, // Support diagrams
    math: true, // Support LaTeX equations
    chemistry: true, // Format reactions and element badges
  },
};

export default config;
