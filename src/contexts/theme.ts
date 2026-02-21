import { createContext } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeContextValue {
  readonly theme: Theme;
  readonly setTheme: (theme: Theme) => void;
  readonly toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
