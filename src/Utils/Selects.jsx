import React from "react";

function Selects({
  map,
  icon,
  iconSize,
  image,
  onChange,
  value,
  id,
  label,
  required,
  defaultVal,
  valueKey = "uid",
  labelKey = "name",
  iconColor,
  maxHeigh = "max-h-10",
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

  const iconColorPicker = {
    orange: "text-[var(--orange)]",
    green: "text-[var(--green)]",
    yellow: "text-[var(--yellow)]",
  };

  const iconSizeSelected = iconSizePick[iconSize];
  const iconColorSelected = iconColorPicker[iconColor];

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="ml-2 font-medium">
          {label}
          {required && <span className="text-red-400"> *</span>}
        </label>
      )}
      <div
        className={`border  border-slate-400/50 rounded-xl flex items-center ${maxHeigh} bg-[var(--textColorInverse)]`}
      >
        <span className="  h-full p-2 ">
          {icon && (
            <SVGIconSelect
              className={`
                ${
                  iconSizeSelected !== undefined
                    ? iconSizeSelected
                    : `w-5 h-5  `
                } ${iconColorSelected}`}
            />
          )}
          {image && !icon && (
            <img
              src={image}
              alt="assign"
              className="h-10 w-12 rounded-full outline-4  outline-[var(--bg-color-component)] object-cover"
            />
          )}
        </span>
        <select
          onChange={onChange}
          value={value}
          className="selectBase p-2 capitalize "
        >
          {defaultVal && <option value="">{defaultVal}</option>}
          {map.map((member) => (
            <option key={member[valueKey]} value={member[valueKey]}>
              {member[labelKey]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default Selects;
