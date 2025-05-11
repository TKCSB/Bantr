import { create } from "zustand";

const getInitialDarkMode = () => {
  const savedTheme = localStorage.getItem("vite-ui-theme");
  if (savedTheme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return savedTheme ? savedTheme === "dark" : false;
};

const useThemeStore = create((set) => ({
  darkMode: getInitialDarkMode(),
  setDarkMode: (mode) => {
    set({ darkMode: mode });
    localStorage.setItem("vite-ui-theme", mode ? "dark" : "light");
  },
}));

export default useThemeStore;
