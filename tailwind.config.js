/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        // ... other color definitions
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      outlineColor: {
        ring: "var(--ring)",
      },
      spacing: {
        '22.5': '5.625rem', // 90px (22.5 * 4px)
        '32.5': '8.125rem', // 130px (32.5 * 4px)
      },
    },
  },
  plugins: [
    require('flowbite/plugin'),
    function({ addUtilities }) {
      const newUtilities = {
        '.outline-ring\\/50': {
          outline: '2px solid var(--ring)',
          outlineColor: 'rgb(var(--ring) / 0.5)',
        },
      };
      addUtilities(newUtilities);
    },
  ],
}

