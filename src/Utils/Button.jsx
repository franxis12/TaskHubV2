import React from "react";
import settingIcon from "../assets/iconsV2/gear-solid-full.svg?react";
import infoIcon from "../assets/iconsV2/circle-info-solid-full.svg?react";
import homeIcon from "../assets/iconsV2/house-solid-full.svg?react";
import userIcon from "../assets/iconsV2/user-solid-full.svg?react";
import addPersonal from "../assets/iconsV2/AddPersonal-icon.svg?react"; //**//
import addPublic from "../assets/iconsV2/addPublic-Icon.svg?react"; //**//

import "../styles/button.css";

function Button({
  onClick,
  btnName,
  classNameExtra,
  iconPicked,
  hasIcon,
  btnType,
  disabled,
}) {
  const iconPick = {
    setting: settingIcon,
    info: infoIcon,
    dashboard: homeIcon,
    user: userIcon,
    addPersonal: addPersonal,
    addPublic: addPublic,
  };
  const buttonType = {
    primary: "btn-prima border",
    secondary: "btn-second text-4xl",
    danger: "btn-danger",
    orange:
      "btn-orange bg-orange text-white min-w-20 items-center justify-center",
    green: "btn-gree bg-teal  text-white min-w-20 items-center justify-center",
    yellow:
      "btn-yellow bg-yellow text-white min-w-20 items-center justify-center",
    edit: "btn-edit bg-white text-white min-w-20 items-center justify-center",
    icon: "icon", //Pending
    link: "link", //Pending
  };

  const btnSelected = buttonType[btnType];
  const IconComponent = iconPick[iconPicked];

  return (
    <>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${btnSelected} ${classNameExtra} text-3xl `}
      >
        {hasIcon && <IconComponent className={`iconColor w-10 h-5 m-1  `} />}{" "}
        {/*Pending create .iconColor class for dinamyc color changed*/}
        {btnName}
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
                         // 1) Si un path trae #000, reemplázalo
                         replaceAttrValues: { "#000": "currentColor", "#000000": "currentColor", black: "currentColor" },
                         // 2) Además, agrega fill="currentColor" al <svg>
                         svgProps: { fill: "currentColor" },
                       },
                     }),        <-- ***** Hasta aqui ***** )
                   ],
                   });
   3. En tu css agrega las clases .btn y btn-primary y ajustalas a tu preferencia.
  
                   
                    




*/
