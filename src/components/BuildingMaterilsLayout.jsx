import React, { useEffect, useState } from "react";

import DashboardStatusGrid from "./BuildingMaterials/DashboardStatusGrid";
import { DASHBOARD_TABS } from "../lib/consts/navigation";

import MonthlyTrend from "./BuildingMaterials/MonthlyPostTrend";
import MonthlyViewTrend from "./BuildingMaterials/MonthlyViewTrend";
import PostByProduct from "./BuildingMaterials/PostByProduct";
import ViewByProduct from "./BuildingMaterials/ViewByProduct";
import TopUsersTable from "./BuildingMaterials/TopUsersTable";

import PostToViewRatio from "./BuildingMaterials/PostToViewRatio";
import QuantityTrend from "./BuildingMaterials/QuantityTrendByMonth";

import PostToViewRatioByProduct from "./BuildingMaterials/PostToViewRatioProduct";
import QuantityTrendByProduct from "./BuildingMaterials/QuantityTrendByProduct";

function MainCommodity() {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState(DASHBOARD_TABS[0].key);

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
      <div>
        <DashboardStatusGrid />
      </div>

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

      <div className="mt-4">{renderTabContent()}</div>
    </>
  );
}

export default MainCommodity;
