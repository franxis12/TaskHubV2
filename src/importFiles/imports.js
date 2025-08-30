//SVG icons components
import PublicIcon from "../assets/iconsV2/publicIcon.svg?react";
import PersonalIcon from "../assets/iconsV2/personalIcon.svg?react"
import CalendarIcon from "../assets/iconsV2/calendar-days-solid-full.svg?react"
import HighIcon from "../assets/iconsV2/priorHigh.svg?react"
import MediumIcon from "../assets/iconsV2/priorMedium.svg?react"
import LowIcon from "../assets/iconsV2/priorLow.svg?react"
import CircleQuestionIcon from "../assets/iconsV2/circle-question-solid-full.svg?react"
import NotesIcon from "../assets/iconsV2/note-sticky-solid-full.svg?react"
import ArrowTurnRight from "../assets/iconsV2/arrow-turn-right-solid-full.svg?react"
import PlusIcon from "../assets/iconsV2/plus-solid-full.svg?react"

//Images
import defaultUser from "../assets/default/default-userImg.jpg"

//Components

const SVGIcons = {
    public: PublicIcon,
    personal: PersonalIcon,
    calendar: CalendarIcon,
    priority:{
        low: LowIcon,
        med: MediumIcon,
        high: HighIcon,
        
    },
    question: CircleQuestionIcon,
    note: NotesIcon,
    arrowTurn: {
        right: ArrowTurnRight,
        left: ArrowTurnRight,//Pending change icon.
    },
    plus: PlusIcon,
}
const myImage = {
    defaultUser: defaultUser
}



export {SVGIcons, myImage};
