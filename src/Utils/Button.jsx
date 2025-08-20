import React from "react";
const iconsFolder = "";
import infoIcon from "../assets/iconsv2/circle-info-solid-full.svg";
import { ReactComponent as Gear } from "../assets/iconsv2/gear-solid-full.svg?react";

<Gear className="h-5 w-5 text-emerald-600" />;
function Button({ onClick, btnName, classNameExtra }) {
  return (
    <>
      <button onClick={onClick} className={`btn btn-primary`}>
        <Gear />
        {btnName || "Add btnName"}
        {/*<img src={infoIcon} />*/}
      </button>
    </>
  );
}

export default Button;
