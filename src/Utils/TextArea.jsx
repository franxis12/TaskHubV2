import React from "react";
import { SVGIcons } from "../importFiles/imports";

function TextArea({
  value,
  onChange,
  placeholder = "Text here",
  maxLength = 400,
  label,
  required,
  icon,
  iconSize,
}) {
  const SVGIconSelect = icon;
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
  const iconSizeSelected = iconSizePick[iconSize];

  return (
    <div className=" h-full max-h-54 overflow-hidden w-full  bg-[var(--textColorInverse)]  flex flex-col items-start gap-2 border  border-slate-400/50 rounded-xl">
      <span className=" text-black px-2 py-1 flex bg-slate-200 w-full rounded-t-xl items-center gap-2">
        {icon && (
          <SVGIconSelect
            className={
              iconSizeSelected !== undefined ? iconSizeSelected : `w-5 h-5  `
            }
          />
        )}
        {label && label}
        {required && <span className="text-red-400"> *</span>}
        {!required && (
          <span className="text-slate-600 text-[12px] mt-1 ml-1">
            (Optional)
          </span>
        )}
      </span>
      <textarea
        value={value}
        onChange={onChange}
        className={"textAreaBase" + " mb-2 min-h-full h-full no-scrollbar"}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    </div>
  );
}

export default TextArea;
