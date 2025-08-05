import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  User,
  ClipboardList,
  FileText,
  Activity,
} from "lucide-react";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

interface NavCategory {
  name: string;
  items: NavItem[];
}

// Group menu items by category for better organization
const navCategories: NavCategory[] = [
  {
    name: "Main",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/doctor/dashboard" },
      { icon: MessageSquare, label: "Patient Chats", path: "/doctor/chats" },
    ],
  },
  {
    name: "Patient Care",
    items: [
      { icon: Users, label: "Patients", path: "/doctor/patients" },
      { icon: Calendar, label: "Appointments", path: "/doctor/appointments" },
      { icon: ClipboardList, label: "Medical Records", path: "/doctor/records" },
    ],
  },
  {
    name: "Management",
    items: [
      { icon: Bell, label: "Notifications", path: "/doctor/notifications" },
      { icon: Settings, label: "Settings", path: "/doctor/settings" },
    ],
  },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Get user info from localStorage
  const [userName, setUserName] = useState<string>("Doctor");

  useEffect(() => {
    // Get the doctor name from localStorage
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    } else {
      // If userName is not in localStorage, fetch it from the API
      const fetchDoctorProfile = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) return;

          const response = await axios.get("http://localhost:5000/api/doctor/profile", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (response.data && response.data.name) {
            // Save the name to localStorage for future use
            localStorage.setItem("userName", response.data.name);
            setUserName(response.data.name);
          }
        } catch (err) {
          console.error("Error fetching doctor profile:", err);
        }
      };

      fetchDoctorProfile();
    }
  }, []);

  // Toggle category expansion
  const toggleCategory = (categoryName: string) => {
    if (expandedCategory === categoryName) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryName);
    }
  };

  // Check if a category has an active item
  const isCategoryActive = (items: NavItem[]) => {
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
    <div className="w-64 bg-white dark:bg-gray-800 h-full border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo and branding */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
          MedBook
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Doctor Portal
        </p>
      </div>

      {/* User profile section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="font-medium text-gray-800 dark:text-gray-200">{userName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Doctor</p>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navCategories.map((category) => {
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
                {category.items.map((item) => {
                  const isItemActive = location.pathname === item.path;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`flex items-center space-x-3 w-full px-8 py-2 text-sm rounded-md transition-colors ${
                        isItemActive
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/30 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
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
}
