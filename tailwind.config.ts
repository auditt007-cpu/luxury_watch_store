import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#070707",
        gold: {
          DEFAULT: "#c9a227",
          soft: "#e6d5a0",
          dim: "#8a7020",
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', "Times New Roman", "serif"],
        sans: ['"Manrope"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(201,162,39,0.35), 0 20px 50px rgba(0,0,0,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
