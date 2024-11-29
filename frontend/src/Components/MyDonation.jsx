import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Wallet,
	TrendingUp,
	Calendar,
	CreditCard,
	ChevronDown,
	Zap,
	Award,
	PieChart,
} from "lucide-react";
import { ethers } from "ethers";
import { getContract } from "../helper/contract";
import DonorWithdrawalVotes from "./DonorWithdrawalVotes";

const MyDonation = () => {
	const [donations, setDonations] = useState([]);
	const [expanded, setExpanded] = useState(null);
	const [stats, setStats] = useState({
		totalDonated: 0,
		campaignCount: 0,
		averageDonation: 0,
	});

	const fetchDonations = async () => {
		try {
			const contract = await getContract();
			const [donationData, totalsData] = await Promise.all([
				contract.getMyDonations(),
				contract.getMyDonationTotals(),
			]);
			console.log(totalsData);

			const formattedDonations = donationData.map((donation) => ({
				campaignId: donation.campaignId,
				amount: ethers.formatEther(donation.amount),
				timestamp: new Date(
					Number(donation.timestamp) * 1000
				).toLocaleDateString(),
				category: donation.category,
				isRefunded: donation.isRefunded,
			}));

			const totalDonated = formattedDonations.reduce(
				(sum, d) => sum + parseFloat(d.amount),
				0
			);
			const campaignCount = new Set(formattedDonations.map((d) => d.campaignId))
				.size;

			setDonations(formattedDonations);
			setStats({
				totalDonated,
				campaignCount,
				averageDonation: totalDonated / campaignCount || 0,
			});
		} catch (error) {
			console.error("Donation fetch failed", error);
		}
	};

	useEffect(() => {
		fetchDonations();
	}, []);

	return (
		<div className="bg-gradient-to-br from-zinc-900 via-black to-zinc-900 min-h-screen text-white pt-24 px-4 sm:px-6 space-y-8">
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="text-center space-y-6"
			>
				<div className="inline-flex items-center bg-white/10 rounded-full px-4 py-2 text-sm mx-auto">
					<TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
					Impact Dashboard
				</div>
				<h1
					className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent 
          bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 
          animate-text-shimmer"
				>
					Your Contribution Journey
				</h1>
				<p className="text-white/60 max-w-xl mx-auto text-sm sm:text-base">
					Transform communities, one donation at a time. Your generosity creates
					waves of change.
				</p>
			</motion.div>

			<div className="grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
				{[
					{
						icon: <Wallet className="w-8 h-8 text-purple-400" />,
						value: `${stats.totalDonated.toFixed(3)} ETH`,
						label: "Total Donated",
						bgClass: "from-purple-900/50 to-indigo-900/50",
					},
					{
						icon: <Award className="w-8 h-8 text-pink-400" />,
						value: stats.campaignCount,
						label: "Campaigns Supported",
						bgClass: "from-pink-900/50 to-purple-900/50",
					},
					{
						icon: <PieChart className="w-8 h-8 text-indigo-400" />,
						value: `${stats.averageDonation.toFixed(2)} ETH`,
						label: "Avg Donation",
						bgClass: "from-indigo-900/50 to-blue-900/50",
					},
				].map((stat, index) => (
					<motion.div
						key={index}
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ delay: index * 0.2 }}
						className={`bg-gradient-to-br ${stat.bgClass} 
              rounded-2xl p-6 border border-white/10 
              hover:scale-105 transition-transform duration-300`}
					>
						<div className="flex justify-between items-center mb-4">
							{stat.icon}
							<span className="text-white/60 text-xs">{stat.label}</span>
						</div>
						<p
							className="text-3xl font-bold bg-clip-text text-transparent 
              bg-gradient-to-r from-white to-white/60"
						>
							{stat.value}
						</p>
					</motion.div>
				))}
			</div>

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="max-w-2xl mx-auto space-y-6 pb-16"
			>
				<h2
					className="text-3xl font-bold text-center bg-clip-text text-transparent 
        bg-gradient-to-r from-purple-400 to-pink-500"
				>
					Donation History
				</h2>

				{donations.length === 0 ? (
					<motion.div
						initial={{ scale: 0.9 }}
						animate={{ scale: 1 }}
						className="text-center bg-white/5 p-12 rounded-3xl border border-white/10"
					>
						<CreditCard className="mx-auto w-20 h-20 text-white/20 mb-6" />
						<p className="text-white/60 text-xl">
							Your generosity starts here. Make your first donation!
						</p>
					</motion.div>
				) : (
					<div className="space-y-4">
						{donations.map((donation, index) => (
							<motion.div
								key={index}
								layout
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{
									opacity: 1,
									scale: 1,
									transition: {
										duration: 0.2,
										ease: "easeInOut",
									},
								}}
								exit={{
									opacity: 0,
									scale: 0.95,
									transition: { duration: 0.2 },
								}}
								className="bg-white/5 rounded-3xl overflow-hidden border border-white/10 
                hover:border-purple-500/50 transition-all"
							>
								<div
									onClick={() => setExpanded(expanded === index ? null : index)}
									className="p-4 sm:p-5 flex justify-between items-center cursor-pointer 
                  hover:bg-white/10 transition group"
								>
									<div className="flex items-center space-x-3 sm:space-x-4">
										<Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 group-hover:rotate-6 transition" />
										<span className="text-xs sm:text-sm font-medium truncate max-w-[150px]">
											{donation.timestamp}
										</span>
									</div>
									<div className="flex items-center space-x-2 sm:space-x-3">
										<span
											className={`text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full font-bold uppercase ${
												donation.isRefunded
													? "bg-red-900/30 text-red-400"
													: "bg-purple-900/30 text-purple-400"
											}`}
										>
											{donation.isRefunded ? "Refunded" : "Donated"}
										</span>
										<ChevronDown
											className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
												expanded === index ? "rotate-180" : ""
											}`}
										/>
									</div>
								</div>

								<AnimatePresence>
									{expanded === index && (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{
												opacity: 1,
												height: "auto",
												transition: {
													duration: 0.3,
													ease: "easeInOut",
												},
											}}
											exit={{
												opacity: 0,
												height: 0,
												transition: {
													duration: 0.2,
													ease: "easeInOut",
												},
											}}
											className="p-4 sm:p-5 bg-black/40 border-t border-white/10"
										>
											<div className="grid grid-cols-2 gap-3 sm:gap-4">
												<div>
													<p className="text-[10px] sm:text-xs text-white/60 mb-1">
														Amount
													</p>
													<p className="font-bold text-purple-300 text-sm sm:text-lg">
														{donation.amount} ETH
													</p>
												</div>
												<div>
													<p className="text-[10px] sm:text-xs text-white/60 mb-1">
														Category
													</p>
													<p className="capitalize text-white/80 text-sm sm:text-lg flex items-center">
														<Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-pink-400" />
														{donation.category}
													</p>
												</div>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</motion.div>
						))}
					</div>
				)}
			</motion.div>
			<div className="pb-24 max-w-4xl mx-auto">
				<DonorWithdrawalVotes />
			</div>
		</div>
	);
};

export default MyDonation;
