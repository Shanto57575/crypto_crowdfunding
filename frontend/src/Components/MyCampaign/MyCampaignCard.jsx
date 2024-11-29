import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { parseEther } from "ethers";
import { motion } from "framer-motion";
import { handleDelete, handleClaimFunds } from "./utils/campaignActions";
import {
	Target,
	Wallet2,
	Tag,
	Clock,
	Edit3,
	Trash2,
	Award,
	ChevronRight,
	Loader2,
	MessageCircle,
} from "lucide-react";
import UpdateModal from "./utils/UpdateModal";

const MyCampaignCard = ({
	campaign,
	loadingStates,
	setLoadingStates,
	onUpdate,
	onWithdraw,
	onUpdateSuccess,
}) => {
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
	const [post, setAllPost] = useState([]);

	const getAllPosts = async () => {
		const response = await fetch("http://localhost:3000/api/post/all-posts", {
			method: "GET",
		});
		console.log(response);

		const responseData = await response.json();
		setAllPost(responseData.filter((data) => data.campaignId === campaign.id));
		console.log("responseData", responseData);
	};

	useEffect(() => {
		getAllPosts();
	}, []);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-900 transition-all duration-300"
		>
			<div className="aspect-video relative">
				<img
					src={campaign.metadataHash.image}
					alt={campaign.metadataHash.title}
					className="w-full h-full object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
				<div className="absolute top-4 right-4">
					<span
						className={`px-3 py-1 rounded-full text-xs font-medium ${
							campaign.status == 0
								? "bg-purple-100 text-purple-600 ring-1 ring-purple-400"
								: "bg-red-100 text-rose-600 ring-1 ring-red-400"
						}`}
					>
						{campaign.status == 0 ? "Active" : "Closed"}
					</span>
				</div>
			</div>

			<div className="p-6 space-y-6">
				<div>
					<h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
						{campaign.metadataHash.title}
					</h3>
					<p className="text-gray-400 text-sm line-clamp-2">
						{campaign.metadataHash.description}
					</p>
				</div>

				<div className="space-y-6">
					<div>
						<div className="flex justify-between mb-2">
							<span className="text-gray-400">Progress</span>
							<span className="text-white font-medium">
								{(
									(Number(campaign.amountCollected) / Number(campaign.target)) *
									100
								).toFixed(1)}
								%
							</span>
						</div>
						<div className="h-2 bg-gray-800 rounded-full overflow-hidden">
							<motion.div
								initial={{ width: 0 }}
								animate={{
									width: `${Math.min(
										(Number(campaign.amountCollected) /
											Number(campaign.target)) *
											100,
										100
									)}%`,
								}}
								transition={{ duration: 1, ease: "easeOut" }}
								className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="bg-gray-800/50 rounded-lg p-4">
							<div className="flex items-center gap-2 text-gray-400 mb-1">
								<Target className="w-4 h-4" />
								<span className="text-sm">Target</span>
							</div>
							<p className="text-white font-semibold">{campaign.target1} ETH</p>
						</div>
						<div className="bg-gray-800/50 rounded-lg p-4">
							<div className="flex items-center gap-2 text-gray-400 mb-1">
								<Wallet2 className="w-4 h-4" />
								<span className="text-sm">Raised</span>
							</div>
							<p className="text-white font-semibold">
								{campaign.amountCollected1} ETH
							</p>
						</div>
					</div>

					<div className="flex items-center justify-between text-sm">
						<div className="flex items-center gap-2 text-gray-400">
							<Tag className="w-4 h-4" />
							<span>{campaign.category}</span>
						</div>
						<div className="flex items-center gap-2 text-gray-400">
							<Clock className="w-4 h-4" />
							<span>
								{new Date(
									Number(campaign.deadline) * 1000
								).toLocaleDateString()}
							</span>
						</div>
					</div>

					{campaign.status == 0 && (
						<div className="flex gap-3">
							{!campaign.claimed &&
								parseEther(campaign.amountCollected) <
									parseEther(campaign.target) && (
									<motion.button
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										onClick={() => {
											if (!loadingStates.update[campaign.id]) {
												onUpdate(campaign);
											}
										}}
										className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
											loadingStates.update[campaign.id]
												? "bg-gray-700 cursor-not-allowed"
												: "bg-gray-800 hover:bg-gray-700 cursor-pointer"
										} text-white`}
									>
										{loadingStates.update[campaign.id] ? (
											<Loader2 className="w-4 h-4 animate-spin" />
										) : (
											<>
												<Edit3 className="w-4 h-4" /> Update
											</>
										)}
									</motion.button>
								)}

							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={() => {
									setIsUpdateModalOpen(true);
								}}
								className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-all"
							>
								<MessageCircle className="w-4 h-4" />
								{post.length > 0 ? "Give recents Updates" : "Give Updates"}
							</motion.button>

							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={() => {
									if (!loadingStates.delete[campaign.id]) {
										handleDelete(
											campaign.id,
											setLoadingStates,
											onUpdateSuccess
										);
									}
								}}
								className={`flex-1 text-center flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
									loadingStates.delete[campaign.id]
										? "bg-gray-700 cursor-not-allowed"
										: "bg-gray-800 hover:bg-gray-700 cursor-pointer"
								} text-white`}
							>
								{loadingStates.delete[campaign.id] ? (
									<Loader2 className="w-4 h-4 animate-spin" />
								) : (
									<>
										<Trash2 className="w-4 h-4" /> Close
									</>
								)}
							</motion.button>

							{campaign.canClaimed > 0 && campaign.claimed == false && (
								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									onClick={() => {
										if (!loadingStates.withdraw[campaign.id]) {
											onWithdraw(campaign);
										}
									}}
									className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
										loadingStates.withdraw[campaign.id]
											? "bg-gray-700 cursor-not-allowed"
											: "bg-gray-800 hover:bg-gray-700 cursor-pointer"
									} text-white`}
								>
									{loadingStates.withdraw[campaign.id] ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										"Withdraw"
									)}
								</motion.button>
							)}
						</div>
					)}

					{campaign.claimed && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="flex items-center justify-center gap-2 bg-green-500/10 text-green-400 py-3 px-4 rounded-lg ring-1 ring-green-500/30"
						>
							<Award className="w-5 h-5" />
							<span className="font-medium">Funds Claimed</span>
						</motion.div>
					)}

					<div className="grid grid-cols-1 gap-3">
						{parseEther(campaign.amountCollected) >=
							parseEther(campaign.target) &&
							!campaign.claimed && (
								<motion.button
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									onClick={() => {
										if (!loadingStates.claim[campaign.id]) {
											handleClaimFunds(
												campaign.id,
												setLoadingStates,
												onUpdateSuccess
											);
										}
									}}
									className={`w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
										loadingStates.claim[campaign.id]
											? "bg-gray-700 cursor-not-allowed"
											: "bg-purple-600 hover:bg-purple-700 cursor-pointer"
									} text-white`}
								>
									{loadingStates.claim[campaign.id] ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<>
											<Wallet2 className="w-4 h-4" /> Claim Funds
										</>
									)}
								</motion.button>
							)}
						<Link
							to={`/all-campaigns/view-details/${campaign.id}`}
							className="w-full"
						>
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-all flex items-center justify-center gap-2"
							>
								View Details <ChevronRight className="w-4 h-4" />
							</motion.button>
						</Link>
					</div>
				</div>
			</div>

			<UpdateModal
				isOpen={isUpdateModalOpen}
				onClose={() => setIsUpdateModalOpen(false)}
				campaignId={campaign.id}
				post={post}
			/>
		</motion.div>
	);
};

export default MyCampaignCard;
