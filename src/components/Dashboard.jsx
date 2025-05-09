import React from "react";
import DashboardStatusGrid from "./Overall/DashboardStatusGrid";

function Dashboard() {
  return (
    <div className="flex flex-col gap-4">
      <DashboardStatusGrid />
      <div className="flex flex-row gap-4 w-full">
        <div className="w-1/4"></div>
      </div>
      <div className="flex flex-row gap-4 w-full"></div>
      <div className="flex flex-row gap-4 w-full"></div>
    </div>
  );
}

export default Dashboard;
