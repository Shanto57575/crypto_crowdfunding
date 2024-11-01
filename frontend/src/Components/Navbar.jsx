import { useState } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { Menu, X, Wallet, ChevronDown, LogOut } from "lucide-react";

const Navbar = () => {
	const { userAddress, connectWallet } = useWallet();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const userMenu = [
		{ name: "Create Campaign", path: "/create-campaign" },
		{ name: "All Campaigns", path: "/all-campaigns" },
		{ name: "My Campaigns", path: "/my-campaigns" },
	];

	return (
		<nav className="bg-gray-900 border-b border-gray-800 fixed w-full z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					{/* Logo Section */}
					<div className="flex items-center">
						<Link to="/" className="flex items-center space-x-2">
							<div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-xl">F</span>
							</div>
							<span className="text-xl font-bold text-white hidden sm:block">
								FundChain
							</span>
						</Link>
					</div>

					{/* Desktop Navigation */}
					<div className="hidden md:flex md:items-center md:space-x-4">
						{userAddress ? (
							<div className="relative">
								<button
									onClick={() => setIsDropdownOpen(!isDropdownOpen)}
									className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
								>
									<span className="text-sm font-medium">
										{userAddress.slice(0, 4)}...{userAddress.slice(38, 42)}
									</span>
									<ChevronDown className="h-4 w-4" />
								</button>

								{isDropdownOpen && (
									<div className="absolute right-0 mt-2 w-56 rounded-lg bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5">
										<div className="py-1">
											{userMenu.map((item) => (
												<Link
													key={item.name}
													to={item.path}
													className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
													onClick={() => setIsDropdownOpen(false)}
												>
													{item.name}
												</Link>
											))}
											<button
												className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 flex items-center space-x-2"
												onClick={() => {
													// Add logout logic here
													setIsDropdownOpen(false);
												}}
											>
												<LogOut className="h-4 w-4" />
												<span>Disconnect</span>
											</button>
										</div>
									</div>
								)}
							</div>
						) : (
							<button
								onClick={connectWallet}
								className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 transition-all"
							>
								<Wallet className="h-4 w-4 mr-2" />
								Connect Wallet
							</button>
						)}
					</div>

					{/* Mobile menu button */}
					<div className="flex items-center md:hidden">
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
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

			{/* Mobile menu */}
			{isMenuOpen && (
				<div className="md:hidden bg-gray-800">
					<div className="px-2 pt-2 pb-3 space-y-1">
						{userAddress ? (
							<>
								<div className="px-3 py-2 text-sm font-medium text-gray-400 border-b border-gray-700">
									{userAddress.slice(0, 4)}...{userAddress.slice(38, 42)}
								</div>
								{userMenu.map((item) => (
									<Link
										key={item.name}
										to={item.path}
										className="block px-3 py-2 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
										onClick={() => setIsMenuOpen(false)}
									>
										{item.name}
									</Link>
								))}
								<button
									className="w-full text-left px-3 py-2 text-base font-medium text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg flex items-center space-x-2"
									onClick={() => {
										// Add logout logic here
										setIsMenuOpen(false);
									}}
								>
									<LogOut className="h-4 w-4" />
									<span>Disconnect</span>
								</button>
							</>
						) : (
							<button
								onClick={() => {
									connectWallet();
									setIsMenuOpen(false);
								}}
								className="w-full flex items-center px-3 py-2 rounded-lg text-base font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
							>
								<Wallet className="h-4 w-4 mr-2" />
								Connect Wallet
							</button>
						)}
					</div>
				</div>
			)}
		</nav>
	);
};

export default Navbar;
