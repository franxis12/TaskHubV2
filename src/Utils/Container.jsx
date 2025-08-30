import React from "react";

function Container({ className, children }) {
  return (
    <div
      className={`  bg-pages scrollbar-hide-x rounded-3xl overflow-y-auto overscroll-contain scroll-smooth no-scrollbar grid   ${className}  gap-2 shadow-2xl`}
    >
      {children}
    </div>
  );
}

export default Container;
