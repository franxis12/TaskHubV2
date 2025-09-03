import React from "react";

function Button({ children, icon, onClick, disabled, color, position }) {
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
  };
  const positionSelected = {
    center: "justify-center",
    right: "justify-end",
    left: "justify-start",
  };

  const btnColor = colorPick[color];
  const justify = positionSelected[position];

  return (
    <>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center ${justify}  text-xs gap-2 px-2 rounded-xl h-11 hover:font-semibold justify-center ${
          btnColor !== undefined
            ? btnColor
            : "border-1 border-slate-500/20 hover:bg-black/25"
        }`}
      >
        {icon && <SVGIcon className={` w-5 h-5`} />}
        {children}
      </button>
    </>
  );
}

export default Button;
