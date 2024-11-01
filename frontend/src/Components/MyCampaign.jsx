import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { getContract } from "../helper/contract";
import Loader from "./Loader";
import { Link } from "react-router-dom";
import {
	ChevronRight,
	Loader2,
	Calendar,
	Target,
	Wallet2,
	Tag,
	AlertCircle,
	PlusCircle,
	ListFilter,
	Trash2,
	Edit3,
	Award,
} from "lucide-react";
import UpdateCampaign from "./UpdateCampaign";
import toast from "react-hot-toast";
import { parseEther } from "ethers";

const MyCampaign = () => {
	const { userAddress } = useWallet();
	const [campaigns, setCampaigns] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
	const [selectedCampaign, setSelectedCampaign] = useState(null);

	const [loadingStates, setLoadingStates] = useState({
		delete: {},
		update: {},
		claim: {},
	});

	const handleUpdate = (campaign) => {
		setSelectedCampaign(campaign);
		setIsUpdateModalOpen(true);
	};

	const handleDelete = async (campaignId) => {
		try {
			setLoadingStates("delete", campaignId, true);
			const contract = await getContract();
			if (!contract) throw new Error("Failed to load contract");

			const tx = await contract.deleteCampaign(campaignId);
			await tx.wait();

			toast.success(
				<p className="font-serif">Campaign Deleted Successfully</p>
			);
		} catch (err) {
			console.error("Error deleting campaign:", err);
			toast.error(
				<p className="font-serif">
					{err.message || "Failed to delete campaign"}
				</p>
			);
		} finally {
			setLoadingStates("delete", campaignId, false);
		}
	};

	const handleClaimFunds = async (campaignId) => {
		console.log(campaignId);
		try {
			setLoadingStates("claim", campaignId, true);
			const contract = await getContract();
			if (!contract) throw new Error("Failed to load contract");

			const tx = await contract.claimFunds(campaignId);
			await tx.wait();
			console.log("tx==>", tx);

			toast.success(<p className="font-serif">Claimed Funds Successfully</p>);
		} catch (err) {
			console.error("Error deleting campaign:", err);
			toast.error(
				<p className="font-serif">
					{err.message || "Failed to delete campaign"}
				</p>
			);
		} finally {
			setLoadingStates("delete", campaignId, false);
		}
	};

	const getMyCampaigns = async () => {
		try {
			setIsLoading(true);
			setError(null);

			if (!userAddress) {
				throw new Error("Please connect your wallet first");
			}

			const contract = await getContract();
			if (!contract) {
				throw new Error("Failed to load contract");
			}

			const allCampaigns = await contract.getCampaignsByOwner(userAddress);
			const formattedCampaigns = await Promise.all(
				allCampaigns.map(async (campaign) => {
					const metadataResponse = await fetch(campaign.metadataHash);
					const metadata = await metadataResponse.json();

					return {
						id: campaign.id,
						owner: campaign.owner,
						metadataHash: metadata,
						target: campaign.target.toString(),
						deadline: campaign.deadline.toString(),
						amountCollected: campaign.amountCollected.toString(),
						claimed: campaign.claimed,
						status: campaign.status,
						category: campaign.category,
					};
				})
			);

			setCampaigns(formattedCampaigns);
		} catch (err) {
			setError(err.message);
			console.error("Error fetching campaigns:", err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (userAddress) {
			getMyCampaigns();
		}
	}, [userAddress]);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex justify-center items-center p-4">
				<div className="text-center">
					<Loader sz={80} />
					<p className="mt-4 text-gray-400 animate-pulse">
						Loading your campaigns...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex items-center justify-center p-4">
				<div className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-red-500/20">
					<div className="flex flex-col items-center text-red-400 space-y-3">
						<AlertCircle className="w-12 h-12 mb-2" />
						<h3 className="text-lg font-medium">Error Occurred</h3>
						<p className="text-sm text-center text-gray-400">{error}</p>
					</div>
				</div>
			</div>
		);
	}

	if (!campaigns.length) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex items-center justify-center p-4">
				<div className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl p-8 text-center border border-gray-700/50">
					<PlusCircle className="w-16 h-16 mx-auto text-gray-400 mb-6" />
					<h3 className="text-2xl font-semibold text-gray-100 mb-3">
						Start Your First Campaign
					</h3>
					<p className="text-gray-400 mb-6">
						Create a campaign and start raising funds for your cause.
					</p>
					<Link to="/create-campaign">
						<button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 w-full">
							Create Campaign
							<ChevronRight className="w-4 h-4" />
						</button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 pb-12 px-2 sm:px-4 lg:px-6 pt-24 sm:pt-32">
			<div className="max-w-7xl mx-auto">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
					<div>
						<h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-2">
							My Campaigns
						</h2>
						<p className="text-gray-400 text-sm">
							Manage and track your fundraising campaigns
						</p>
					</div>
					<div className="flex items-center gap-3">
						<span className="inline-flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm text-gray-200 text-sm font-medium px-4 py-2 rounded-xl border border-gray-700/50">
							<ListFilter className="w-4 h-4" />
							Total: {campaigns.length}
						</span>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{campaigns.map((campaign, index) => (
						<div
							key={index}
							className="group bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-700/50"
						>
							<div className="relative pb-[56.25%]">
								<img
									src={campaign.metadataHash.image}
									alt={campaign.metadataHash.title}
									className="absolute h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
								<div className="absolute top-4 right-4">
									<span
										className={`px-4 py-1.5 rounded-xl text-sm font-medium shadow-lg ${
											campaign.status == 0
												? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
												: "bg-red-500/20 text-red-300 border border-red-500/30"
										}`}
									>
										{campaign.status == 0 ? "Active" : "Inactive"}
									</span>
								</div>
							</div>

							<div className="p-6 space-y-6">
								<div>
									<h3 className="text-xl font-semibold text-gray-100 mb-2 line-clamp-1">
										{campaign.metadataHash.title}
									</h3>
									<p className="text-gray-400 text-sm line-clamp-2">
										{campaign.metadataHash.description}
									</p>
								</div>

								<div className="space-y-4">
									<div className="bg-gray-900/50 rounded-xl p-4">
										<div className="flex justify-between mb-2">
											<span className="text-gray-400 text-sm">Progress</span>
											<span className="text-gray-200 font-medium">
												{(
													(Number(campaign.amountCollected) /
														Number(campaign.target)) *
													100
												).toFixed(1)}
												%
											</span>
										</div>
										<div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
											<div
												className="bg-blue-600 rounded-full h-2 transition-all duration-300"
												style={{
													width: `${Math.min(
														(Number(campaign.amountCollected) /
															Number(campaign.target)) *
															100,
														100
													)}%`,
												}}
											></div>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div className="bg-gray-900/50 p-3 rounded-xl">
											<div className="flex items-center gap-2 mb-1">
												<Target className="w-4 h-4 text-gray-400" />
												<p className="text-gray-400 text-xs">Target</p>
											</div>
											<p className="font-semibold text-gray-200">
												{(Number(campaign.target) / 1e18).toFixed(4)} ETH
											</p>
										</div>
										<div className="bg-gray-900/50 p-3 rounded-xl">
											<div className="flex items-center gap-2 mb-1">
												<Wallet2 className="w-4 h-4 text-gray-400" />
												<p className="text-gray-400 text-xs">Collected</p>
											</div>
											<p className="font-semibold text-gray-200">
												{(Number(campaign.amountCollected) / 1e18).toFixed(4)}{" "}
												ETH
											</p>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-4 text-sm">
										<div className="flex items-center gap-2">
											<Tag className="w-4 h-4 text-gray-400" />
											<span className="text-gray-300">{campaign.category}</span>
										</div>
										<div className="flex items-center gap-2">
											<Calendar className="w-4 h-4 text-gray-400" />
											<span className="text-gray-300">
												{new Date(
													Number(campaign.deadline) * 1000
												).toLocaleDateString()}
											</span>
										</div>
									</div>
								</div>

								{campaign.status == 0 && (
									<div className="grid grid-cols-2 gap-3">
										<button
											onClick={() => handleUpdate(campaign)}
											disabled={loadingStates.update[campaign.id]}
											className="px-4 py-2.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm border border-gray-600/30"
										>
											{loadingStates.update[campaign.id] ? (
												<Loader2 className="w-4 h-4 animate-spin" />
											) : (
												<>
													<Edit3 className="w-4 h-4" /> Update
												</>
											)}
										</button>
										<button
											onClick={() => handleDelete(campaign.id)}
											disabled={loadingStates.delete[campaign.id]}
											className="px-4 py-2.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm border border-gray-600/30"
										>
											{loadingStates.delete[campaign.id] ? (
												<Loader2 className="w-4 h-4 animate-spin" />
											) : (
												<>
													<Trash2 className="w-4 h-4" /> Close
												</>
											)}
										</button>
									</div>
								)}

								{campaign.claimed && (
									<div className="flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/10 py-2 px-4 rounded-xl border border-emerald-500/20">
										<Award className="w-4 h-4" />
										<span className="text-sm font-medium">Funds Claimed!</span>
									</div>
								)}

								<div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
									{parseEther(campaign.amountCollected) >=
										parseEther(campaign.target) && (
										<button
											onClick={() => handleClaimFunds(campaign.id)}
											disabled={loadingStates.claim[campaign.id]}
											className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
										>
											{loadingStates.claim[campaign.id] ? (
												<Loader2 className="w-4 h-4 animate-spin" />
											) : (
												<>
													<Wallet2 className="w-4 h-4" /> Claim Funds
												</>
											)}
										</button>
									)}
									<Link
										to={`/all-campaigns/view-details/${campaign.id}`}
										className="w-full"
									>
										<button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm">
											View Details
											<ChevronRight className="w-4 h-4" />
										</button>
									</Link>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
			<UpdateCampaign
				campaign={selectedCampaign}
				isOpen={isUpdateModalOpen}
				onClose={() => {
					setIsUpdateModalOpen(false);
					setSelectedCampaign(null);
				}}
				onUpdateSuccess={() => {
					getMyCampaigns();
				}}
			/>
		</div>
	);
};

export default MyCampaign;
