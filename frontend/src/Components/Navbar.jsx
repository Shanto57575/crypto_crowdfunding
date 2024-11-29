import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import {
	Menu,
	X,
	Wallet,
	LogOut,
	Home,
	PlusCircle,
	Users,
	Compass,
	LayoutDashboard,
	ChevronDown,
	Settings,
	History,
	TrendingUp,
	BookPlus,
	PanelRight,
} from "lucide-react";

const Navbar = () => {
	const { userAddress, connectWallet, disconnect } = useWallet();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isDashboardOpen, setIsDashboardOpen] = useState(false);
	const location = useLocation();
	const [scrolled, setScrolled] = useState(false);
	const dashboardRef = useRef(null);

	// Handle scroll effect
	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				dashboardRef.current &&
				!dashboardRef.current.contains(event.target)
			) {
				setIsDashboardOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const mainRoutes = [
		{ name: "Home", path: "/", icon: Home },
		{ name: "Blog", path: "/blog", icon: BookPlus },
		{ name: "User Guide", path: "/user-guide", icon: PanelRight },
		{ name: "Explore", path: "/all-campaigns", icon: Compass },
	];

	const dashboardRoutes = [
		{ name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
		{ name: "My Campaigns", path: "/my-campaigns", icon: Users },
		{ name: "Create Campaign", path: "/create-campaign", icon: PlusCircle },
		{ name: "My Donations", path: "/my-donation", icon: History },
		{ name: "Analytics", path: "/analytics", icon: TrendingUp },
		{ name: "Settings", path: "/settings", icon: Settings },
	];

	const AddressDisplay = ({ address, className = "" }) => (
		<div className={`flex items-center space-x-2 ${className}`}>
			<div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
			<span className="text-sm font-medium text-gray-300 tracking-wider">
				{address.slice(0, 6)}...{address.slice(-4)}
			</span>
		</div>
	);

	return (
		<nav
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
				scrolled
					? "bg-[#0a0a1a]/95 backdrop-blur-lg shadow-xl"
					: "bg-[#0a0a1a]/80"
			}`}
		>
			<div className="container mx-auto px-3 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16 sm:h-20">
					{/* Logo */}
					<Link to="/" className="flex items-center space-x-2 flex-shrink-0">
						<div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
							<span className="text-white font-bold text-xl">F</span>
						</div>
						<h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight hidden sm:block">
							FundChain
						</h1>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden lg:flex items-center space-x-1">
						{/* Main Routes */}
						{mainRoutes.map((item) => (
							<Link
								key={item.name}
								to={item.path}
								className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
									location.pathname === item.path
										? "bg-gray-800 text-white"
										: "text-gray-400 hover:bg-gray-800/50 hover:text-white"
								}`}
							>
								<item.icon className="h-4 w-4" />
								<span className="text-sm font-medium">{item.name}</span>
							</Link>
						))}

						{/* Dashboard Dropdown */}
						{userAddress && (
							<div className="relative" ref={dashboardRef}>
								{/* <button
									onClick={() => setIsDashboardOpen(!isDashboardOpen)}
									className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
										isDashboardOpen ||
										dashboardRoutes.some(
											(route) => location.pathname === route.path
										)
											? "bg-gray-800 text-white"
											: "text-gray-400 hover:bg-gray-800/50 hover:text-white"
									}`}
								>
									<LayoutDashboard className="h-4 w-4" />
									<span className="text-sm font-medium">Dashboard</span>
									<ChevronDown
										className={`h-4 w-4 transition-transform duration-200 ${
											isDashboardOpen ? "rotate-180" : ""
										}`}
									/>
								</button> */}
								<Link to={'/dashboard/dashboardHome'} className="px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 text-gray-400 hover:bg-gray-800/50 hover:text-white">Dashboard</Link>

								{/* Dashboard Menu */}
								{isDashboardOpen && (
									<div className="absolute top-full right-0 mt-2 w-56 rounded-xl bg-gray-900 border border-gray-800 shadow-xl py-2">
										{dashboardRoutes.map((item) => (
											<Link
												key={item.name}
												to={item.path}
												onClick={() => setIsDashboardOpen(false)}
												className={`flex items-center space-x-3 px-4 py-2 transition-all duration-200 ${
													location.pathname === item.path
														? "bg-gray-800/80 text-white"
														: "text-gray-400 hover:bg-gray-800/50 hover:text-white"
												}`}
											>
												<item.icon className="h-4 w-4" />
												<span className="text-sm">{item.name}</span>
											</Link>
										))}
									</div>
								)}
							</div>
						)}
					</div>

					{/* Right Section */}
					<div className="flex items-center space-x-4">
						{/* Wallet Section - Only visible on large devices */}
						{userAddress ? (
							<div className="hidden lg:flex items-center space-x-4">
								<AddressDisplay address={userAddress} />
								<button
									onClick={disconnect}
									className="p-2 rounded-lg text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-all duration-200"
								>
									<LogOut className="h-5 w-5" />
								</button>
							</div>
						) : (
							<button
								onClick={connectWallet}
								className="hidden lg:flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800 transition-all duration-200 transform hover:scale-[1.02]"
							>
								<Wallet className="h-5 w-5" />
								<span className="text-sm font-medium">Connect Wallet</span>
							</button>
						)}

						{/* Mobile Menu Button */}
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="lg:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200"
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
					<div className="lg:hidden fixed inset-0 top-16 sm:top-20 bg-[#0a0a1a] border-t border-gray-800 overflow-y-auto">
						<div className="container mx-auto px-4 py-6">
							{/* Wallet Display for Mobile */}
							{userAddress ? (
								<div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-gray-800/50">
									<AddressDisplay address={userAddress} />
									<button
										onClick={() => {
											disconnect();
											setIsMenuOpen(false);
										}}
										className="p-2 rounded-lg text-red-400 hover:bg-red-950/50 hover:text-red-300"
									>
										<LogOut className="h-5 w-5" />
									</button>
								</div>
							) : (
								<button
									onClick={() => {
										connectWallet();
										setIsMenuOpen(false);
									}}
									className="w-full flex items-center justify-center space-x-2 px-6 py-3 mb-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800 transition-all duration-200"
								>
									<Wallet className="h-5 w-5" />
									<span>Connect Wallet</span>
								</button>
							)}

							{/* Mobile Navigation Links */}
							<div className="space-y-2">
								{/* Main Routes */}
								{mainRoutes.map((item) => (
									<Link
										key={item.name}
										to={item.path}
										onClick={() => setIsMenuOpen(false)}
										className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
											location.pathname === item.path
												? "bg-gray-800 text-white"
												: "text-gray-400 hover:bg-gray-800/50 hover:text-white"
										}`}
									>
										<item.icon className="h-5 w-5" />
										<span className="font-medium">{item.name}</span>
									</Link>
								))}

								{/* Dashboard Section */}
								{/* {userAddress && (
									<>
										<div className="mt-6 mb-3 px-4">
											<h2 className="text-sm font-semibold text-gray-400">
												Dashboard
											</h2>
										</div>
										{dashboardRoutes.map((item) => (
											<Link
												key={item.name}
												to={item.path}
												onClick={() => setIsMenuOpen(false)}
												className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
													location.pathname === item.path
														? "bg-gray-800 text-white"
														: "text-gray-400 hover:bg-gray-800/50 hover:text-white"
												}`}
											>
												<item.icon className="h-5 w-5" />
												<span className="font-medium">{item.name}</span>
											</Link>
										))}
									</>
								)} */}
							</div>
						</div>
					</div>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
