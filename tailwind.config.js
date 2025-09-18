/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* === Base colors === */
        primaryBlue: "var(--primaryBlue)",
        primaryBlueTransparent: "var(--primaryBlueTransparent)",
        secondaryBlue: "var(--secondaryBlue)",
        surface: "var(--componentsBG)",

        /* States / actions */
        danger: "var(--dangerActionsRed)",
        dangerTransparent: "var(--dangerActionsRedTransparent)",
        warning: "var(--warningActionsYellow)",
        warningTransparent: "var(--warningActionsYellowTransparent)",

        /* Borders */
        borderYellow: "var(--borderYellow)",
        borderBlue: "var(--borderBlue)",
        borderRed: "var(--borderRed)",

        /* User states */
        available: "var(--availableColor)",
        offline: "var(--oflineColor)",
        busy: "var(--busyColor)",

        /* Neutral / info */
        neutro: "var(--neutroColor)",
        neutroBorder: "var(--neutroColorBorder)",
        neutroHover: "var(--neutroColorHover)",
        info: "var(--bg-infoColor)",

        /* Primary brand */
        primary: "var(--primaryColor)",
        primaryBorder: "var(--primaryColorBorder)",
        primaryHover: "var(--primaryColorHover)",
        primaryText: "var(--PrimaryTextColor)",

        /* Other helpers */
        textColor: "var(--textColor)",
        pagesBackground: "var(--pagesBackground)",

        /* Custom colors you had */
        orange: "#f15b2a",
        teal: "#247881",
        yellow: "#f9a825",
      },
      fontFamily: {
        primary: ["var(--font-primary)", "cursive"],
        secondary: ["var(--font-secondary)", "cursive"],
      },
      boxShadow: {
        component: "var(--shadowComponents)",
      },
    },
  },
  plugins: [],
}
