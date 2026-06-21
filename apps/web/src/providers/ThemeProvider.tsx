import {
  ColorPalette,
  DARK_COLORS,
  LIGHT_COLORS,
} from "@liftledger/shared";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ThemePreference = "light" | "dark" | "system";

interface ThemeContextValue {
  colors: ColorPalette;
  scheme: "light" | "dark";
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
}

const STORAGE_KEY = "liftledger-theme";

const getSystemScheme = (): "light" | "dark" =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const ThemeContext = createContext<ThemeContextValue>({
  colors: DARK_COLORS,
  scheme: "dark",
  preference: "system",
  setPreference: () => undefined,
});

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark" || stored === "system")
        return stored;
    } catch {
      // localStorage unavailable (SSR / private mode edge case)
    }
    return "system";
  });

  const [systemScheme, setSystemScheme] = useState<"light" | "dark">(
    getSystemScheme,
  );

  // Keep system scheme in sync with OS preference changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) =>
      setSystemScheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    try {
      localStorage.setItem(STORAGE_KEY, pref);
    } catch {
      // ignore
    }
  }, []);

  const scheme = preference === "system" ? systemScheme : preference;
  const colors = scheme === "light" ? LIGHT_COLORS : DARK_COLORS;

  // Expose the active scheme as a data-attribute on <html> so CSS (Bootstrap
  // overrides, module CSS) can also key off the theme.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", scheme);
  }, [scheme]);

  return (
    <ThemeContext.Provider value={{ colors, scheme, preference, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
