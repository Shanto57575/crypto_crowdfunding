import { useState } from "react";
import {
	ChevronRight,
	ChevronLeft,
	Search,
	Menu,
	X,
	CheckCircle2,
	Maximize2,
	Minimize2,
} from "lucide-react";

const steps = [
	{
		title: "Step 1: Installing the Metamask Extension",
		image: "1.png",
		description:
			"Begin by visiting the Chrome Web Store and searching for the Metamask Extension. Click on the 'Add to Chrome' button to install it. Metamask is a crucial tool for managing your cryptocurrency wallets and interacting with blockchain applications. After the installation is complete, you will notice the Metamask icon in your browser's toolbar.",
		keyPoints: [
			"Available for Chrome, Firefox, Edge and Brave",
			"Free to install",
			"Trusted by millions of users",
		],
	},
	{
		title: "Step 2: Setting Up Your Wallet",
		image: "2.png",
		description:
			"Click on the Metamask icon in the toolbar to open it. You will be greeted with an introduction screen. Check the box to accept the terms and conditions, then click the 'Create a New Wallet' button. This initiates the wallet setup process where you'll configure your new wallet.",
		keyPoints: [
			"Simple one-click setup process",
			"Beginner-friendly interface",
			"Secure wallet creation flow",
		],
	},
	{
		title: "Step 3: Agreeing to Policies",
		image: "3.png",
		description:
			"To proceed, you need to agree to Metamask's policies. Carefully read through the privacy and security terms. Tick the checkbox to acknowledge your agreement and click the 'I Agree' button to move forward. This step ensures that you understand how Metamask manages your data.",
		keyPoints: [
			"Transparent privacy policies",
			"Clear security terms",
			"Data management guidelines",
		],
	},
	{
		title: "Step 4: Creating a Strong Password",
		image: "4.png",
		description:
			"Create a password that is at least 8 characters long and includes a mix of uppercase letters, numbers, and symbols. This password will be used to secure your wallet on your local device. Remember to store your password securely as it cannot be recovered if lost. After entering the password twice, tick the checkbox to confirm, and click the 'Create a New Wallet' button.",
		keyPoints: [
			"Minimum 8 characters required",
			"Mix of letters, numbers, and symbols",
			"Non-recoverable - store safely",
		],
	},
	{
		title: "Step 5: Securing Your Wallet",
		image: "5.png",
		description:
			"To enhance security, Metamask will prompt you to secure your wallet with a recovery option. Click on the 'Secure My Wallet' button to proceed. This step is essential to safeguard your wallet in case you lose access to your browser or device.",
		keyPoints: [
			"Additional security layer",
			"Recovery options available",
			"Protection against device loss",
		],
	},
	{
		title: "Step 6: Revealing the Secret Recovery Phrase",
		image: "6.png",
		description:
			"You will be presented with a secret recovery phrase, hidden initially for security. Click the 'Reveal Secret Recovery Phrase' button to view it. This phrase is critical for recovering your wallet if you lose access to your password or device. Never share this phrase with anyone and store it in a secure location.",
		keyPoints: [
			"12-word recovery phrase",
			"Critical for wallet recovery",
			"Keep absolutely private",
		],
	},
	{
		title: "Step 7: Saving Your Recovery Phrase",
		image: "7.png",
		description:
			"Write down your recovery phrase on paper or save it in a highly secure digital format. Avoid storing it in easily accessible locations like text files or screenshots on your device. Metamask will ask you to verify this phrase in the next step to confirm you've saved it correctly.",
		keyPoints: [
			"Write physically or store securely",
			"Avoid digital screenshots",
			"Verification required next",
		],
	},
	{
		title: "Step 8: Verifying Your Recovery Phrase",
		image: "8.png",
		description:
			"Metamask will ask you to re-enter certain words from your recovery phrase. This ensures that you've saved it properly. Follow the prompts and select the correct words in the right order to complete the verification process. This step is mandatory to secure your wallet.",
		keyPoints: [
			"Word order verification",
			"Mandatory security step",
			"Confirms proper storage",
		],
	},
	{
		title: "Step 9: Completion Confirmation",
		image: "9.png",
		description:
			"Once all steps are completed successfully, you will see a 'Congratulations' page. This indicates that your wallet setup is complete. Click the 'Done' button to finish the process and access your wallet's main dashboard.",
		keyPoints: [
			"Setup completion confirmed",
			"Access to dashboard granted",
			"Ready for transactions",
		],
	},
	{
		title: "Step 10: Navigating to the Next Step",
		image: "10.png",
		description:
			"Click the 'Next' button on the dashboard to explore additional configuration settings. This helps you familiarize yourself with Metamask's features and options for managing your wallet.",
		keyPoints: [
			"Additional configuration options",
			"Feature exploration",
			"Wallet management tools",
		],
	},
	{
		title: "Step 11: Successful Installation",
		image: "11.png",
		description:
			"Congratulations! Metamask has been installed successfully, and your wallet is ready to use. You can now start interacting with blockchain applications and managing cryptocurrencies securely.",
		keyPoints: [
			"Installation complete",
			"Ready for blockchain apps",
			"Secure cryptocurrency management",
		],
	},
	{
		title: "Step 12: Verifying the Wallet Screen",
		image: "12.png",
		description:
			"If you've followed all the steps correctly, you will see a wallet interface displaying your account details. Click the three-dot icon for additional settings, such as managing networks or connecting accounts.",
		keyPoints: [
			"Account details visible",
			"Settings menu available",
			"Network management options",
		],
	},
	{
		title: "Step 13: Exploring Wallet Options",
		image: "13.png",
		description:
			"Clicking the three-dot icon reveals a menu with several options. By default, the 'Ethereum Mainnet' network will be selected. This is the primary blockchain network supported by Metamask for live transactions.",
		keyPoints: [
			"Multiple network options",
			"Ethereum Mainnet default",
			"Live transaction support",
		],
	},
	{
		title: "Step 14: Enabling Test Networks",
		image: "14.png",
		description:
			"Scroll through the settings to find the toggle button labeled 'Show Test Networks.' Enable this option to access test networks like 'Sepolia.' These networks allow you to test blockchain interactions without using real cryptocurrency.",
		keyPoints: [
			"Test network access",
			"Risk-free testing",
			"Practice transactions",
		],
	},
	{
		title: "Step 15: Viewing the Wallet Popup",
		image: "15.png",
		description:
			"Open the Metamask extension. A popup will appear showing your wallet's status. If no accounts are connected, you will need to connect one manually to interact with blockchain applications.",
		keyPoints: [
			"Quick status overview",
			"Account connection required",
			"Easy access popup",
		],
	},
	{
		title: "Step 16: Viewing Your Wallet Address",
		image: "16.png",
		description:
			"Even if no accounts are connected, Metamask displays your wallet address. This address is unique to your wallet and is used to send or receive cryptocurrency securely.",
		keyPoints: [
			"Unique wallet address",
			"Send/receive capability",
			"Always accessible",
		],
	},
	{
		title: "Step 17: Connecting the Wallet to a Website",
		image: "17.png",
		description:
			"Click the 'Connect Wallet' button on the website you want to interact with. This will initiate a connection request to your Metamask wallet, allowing the website to access your wallet for transactions.",
		keyPoints: [
			"Website integration",
			"One-click connection",
			"Secure authorization",
		],
	},
	{
		title: "Step 18: Authorizing the Connection",
		image: "18.png",
		description:
			"Metamask will prompt you to authorize the connection. Review the details of the request and click 'Confirm' to establish a secure link between the website and your wallet.",
		keyPoints: [
			"Connection verification",
			"Security review prompt",
			"User authorization required",
		],
	},
	{
		title: "Step 19: Signing a Request",
		image: "19.png",
		description:
			"You may receive a 'Signature Request' popup from Metamask. This is typically required to authorize specific actions or transactions. Carefully review the details and click 'Confirm' to proceed.",
		keyPoints: [
			"Transaction authorization",
			"Detail verification",
			"Secure signing process",
		],
	},
	{
		title: "Step 20: Wallet Connection Confirmation",
		image: "22.png",
		description:
			"Once the connection is established, you will see a message confirming that your wallet has been connected successfully. This allows you to interact with the website seamlessly.",
		keyPoints: [
			"Connection confirmed",
			"Ready for interaction",
			"Seamless integration",
		],
	},
	{
		title: "Step 21: Disconnecting the Wallet",
		image: "21.png",
		description:
			"If you want to disconnect your wallet, click on the logout icon in the website or Metamask interface. This will safely disconnect your wallet and prevent further interactions.",
		keyPoints: [
			"Safe disconnection",
			"Prevent unauthorized access",
			"Quick logout option",
		],
	},
];

