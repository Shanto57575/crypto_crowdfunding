import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract } from "../helper/contract";
import {
	ArrowUpRight,
	HeartIcon,
	Share2Icon,
	Target,
	Wallet,
	Sparkles,
	Clock,
	TrendingUp,
	AlertCircle,
	CheckCircle2,
	Loader2,
	Users,
} from "lucide-react";
import toast from "react-hot-toast";

const CampaignList = () => {
	const [campaigns, setCampaigns] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [donationAmounts, setDonationAmounts] = useState({});
	const [filter, setFilter] = useState("all"); // New state for filter
	const [loadingStates, setLoadingStates] = useState({
		donate: {},
		delete: {},
		claim: {},
		update: {},
	});

	// Helper function to set loading state for a specific action and campaign
	const setLoadingState = (action, campaignId, isLoading) => {
		setLoadingStates((prev) => ({
			...prev,
			[action]: {
				...prev[action],
				[campaignId]: isLoading,
			},
		}));
	};

	const fetchIPFSData = async (hash) => {
		try {
			const response = await fetch(`${hash}`);
			if (!response.ok) throw new Error("Failed to fetch IPFS data");
			const data = await response.json();
			return data;
		} catch (err) {
			console.error("Error fetching IPFS data:", err);
			return null;
		}
	};

	const fetchAllCampaigns = async () => {
		try {
			setLoading(true);
			const contract = await getContract();
			if (!contract) throw new Error("Failed to load contract");

			let onChainCampaigns;
			switch (filter) {
				case "active":
					onChainCampaigns = await contract.getActiveCampaigns();
					break;
				case "inactive":
					onChainCampaigns = await contract.getInactiveCampaigns();
					break;
				default:
					onChainCampaigns = await contract.getAllCampaigns();
			}

			const campaignsWithData = await Promise.all(
				onChainCampaigns.map(async (campaign) => {
					const ipfsData = await fetchIPFSData(campaign.metadataHash);
					return {
						id: campaign.id,
						owner: campaign.owner,
						target: ethers.formatEther(campaign.target),
						deadline: new Date(Number(campaign.deadline) * 1000),
						amountCollected: ethers.formatEther(campaign.amountCollected),
						claimed: campaign.claimed,
						status: campaign.status,
						category: campaign.category,
						title: ipfsData?.title || "Untitled Campaign",
						description: ipfsData?.description || "No description available",
						image:
							ipfsData?.image?.replace(
								"ipfs://",
								"https://gateway.pinata.cloud/ipfs/"
							) || "",
						donorList: campaign.donorList,
					};
				})
			);

			setCampaigns(campaignsWithData);
		} catch (err) {
			console.error("Error fetching campaigns:", err);
			setError(err.message || "Failed to fetch campaigns");
		} finally {
			setLoading(false);
		}
	};

	const handleDonate = async (campaignId, amount) => {
		try {
			setLoadingState("donate", campaignId, true);
			const contract = await getContract();
			if (!contract) throw new Error("Failed to load contract");

			const tx = await contract.donateToCampaign(campaignId, {
				value: ethers.parseEther(amount),
			});
			await tx.wait();
			toast.success(<p className="font-serif">Donation Successful</p>);
			setDonationAmounts({});
			fetchAllCampaigns();
		} catch (err) {
			console.error("Error donating:", err);
			toast.error(
				<p className="font-serif">{err.message || "Failed to donate"}</p>
			);
		} finally {
			setLoadingState("donate", campaignId, false);
		}
	};

	const handleClaimingFunds = async (campaignId) => {
		try {
			setLoadingState("claim", campaignId, true);
			const contract = await getContract();
			if (!contract) throw new Error("Failed to load contract");

			const tx = await contract.claimFunds(campaignId);
			await tx.wait();
			toast.success(<p className="font-serif">Fund Claimed Successfully</p>);
			fetchAllCampaigns();
		} catch (err) {
			const errorMessage =
				err.data?.message ||
				err.error?.data?.message ||
				err.reason ||
				err.message ||
				"Transaction failed";
			toast.error(
				<p className="font-serif">
					{errorMessage.replace("execution reverted:", "").trim()}
				</p>
			);
		} finally {
			setLoadingState("claim", campaignId, false);
		}
	};

	const handleDelete = async (campaignId) => {
		try {
			setLoadingState("delete", campaignId, true);
			const contract = await getContract();
			if (!contract) throw new Error("Failed to load contract");

			const tx = await contract.deleteCampaign(campaignId);
			await tx.wait();
			toast.success(
				<p className="font-serif">Campaign Deleted Successfully</p>
			);
			fetchAllCampaigns();
		} catch (err) {
			console.error("Error deleting campaign:", err);
			toast.error(
				<p className="font-serif">
					{err.message || "Failed to delete campaign"}
				</p>
			);
		} finally {
			setLoadingState("delete", campaignId, false);
		}
	};

	const handleUpdate = async (campaignId) => {
		try {
			setLoadingState("update", campaignId, true);
			// Your update logic here
		} catch (err) {
			console.error("Error updating campaign:", err);
			toast.error(
				<p className="font-serif">
					{err.message || "Failed to update campaign"}
				</p>
			);
		} finally {
			setLoadingState("update", campaignId, false);
		}
	};

	useEffect(() => {
		fetchAllCampaigns();
	}, [filter]);

	if (loading) {
		return (
			<div className="min-h-screen bg-black flex justify-center items-center">
				<div className="relative">
					<div className="w-16 h-16 relative">
						<div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
						<div className="absolute inset-0 rounded-full border-2 border-gray-800"></div>
					</div>
					<Sparkles className="absolute inset-0 m-auto w-6 h-6 text-indigo-400" />
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-black flex justify-center items-center p-4">
				<div className="bg-gray-900/50 backdrop-blur-xl border border-red-500/10 rounded-2xl p-8 max-w-md">
					<div className="text-center space-y-6">
						<div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
							<AlertCircle className="w-8 h-8 text-red-400" />
						</div>
						<p className="text-red-400 text-lg font-medium">{error}</p>
						<button
							onClick={fetchAllCampaigns}
							className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
						>
							<Loader2 className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
							Retry
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8 pt-28">
			<div className="max-w-7xl mx-auto space-y-12">
				<div className="text-center space-y-8">
					<div className="space-y-4">
						<h1 className="text-4xl font-bold bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
							Campaigns
						</h1>
						<p className="text-gray-400 max-w-2xl mx-auto text-lg">
							Support innovative projects & make a difference in the community
						</p>
					</div>

					{/* Filter buttons */}
					<div className="flex justify-center gap-4">
						<button
							onClick={() => setFilter("all")}
							className={`px-6 py-2 rounded-xl transition-all ${
								filter === "all"
									? "bg-indigo-600 text-white"
									: "bg-gray-800 text-gray-300 hover:bg-gray-700"
							}`}
						>
							All Campaigns
						</button>
						<button
							onClick={() => setFilter("active")}
							className={`px-6 py-2 rounded-xl transition-all ${
								filter === "active"
									? "bg-indigo-600 text-white"
									: "bg-gray-800 text-gray-300 hover:bg-gray-700"
							}`}
						>
							Active Campaigns
						</button>
						<button
							onClick={() => setFilter("inactive")}
							className={`px-6 py-2 rounded-xl transition-all ${
								filter === "inactive"
									? "bg-indigo-600 text-white"
									: "bg-gray-800 text-gray-300 hover:bg-gray-700"
							}`}
						>
							Inactive Campaigns
						</button>
					</div>
				</div>

				{campaigns.length === 0 ? (
					<div className="flex justify-center items-center min-h-[60vh]">
						<div className="bg-gray-900/30 backdrop-blur-xl border border-gray-800 rounded-2xl p-12 max-w-lg mx-auto text-center space-y-6">
							<div className="relative w-16 h-16 mx-auto">
								<div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
								<div className="relative flex items-center justify-center">
									<Sparkles className="w-8 h-8 text-indigo-400" />
								</div>
							</div>
							<h2 className="text-3xl font-bold bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
								No Campaigns Yet
							</h2>
							{/* <p className="text-gray-500">Be the first to start a campaign!</p> */}
						</div>
					</div>
				) : (
					<>
						<div
							className="grid justify-center
							gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8"
						>
							{campaigns.map((campaign) => (
								<div key={campaign.id} className="group relative">
									{console.log(campaign)}
									<div className="absolute -inset-0.5 bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
									<div className="relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800/50">
										{campaign.image && (
											<div className="relative h-48 overflow-hidden">
												<img
													src={campaign.image}
													alt={campaign.title}
													className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
												/>
												<div className="absolute inset-0 mt-32 ml-3 bg-gradient-to-t from-gray-900 via-transparent to-transparent">
													<div className="flex items-center space-x-2">
														<div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
															<Users className="h-5 w-5 text-gray-900" />
														</div>
														<div className="bg-gray-900 text-gray-900 px-5 py-2 rounded-full">
															<p className="text-sm text-gray-100">
																Created by :
																<span className="font-medium">
																	{" "}
																	{`${campaign.owner.slice(
																		0,
																		6
																	)}...${campaign.owner.slice(-4)}`}
																</span>
															</p>
														</div>
													</div>
												</div>
											</div>
										)}

										<div className="p-6 space-y-6">
											<div className="flex justify-between items-start">
												<h2 className="text-xl font-semibold text-gray-100 group-hover:text-white transition-colors duration-300">
													{campaign.title.slice(0, 23)}
												</h2>
												<div className="flex gap-2">
													<button className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 transition-colors">
														<HeartIcon className="w-4 h-4 text-gray-400 hover:text-red-400 transition-colors" />
													</button>
													<button className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 transition-colors">
														<Share2Icon className="w-4 h-4 text-gray-400 hover:text-indigo-400 transition-colors" />
													</button>
												</div>
											</div>

											<p className="text-gray-400 text-sm line-clamp-2">
												{campaign.description}
											</p>

											<div className="grid grid-cols-2 gap-4">
												<div className="bg-gray-800/30 rounded-xl p-4 backdrop-blur-sm border border-gray-700/50">
													<div className="flex items-center gap-2 text-gray-400 mb-2">
														<Target className="w-4 h-4" />
														<span className="text-xs font-medium">Target</span>
													</div>
													<p className="text-gray-100 font-bold">
														{campaign.target} ETH
													</p>
												</div>
												<div className="bg-gray-800/30 rounded-xl p-4 backdrop-blur-sm border border-gray-700/50">
													<div className="flex items-center gap-2 text-gray-400 mb-2">
														<TrendingUp className="w-4 h-4" />
														<span className="text-xs font-medium">Raised</span>
													</div>
													<p className="text-gray-100 font-bold">
														{campaign.amountCollected} ETH
													</p>
												</div>
											</div>

											<div className="space-y-3">
												<div className="flex justify-between text-sm">
													<span className="text-gray-400">Progress</span>
													<span className="text-gray-300">
														{(
															(Number(campaign.amountCollected) /
																Number(campaign.target)) *
															100
														).toFixed(1)}
														%
													</span>
												</div>
												<div className="h-2 bg-gray-800 rounded-full overflow-hidden">
													<div
														className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-300 relative"
														style={{
															width: `${Math.min(
																(Number(campaign.amountCollected) /
																	Number(campaign.target)) *
																	100,
																100
															)}%`,
														}}
													>
														<div className="absolute inset-0 bg-white/20 animate-pulse"></div>
													</div>
												</div>
											</div>

											{!campaign.claimed && new Date() < campaign.deadline && (
												<div className="space-y-4">
													<div className="flex gap-2">
														<input
															type="number"
															placeholder="ETH Amount"
															className="flex-1 px-4 py-3 bg-gray-800/30 border border-gray-700/50 text-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all"
															value={donationAmounts[campaign.id] || ""}
															onChange={(e) =>
																setDonationAmounts((prev) => ({
																	...prev,
																	[campaign.id]: e.target.value,
																}))
															}
														/>
														<button
															onClick={() =>
																handleDonate(
																	campaign.id,
																	donationAmounts[campaign.id]
																)
															}
															disabled={loadingStates.donate[campaign.id]}
															className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
														>
															{loadingStates.donate[campaign.id] ? (
																<>
																	<Loader2 className="w-4 h-4 animate-spin" />
																	<span>Donating</span>
																</>
															) : (
																<>
																	<span>Donate</span>
																	<ArrowUpRight className="w-4 h-4" />
																</>
															)}
														</button>
													</div>

													<div className="flex gap-2">
														<button
															onClick={() => handleUpdate(campaign.id)}
															disabled={loadingStates.update[campaign.id]}
															className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-100 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
														>
															{loadingStates.update[campaign.id] ? (
																<Loader2 className="w-4 h-4 animate-spin" />
															) : (
																"Update"
															)}
														</button>
														<button
															onClick={() => handleDelete(campaign.id)}
															disabled={loadingStates.delete[campaign.id]}
															className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-100 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
														>
															{loadingStates.delete[campaign.id] ? (
																<Loader2 className="w-4 h-4 animate-spin" />
															) : (
																"Delete"
															)}
														</button>
													</div>
												</div>
											)}

											{campaign.claimed && (
												<div className="bg-green-900/20 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
													<CheckCircle2 className="w-5 h-5 text-green-400" />
													<p className="text-green-400 font-medium">
														Campaign funds claimed
													</p>
												</div>
											)}

											{new Date() >= campaign.deadline && !campaign.claimed && (
												<div className="space-y-4">
													<div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 flex items-center gap-3">
														<Clock className="w-5 h-5 text-gray-400" />
														<p className="text-gray-400 font-medium">
															Campaign ended, awaiting claim
														</p>
													</div>
													<button
														onClick={() => handleClaimingFunds(campaign.id)}
														disabled={loadingStates.claim[campaign.id]}
														className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
													>
														{loadingStates.claim[campaign.id] ? (
															<>
																<Loader2 className="w-4 h-4 animate-spin" />
																<span>Claiming...</span>
															</>
														) : (
															<>
																<Wallet className="w-4 h-4" />
																<span>Claim Funds</span>
															</>
														)}
													</button>
												</div>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default CampaignList;
