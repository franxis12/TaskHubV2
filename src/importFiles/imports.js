//./src/importFiles/imports.js
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
import PendingIcon from "../assets/iconsV2/clock-solid-full.svg?react"
import CompleteIcon from "../assets/iconsV2/check-solid-full.svg?react"
import MissedIcon from "../assets/iconsV2/xmark-solid-full.svg?react"
import ProgressIcon from "../assets/iconsV2/spinner-solid-full.svg?react"
import arrowDown from "../assets/iconsV2/arrowDown.svg?react"
import arrowUp from "../assets/iconsV2/arrowUp.svg?react"
import timeLeft from "../assets/iconsV2/stopwatch-20-solid-full.svg?react"
import openIcon from "../assets/iconsV2/bars-solid-full.svg?react";
import closeIcon from "../assets/iconsV2/ellipsis-vertical-solid-full.svg?react";
import home from "../assets/iconsV2/house-solid-full.svg?react";
import teams from "../assets/iconsV2/people-group-solid-full.svg?react";
import stats from "../assets/iconsV2/chart-simple-solid-full.svg?react";
import logout from "../assets/iconsV2/right-from-bracket-solid-full.svg?react";
import setting from "../assets/iconsV2/gears-solid-full.svg?react";
import addPublic from "../assets/iconsV2/addPublic-Icon.svg?react";
import addPersonal from "../assets/iconsV2/AddPersonal-icon.svg?react";
import tasklistIcon from "../assets/iconsV2/list-check-solid-full.svg?react";
import commentIcon from "../assets/iconsV2/comment-solid-full.svg?react";


//Images
import defaultUser from "../assets/default/default-userImg.jpg"
import logo from "../assets/LOGO.svg?react";

const SVGIcons = {
    public: PublicIcon,
    personal: PersonalIcon,
    addPublic: addPublic,
    addPersonal: addPersonal,
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
    },
    arrow:{
        up: arrowUp,
        down: arrowDown,
    },
    plus: PlusIcon,
    status:{
        completed: CompleteIcon,
        pending: PendingIcon,
        missed: MissedIcon,
        progress : ProgressIcon,
    },
    x: MissedIcon,
    timeLeft: timeLeft,
    menu:{
        open:openIcon,
        close: closeIcon,
    },
    home: home,
    team: teams,
    stast: stats,
    logout: logout,
    setting: setting,
    tasklist: tasklistIcon,
    chat: commentIcon,

    
}

const myImage = {
    defaultUser: defaultUser,
    logo: logo,
}




export {SVGIcons, myImage};
