/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        xqblue: {
          light: "#3B82F6",
          DEFAULT: "#2563EB",
          dark: "#1D4ED8",
        },
        xqcyan: {
          light: "#22D3EE",
          DEFAULT: "#06B6D4",
          dark: "#0891B2",
        },
        xqpurple: {
          light: "#A78BFA",
          DEFAULT: "#8B5CF6",
          dark: "#7C3AED",
        },
        xqdark: {
          light: "#1E293B",
          DEFAULT: "#0F172A",
          dark: "#020617",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
