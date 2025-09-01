const inputs = "h-16px";
const darkAndLight = "inline-block h-5 w-5 align-[-2px] text-[var(--textColorInverse)] w-10 h-7";
const iconsWhite = "inline-block h-5 w-5 align-[-2px] text-white w-10 h-7";
const iconsBlack = "inline-block h-5 w-5 align-[-2px] text-black w-10 h-7";

const badgeGreen = " px-2 rounded-3xl whitespace-nowrap text-[var(--greenMain)] bg-[var(--green-trasparent)] border border-[var(--greenMain) font-bold text-[12px]";
const badgeYellow = " rounded-3xl whitespace-nowrap text-[var(--yellow)] bg-[var(--yellow-trasparent)] border border-[var(--yellow) font-bold text-[12px]";
const badgeOrange = " rounded-3xl whitespace-nowrap text-[var(--orange)] bg-[var(--orange-trasparent)] border border-[var(--orange) font-bold text-[12px]";

const stsBadge = "rounded-t-lg border border-slate-700/50 flex items-center overflow-hidden pr-1 min-w-25  min-h-6 gap-1 h-6"
const stsBadgeChildren_1 = "bg-black text-white h-full flex items-center justify-center w-7"
const stsBadgeChildren_2 = " text-[var(--textColor)] capitalize font-semibold text-xs"

const priorBadge = "rounded-b-lg border border-slate-700/50 flex items-center overflow-hidden pr-1 min-w-25  min-h-6 gap-1 h-6"
const priorBadgeChildren_1 = "bg-black text-white h-full flex items-center justify-center w-7"
const priorBadgeChildren_2 = " text-[var(--textColor)] capitalize font-semibold text-xs"

const timeBadge = "border border-slate-700/50 flex items-center overflow-hidden pr-1 min-w-25  min-h-6 gap-1 h-6"
const timeBadgeChildren_1 = "bg-black text-white h-full flex items-center justify-center w-7"
const timeBadgeChildren_2 = " text-[var(--textColor)] capitalize font-semibold text-xs"

const tailwindClass = {
    inputs: inputs,
    icon: {
       darkLight: darkAndLight,
       dark: iconsBlack,
       light: iconsWhite,
    },
    badge: {
        green: badgeGreen,
        yellow: badgeYellow,
        orange: badgeOrange,
    },
    status: {
        parent: stsBadge,
        children1: stsBadgeChildren_1,
        children2: stsBadgeChildren_2,
    },
    priority:{
        parent: priorBadge,
        children1: priorBadgeChildren_1,
        children2: priorBadgeChildren_2,
    },
    time:{
        parent: timeBadge,
        children1: timeBadgeChildren_1,
        children2: timeBadgeChildren_2,
    },

    
}

export {tailwindClass};
