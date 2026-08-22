export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx,stories.tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tailwind のデフォルト fontSize スケールに "base" キーが存在するため、
        // colors.base にすると `.text-base` の意味が「文字サイズ 1rem」から
        // 「文字色 #F2FAF9」に上書きされてしまう（同名セレクタでの衝突）。
        // それを避けるため canvas という別名にしている。
        canvas: "#F2FAF9",
        surface: "#FFFFFF",
        accent: {
          DEFAULT: "#0F9E93",
          hover: "#0B7A72",
        },
        ink: {
          DEFAULT: "#12302E",
          sub: "#4B6C69",
        },
        line: "#D9EEEB",
        rank: {
          gold: "#B4881A",
          silver: "#7C8B92",
          bronze: "#A2653A",
        },
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-from-top": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-from-bottom": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-from-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-from-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.3s ease-out",
        "slide-in-from-left": "slide-in-from-left 0.3s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.3s ease-out",
      },
    },
  },
  plugins: [],
}

