import { Link, NavLink } from "react-router-dom";
import { Home, PlusCircle, Folder, Heart, LayoutDashboard, BookOpen, HelpCircle, LogOut } from 'lucide-react';

const Sidebar = () => {
  const activeStyle = {
    backgroundColor: "#4A5568",
    color: "white",
    fontWeight: "bold",
  };

  return (
    <div className="bg-gray-800 text-white h-screen fixed left-0 top-0 bottom-0 w-64 flex flex-col">
      <div className="p-5">
        <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight hidden sm:block">
            FundChain
          </h1>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-2 p-4">
          <li>
            <NavLink
              to="/dashboard/dashboardHome"
              className="flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 hover:bg-gray-700"
              style={({ isActive }) => (isActive ? activeStyle : undefined)}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/create-campaign"
              className="flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 hover:bg-gray-700"
              style={({ isActive }) => (isActive ? activeStyle : undefined)}
            >
              <PlusCircle size={20} />
              <span>Create Campaign</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/my-campaigns"
              className="flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 hover:bg-gray-700"
              style={({ isActive }) => (isActive ? activeStyle : undefined)}
            >
              <Folder size={20} />
              <span>My Campaigns</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/my-donations"
              className="flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 hover:bg-gray-700"
              style={({ isActive }) => (isActive ? activeStyle : undefined)}
            >
              <Heart size={20} />
              <span>My Donations</span>
            </NavLink>
          </li>

          <li className="py-2">
            <div className="bg-gray-700 h-px"></div>
          </li>

          <li>
            <NavLink
              to="/"
              className="flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 hover:bg-gray-700"
              style={({ isActive }) => (isActive ? activeStyle : undefined)}
            >
              <Home size={20} />
              <span>Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/blog"
              className="flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 hover:bg-gray-700"
              style={({ isActive }) => (isActive ? activeStyle : undefined)}
            >
              <BookOpen size={20} />
              <span>Blog</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/user-guide"
              className="flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 hover:bg-gray-700"
              style={({ isActive }) => (isActive ? activeStyle : undefined)}
            >
              <HelpCircle size={20} />
              <span>User Guide</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="p-4">
        <button className="flex items-center space-x-3 p-2 w-full rounded-lg transition-colors duration-200 hover:bg-gray-700">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

