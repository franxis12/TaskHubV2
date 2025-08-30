const inputs = "h-16px";
const icons = "mr-2 inline-block h-5 w-5 align-[-2px] text-[var(--textColor)]";
const badgeGreen = "px-1 rounded-3xl whitespace-nowrap text-[var(--greenMain)] bg-[var(--green-trasparent)] border border-[var(--greenMain) font-bold text-[12px]";
const badgeYellow = "px-1 rounded-3xl whitespace-nowrap text-[var(--yellow)] bg-[var(--yellow-trasparent)] border border-[var(--yellow) font-bold text-[12px]";
const baggeOrange = "px-1 rounded-3xl whitespace-nowrap text-[var(--orange)] bg-[var(--orange-trasparent)] border border-[var(--orange) font-bold text-[12px]";

const tailwindClass = {
    inputs: inputs,
    icons: icons,
    badge: {
        green: badgeGreen,
        yellow: badgeYellow,
        orange: baggeOrange
    },
}

export {inputs, tailwindClass};