import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Activity,
  FileText,
  Users,
  Calendar,
  Settings,
  LogOut,
  Pill,
  HeartPulse,
  ClipboardList,
  Bell,
  MessageSquare,
  ChevronRight,
  User,
} from "lucide-react";

// Group menu items by category for better organization
const menuCategories = [
  {
    name: "Main",
    items: [
      { icon: Activity, label: "Dashboard", path: "/patientDashboard" },
      { icon: MessageSquare, label: "Doctor Chats", path: "/chats" },
      { icon: ClipboardList, label: "Chat4Health", path: "/chat4health" },
    ],
  },
  {
    name: "Health Records",
    items: [
      { icon: FileText, label: "Medical Records", path: "/records" },
      { icon: Users, label: "Family History", path: "/family" },
      { icon: Pill, label: "Medications", path: "/medications" },
      { icon: HeartPulse, label: "Vital Signs", path: "/vitals" },
    ],
  },
  {
    name: "Management",
    items: [
      { icon: Calendar, label: "Appointments", path: "/appointments" },
      { icon: Bell, label: "Notifications", path: "/notifications" },
      { icon: Settings, label: "Settings", path: "/settings" },
    ],
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Get user info from localStorage
  const userName = localStorage.getItem("userName") || "Patient";

  // Toggle category expansion
  const toggleCategory = (categoryName: string) => {
    if (expandedCategory === categoryName) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryName);
    }
  };

  // Check if a category has an active item
  const isCategoryActive = (items: any[]) => {
    return items.some(item => location.pathname === item.path);
  };

  // Sign out handler
  const handleSignOut = () => {
    // 1) Remove token and userType from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("userName");

    // 2) Navigate to homepage
    navigate("/");

    // 3) Force a one-time page reload
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo and branding */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
          MedBook
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Your Health Companion
        </p>
      </div>

      {/* User profile section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="font-medium text-gray-800 dark:text-gray-200">{userName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Patient</p>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuCategories.map((category) => {
          const isActive = isCategoryActive(category.items);
          const isExpanded = expandedCategory === category.name || isActive;

          return (
            <div key={category.name} className="mb-4">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(category.name)}
                className={`flex items-center justify-between w-full px-6 py-2 text-sm font-medium ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <span>{category.name}</span>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    isExpanded ? "transform rotate-90" : ""
                  }`}
                />
              </button>

              {/* Category items */}
              <div className={`mt-1 space-y-1 ${isExpanded ? "block" : "hidden"}`}>
                {category.items.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-8 py-2 text-sm rounded-md transition-colors ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/30 hover:text-blue-600 dark:hover:text-blue-400"
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Sign out button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full px-4 py-2 rounded-lg"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
