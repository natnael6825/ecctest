import React from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Head from "./Head";
function Layout() {
  return (
    <div className="flex flex-row bg-neutral-100 h-screen w-screen overflow-hidden">
      <Sidebar className="h-screen fixed" />
      <div className="flex flex-col flex-1 overflow-y-auto">
        <Head className="sticky top-0 bg-white z-10" />
        <div className="p-4 overflow-x-auto">{<Outlet />}</div>
      </div>
    </div>
  );
}

export default Layout;
