import React, { useState } from "react";
import DashboardStatusGrid from "./UserAndNews/DashboardStatusGrid";
import { NEWS_TABS } from "../lib/consts/navigation";
import UserAndNews from "./UserAndNews/NewsViewCount";
import AllUsers from "./UserAndNews/AllUsers";
import RegisteredUsersByMonth from "./UserAndNews/RegisteredUsersByMonth";
import UserToPostRatio from "./UserAndNews/UserToPostRatio";
import PostInfo from "./UserAndNews/PostInfo";
import TotalViewForAdmin from "./UserAndNews/TotalViewForAdmin";
import TotalViewForUser from "./UserAndNews/TotalViewForUser";
import AvgProductValue from "./UserAndNews/AvgProductValue";
import DailyUserPostsChart from "./UserAndNews/TotalPostForUser";
import DailyAdminPostsChart from "./UserAndNews/TotalPostForAdmin";

function MainCommodity() {
  const [activeTab, setActiveTab] = useState(NEWS_TABS[0].key);

  const renderTabContent = () => {
    switch (activeTab) {
      case "newsViewCount":
        return (
          <div className="h-full w-full bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
            <strong className="text-gray-900 font-bold text-center text-2xl">
              News View Count
            </strong>
            <div className="mt-3 w-full flex-1 text-xs">
              <UserAndNews />
            </div>
          </div>
        );
      case "allUsers":
        return (
          <div className="h-full w-full bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
            <strong className="text-gray-900 font-bold text-center text-2xl">
              All Users List
            </strong>
            <div className="mt-3 w-full flex-1 text-xs">
              <AllUsers />
            </div>
          </div>
        );
      case "registeredUsersByMonth":
        return (
          <div className="h-full w-full bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
            <strong className="text-gray-900 font-bold text-center text-2xl">
              User Registration Trend
            </strong>
            <div className="mt-3 w-full flex-1 text-xs">
              <RegisteredUsersByMonth />
            </div>
          </div>
        );
      case "userToPostRatio":
        return (
          <div className="h-full w-full bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
            <strong className="text-gray-900 font-bold text-center text-2xl">
              User To Post Ratio
            </strong>
            <div className="mt-3 w-full flex-1 text-xs">
              <UserToPostRatio />
            </div>
          </div>
        );
      case "PostInfo":
        return (
          <div className="h-full w-full bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
            <strong className="text-gray-900 font-bold text-center text-2xl">
              Post Information
            </strong>
            <div className="mt-3 w-full flex-1 text-xs">
              <PostInfo />
            </div>
          </div>
        );
      case "TotalViewForAdminPost":
        return (
          <div className="h-full w-full bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
            <strong className="text-gray-900 font-bold text-center text-2xl">
              Total View For Admin Post
            </strong>
            <div className="mt-3 w-full flex-1 text-xs">
              <TotalViewForAdmin />
            </div>
          </div>
        );
      case "TotalViewForUserPost":
        return (
          <div className="h-full w-full bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
            <strong className="text-gray-900 font-bold text-center text-2xl">
              Total View For User Post
            </strong>
            <div className="mt-3 w-full flex-1 text-xs">
              <TotalViewForUser />
            </div>
          </div>
        );
      case "AvgProductValue":
        return (
          <div className="h-full w-full bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
            <strong className="text-gray-900 font-bold text-center text-2xl">
              Product Value
            </strong>
            <div className="mt-3 w-full flex-1 text-xs">
              <AvgProductValue />
            </div>
          </div>
        );
      case "TotalPostForUserPost":
        return (
          <div className="h-full w-full bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
            <strong className="text-gray-900 font-bold text-center text-2xl">
              Total User Post Per Day
            </strong>
            <div className="mt-3 w-full flex-1 text-xs">
              <DailyUserPostsChart />
            </div>
          </div>
        );
      case "TotalPostForAdminPost":
        return (
          <div className="h-full w-full bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
            <strong className="text-gray-900 font-bold text-center text-2xl">
              Total Admin Post Per Day
            </strong>
            <div className="mt-3 w-full flex-1 text-xs">
              <DailyAdminPostsChart />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div>
        <DashboardStatusGrid />
      </div>

      <div className="border-b border-gray-200 mt-4">
        <nav className="flex space-x-4">
          {NEWS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 font-medium ${
                activeTab === tab.key
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-4">{renderTabContent()}</div>
    </>
  );
}

export default MainCommodity;
