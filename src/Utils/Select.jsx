import React from "react";
import "../styles/select.css";

function Select({
  defaultValue,
  onChange,
  placeholder,
  id,
  type,
  classNameExtra,
  labelName,
  iconPick,
  hasIcon,
  value,
  cols,
  current,
  options,
  optionsVal,
  nameOpt,
  optionsMap,

  expandedId,
  setExpandedId,
}) {
  const isExpanded = expandedId === current;

  const selectBase = `bg-white block  p-2 gap-2 rounded-xl items-center`;

  return (
    <div className={`flex flex-wrap w-fit gap-2 h-fit`}>
      <label htmlFor={id} className=" text-xs font-medium text-slate-600">
        {labelName}
      </label>
      <select
        id={id}
        className={"selectClass"}
        value={value}
        onChange={onChange}
        onClick={() => setExpandedId(isExpanded ? null : current)}
      >
        {options.map((element) => (
          <option key={element.nameOpt} value={element.optionsVal}>
            {element.nameOpt}
          </option>
        ))}
        {optionsMap &&
          optionsMap.map((u) => (
            <option key={u.uid} value={u.uid}>
              {u.name}
            </option>
          ))}
      </select>
    </div>
  );
}

export default Select;
