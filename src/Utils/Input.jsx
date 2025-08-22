import React from "react";
import "../styles/input.css";
import searchIcon from "../assets/iconsV2/magnifying-glass-solid-full.svg?react";
import dateIcon from "../assets/iconsV2/calendar-days-solid-full.svg?react";
import { useState } from "react";

function Input({
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

  expandedId,
  setExpandedId,
}) {
  const [expanded, setExpanded] = useState("");
  //const [current, setCurrent] = useState("");
  const isExpanded = expandedId === current;

  const inputBase = `bg-white block flex p-2 gap-2 rounded-xl items-center  
  ${
    isExpanded
      ? `w-30 h-9 items-center justify-center shadow-lg border ${(cols = 1)}`
      : "w-10 h-9 items-center "
  } `;

  const iconsArr = {
    search: searchIcon,
    date: dateIcon,
  };

  const IconPicked = iconsArr[iconPick];

  return (
    <div className={`md:col-span-${cols} flex items-center`}>
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-medium text-slate-600"
      >
        {labelName}
      </label>
      <div className={inputBase}>
        {hasIcon && (
          <IconPicked
            className="icons h-full"
            onClick={() => setExpandedId(isExpanded ? null : current)}
          />
        )}
        {isExpanded && (
          <input
            id={id}
            type={type}
            className={` ${classNameExtra} w-full placeholder-slate-400 focus:outline-none text-sm `}
            placeholder={placeholder}
            defaultValue={defaultValue}
            onChange={onChange}
            aria-label="Search tasks"
            value={value}
          />
        )}
      </div>
    </div>
  );
}

export default Input;
