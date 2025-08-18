/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* === Colores base === */
        primaryBlue: "var(--primaryBlue)",
        primaryBlueTransparent: "var(--primaryBlueTransparent)",
        secondaryBlue: "var(--secondaryBlue)",
        surface: "var(--componentsBG)",

        /* Estados / acciones */
        danger: "var(--dangerActionsRed)",
        dangerTransparent: "var(--dangerActionsRedTransparent)",
        warning: "var(--warningActionsYellow)",
        warningTransparent: "var(--warningActionsYellowTransparent)",

        /* Bordes */
        borderYellow: "var(--borderYellow)",
        borderBlue: "var(--borderBlue)",
        borderRed: "var(--borderRed)",

        /* Estados de usuario */
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

        /* Otros helpers */
        textColor: "var(--textColor)",
        pagesBackground: "var(--pagesBackground)",

        /* Colores custom que tenías */
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