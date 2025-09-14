import React from "react";
import { SVGIcons } from "../importFiles/imports";

function SubTaskCard({ st, idx, members, myImage }) {
  return (
    <li
      key={`${st.name}-${idx}`}
      className=" flex  items-start justify-between rounded-lg border border-slate-200  p-1 text-sm text-slate-800"
    >
      <div className="flex ">
        <div className="h-full w-5 ">
          <div className="bg-black text-white w-5 rounded-md items-center flex justify-center">
            {idx + 1}
          </div>
          <SVGIcons.arrowTurn.right className="w-4 h-full mr-3 ml-2" />
        </div>
        <div className=" flex flex-col ml-3 ">
          <div className="  text-[10px] text-slate-500 flex  gap-2 items-center justify-between ">
            {st.assignedTo && (
              <>
                <span className="inline-flex items-center gap-1 justify-between ">
                  {members.find((m) => m.uid === st.assignedTo)?.name || "?"}
                  <img
                    src={
                      members.find((m) => m.uid === st.assignedTo)?.photo ||
                      myImage.defaultUser
                    }
                    alt="assignee"
                    className="h-auto w-auto max-h-7 aspect-square rounded-full border "
                  />
                </span>
              </>
            )}
          </div>
          <div className="capitalize font-medium truncate mb-1 ">{st.name}</div>
        </div>
      </div>
    </li>
  );
}

export default SubTaskCard;
