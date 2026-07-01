import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faArrowRight,
  faRocket,
  faHandshake,
  faBolt,
  faStar,
  faMobileScreen,
  faServer,
  faCode,
  faMobileScreenButton,
  faCloud,
  faShieldHalved,
  faUserShield,
  faUser,
  faLock,
  faEye,
  faEyeSlash,
  faArrowLeft,
  faVideo,
  faGear,
  faEnvelope,
  faPhone,
  faLocationDot,
  faPaperPlane,
  faSpinner,
  faCircleCheck,
  faCircleExclamation,
  faArrowRotateRight,
  faMagnifyingGlass,
  faFileLines,
  faDownload,
  faTrash,
  faBriefcase,
  faTriangleExclamation,
  faHouse,
  faUsers,
  faRobot,
  faSeedling,
  faWind,
  faDesktop,
  faClock,
  faMedal,
  faPlay,
  // ===== ADD THESE FOR THE RESPONSIBLE SIDEBAR TO WORK =====
  faBars,
  faXmark,
  // ===== ADD THESE FOR THE CAREERS / ADMIN DASHBOARD TO WORK =====
  faGlobe,
  faInbox,
  faPenToSquare,
  faClipboardList,
  faPlus,
  faArrowUpRightFromSquare,
  faBell
} from '@fortawesome/free-solid-svg-icons'

import {
  faUser as faUserRegular,
  faEnvelope as faEnvelopeRegular,
  faComment,
} from '@fortawesome/free-regular-svg-icons'

import {
  faReact,
  faNodeJs,
  faPython,
  faAws,
  faDocker,
  faGoogle,
  faJira,
  faVuejs,
  faJava,
  faHtml5,
  faCss3Alt,
  faWordpress,
} from '@fortawesome/free-brands-svg-icons'

library.add(
    // Chevrons & arrows
    faChevronLeft,
    faChevronRight,
    faChevronDown,
    faArrowRight,
    faArrowLeft,

    // General
    faRocket,
    faHandshake,
    faBolt,
    faStar,
    faCode,
    faCloud,
    faServer,
    faGear,
    faVideo,
    faHouse,
    faUsers,
    faRobot,
    faClock,
    faMedal,
    // ===== ADD THESE IN THE LIBRARY ARRAY =====
    faBars,
    faXmark,

    // Mobile
    faMobileScreen,
    faMobileScreenButton,

    // Auth
    faShieldHalved,
    faUserShield,
    faUser,
    faLock,
    faEye,
    faEyeSlash,

    // Contact form
    faEnvelope,
    faPhone,
    faLocationDot,
    faPaperPlane,
    faSpinner,
    faCircleCheck,
    faCircleExclamation,

    // Regular icons (far)
    faUserRegular,
    faEnvelopeRegular,
    faComment,

    // Brands
    faReact,
    faNodeJs,
    faPython,
    faAws,
    faDocker,
    faGoogle,
    faJira,
    faVuejs,
    faJava,
    faHtml5,
    faCss3Alt,
    faWordpress,
    faSeedling,
    faWind,
    faDesktop,
    faArrowRotateRight,
    faMagnifyingGlass,
    faFileLines,
    faDownload,
    faTrash,
    faBriefcase,
    faTriangleExclamation,

    // ===== Careers / Admin Dashboard (header, stat cards, tabs, table, CV applications) =====
    faGlobe,
    faInbox,
    faPenToSquare,
    faClipboardList,
    faPlus,
    faArrowUpRightFromSquare,
    faBell,
    faPlay

)