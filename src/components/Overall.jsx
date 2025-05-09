import React, { useEffect, useState } from "react";

import DashboardStatusGrid from "./Overall/DashboardStatusGrid";
import { DASHBOARD_TABS } from "../lib/consts/navigation";

import MonthlyTrend from "./Overall/MonthlyPostTrend";
import MonthlyViewTrend from "./Overall/MonthlyViewTrend";
import PostByProduct from "./Overall/PostByProduct";
import ViewByProduct from "./Overall/ViewByProduct";
import TopUsersTable from "./Overall/TopUsersTable";

import PostToViewRatio from "./Overall/PostToViewRatio";
import QuantityTrend from "./Overall/QuantityTrendByMonth";

import PostToViewRatioByProduct from "./Overall/PostToViewRatioProduct";
import QuantityTrendByProduct from "./Overall/QuantityTrendByProduct";

// Generate a unique color palette for each bar
const palette = [
  "#C4A484 ", // Light Browne
  "#006400", // Emerald Green
  "#007BFF", // Azure Blue
  "#F7931A", // Tangerine
  "#FF00FF", // Fuchsia
  "#436EEE", // Cerulean
  "#32CD32", // Lime Green
  "#4169E1", // Royal Purple
  "#DFFF00", // Chartreuse
  "#FA8072", // Salmon
  "#4B0082", // Indigo
  "#008080", // Teal
];

function Overall() {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState(DASHBOARD_TABS[0].key); // Manage the active tab state

  // Function to display content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "monthlyPost":
        return (
          <div className=" h-full w-full bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
            <strong className="text-gray-900 font-bold text-center text-2xl">
              Monthly Buy and Sell Trend
            </strong>
            <div className="mt-3 w-full flex-1 text-xs">
              <MonthlyTrend />
            </div>
          </div>
        );
      case "monthlyView":
        return (
          <div className=" h-full w-full bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
            <strong className="text-gray-900 font-bold text-center text-2xl">
              Monthly View Trend
            </strong>
            <MonthlyViewTrend />
          </div>
        );
      case "PostByProduct":
        return (
          <div className=" h-full w-full bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
            <strong className="text-gray-900 font-bold text-center text-2xl">
              Post By Product
            </strong>
            <PostByProduct />
          </div>
        );
      case "ViewByProduct":
        return (
          <div className=" h-full w-full bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
            <strong className="text-gray-900 font-bold text-center text-2xl">
              View By Product
            </strong>
            <ViewByProduct />
          </div>
        );
      case "TopUsers":
        return (
          <div className=" h-full w-full bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
            <strong className="text-gray-900 font-bold text-center text-2xl">
              Top 10 Users
            </strong>
            <TopUsersTable />
          </div>
        );

      case "PostToViewRatio":
        return (
          <div className=" h-full w-full bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
            <strong className="text-gray-900 font-bold text-center text-2xl">
              View To Post Ratio By Month
            </strong>
            <PostToViewRatio />
          </div>
        );
      case "PostToViewRatioByProduct": // Ensure this case exists for the tab
        return (
          <div className=" h-full w-full bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
            <strong className="text-gray-900 font-bold text-center text-2xl">
              View to Post Ratio By Product
            </strong>
            <PostToViewRatioByProduct />
          </div>
        );
      case "QuantityTrendByMonth":
        return (
          <div className=" h-full w-full bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
            <strong className="text-gray-900 font-bold text-center text-2xl">
              Quantity Trend By Month
            </strong>
            <QuantityTrend />
          </div>
        );
      case "QuantityTrendByProduct":
        return (
          <div className=" h-full w-full bg-white p-4 rounded-sm border border-gray-200 flex flex-col flex-1">
            <strong className="text-gray-900 font-bold text-center text-2xl">
              Quantity Trend By Product
            </strong>
            <QuantityTrendByProduct />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Dashboard status grid */}
      <div>
        <DashboardStatusGrid />
      </div>

      {/* Tab Menu */}
      <div className="border-b border-gray-200 mt-4">
        <nav className="flex space-x-4">
          {DASHBOARD_TABS.map((tab) => (
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

      {/* Render tab content */}
      <div className="mt-4">{renderTabContent()}</div>
    </>
  );
}

export default Overall;
