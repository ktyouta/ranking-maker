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
        // 「文字色」に上書きされてしまう（同名セレクタでの衝突）。
        // それを避けるため canvas という別名にしている。
        //
        // 各値は固定hexではなくCSS変数（--xxx-rgb、index.css で [data-theme="..."] ごとに定義）
        // を参照する。テーマ切り替えは <html data-theme="..."> を付け替えるだけで、
        // ビルドし直さずに反映される（rgb(var(--x) / <alpha-value>) にすることで
        // bg-accent/50 のような透過度指定にも対応する）。
        canvas: "rgb(var(--canvas-rgb) / <alpha-value>)",
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
        accent: {
          DEFAULT: "rgb(var(--accent-rgb) / <alpha-value>)",
          hover: "rgb(var(--accent-hover-rgb) / <alpha-value>)",
          // ボタン・バッジ等の単色塗りつぶし専用（index.css 参照）
          surface: "rgb(var(--accent-surface-rgb) / <alpha-value>)",
          "surface-hover": "rgb(var(--accent-surface-hover-rgb) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--ink-rgb) / <alpha-value>)",
          sub: "rgb(var(--ink-sub-rgb) / <alpha-value>)",
        },
        line: "rgb(var(--line-rgb) / <alpha-value>)",
        // ヘッダーロゴ専用。ライト3テーマはaccentと同値、ダークのみ白にする
        brand: "rgb(var(--brand-rgb) / <alpha-value>)",
        // 金・銀・銅は順位演出の視認性を優先し、テーマに関わらず固定色にする
        // （docs/shared.md 禁止事項: 順位カラーとアクセントカラーを混色・近似させない）
        rank: {
          gold: "#B4881A",
          silver: "#7C8B92",
          bronze: "#A2653A",
        },
        // 削除等の破壊的操作用。色相は赤で固定し、ライト3テーマ共通・ダークのみ沈めた値にする
        danger: {
          DEFAULT: "rgb(var(--danger-rgb) / <alpha-value>)",
          bg: "rgb(var(--danger-bg-rgb) / <alpha-value>)",
          border: "rgb(var(--danger-border-rgb) / <alpha-value>)",
          fill: "rgb(var(--danger-fill-rgb) / <alpha-value>)",
          "fill-hover": "rgb(var(--danger-fill-hover-rgb) / <alpha-value>)",
        },
        // Dialog のアクセント強調ヘッダー用。ライト3テーマはアクセントカラーの薄塗り、
        // ダークは surface と同値にしてヘッダー・本体の区切りをなくす
        "modal-header": "rgb(var(--modal-header-rgb) / <alpha-value>)",
      },
      borderColor: {
        // 色指定のない `border` / `border-b` 等（Tailwindの既定では固定のgray-200相当）を
        // line トークンに揃える。ダークモード時に固定グレーの罫線が浮くのを防ぐ。
        DEFAULT: "rgb(var(--line-rgb) / <alpha-value>)",
      },
      ringColor: {
        DEFAULT: "rgb(var(--accent-rgb) / <alpha-value>)",
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

