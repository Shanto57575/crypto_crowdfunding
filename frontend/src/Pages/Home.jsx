import { useState, useEffect } from "react";
import {
	Wallet,
	TrendingUp,
	Shield,
	Users,
	Globe,
	ChevronUp,
	ArrowUpRight,
	Boxes,
	BookOpen,
	HelpCircle,
	MessageCircle,
	Rocket,
	PiggyBank,
	Target,
	ArrowRight,
	ChevronDown,
	Mail,
	Phone,
	MapPin,
} from "lucide-react";

const benefits = [
	{
		icon: <Shield className="w-8 h-8" />,
		title: "Secure & Transparent",
		description:
			"Smart contract-based funding with complete transparency and security",
	},
	{
		icon: <Rocket className="w-8 h-8" />,
		title: "Quick Launch",
		description: "Start your campaign in minutes with our intuitive platform",
	},
	{
		icon: <PiggyBank className="w-8 h-8" />,
		title: "Lower Fees",
		description: "Minimal platform fees compared to traditional crowdfunding",
	},
	{
		icon: <Target className="w-8 h-8" />,
		title: "Global Reach",
		description: "Access to worldwide community of crypto-savvy investors",
	},
];

const resources = [
	{
		icon: <Users className="w-6 h-6" />,
		title: "Join the Community",
		description: "Connect with creators and backers",
		bgColor: "from-purple-500 to-indigo-600",
	},
	{
		icon: <BookOpen className="w-6 h-6" />,
		title: "Blog/Resources",
		description: "Guides, tips, and platform updates",
		bgColor: "from-pink-500 to-rose-600",
	},
	{
		icon: <HelpCircle className="w-6 h-6" />,
		title: "FAQs",
		description: "Quick answers to common questions",
		bgColor: "from-orange-500 to-red-600",
	},
	{
		icon: <MessageCircle className="w-6 h-6" />,
		title: "Contact Us",
		description: "You are not alone! Get help from our support team",
		bgColor: "from-green-500 to-emerald-600",
	},
];

const faqs = [
	{
		question: "How does blockchain crowdfunding work?",
		answer:
			"Blockchain crowdfunding uses smart contracts to securely collect and distribute funds. When you back a project, your funds are held in escrow until project milestones are met.",
	},
	{
		question: "What are the platform fees?",
		answer:
			"Our platform charges a minimal 3% fee on successfully funded projects, significantly lower than traditional crowdfunding platforms.",
	},
	{
		question: "How do I start a campaign?",
		answer:
			"Connect your wallet, fill out your project details, set funding goals, and launch. Our intuitive interface makes it easy to start in minutes.",
	},
	{
		question: "Is my investment secure?",
		answer:
			"All transactions are secured by blockchain technology. Smart contracts ensure transparent fund management and automatic distributions.",
	},
];

