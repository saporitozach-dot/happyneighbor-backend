/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        serif: ["Literata", "Georgia", "serif"],
      },
      colors: {
        stone: {
          850: "#292524",
          950: "#0c0a09",
        },
        sage: {
          50: "#f4f6f4",
          100: "#e4e9e2",
          200: "#c9d4c5",
          300: "#a3b59d",
          400: "#7a9472",
          500: "#5c7554",
          600: "#495d42",
          700: "#3c4b36",
          800: "#343e2e",
          900: "#2d3528",
        },
        warm: {
          50: "#faf8f5",
          100: "#f2ede5",
          200: "#e5dccb",
        },
        accent: {
          DEFAULT: "#4a6b5a",
          light: "#5c7f6c",
          dark: "#3a5548",
        },
        citrus: {
          DEFAULT: "#c4915c",
          light: "#d4a574",
          muted: "#e8d4c4",
        },
        leaf: {
          DEFAULT: "#5c7f6c",
          light: "#7a9a85",
          dark: "#4a6b5a",
          pale: "#e8efe6",
        },
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
      },
      boxShadow: {
        soft: "0 2px 12px rgba(0,0,0,0.04)",
        card: "0 1px 3px rgba(0,0,0,0.06)",
        cardHover: "0 4px 16px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
