import React from "react";

function Button({
  children,
  icon,
  onClick,
  disabled,
  color,
  position,
  id,
  type,
  title,
  iconSize,
  ariaLabel,
}) {
  const SVGIcon = icon;
  const colorPick = {
    orange:
      "bg-[var(--orange)] text-white hover:text-[var(--orange)] border-2 border-[var(--orange)] hover:bg-[var(--orange-trasparent)]/50 ",
    yellow:
      "bg-[var(--yellow)] text-white hover:text-[var(--yellow)] border-2 border-[var(--yellow)] hover:bg-[var(--yellow-trasparent)]/50 ",
    green:
      "bg-[var(--greenMain)] text-white hover:text-[var(--greenMain)] border-2 border-[var(--greenMain)] hover:bg-[var(--green-trasparent)]/50 ",
    white:
      "bg-white text-black border-1 border-black hover:bg-black hover:text-white hover:border-white ",
    black:
      "bg-black text-white border-1 border-white hover:bg-white hover:text-black hover:border-black",
    autoInverse:
      "bg-[var(--textColorInverse)] text-[var(--textColor)] border-1 border-[var(--textColor)] hover:bg-[var(--textColor)] hover:text-[var(--textColorInverse)] hover:border-[var(--textColorInverse)]",
    auto: "bg-[var(--textColor)] text-[var(--textColorInverse)] border-1 border-[var(--textColorInverse)] hover:bg-[var(--textColorInverse)] hover:text-[var(--textColor)] hover:border-[var(--textColor)]",
    disable: "cursor-not-allowed",
    iconGreen:
      "hover:text-[var(--greenMain)] hover:border-1 hover:border-slate-500/20",
  };
  const positionSelected = {
    center: "justify-center",
    right: "justify-end",
    left: "justify-start",
  };

  const iconSizePick = {
    2: "w-2 h-2",
    3: "w-3 h-3",
    4: "w-4 h-4",
    5: "w-5 h-5",
    6: "w-6 h-6",
    7: "w-7 h-7",
    8: "w-8 h-8",
    9: "w-9 h-9",
    10: "w-10 h-10",
  };

  const btnColor = colorPick[color];
  const justify = positionSelected[position];
  const iconSizeSelected = iconSizePick[iconSize];

  return (
    <>
      <button
        id={id}
        type={type}
        onClick={onClick}
        disabled={disabled}
        title={title}
        aria-label={ariaLabel}
        className={`flex items-center ${justify}  text-sm gap-2 px-3 rounded-xl h-11 hover:font-semibold justify-center ${
          btnColor !== undefined
            ? btnColor
            : "border-1 border-slate-500/20 hover:bg-black/25"
        }`}
      >
        {icon && (
          <SVGIcon
            className={
              iconSizeSelected !== undefined ? iconSizeSelected : "w-5 h-5"
            }
          />
        )}
        {children}
      </button>
    </>
  );
}

export default Button;
/*Este boton necesita las siguientes dependencias para funcionar correctamente
  1. npm i -D vite-plugin-svgr con esto ahora podras usar los iconos como componentes 
  2. Edita el vite.config.js y importa vite-plugin-svgr.
       Ejemplo:    import { defineConfig } from "vite";
                   import react from "@vitejs/plugin-react";
                   import svgr from "vite-plugin-svgr";   <-- ***** Esta linea ***** )

                   export default defineConfig({
                   plugins: [
                     react(),
                     svgr({    <-- ***** Deste aqui ***** )
                       svgrOptions: {
                         // 1) If a path contains #000, replace it
                         replaceAttrValues: { "#000": "currentColor", "#000000": "currentColor", black: "currentColor" },
                         // 2) Also add fill="currentColor" to the <svg>
                         svgProps: { fill: "currentColor" },
                       },
                     }),        <-- ***** Hasta aqui ***** )
                   ],
                   });
   3. En tu css agrega las clases .btn y btn-primary y ajustalas a tu preferencia.*/
