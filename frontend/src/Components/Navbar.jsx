import {
  Compass,
  Home,
  LogOut,
  Menu,
  PlusCircle,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

const Navbar = () => {
  const { userAddress, connectWallet, disconnect } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const userMenu = [
    { name: "Home", path: "/", icon: Home },
    { name: "Explore Campaigns", path: "/all-campaigns", icon: Compass },
    { name: "Create Campaigns", path: "/create-campaign", icon: PlusCircle },
    { name: "My Campaigns", path: "/my-campaigns", icon: Users },
    { name: "My Donations", path: "/my-donations", icon: Users },
  ];

  const AddressDisplay = ({ address, className = "" }) => (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="w-3 h-3 bg-emerald-300 rounded-full animate-pulse"></div>
      <span className="text-sm font-medium text-gray-300 tracking-wider">
        {address.slice(0, 6)}...{address.slice(-4)}
      </span>
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a1a] bg-opacity-95 backdrop-blur-xl shadow-2xl border-b border-gray-800">
      <div className="container mx-auto px-4 py-3 2xl:px-16">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-tr from-blue-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl md:text-3xl">
                F
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-100 tracking-tight hidden md:block">
              FundChain
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center text-center space-x-6 xl:space-x-8">
            {/* Navigation Links */}
            <div className="flex space-x-1 xl:space-x-2">
              {userMenu.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group px-3 py-2 rounded-lg flex items-center space-x-2 transition ${
                    location.pathname === item.path
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 ${
                      location.pathname === item.path
                        ? "text-blue-400"
                        : "text-gray-500 group-hover:text-blue-400"
                    }`}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Wallet Connection */}
            {userAddress ? (
              <div className="flex items-center space-x-4 pl-4 border-l border-gray-700">
                <AddressDisplay address={userAddress} />
                <button
                  onClick={disconnect}
                  className="text-red-400 hover:text-red-500 transition"
                  aria-label="Disconnect Wallet"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="px-4 py-2.5 rounded bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-purple-800 transition transform hover:scale-105 flex items-center space-x-2 shadow-md"
              >
                <Wallet className="h-5 w-5" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white transition"
              aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full bg-[#0a0a1a] shadow-2xl border-t border-gray-800">
            <div className="px-4 py-6 space-y-3">
              {userAddress ? (
                <>
                  <AddressDisplay
                    address={userAddress}
                    className="mb-4 pb-3 border-b border-gray-700 text-center"
                  />
                  {userMenu.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                        location.pathname === item.path
                          ? "bg-gray-800 text-white"
                          : "hover:bg-gray-800 text-gray-400 hover:text-white"
                      }`}
                    >
                      <item.icon
                        className={`h-6 w-6 ${
                          location.pathname === item.path
                            ? "text-blue-400"
                            : "text-gray-500"
                        }`}
                      />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      disconnect();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-950 hover:text-red-300 transition"
                  >
                    <LogOut className="h-6 w-6" />
                    <span>Disconnect</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    connectWallet();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800 transition flex items-center justify-center space-x-2"
                >
                  <Wallet className="h-6 w-6" />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
