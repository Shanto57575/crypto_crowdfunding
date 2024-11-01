import { motion } from "framer-motion";
import {
	Github,
	Mail,
	MapPin,
	Phone,
	Twitter,
	Heart,
	BookOpen,
	Rocket,
	Palette,
	Users,
	Cpu,
	Leaf,
} from "lucide-react";

const categories = [
	{
		id: "DISASTER_RELIEF",
		label: "Disaster Relief",
		icon: Heart,
		color: "text-red-500",
	},
	{
		id: "MEDICAL_TREATMENT",
		label: "Medical Treatment",
		icon: Heart,
		color: "text-blue-500",
	},
	{
		id: "EDUCATION",
		label: "Education",
		icon: BookOpen,
		color: "text-yellow-500",
	},
	{
		id: "STARTUP_BUSINESS",
		label: "Startup Business",
		icon: Rocket,
		color: "text-purple-500",
	},
	{
		id: "CREATIVE_PROJECTS",
		label: "Creative Projects",
		icon: Palette,
		color: "text-pink-500",
	},
	{
		id: "COMMUNITY_SERVICE",
		label: "Community Service",
		icon: Users,
		color: "text-green-500",
	},
	{
		id: "TECHNOLOGY",
		label: "Technology",
		icon: Cpu,
		color: "text-indigo-500",
	},
	{
		id: "ENVIRONMENTAL",
		label: "Environmental",
		icon: Leaf,
		color: "text-emerald-500",
	},
];

const Footer = () => {
	return (
		<footer className="bg-gray-950 py-12">
			<div className="container mx-auto px-6">
				<div className="grid md:grid-cols-4 gap-8">
					<div>
						<h3 className="text-2xl font-bold mb-4">FundChain</h3>
						<p className="text-gray-400 mb-4">
							Decentralized crowdfunding platform powered by blockchain
							technology.
						</p>
						<div className="flex space-x-4">
							<motion.a
								whileHover={{ scale: 1.1 }}
								href="#"
								className="text-gray-400 hover:text-white"
							>
								<Twitter size={20} />
							</motion.a>
							<motion.a
								whileHover={{ scale: 1.1 }}
								href="#"
								className="text-gray-400 hover:text-white"
							>
								Innovators Trio
							</motion.a>
							<motion.a
								whileHover={{ scale: 1.1 }}
								href="#"
								className="text-gray-400 hover:text-white"
							>
								<Github size={20} />
							</motion.a>
						</div>
					</div>

					<div>
						<h4 className="text-lg font-bold mb-4">Quick Links</h4>
						<ul className="space-y-2 text-gray-400">
							<li>
								<a href="#" className="hover:text-white transition">
									About Us
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-white transition">
									How It Works
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-white transition">
									Featured Projects
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-white transition">
									Success Stories
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-white transition">
									FAQs
								</a>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="text-lg font-bold mb-4">Categories</h4>
						<ul className="space-y-2 text-gray-400">
							{categories.slice(0, 5).map((category) => (
								<li key={category.id}>
									<a href="#" className="hover:text-white transition">
										{category.label}
									</a>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h4 className="text-lg font-bold mb-4">Contact Us</h4>
						<ul className="space-y-2 text-gray-400">
							<li className="flex items-center space-x-2">
								<Mail size={16} />
								<span>support@fundchain.io</span>
							</li>
							<li className="flex items-center space-x-2">
								<Phone size={16} />
								<span>+1 (555) 123-4567</span>
							</li>
							<li className="flex items-center space-x-2">
								<MapPin size={16} />
								<span>Decentraland, Web3.0</span>
							</li>
						</ul>
					</div>
				</div>

				<div className="border-t border-gray-800 mt-12 pt-8">
					<div className="flex flex-col md:flex-row justify-between items-center">
						<p className="text-gray-400 text-sm">
							© 2024 FundChain. All rights reserved.
						</p>
						<div className="flex space-x-6 mt-4 md:mt-0">
							<a href="#" className="text-gray-400 hover:text-white text-sm">
								Privacy Policy
							</a>
							<a href="#" className="text-gray-400 hover:text-white text-sm">
								Terms of Service
							</a>
							<a href="#" className="text-gray-400 hover:text-white text-sm">
								Cookie Policy
							</a>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
