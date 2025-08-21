import React from "react";

function Container() {
  return (
    <div className="min-w-20 min-h-20 bg-pages rounded-xl grid grid-cols-3 gap-2 ">
      <div className="col-span-1 bg-amber-300 rounded-xl"></div>
      <div className="col-span-1 bg-amber-300 rounded-xl"></div>
      <div className="col-span-1 bg-amber-300 rounded-xl grid-flow-row"></div>
    </div>
  );
}

export default Container;