const Home = () => {
	const [isVisible, setIsVisible] = useState(false);
	const [activeAccordion, setActiveAccordion] = useState(0);
	console.log(isVisible);

	useEffect(() => {
		const toggleVisibility = () => {
			setIsVisible(window.pageYOffset > 300);
		};
		window.addEventListener("scroll", toggleVisibility);
		return () => window.removeEventListener("scroll", toggleVisibility);
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
			{/* Hero Section */}
			<section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-32">
				<video
					className="absolute inset-0 w-full h-full object-cover"
					src="banner.mp4"
					autoPlay
					muted
					loop
				/>
				<div className="absolute inset-0 bg-black/60 z-[1]"></div>

				<div className="container mx-auto px-6 relative z-10">
					<div className="text-center max-w-4xl mx-auto">
						<h1 className="text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 drop-shadow-2xl">
							Fund the Future
						</h1>
						<p className="text-2xl mb-6 text-gray-100 font-light">
							Where Visionaries Meet Investors in the Web3 Space
						</p>
						<p className="text-lg mb-12 text-gray-300 max-w-2xl mx-auto">
							Join the revolution in decentralized crowdfunding. Back innovative
							projects, support creators, and earn rewards through blockchain
							technology.
						</p>
						<div className="flex justify-center gap-6">
							<button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-full font-semibold flex items-center gap-2 transform hover:scale-105 transition-all">
								Start Funding <ArrowUpRight className="w-5 h-5" />
							</button>
							<button className="border-2 border-purple-500 px-8 py-4 rounded-full font-semibold hover:bg-purple-600/20 backdrop-blur-sm transition-all">
								Create campaign
							</button>
						</div>

						{/* Quick Stats */}
					</div>
				</div>
			</section>
			<div className="my-20 grid grid-cols-3 gap-8 max-w-5xl mx-auto backdrop-blur-sm bg-gradient-to-r bg-black shadow-md shadow-purple-600 p-8 rounded-2xl border border-gray-800/50">
				<div className="text-center">
					<h3 className="text-3xl font-bold text-purple-400">$50M+</h3>
					<p className="text-gray-400">Total Funded</p>
				</div>
				<div className="text-center">
					<h3 className="text-3xl font-bold text-pink-400">2.5K+</h3>
					<p className="text-gray-400">Projects Launched</p>
				</div>
				<div className="text-center">
					<h3 className="text-3xl font-bold text-orange-400">100K+</h3>
					<p className="text-gray-400">Active Backers</p>
				</div>
			</div>

			{/* Features Section */}
			<section className="py-20 bg-black/50">
				<div className="container mx-auto px-6">
					<h2 className="text-4xl font-bold text-center mb-16">
						Why Choose Us?
					</h2>
					<div className="grid md:grid-cols-3 gap-12">
						{[
							{
								icon: <Shield className="w-12 h-12 text-purple-500" />,
								title: "Secure & Transparent",
							},
							{
								icon: <Globe className="w-12 h-12 text-purple-500" />,
								title: "Global Access",
							},
							{
								icon: <Wallet className="w-12 h-12 text-purple-500" />,
								title: "No Intermediaries",
							},
						].map((feature, index) => (
							<div
								key={index}
								className="text-center p-6 rounded-xl bg-gray-800/50 hover:bg-gray-800/80 transition-all shadow-purple-500 shadow-sm hover:shadow-md hover:shadow-purple-300"
							>
								<div className="flex justify-center mb-4">{feature.icon}</div>
								<h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
								<p className="text-gray-400">
									Lorem ipsum dolor sit amet, consectetur adipiscing elit.
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className="py-20">
				<div className="container mx-auto px-6">
					<h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
					<div className="grid md:grid-cols-4 gap-8">
						{[
							{ icon: <Wallet />, title: "Connect Wallet" },
							{ icon: <Boxes />, title: "Create Project" },
							{ icon: <Users />, title: "Get Funded" },
							{ icon: <TrendingUp />, title: "Track Progress" },
						].map((step, index) => (
							<div key={index} className="flex flex-col items-center relative">
								<div className="w-16 h-16 hover:w-24 hover:h-24 rounded-full bg-purple-600 flex items-center justify-center mb-4 hover:border border-purple-500 hover:p-10 duration-500">
									{step.icon}
								</div>
								<h3 className="text-xl font-semibold mb-2">{step.title}</h3>
								<p className="text-center text-gray-400">Step {index + 1}</p>
								{index < 3 && (
									<div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-purple-500 to-purple-500/0" />
								)}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Benefits Section */}
			<section className="py-24 bg-gray-900/50">
				<div className="container mx-auto px-6">
					<div className="text-center mb-20">
						<h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
							Benefits of Using the Platform
						</h2>
						<p className="text-gray-400 max-w-2xl mx-auto">
							Experience the future of crowdfunding with our innovative
							blockchain-based platform
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
						{benefits.map((benefit, index) => (
							<div
								key={index}
								className="p-6 rounded-2xl bg-gray-800/50 hover:bg-gray-800/80 transition-all border border-gray-700/50 hover:border-purple-500/50 group"
							>
								<div className="mb-4 text-purple-500 group-hover:scale-110 transition-transform">
									{benefit.icon}
								</div>
								<h3 className="text-xl font-semibold mb-3 text-white">
									{benefit.title}
								</h3>
								<p className="text-gray-400">{benefit.description}</p>
							</div>
						))}
					</div>

					{/* Resources Grid */}
					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
						{resources.map((resource, index) => (
							<div key={index} className="group cursor-pointer">
								<div
									className={`p-6 rounded-2xl bg-gradient-to-r ${resource.bgColor} transform hover:-translate-y-1 transition-all duration-300`}
								>
									<div className="flex items-center justify-between mb-4">
										<div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
											{resource.icon}
										</div>
										<ArrowRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
									</div>
									<h3 className="text-xl font-semibold mb-2 text-white">
										{resource.title}
									</h3>
									<p className="text-white/80">{resource.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Featured Projects */}
			<section className="py-20 bg-black/50">
				<div className="container mx-auto px-6">
					<h2 className="text-4xl font-bold text-center mb-16">
						Featured Projects
					</h2>
					<div className="grid md:grid-cols-3 gap-8">
						<div className="rounded-xl overflow-hidden bg-gray-800/50 hover:bg-gray-800/80 transition-all group">
							<div className="relative">
								<img
									src="https://t4.ftcdn.net/jpg/02/99/70/57/240_F_299705711_auOvoTZv6yKdg1xsdePbWMvTpC83FqZg.jpg"
									alt="Project"
									className="w-full h-64 object-cover"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
							</div>
							<div className="p-6">
								<div className="flex justify-between items-start mb-4">
									<div>
										<h3 className="text-xl font-semibold mb-2">
											Project Title
										</h3>
										<span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
											Category
										</span>
									</div>
									<div className="text-right">
										<span className="text-green-400">75% Funded</span>
										<p className="text-sm text-gray-400">12 days left</p>
									</div>
								</div>
								<div className="w-full h-2 bg-gray-700 rounded-full mb-4">
									<div className="w-3/4 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
								</div>
								<div className="flex justify-between text-sm text-gray-400">
									<span>Raised: $37,500</span>
									<span>Goal: $50,000</span>
								</div>
							</div>
						</div>
						<div className="rounded-xl overflow-hidden bg-gray-800/50 hover:bg-gray-800/80 transition-all group">
							<div className="relative">
								<img
									src="https://t3.ftcdn.net/jpg/07/19/14/36/240_F_719143618_hwdmyu52H3MyFjSk8oYpPAXvglrkhIJY.jpg"
									alt="Project"
									className="w-full h-64 object-cover"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
							</div>
							<div className="p-6">
								<div className="flex justify-between items-start mb-4">
									<div>
										<h3 className="text-xl font-semibold mb-2">
											Project Title
										</h3>
										<span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
											Category
										</span>
									</div>
									<div className="text-right">
										<span className="text-green-400">75% Funded</span>
										<p className="text-sm text-gray-400">12 days left</p>
									</div>
								</div>
								<div className="w-full h-2 bg-gray-700 rounded-full mb-4">
									<div className="w-3/4 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
								</div>
								<div className="flex justify-between text-sm text-gray-400">
									<span>Raised: $37,500</span>
									<span>Goal: $50,000</span>
								</div>
							</div>
						</div>
						<div className="rounded-xl overflow-hidden bg-gray-800/50 hover:bg-gray-800/80 transition-all group">
							<div className="relative">
								<img
									src="https://t3.ftcdn.net/jpg/04/72/72/26/240_F_472722650_jFvy5srIS6gemjYdK7uPhH7bQk38QDSe.jpg"
									alt="Project"
									className="w-full h-64 object-cover"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
							</div>
							<div className="p-6">
								<div className="flex justify-between items-start mb-4">
									<div>
										<h3 className="text-xl font-semibold mb-2">
											Project Title
										</h3>
										<span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
											Category
										</span>
									</div>
									<div className="text-right">
										<span className="text-green-400">75% Funded</span>
										<p className="text-sm text-gray-400">12 days left</p>
									</div>
								</div>
								<div className="w-full h-2 bg-gray-700 rounded-full mb-4">
									<div className="w-3/4 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
								</div>
								<div className="flex justify-between text-sm text-gray-400">
									<span>Raised: $37,500</span>
									<span>Goal: $50,000</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section className="py-20 bg-gray-900/50">
				<div className="container mx-auto px-6">
					<h2 className="text-4xl font-bold text-center mb-16">
						Frequently Asked Questions
					</h2>
					<div className="max-w-3xl mx-auto">
						{faqs.map((faq, index) => (
							<div key={index} className="mb-4">
								<button
									className={`w-full px-6 py-4 bg-gray-800/50 hover:bg-gray-800/80 rounded-xl ${
										activeAccordion === index ? "rounded-b-none" : ""
									} flex items-center justify-between transition-all`}
									onClick={() =>
										setActiveAccordion(activeAccordion === index ? null : index)
									}
								>
									<span className="text-left font-semibold">
										{faq.question}
									</span>
									{activeAccordion === index ? (
										<ChevronUp className="w-5 h-5" />
									) : (
										<ChevronDown className="w-5 h-5" />
									)}
								</button>
								{activeAccordion === index && (
									<div className="px-6 py-4 bg-gray-800/30 rounded-b-xl">
										<p className="text-gray-300">{faq.answer}</p>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Contact Us Section */}
			<section className="py-20 bg-black/50">
				<div className="container mx-auto px-6">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
							Get in Touch
						</h2>
						<p className="text-gray-400 max-w-2xl mx-auto">
							Have questions or need support? Our team is here to help you
							navigate the future of crowdfunding.
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
						{/* Contact Information */}
						<div className="space-y-8">
							<div className="flex items-start space-x-4">
								<div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0">
									<Mail className="w-6 h-6 text-purple-400" />
								</div>
								<div>
									<h3 className="text-xl font-semibold mb-2">Email Us</h3>
									<p className="text-gray-400">support@platform.com</p>
									<p className="text-gray-400">business@platform.com</p>
								</div>
							</div>

							<div className="flex items-start space-x-4">
								<div className="w-12 h-12 rounded-full bg-pink-600/20 flex items-center justify-center flex-shrink-0">
									<Phone className="w-6 h-6 text-pink-400" />
								</div>
								<div>
									<h3 className="text-xl font-semibold mb-2">Call Us</h3>
									<p className="text-gray-400">+1 (555) 123-4567</p>
									<p className="text-gray-400">Mon-Fri 9AM-6PM EST</p>
								</div>
							</div>

							<div className="flex items-start space-x-4">
								<div className="w-12 h-12 rounded-full bg-orange-600/20 flex items-center justify-center flex-shrink-0">
									<MapPin className="w-6 h-6 text-orange-400" />
								</div>
								<div>
									<h3 className="text-xl font-semibold mb-2">Visit Us</h3>
									<p className="text-gray-400">123 Blockchain Street</p>
									<p className="text-gray-400">Crypto City, CC 12345</p>
								</div>
							</div>
						</div>

						{/* Contact Form */}
						<div className="bg-gray-800/50 p-8 rounded-2xl">
							<form className="space-y-6">
								<div>
									<label className="block text-sm font-medium mb-2">Name</label>
									<input
										type="text"
										className="w-full px-4 py-3 bg-gray-900/50 rounded-lg border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
										placeholder="Your name"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-2">
										Email
									</label>
									<input
										type="email"
										className="w-full px-4 py-3 bg-gray-900/50 rounded-lg border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
										placeholder="your@email.com"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-2">
										Message
									</label>
									<textarea
										className="w-full px-4 py-3 bg-gray-900/50 rounded-lg border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all h-32"
										placeholder="Your message..."
									></textarea>
								</div>
								<button
									type="submit"
									className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-lg font-semibold transform hover:scale-105 transition-all"
								>
									Send Message
								</button>
							</form>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Home;
