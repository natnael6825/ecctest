import React, { useState, useMemo } from "react";
import classNames from "classnames";
import { FcBullish } from "react-icons/fc";
import { HiOutlineLogout, HiChevronDown } from "react-icons/hi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  DASHBOARD_SIDEBAR_BOTTOM_LINKS,
  ANALYTICS_SIDEBAR_LINKS,
  OFFER_MANAGEMENT_SIDEBAR_LINKS,
  PRODUCT_MANAGEMENT_SIDEBAR_LINKS,
  CONTENT_MANAGEMENT_SIDEBAR_LINKS,
  USER_MANAGEMENT_SIDEBAR_LINKS,
} from "../../lib/consts/navigation";

const linkClass =
  "flex items-center gap-2 font-light px-3 py-2 hover:bg-neutral-700 hover:no-underline active:bg-neutral-600 rounded-sm text-base";

function Sidebar() {
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [offerManagementOpen, setOfferManagementOpen] = useState(false);
  const [productManagementOpen, setProductManagementOpen] = useState(false);
  const [contentManagementOpen, setContentManagementOpen] = useState(false);
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Parse stored admin info once
  const adminInfo = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("adminInfo") || "{}");
    } catch {
      return {};
    }
  }, []);

  const isSuperAdmin = adminInfo.role === "superadmin";

  const handleLogout = () => {
    // Delete auth cookie
    document.cookie = "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    // Clear stored admin data
    localStorage.removeItem("userRole");
    localStorage.removeItem("adminInfo");
    // Redirect
    navigate("/login", { replace: true });
  };

  return (
    <div className="bg-neutral-900 w-60 p-3 flex flex-col text-white h-screen">
      {/* Header */}
      <div className="flex items-center gap-2 px-1 py-3">
        <FcBullish fontSize={24} />
        <span className="text-neutral text-lg">Dashboard</span>
      </div>

      {/* Main Section with Dropdown Groups */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Analytics */}
        <Section
          title="Analytics"
          isOpen={analyticsOpen}
          setIsOpen={setAnalyticsOpen}
          links={ANALYTICS_SIDEBAR_LINKS}
        />

        {/* Offer Management */}
        <Section
          title="Offer Management"
          isOpen={offerManagementOpen}
          setIsOpen={setOfferManagementOpen}
          links={OFFER_MANAGEMENT_SIDEBAR_LINKS}
          className="mt-4"
        />

        {/* Product Management */}
        <Section
          title="Product Management"
          isOpen={productManagementOpen}
          setIsOpen={setProductManagementOpen}
          links={PRODUCT_MANAGEMENT_SIDEBAR_LINKS}
          className="mt-4"
        />

        {/* Content Management */}
        <Section
          title="Content Management"
          isOpen={contentManagementOpen}
          setIsOpen={setContentManagementOpen}
          links={CONTENT_MANAGEMENT_SIDEBAR_LINKS}
          className="mt-4"
        />

        {/* User Management: only for super admins */}
        {isSuperAdmin && (
          <Section
            title="User Management"
            isOpen={userManagementOpen}
            setIsOpen={setUserManagementOpen}
            links={USER_MANAGEMENT_SIDEBAR_LINKS}
            className="mt-4"
          />
        )}
      </div>

      {/* Bottom Links & Logout */}
      <div className="flex flex-col gap-0.5 pt-2 border-t border-neutral-700">
        {DASHBOARD_SIDEBAR_BOTTOM_LINKS.map((item) => (
          <SidebarLink key={item.key} item={item} pathname={pathname} />
        ))}

        <div
          onClick={handleLogout}
          className={classNames("text-red-500 cursor-pointer", linkClass)}
        >
          <span className="text-xl">
            <HiOutlineLogout />
          </span>
          Logout
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

// Helper for dropdown sections
function Section({ title, isOpen, setIsOpen, links, className = "" }) {
  return (
    <>
      <div
        className={classNames(
          "py-2 cursor-pointer flex items-center justify-between text-white font-bold text-base",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <HiChevronDown
          className={classNames("transform transition-transform duration-300", {
            "rotate-180": isOpen,
          })}
        />
      </div>
      {isOpen && (
        <div className="flex flex-col gap-0.5">
          {links.map((item) => (
            <SidebarLink
              key={item.key}
              item={item}
              pathname={window.location.pathname}
            />
          ))}
        </div>
      )}
    </>
  );
}

// Individual link
function SidebarLink({ item, pathname }) {
  let linkPath = item.path;
  if (item.dynamic && item.params) {
    linkPath = `${item.path}/${item.params.startDate}/${item.params.endDate}`;
  }

  return (
    <Link
      to={linkPath}
      className={classNames(
        pathname === item.path
          ? "bg-neutral-700 text-white"
          : "text-neutral-400",
        linkClass
      )}
    >
      <span className="text-xl">{item.icon}</span>
      {item.label}
    </Link>
  );
}