const Navigation = ({ currentStep, totalSteps, onPrevious, onNext }) => {
	return (
		<div className="flex items-center justify-between mt-8">
			<button
				onClick={onPrevious}
				disabled={currentStep === 0}
				className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-800 rounded-lg
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              hover:bg-gray-800"
			>
				<ChevronLeft className="w-4 h-4" />
				<span className="hidden sm:inline">Previous</span>
			</button>

			<div className="text-sm text-gray-400">
				{currentStep + 1} / {totalSteps}
			</div>

			<button
				onClick={onNext}
				disabled={currentStep === totalSteps - 1}
				className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
			>
				<span className="hidden sm:inline">Next</span>
				<ChevronRight className="w-4 h-4" />
			</button>
		</div>
	);
};

const SearchBar = ({ onSearch, searchQuery }) => {
	const handleSubmit = (e) => {
		e.preventDefault();
	};

	return (
		<form onSubmit={handleSubmit} className="relative">
			<div>
				<input
					type="text"
					value={searchQuery}
					placeholder="Search steps..."
					onChange={(e) => onSearch(e.target.value)}
					className="w-full px-4 py-2 pl-10 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
				/>
				<Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
			</div>
		</form>
	);
};

const TableOfContents = ({ steps, currentStep, onStepClick }) => {
	return (
		<div className="w-64 border-r border-gray-800 h-full overflow-hidden">
			<div className="p-4 space-y-2 h-full overflow-y-auto">
				{steps.map((step, index) => (
					<button
						key={index}
						onClick={() => onStepClick(index)}
						className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center space-x-3 ${
							currentStep === index
								? "bg-blue-600/20 text-blue-400"
								: "hover:bg-gray-800"
						}`}
					>
						<span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs">
							{index + 1}
						</span>
						<span className="truncate">
							{step.title.split(":")[1]?.trim() || step.title}
						</span>
					</button>
				))}
			</div>
		</div>
	);
};

const ProgressBar = ({ progress }) => {
	return (
		<div className="h-1 bg-gray-800 rounded-full overflow-hidden">
			<div
				className="h-full bg-blue-600 transition-all duration-300 ease-out"
				style={{ width: `${progress}%` }}
			/>
		</div>
	);
};

const ImageViewer = ({ isOpen, onClose, imageUrl, title }) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
			<div className="w-full max-w-6xl p-4">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-medium text-white">{title}</h3>
					<button
						onClick={onClose}
						className="p-2 hover:bg-white/10 rounded-lg transition-colors"
					>
						<Minimize2 className="w-6 h-6 text-white" />
					</button>
				</div>
				<img src={imageUrl} alt={title} className="w-full h-auto rounded-lg" />
			</div>
		</div>
	);
};

const StepContent = ({ step, isActive }) => {
	const [isFullscreen, setIsFullscreen] = useState(false);

	return (
		<div
			className={`transition-opacity duration-300 ${
				isActive ? "opacity-100" : "opacity-0"
			}`}
		>
			<h2 className="text-2xl font-medium mb-4">{step.title}</h2>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div className="space-y-6">
					<p className="text-gray-300 leading-relaxed">{step.description}</p>

					<div className="space-y-3">
						<h3 className="text-sm font-medium text-gray-400">Key Points</h3>
						{step.keyPoints.map((point, index) => (
							<div key={index} className="flex items-center space-x-2">
								<CheckCircle2 className="w-4 h-4 text-blue-500" />
								<span className="text-sm text-gray-300">{point}</span>
							</div>
						))}
					</div>
				</div>

				<div className="relative group">
					<div className="aspect-video rounded-lg overflow-hidden border border-gray-800 transition-transform duration-300 group-hover:scale-[1.02]">
						<img
							src={step.image}
							alt={step.title}
							className="w-full h-full object-cover"
						/>
					</div>
					<button
						onClick={() => setIsFullscreen(true)}
						className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black flex items-center space-x-2"
					>
						<Maximize2 className="w-4 h-4" />
						<span>View Fullscreen</span>
					</button>
				</div>
			</div>

			<ImageViewer
				isOpen={isFullscreen}
				onClose={() => setIsFullscreen(false)}
				imageUrl={step.image}
				title={step.title}
			/>
		</div>
	);
};

const Tutorial = () => {
	const [currentStep, setCurrentStep] = useState(0);
	const [searchQuery, setSearchQuery] = useState("");
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const filteredSteps = steps.filter((step) =>
		step.title.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const activeStep =
		filteredSteps.length > 0 ? filteredSteps[currentStep] : steps[currentStep];

	const progress = ((currentStep + 1) / steps.length) * 100;

	const handleNext = () => {
		if (currentStep < steps.length - 1) {
			setCurrentStep((prev) => prev + 1);
		}
	};

	const handlePrevious = () => {
		if (currentStep > 0) {
			setCurrentStep((prev) => prev - 1);
		}
	};

	const handleSearch = (query) => {
		setSearchQuery(query);
		if (filteredSteps.length > 0) {
			setCurrentStep(0);
		}
	};

	return (
		<div className="flex flex-col min-h-screen bg-gray-950 text-white pt-16 sm:pt-20">
			{/* Secondary Header */}
			<header className="sticky top-16 sm:top-20 z-40 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
				<div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
					<div className="flex items-center space-x-4">
						<button
							onClick={() => setIsMobileMenuOpen(true)}
							className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
						>
							<Menu className="w-5 h-5" />
						</button>
					</div>

					<div className="w-full md:mx-20">
						<SearchBar onSearch={handleSearch} searchQuery={searchQuery} />
					</div>
				</div>
			</header>

			{/* Mobile Menu */}
			<div
				className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
					isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
				}`}
			>
				<div
					className={`absolute inset-y-0 left-0 w-64 bg-gray-900 border-r border-gray-800 transition-transform duration-300 ${
						isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
					}`}
				>
					<div className="flex flex-col h-full">
						<div className="flex justify-between items-center p-4 border-b border-gray-800">
							<h3 className="font-medium">Contents</h3>
							<button onClick={() => setIsMobileMenuOpen(false)}>
								<X className="w-5 h-5" />
							</button>
						</div>
						<div className="flex-1 overflow-y-auto">
							<TableOfContents
								steps={steps}
								currentStep={currentStep}
								onStepClick={(index) => {
									setCurrentStep(index);
									setIsMobileMenuOpen(false);
								}}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<main className="flex-1">
				<div className="max-w-7xl mx-auto px-4">
					<div className="flex">
						{/* Sidebar - Desktop */}
						<div className="hidden lg:block">
							<div
								className="sticky"
								style={{ top: "8rem", height: "calc(100vh - 8rem)" }}
							>
								<TableOfContents
									steps={steps}
									currentStep={currentStep}
									onStepClick={setCurrentStep}
								/>
							</div>
						</div>

						{/* Content */}
						<div className="flex-1 min-h-screen py-8 lg:pl-8">
							<ProgressBar progress={progress} />

							{filteredSteps.length === 0 ? (
								<div className="mt-8 text-center py-12">
									<p className="text-gray-400">
										No results found for {`${searchQuery}`}
									</p>
									<button
										onClick={() => setSearchQuery("")}
										className="mt-4 px-4 py-2 text-sm bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
									>
										Clear Search
									</button>
								</div>
							) : (
								<div className="mt-8">
									<StepContent step={activeStep} isActive={true} />
								</div>
							)}

							<Navigation
								currentStep={currentStep}
								totalSteps={steps.length}
								onPrevious={handlePrevious}
								onNext={handleNext}
							/>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default Tutorial;
