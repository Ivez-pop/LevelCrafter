import { useEffect, useState } from "react";

const themes = ["neon", "candy", "terminal"] as const;

type Theme = (typeof themes)[number];

function isTheme(value: string | null): value is Theme {
  return value === "neon" || value === "candy" || value === "terminal";
}

export function ThemeSelector() {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem("levelcrafter.theme");

    return isTheme(storedTheme) ? storedTheme : "neon";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("levelcrafter.theme", theme);
  }, [theme]);

  return (
    <div className="fixed right-3 top-3 z-50 flex gap-2">
      {themes.map((item) => (
        <button
          key={item}
          onClick={() => setTheme(item)}
          className={`border-2 border-black px-2 py-1 font-mono text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] ${
            theme === item
              ? "bg-yellow-300 text-black"
              : "bg-[#12122f] text-cyan-100"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
