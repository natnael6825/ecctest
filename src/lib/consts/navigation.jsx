import {
  HiOutlineViewGrid,
  HiOutlineQuestionMarkCircle,
  HiOutlineCog,
} from "react-icons/hi";
import { VscGraphLine } from "react-icons/vsc";
import { RiNumbersLine } from "react-icons/ri";
import { MdOutlineCalendarMonth } from "react-icons/md";
import { BsCalendar3Range } from "react-icons/bs";
import { GrTransaction } from "react-icons/gr";

export const ANALYTICS_SIDEBAR_LINKS = [
  {
    key: "products",
    label: "Overall",
    path: "/Overall",
    icon: <VscGraphLine />,
  },
  {
    key: "mainCommodity",
    label: "Main Commodity",
    path: "/mainCommodity",
    icon: <VscGraphLine />,
  },
  {
    key: "spice",
    label: "Spice",
    path: "/Spice",
    icon: <VscGraphLine />,
  },
  {
    key: "fruit",
    label: "Fruit",
    path: "/Fruit",
    icon: <VscGraphLine />,
  },
  {
    key: "pulse",
    label: "Pulse",
    path: "/Pulse",
    icon: <VscGraphLine />,
  },
  {
    key: "oilseed",
    label: "Oil Seed",
    path: "/OilSeed",
    icon: <VscGraphLine />,
  },
  {
    key: "vegetable",
    label: "Vegetable",
    path: "/Vegetable",
    icon: <VscGraphLine />,
  },
  {
    key: "rootcrop",
    label: "Root Crop",
    path: "/RootCrop",
    icon: <VscGraphLine />,
  },
  {
    key: "buildingmaterils",
    label: "Building Materils",
    path: "/BuildingMaterils",
    icon: <VscGraphLine />,
  },
  {
    key: "grainsandcereals",
    label: "Grains And Cereals",
    path: "/GrainsAndCereals",
    icon: <VscGraphLine />,
  },
  {
    key: "userandnews",
    label: "User And News",
    path: "/UserAndNews",
    icon: <VscGraphLine />,
  },
];

export const OFFER_MANAGEMENT_SIDEBAR_LINKS = [
  {
    key: "adminPosingForm",
    label: "Post Offer",
    path: "/ankuaru/postOffer",
    icon: <RiNumbersLine />,
  },

  {
    key: "listOffer",
    label: "List Offer",
    path: "/ankuaru/listOffer",
    icon: <RiNumbersLine />,
  },
];

export const PRODUCT_MANAGEMENT_SIDEBAR_LINKS = [
  {
    key: "createProduct",
    label: "Create Product",
    path: "/ankuaru/createProduct",
    icon: <RiNumbersLine />,
  },
  {
    key: "createProperty",
    label: "Create Property",
    path: "/ankuaru/createProperty",
    icon: <RiNumbersLine />,
  },
  {
    key: "createPropertyvalue",
    label: "Create Property Value",
    path: "/ankuaru/createPropertyValue",
    icon: <RiNumbersLine />,
  },
  {
    key: "productPrice",
    label: "Product Price",
    path: "/ankuaru/productPrice",
    icon: <RiNumbersLine />,
  },
  {
    key: "productValueCalc",
    label: "Product Value Calculator",
    path: "/ankuaru/productValueCalc",
    icon: <RiNumbersLine />,
  },
];

export const CONTENT_MANAGEMENT_SIDEBAR_LINKS = [
  {
    key: "createPost",
    label: "Create Post",
    path: "/ankuaru/createPost",
    icon: <RiNumbersLine />,
  },
  {
    key: "preViewPosts",
    label: "Preview Posts",
    path: "/ankuaru/preViewPosts",
    icon: <RiNumbersLine />,
  },
  {
    key: "addExchangeRate",
    label: "Add Exchange Rate",
    path: "/ankuaru/addExchangeRate",
    icon: <RiNumbersLine />,
  },
  {
    key: "PostStatistics",
    label: "Post Statistics",
    path: "/ankuaru/postStatistics",
    icon: <RiNumbersLine />,
  },
];

export const USER_MANAGEMENT_SIDEBAR_LINKS = [
  {
    key: "addAdmin",
    label: "Add Admin",
    path: "/ankuaru/addAdmin",
    icon: <RiNumbersLine />,
  },
  {
    key: "removeAdmin",
    label: "Remove Admin",
    path: "/ankuaru/removeAdmin",
    icon: <RiNumbersLine />,
  },
  {
    key: "users",
    label: "Users",
    path: "/ankuaru/users",
    icon: <RiNumbersLine />,
  },
];

export const DASHBOARD_SIDEBAR_BOTTOM_LINKS = [];

export const DASHBOARD_TABS = [
  {
    key: "monthlyPost",
    label: "Monthly Post Trends",
  },
  {
    key: "monthlyView",
    label: "Monthly View Trends",
  },
  {
    key: "PostByProduct",
    label: "Post by Product",
  },
  {
    key: "ViewByProduct",
    label: "View by Product",
  },
  {
    key: "TopUsers",
    label: "Top 10 Users",
  },
  {
    key: "PostToViewRatio",
    label: "View to Post Ratio",
  },
  {
    key: "PostToViewRatioByProduct",
    label: "View to Post Ratio By Product",
  },
  {
    key: "QuantityTrendByMonth",
    label: "Quantity Trends by Month",
  },
  {
    key: "QuantityTrendByProduct",
    label: "Quantity Trends by Product",
  },
];

export const NEWS_TABS = [
  {
    key: "newsViewCount",
    label: "News View Count",
  },
  {
    key: "allUsers",
    label: "Registered User List",
  },
  {
    key: "registeredUsersByMonth",
    label: "User Registration Trend",
  },
  {
    key: "userToPostRatio",
    label: "User To Post Ratio",
  },
  {
    key: "PostInfo",
    label: "Post Information",
  },
  {
    key: "TotalViewForAdminPost",
    label: "Total View For Admin Post",
  },
  {
    key: "TotalViewForUserPost",
    label: "Total View For User Post",
  },
  {
    key: "TotalPostForUserPost",
    label: "Total User Post Per Day",
  },
  {
    key: "TotalPostForAdminPost",
    label: "Total Admin Post Per Day",
  },
  {
    key: "AvgProductValue",
    label: "Product Value",
  },
];

export const CONTENT_MANAGEMENT_TABS = [
  {
    key: "addExchangeRate",
    label: "Add Exchange Rate",
  },
  {
    key: "createPost",
    label: "Create Post",
  },
  {
    key: "postStatistics",
    label: "Post Statistics",
  },
  {
    key: "editPost",
    label: "Edit Post",
  },
  {
    key: "preViewPost",
    label: "Preview Post",
  },
];
