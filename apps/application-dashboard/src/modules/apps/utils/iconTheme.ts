export interface IconTheme {
  lightBg: string;
  darkBg: string;
  color: string;
}

export const APP_ICON_THEMES: IconTheme[] = [
  { lightBg: 'bg-red-100', darkBg: 'dark:bg-red-500/15', color: '#d45555' },
  { lightBg: 'bg-teal-100', darkBg: 'dark:bg-teal-500/15', color: '#4aada5' },
  { lightBg: 'bg-yellow-100', darkBg: 'dark:bg-yellow-500/15', color: '#c4a84a' },
  { lightBg: 'bg-indigo-100', darkBg: 'dark:bg-indigo-500/15', color: '#6a72c4' },
  { lightBg: 'bg-pink-100', darkBg: 'dark:bg-pink-500/15', color: '#c45a8a' },
  { lightBg: 'bg-emerald-100', darkBg: 'dark:bg-emerald-500/15', color: '#4aaa9a' },
];

export const SERVICE_ICON_THEMES: IconTheme[] = [
  { lightBg: 'bg-blue-100', darkBg: 'dark:bg-blue-500/15', color: '#5588cc' },
  { lightBg: 'bg-purple-100', darkBg: 'dark:bg-purple-500/15', color: '#8a6ac4' },
  { lightBg: 'bg-orange-100', darkBg: 'dark:bg-orange-500/15', color: '#c4884a' },
  { lightBg: 'bg-cyan-100', darkBg: 'dark:bg-cyan-500/15', color: '#4a99b5' },
  { lightBg: 'bg-rose-100', darkBg: 'dark:bg-rose-500/15', color: '#c45a6a' },
  { lightBg: 'bg-lime-100', darkBg: 'dark:bg-lime-500/15', color: '#7aaa4a' },
];

export const getIconTheme = (name: string, themes: IconTheme[]): IconTheme => {
  let hash = 0;

  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return themes[Math.abs(hash) % themes.length];
};
