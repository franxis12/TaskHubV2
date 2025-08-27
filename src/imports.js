//SVG icons components
import PublicIcon from "./assets/iconsV2/publicIcon.svg?react";
import CalendarIcon from "./assets/iconsV2/calendar-days-solid-full.svg?react"
import HighIcon from "./assets/iconsV2/priorHigh.svg?react"
import MediumIcon from "./assets/iconsV2/priorMedium.svg?react"
import LowIcon from "./assets/iconsV2/priorLow.svg?react"
import CircleQuestionIcon from "./assets/iconsV2/circle-question-solid-full.svg?react"
import NotesIcon from "./assets/iconsV2/note-sticky-solid-full.svg?react"
import ArrowTurnRight from "./assets/iconsV2/arrow-turn-right-solid-full.svg?react"
//Images
import defaultUser from "./assets/default/default-userImg.jpg"

const SVGIcons = {
    public: PublicIcon,
    calendar: CalendarIcon,
    low: LowIcon,
    med: MediumIcon,
    high: HighIcon,
    question: CircleQuestionIcon,
    note: NotesIcon,
    arrowTurn: {
        right: ArrowTurnRight,
        left: ArrowTurnRight,
    },
}
const myImage = {
    defaultUser: defaultUser
}


export {SVGIcons, myImage};
