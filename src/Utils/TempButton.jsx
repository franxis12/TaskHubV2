import React from "react";

function TempButton({ children, icon, onClick, disabled, color }) {
  const SVGIcon = icon;
  const colorPick = {
    orange:
      "bg-[var(--orange)] text-white border-2 border-[var(--orange)] hover:bg-[var(--orange-trasparent)]/50 ",
    yellow:
      "bg-[var(--yellow)] text-white border-2 border-[var(--yellow)] hover:bg-[var(--yellow-trasparent)]/50 ",
    green:
      "bg-[var(--greenMain)] text-white border-2 border-[var(--greenMain)] hover:bg-[var(--green-trasparent)]/50 ",
    white: "bg-white text-black border-2 border-black hover:bg-white/25 ",
    black: "bg-black text-white",
    autoInverse: "bg-[var(--textColorInverse)]",
    auto: "bg-[var(--textColor)] tex-[var(--textColorInverse)]",
  };

  const btnColor = colorPick[color];
  console.log(btnColor);

  return (
    <>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center justify-center  text-xs gap-2 rounded-2xl h-9 hover:font-semibold ${
          btnColor !== undefined ? btnColor : "border hover:bg-white/50"
        }`}
      >
        {icon && <SVGIcon className={` w-5 h-5`} />}
        {children}
      </button>
    </>
  );
}

export default TempButton;
