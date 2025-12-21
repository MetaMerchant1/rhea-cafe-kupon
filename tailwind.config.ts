import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#fdf6e3',
          100: '#f5e6c8',
          200: '#e8d4a8',
          300: '#d4b896',
          400: '#b8956f',
          500: '#6F4E37',
          600: '#5c4030',
          700: '#4a3427',
          800: '#3a291f',
          900: '#2a1f17',
        },
      },
    },
  },
  plugins: [],
};

export default config;
