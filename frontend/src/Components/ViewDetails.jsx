import { formatEther } from "ethers";
import { AnimatePresence, motion } from "framer-motion";
import {
	AlertCircle,
	Bookmark,
	Calendar,
	DollarSign,
	MessageCircle,
	Share2,
	Target,
	UserRound,
	Users,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getContract } from "../helper/contract";

const ViewDetails = () => {
	const [campaign, setCampaign] = useState(null);
	const [posts, setAllPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [activeTab, setActiveTab] = useState("about");
	const [showShareModal, setShowShareModal] = useState(false);
	const [isBookmarked, setIsBookmarked] = useState(false);
	const { id: campaignId } = useParams();

	console.log('campaign', campaign);

	const getAllPosts = async () => {
		const response = await fetch(
			"https://crypto-crowdfunding-3go8.onrender.com/api/post/all-posts",
			{
				method: "GET",
			}
		);
		console.log(response);

		const responseData = await response.json();
		setAllPosts(responseData.filter((data) => data.campaignId === campaignId));
		console.log("responseData", responseData);
	};

	useEffect(() => {
		getAllPosts();
	}, []);

	const campaignDetails = async () => {
		try {
			setLoading(true);
			const contract = await getContract();
			if (!contract) throw new Error("Failed to load contract");

			const details = await contract.getCampaignDetails(campaignId);
			const response = await fetch(details.metadataHash);
			if (!response.ok) throw new Error("Failed to fetch IPFS data");
			const data = await response.json();

			const formattedCampaign = {
				id: details.id,
				owner: details.owner,
				metadataHash: data,
				target: formatEther(details.target),
				deadline: Number(details.deadline),
				amountCollected: formatEther(details.amountCollected),
				claimed: details.claimed,
				status: details.status,
				category: details.category,
				donorList: details.donorList,
			};

			console.log('askdg', formattedCampaign?.donorList);

			setCampaign(formattedCampaign);
			setLoading(false);
		} catch (err) {
			setError(err.message);
			setLoading(false);
		}
	};

	useEffect(() => {
		if (campaignId) {
			campaignDetails();
		}
	}, [campaignId]);

	const calculateProgress = () => {
		if (!campaign?.target || !campaign?.amountCollected) return 0;
		const progress =
			(parseFloat(campaign.amountCollected) / parseFloat(campaign.target)) *
			100;
		return Math.min(progress, 100).toFixed(1);
	};

	const calculateTimeLeft = () => {
		if (!campaign?.deadline) return null;
		const now = Math.floor(Date.now() / 1000);
		const deadline = Number(campaign.deadline);
		const difference = deadline - now;

		if (difference <= 0) return "Ended";

		const days = Math.floor(difference / (60 * 60 * 24));
		const hours = Math.floor((difference % (60 * 60 * 24)) / (60 * 60));

		return `${days}d ${hours}h left`;
	};

	const formatDate = (timestamp) => {
		if (!timestamp) return "N/A";
		return new Date(timestamp).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const ShareModal = () => (
		<AnimatePresence>
			{showShareModal && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
					onClick={() => setShowShareModal(false)}
				>
					<motion.div
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.9, opacity: 0 }}
						className="bg-gray-800 p-6 rounded-2xl w-full max-w-md m-4"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-bold">Share this campaign</h3>
							<button onClick={() => setShowShareModal(false)}>
								<X className="h-5 w-5 text-gray-400 hover:text-white" />
							</button>
						</div>
						<div className="space-y-4">
							{["Twitter", "Facebook", "LinkedIn", "Email"].map((platform) => (
								<button
									key={platform}
									className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors flex items-center justify-center space-x-2"
								>
									<span>{platform}</span>
								</button>
							))}
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);

	if (loading || error || !campaign) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
				{loading && (
					<motion.div
						animate={{ rotate: 360 }}
						transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
						className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
					/>
				)}
				{error && (
					<div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center space-x-2">
						<AlertCircle className="h-5 w-5 text-red-500" />
						<p className="text-red-500">{error}</p>
					</div>
				)}
				{!campaign && !loading && !error && (
					<div className="text-white text-lg">No campaign found</div>
				)}
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
			{/* Hero Section */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="relative h-[500px] overflow-hidden"
			>
				<motion.img
					initial={{ scale: 1.1, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.5 }}
					src={campaign.metadataHash?.image || "/api/placeholder/800/400"}
					alt={campaign.metadataHash?.title}
					className="absolute w-full h-full object-cover mt-20"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent">
					<div className="max-w-6xl mx-auto px-4 h-full flex flex-col justify-end pb-12">
						<motion.div
							initial={{ y: 20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							className="space-y-6"
						>
							<div className="flex items-center space-x-4">
								<span className="px-3 py-1 bg-purple-500/20 rounded-full text-purple-400 text-sm font-medium">
									{campaign.category}
								</span>
								<span className="px-3 py-1 font-sans bg-green-500/20 rounded-full text-green-400 text-sm font-medium">
									{calculateTimeLeft()}
								</span>
							</div>

							<h1 className="text-5xl font-bold leading-tight">
								{campaign.metadataHash?.title}
							</h1>

							<div className="flex items-center space-x-6">
								<div className="flex items-center space-x-2">
									<div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
										<Users className="h-5 w-5 text-purple-400" />
									</div>
									<div>
										<p className="text-sm text-gray-400">Created by</p>
										<p className="font-medium">{`${campaign.owner.slice(
											0,
											6
										)}...${campaign.owner.slice(-4)}`}</p>
									</div>
								</div>

								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl flex items-center space-x-2"
									onClick={() => setIsBookmarked(!isBookmarked)}
								>
									<Bookmark
										className={`h-5 w-5 ${
											isBookmarked
												? "text-purple-400 fill-purple-400"
												: "text-white"
										}`}
									/>
									<span>{isBookmarked ? "Saved" : "Save"}</span>
								</motion.button>
							</div>
						</motion.div>
					</div>
				</div>
			</motion.div>

			{/* Main Content */}
			<div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10 pb-20">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column - Campaign Details */}
					<div className="lg:col-span-2 space-y-6">
						{/* Custom Tabs */}
						<div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden mt-14">
							<div className="flex border-b border-gray-700">
								{["about", "updates", "comments"].map((tab) => (
									<button
										key={tab}
										onClick={() => setActiveTab(tab)}
										className={`flex-1 px-6 py-4 text-sm font-medium ${
											activeTab === tab
												? "text-purple-400 border-b-2 border-purple-400"
												: "text-gray-400 hover:text-white"
										}`}
									>
										{tab.charAt(0).toUpperCase() + tab.slice(1)}
									</button>
								))}
							</div>

							<div className="p-6">
								{activeTab === "about" && (
									<div className="space-y-6">
										<p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
											{campaign.metadataHash?.description}
										</p>

										<div className="mt-8">
											<h3 className="text-xl font-bold mb-4">
												Campaign Supporters
											</h3>
											<div className="space-y-4">
												{campaign.donorList?.map((donor, index) => (
													<motion.div
														key={donor}
														initial={{ opacity: 0, x: -20 }}
														animate={{ opacity: 1, x: 0 }}
														transition={{ delay: index * 0.1 }}
														className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl"
													>
														<div className="flex items-center justify-between space-x-3">
															<div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
																<UserRound className="h-5 w-5 text-purple-400" />
															</div>
															<span className="font-medium truncate">
																{donor.donorAddress.slice(0, 6)}
																.........................
																{donor.donorAddress.slice(38, 42)}
															</span>
														</div>
														<span className="text-gray-400 text-sm">
															{Number(donor.totalDonated) / 1e18} ETH
														</span>
													</motion.div>
												))}
											</div>
										</div>
									</div>
								)}

								{activeTab === "updates" && (
									<div className="text-center text-gray-400">
										{posts.length === 0
											? "No Updates Yet"
											: posts.map((post) => (
													<div key={post.id}>
														<h1>{post.title}</h1>
														<p>{post.description}</p>
														<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
															{post.images.map((image, idx) => (
																<div key={idx + 1}>
																	{console.log("image", image)}
																	<img
																		src={`https://crypto-crowdfunding-3go8.onrender.com${image}`}
																		alt={`Post image ${idx + 1}`}
																		className="w-full h-36 rounded-lg"
																	/>
																</div>
															))}
														</div>
													</div>
											  ))}
									</div>
								)}

								{activeTab === "comments" && (
									<div className="text-center text-gray-400 py-8">
										No comments yet
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Right Column - Campaign Stats */}
					<div className="space-y-6 mt-14">
						<div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
							<div className="space-y-6">
								<div>
									<p className="text-4xl font-bold">
										{campaign.amountCollected} ETH
									</p>
									<p className="text-gray-400">
										raised of {campaign.target} ETH goal
									</p>
								</div>

								<div className="space-y-2">
									<div className="h-2 bg-gray-700 rounded-full overflow-hidden">
										<motion.div
											initial={{ width: 0 }}
											animate={{ width: `${calculateProgress()}%` }}
											transition={{ duration: 0.8, delay: 0.5 }}
											className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
										/>
									</div>
									<div className="flex justify-between text-sm">
										<span>{calculateProgress()}% Complete</span>
										<span>{calculateTimeLeft()}</span>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4 py-4">
									<div className="text-center p-4 bg-gray-700/30 rounded-xl">
										<p className="text-2xl font-bold">
											{campaign.donorList?.length || 0}
										</p>
										<p className="text-gray-400">Supporters</p>
									</div>
									<div className="text-center p-4 bg-gray-700/30 rounded-xl">
										<p className="text-2xl font-bold">
											{new Date(
												Number(campaign.deadline) * 1000
											).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
											})}
										</p>
										<p className="text-gray-400">End Date</p>
									</div>
								</div>

								<Link to="/all-campaigns">
									<motion.button
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										className="w-full py-4 bg-purple-500 hover:bg-purple-600 rounded-xl font-semibold transition-colors"
									>
										Support this campaign
									</motion.button>
								</Link>

								<div className="pt-4">
									<h3 className="text-lg font-semibold mb-4">
										Share this campaign
									</h3>
									<div className="grid grid-cols-2 gap-4">
										{["Twitter", "Facebook", "LinkedIn", "Email"].map(
											(platform) => (
												<motion.button
													key={platform}
													whileHover={{ scale: 1.05 }}
													whileTap={{ scale: 0.95 }}
													className="p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-xl text-sm flex items-center justify-center space-x-2 transition-colors"
												>
													<span>{platform}</span>
												</motion.button>
											)
										)}
									</div>
								</div>
							</div>

							{/* Campaign Stats Details */}
							<div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
								<h3 className="text-lg font-semibold mb-4">Campaign Details</h3>
								<div className="space-y-4">
									<div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
										<div className="flex items-center space-x-3">
											<div className="p-2 bg-purple-500/20 rounded-lg">
												<Calendar className="h-5 w-5 text-purple-400" />
											</div>
											<span className="text-gray-400">Created</span>
										</div>
										<span className="text-sm">
											{formatDate(campaign.metadataHash.createdAt)}
										</span>
									</div>

									<div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
										<div className="flex items-center space-x-3">
											<div className="p-2 bg-purple-500/20 rounded-lg">
												<Target className="h-5 w-5 text-purple-400" />
											</div>
											<span className="text-gray-400">Goal</span>
										</div>
										<span>{campaign.target} ETH</span>
									</div>

									<div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
										<div className="flex items-center space-x-3">
											<div className="p-2 bg-purple-500/20 rounded-lg">
												<DollarSign className="h-5 w-5 text-purple-400" />
											</div>
											<span className="text-gray-400">Raised</span>
										</div>
										<span>{campaign.amountCollected} ETH</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Floating Action Buttons */}
				<div className="fixed bottom-8 right-8 flex flex-col space-y-4">
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => setShowShareModal(true)}
						className="p-4 bg-purple-500 hover:bg-purple-600 rounded-full shadow-lg text-white"
					>
						<Share2 className="h-6 w-6" />
					</motion.button>

					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full shadow-lg text-white"
					>
						<MessageCircle className="h-6 w-6" />
					</motion.button>
				</div>

				{/* Share Modal */}
				<ShareModal />
			</div>
		</div>
	);
};

export default ViewDetails;
