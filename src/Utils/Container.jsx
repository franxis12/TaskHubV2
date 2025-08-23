import React from "react";

function Container({ cols, rows, children }) {
  return (
    <div
      className={` min-w-20 min-h-70  w-full bg-pages rounded-3xl overflow-y-scroll scroll-smooth no-scrollbar grid grid-cols-3  ${cols}  ${rows} gap-2 shadow-2xl`}
    >
      {children}
    </div>
  );
}

export default Container;
