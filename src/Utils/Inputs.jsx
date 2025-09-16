import React, { useState } from "react";

function Inputs({
  icon,
  iconSize,
  placeholder,
  id,
  required,
  label,
  value,
  onChange,
  defaultValue,
  type,
  maxLength,
  accept,
  plain,
}) {
  const [focus, setFocus] = useState(false);
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
    <>
      <div className="">
        {label && (
          <label htmlFor={id} className="ml-2 font-medium flex items-center">
            {label}
            {required && label && !plain && (
              <span className="text-red-400">*</span>
            )}
            {!required && !plain && (
              <span className="text-slate-600 text-[12px] mt-1 ml-1">
                {" "}
                (Optional)
              </span>
            )}
          </label>
        )}
        <div
          className={`border rounded-xl flex items-center border-slate-400/50 gap-2 overflow-hidden bg-[var(--textColorInverse)] ${
            focus ? " shadow-[var(--shadowGreen)]" : ""
          }`}
        >
          <span className=" h-full p-2 ">
            {icon && (
              <SVGIconSelect
                className={
                  iconSizeSelected !== undefined
                    ? iconSizeSelected
                    : `w-5 h-5  `
                }
              />
            )}
          </span>
          <span className="w-full h-full p-2">
            <input
              className="w-full h-full outline-0 "
              placeholder={placeholder}
              id={id}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              value={value}
              onChange={onChange}
              required={required}
              defaultValue={defaultValue}
              type={type}
              maxLength={maxLength}
              accept={accept}
            />
          </span>
          {!label && required && !plain && (
            <span className="text-red-400 mr-4 mt-2 text-lg">*</span>
          )}
          {!required && !label && !plain && (
            <span className="text-slate-600 text-[12px] mr-4"> (Optional)</span>
          )}
        </div>
      </div>
    </>
  );
}

export default Inputs;
