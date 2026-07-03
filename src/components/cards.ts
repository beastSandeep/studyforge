import { getIconSvg } from './icons.js';

export interface CardStyle {
  borderClass: string;
  bgClass: string;
  textClass: string;
  iconName: string;
  defaultTitle: string;
}

export const cardStyles: Record<string, CardStyle> = {
  note: {
    borderClass: 'border-l-4 border-sky-500',
    bgClass: 'bg-sky-50/40',
    textClass: 'text-sky-900',
    iconName: 'info',
    defaultTitle: 'टिप्पणी (Note)'
  },
  info: {
    borderClass: 'border-l-4 border-sky-500',
    bgClass: 'bg-sky-50/40',
    textClass: 'text-sky-900',
    iconName: 'info',
    defaultTitle: 'जानकारी (Information)'
  },
  tip: {
    borderClass: 'border-l-4 border-emerald-500',
    bgClass: 'bg-emerald-50/40',
    textClass: 'text-emerald-900',
    iconName: 'lightbulb',
    defaultTitle: 'सुझाव (Tip)'
  },
  important: {
    borderClass: 'border-l-4 border-indigo-500',
    bgClass: 'bg-indigo-50/40',
    textClass: 'text-indigo-900',
    iconName: 'star',
    defaultTitle: 'महत्वपूर्ण (Important)'
  },
  warning: {
    borderClass: 'border-l-4 border-amber-500',
    bgClass: 'bg-amber-50/40',
    textClass: 'text-amber-900',
    iconName: 'alertTriangle',
    defaultTitle: 'चेतावनी (Warning)'
  },
  caution: {
    borderClass: 'border-l-4 border-red-500',
    bgClass: 'bg-red-50/40',
    textClass: 'text-red-900',
    iconName: 'alertCircle',
    defaultTitle: 'सावधानी (Caution)'
  },
  question: {
    borderClass: 'border-l-4 border-purple-500',
    bgClass: 'bg-purple-50/40',
    textClass: 'text-purple-900',
    iconName: 'helpCircle',
    defaultTitle: 'प्रश्न (Question)'
  },
  success: {
    borderClass: 'border-l-4 border-green-500',
    bgClass: 'bg-green-50/40',
    textClass: 'text-green-900',
    iconName: 'checkCircle',
    defaultTitle: 'सफलता (Success)'
  },
  remember: {
    borderClass: 'border-l-4 border-yellow-500',
    bgClass: 'bg-yellow-50/40',
    textClass: 'text-yellow-900',
    iconName: 'bell',
    defaultTitle: 'याद रखें (Remember)'
  },
  example: {
    borderClass: 'border-l-4 border-violet-500',
    bgClass: 'bg-violet-50/40',
    textClass: 'text-violet-900',
    iconName: 'bookOpen',
    defaultTitle: 'उदाहरण (Example)'
  },
  formula: {
    borderClass: 'border-l-4 border-cyan-500',
    bgClass: 'bg-cyan-50/40',
    textClass: 'text-cyan-900',
    iconName: 'binary',
    defaultTitle: 'सूत्र (Formula)'
  },
  reaction: {
    borderClass: 'border-l-4 border-teal-500',
    bgClass: 'bg-teal-50/40',
    textClass: 'text-teal-900',
    iconName: 'beaker',
    defaultTitle: 'अभिक्रिया (Reaction)'
  },
  mindmap: {
    borderClass: 'border-l-4 border-rose-500',
    bgClass: 'bg-rose-50/40',
    textClass: 'text-rose-900',
    iconName: 'gitBranch',
    defaultTitle: 'माइंड मैप (Mindmap)'
  },
  summary: {
    borderClass: 'border-l-4 border-slate-500',
    bgClass: 'bg-slate-50/40',
    textClass: 'text-slate-900',
    iconName: 'fileText',
    defaultTitle: 'सारांश (Summary)'
  },
  revision: {
    borderClass: 'border-l-4 border-fuchsia-500',
    bgClass: 'bg-fuchsia-50/40',
    textClass: 'text-fuchsia-900',
    iconName: 'zap',
    defaultTitle: 'त्वरित दोहराव (Revision Point)'
  },
  exam: {
    borderClass: 'border-l-4 border-pink-500',
    bgClass: 'bg-pink-50/40',
    textClass: 'text-pink-900',
    iconName: 'award',
    defaultTitle: 'परीक्षा उपयोगी तथ्य (Exam Point)'
  },
  definition: {
    borderClass: 'border-l-4 border-teal-400',
    bgClass: 'bg-teal-50/20',
    textClass: 'text-teal-900',
    iconName: 'book',
    defaultTitle: 'परिभाषा (Definition)'
  }
};

/**
 * Renders a callout card's opening HTML
 */
export function renderCalloutCard(type: string, title?: string): string {
  const style = cardStyles[type] || cardStyles.note;
  const displayTitle = title || style.defaultTitle;
  
  // Icon styling using theme color mapping
  const themeColorClassMap: Record<string, string> = {
    note: 'text-sky-600',
    info: 'text-sky-600',
    tip: 'text-emerald-600',
    important: 'text-indigo-600',
    warning: 'text-amber-600',
    caution: 'text-red-600',
    question: 'text-purple-600',
    success: 'text-green-600',
    remember: 'text-yellow-600',
    example: 'text-violet-600',
    formula: 'text-cyan-600',
    reaction: 'text-teal-600',
    mindmap: 'text-rose-600',
    summary: 'text-slate-600',
    revision: 'text-fuchsia-600',
    exam: 'text-pink-600',
    definition: 'text-teal-600'
  };
  
  const iconColor = themeColorClassMap[type] || 'text-indigo-600';
  const iconHtml = getIconSvg(style.iconName, `w-5 h-5 ${iconColor}`);

  return `
    <div class="callout-card my-6 rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden break-inside-avoid ${style.borderClass} ${style.bgClass}">
      <div class="callout-header flex items-center gap-2.5 px-4 py-3 bg-white/60 border-b border-slate-200/30">
        ${iconHtml}
        <span class="callout-title font-bold text-sm uppercase tracking-wide ${style.textClass}">${displayTitle}</span>
      </div>
      <div class="callout-content px-5 py-4 text-slate-800 text-sm leading-relaxed space-y-3">
  `;
}
