import { useState } from "react";
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
} from "lucide-react";

const Navbar = () => {
	const { userAddress, connectWallet, disconnect } = useWallet();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const location = useLocation();

	const userMenu = [
		{ name: "Home", path: "/", icon: Home },
		{ name: "Explore Campaigns", path: "/all-campaigns", icon: Compass },
		{ name: "Create Campaigns", path: "/create-campaign", icon: PlusCircle },
		{ name: "My Campaigns", path: "/my-campaigns", icon: Users },
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
		<nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a1a] bg-opacity-95 backdrop-blur-lg shadow-2xl border-b border-gray-800 py-4 sm:py-3">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center">
					<Link to="/" className="flex items-center space-x-2">
						<div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
							<span className="text-white font-bold text-xl">F</span>
						</div>
						<h1 className="text-xl font-bold text-gray-100 tracking-tight hidden sm:block">
							FundChain
						</h1>
					</Link>

					<div className="flex items-center space-x-4">
						{/* Desktop Menu */}
						<div className="hidden sm:flex items-center space-x-3">
							{userAddress &&
								userMenu.map((item) => (
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

						{/* User Address or Connect Wallet on Desktop */}
						{userAddress ? (
							<div className="flex items-center space-x-4">
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
								className="w-full hidden sm:inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800 transition md:flex items-center justify-center space-x-2"
							>
								<Wallet className="h-5 w-5" />
								<span>Connect Wallet</span>
							</button>
						)}

						{/* Mobile Menu Button */}
						<div className="sm:hidden">
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
				</div>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<div className="sm:hidden absolute left-0 right-0 top-full bg-[#0a0a1a] shadow-2xl border-t border-gray-800">
						<div className="px-4 py-6 space-y-3">
							{userAddress ? (
								<>
									<AddressDisplay
										address={userAddress}
										className="text-center mb-3"
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
									className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800 transition"
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
