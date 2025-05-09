import React, { useEffect, useState } from "react";

import DashboardStatusGrid from "./ContentManagement/DashboardStatusGrid";
import { CONTENT_MANAGEMENT_TABS } from "../lib/consts/navigation";

import AddExchangeRate from "./ContentManagement/AddExchangeRate";
import CreatePost from "./ContentManagement/CreatePost";
import PostStatistics from "./ContentManagement/PostStatistics";
import EditPost from "./ContentManagement/EditPost";
import PreViewPost from "./ContentManagement/PreviewPost";

function MainCommodity() {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState(CONTENT_MANAGEMENT_TABS[0].key);

  const renderTabContent = () => {
    switch (activeTab) {
      case "addExchangeRate":
        return (
          <div className=" h-full w-full bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
            <strong className="text-gray-900 font-bold text-center text-2xl">
              Add Exchange Rate
            </strong>
            <div className="mt-3 w-full flex-1 text-xs">
              <AddExchangeRate />
            </div>
          </div>
        );
      case "createPost":
        return (
          <div className=" h-full w-full bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
            <strong className="text-gray-900 font-bold text-center text-2xl">
              Create Post
            </strong>
            <CreatePost />
          </div>
        );
      case "postStatistics":
        return (
          <div className=" h-full w-full bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
            <strong className="text-gray-900 font-bold text-center text-2xl">
              Post Statistics
            </strong>
            <PostStatistics />
          </div>
        );
      case "editPost":
        return (
          <div className=" h-full w-full bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
            <strong className="text-gray-900 font-bold text-center text-2xl">
              Edit Post
            </strong>
            <EditPost />
          </div>
        );
      case "preViewPost":
        return (
          <div className=" h-full w-full bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
            <strong className="text-gray-900 font-bold text-center text-2xl">
              Preview Post
            </strong>
            <PreViewPost />
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
          {CONTENT_MANAGEMENT_TABS.map((tab) => (
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
