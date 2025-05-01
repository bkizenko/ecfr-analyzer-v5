import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [],
  theme: {
    extend: {
      fontFamily: {
        title: "var(--title-font)",
      },
      colors: {
        light: {
          DEFAULT: "var(--light-color)",
          50: "var(--light-shade-50)",
          100: "var(--light-shade-100)",
          200: "var(--light-shade-200)",
          300: "var(--light-shade-300)",
        },
        primary: {
          DEFAULT: "var(--primary-color)",
          50: "var(--primary-shade-50)",
          100: "var(--primary-shade-100)",
          200: "var(--primary-shade-200)",
          300: "var(--primary-shade-300)",
          400: "var(--primary-shade-400)",
          500: "var(--primary-shade-500)",
          600: "var(--primary-shade-600)",
          700: "var(--primary-shade-700)",
          800: "var(--primary-shade-800)",
          900: "var(--primary-shade-900)",
          950: "var(--primary-shade-950)",
        },
        accent: {
          DEFAULT: "var(--accent-color)",
          50: "var(--accent-shade-50)",
          100: "var(--accent-shade-100)",
          200: "var(--accent-shade-200)",
          300: "var(--accent-shade-300)",
          400: "var(--accent-shade-400)",
          500: "var(--accent-shade-500)",
          600: "var(--accent-shade-600)",
          700: "var(--accent-shade-700)",
          800: "var(--accent-shade-800)",
          900: "var(--accent-shade-900)",
          950: "var(--accent-shade-950)",
        },
      },
    },
  },
} satisfies Config;
