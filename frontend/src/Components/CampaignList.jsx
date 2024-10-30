import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract } from "../helper/contract";
import Loader from "./Loader";
import toast from "react-hot-toast";

const CampaignList = () => {
	const [campaigns, setCampaigns] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loadingCampaigns, setLoadingCampaigns] = useState({});
	const [error, setError] = useState("");
	const [donationAmounts, setDonationAmounts] = useState({}); // Track ETH input per campaign

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

	const getAllCampaigns = async () => {
		try {
			setLoading(true);
			const contract = await getContract();
			if (!contract) throw new Error("Failed to load contract");

			const onChainCampaigns = await contract.getActiveCampaigns();
			const campaignsWithData = await Promise.all(
				onChainCampaigns.map(async (campaign, index) => {
					const metaData = Object.values(campaign)[1];
					const ipfsData = await fetchIPFSData(metaData);
					return {
						id: index,
						owner: campaign.owner,
						target: ethers.formatEther(campaign.target),
						deadline: new Date(Number(campaign.deadline) * 1000),
						amountCollected: ethers.formatEther(campaign.amountCollected),
						claimed: campaign.claimed,
						isActive: campaign.isActive,
						title: ipfsData?.title || "Untitled Campaign",
						description: ipfsData?.description || "No description available",
						image:
							ipfsData?.image?.replace(
								"ipfs://",
								"https://gateway.pinata.cloud/ipfs/"
							) || "",
					};
				})
			);

			setCampaigns(campaignsWithData.filter((campaign) => campaign.isActive));
		} catch (err) {
			console.error("Error fetching campaigns:", err);
			setError(err.message || "Failed to fetch campaigns");
		} finally {
			setLoading(false);
		}
	};

	const handleDonate = async (campaignId, amount) => {
		try {
			setLoadingCampaigns((prev) => ({ ...prev, [campaignId]: true }));
			const contract = await getContract();
			if (!contract) throw new Error("Failed to load contract");

			const tx = await contract.donateToCampaign(campaignId, {
				value: ethers.parseEther(amount),
			});
			await tx.wait();
			console.log("tx from donation=>", tx);
			toast.success(<p className="font-serif">Donation Successfull</p>);
			getAllCampaigns();
		} catch (err) {
			console.error("Error donating:", err);
			alert(err.message || "Failed to donate");
		} finally {
			setLoadingCampaigns((prev) => ({ ...prev, [campaignId]: false }));
		}
	};

	useEffect(() => {
		getAllCampaigns();
	}, []);

	if (loading)
		return (
			<div className="min-h-screen bg-gray-950 flex justify-center items-center">
				<Loader sz={100} />
			</div>
		);

	if (error)
		return (
			<div className="min-h-screen bg-gray-950 flex justify-center items-center">
				<div className="text-red-500 text-center">
					<p>Error: {error}</p>
					<button
						onClick={getAllCampaigns}
						className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
					>
						Retry
					</button>
				</div>
			</div>
		);

	return (
		<div className="min-h-screen bg-gray-950 py-8 px-4 sm:px-6 lg:px-8 pt-32">
			<div className="max-w-7xl mx-auto">
				{campaigns.length === 0 ? (
					<div className="text-center text-gray-300">
						<p className="text-3xl pt-52 flex flex-col items-center justify-center">
							No active campaigns Yet!
						</p>
					</div>
				) : (
					<div>
						<h1 className="text-3xl font-bold text-white mb-8 text-center">
							Active Campaigns
						</h1>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{campaigns.map((campaign) => (
								<div
									key={campaign.id}
									className="bg-gray-900 rounded-lg overflow-hidden shadow-lg"
								>
									{campaign.image && (
										<img
											src={campaign.image}
											alt={campaign.title}
											className="w-full h-48 object-cover"
										/>
									)}
									<div className="p-6">
										<h2 className="text-xl font-bold text-white mb-2">
											{campaign.title}
										</h2>
										<p className="text-gray-400 mb-4 line-clamp-2">
											{campaign.description}
										</p>
										<div className="space-y-2 text-sm text-gray-300">
											<p>
												<span className="font-medium">Target:</span>{" "}
												{campaign.target} ETH
											</p>
											<p>
												<span className="font-medium">Collected:</span>{" "}
												{campaign.amountCollected} ETH
											</p>
											<p>
												<span className="font-medium">Deadline:</span>{" "}
												{campaign.deadline.toLocaleDateString()}
											</p>
											<p className="truncate">
												<span className="font-medium">Owner:</span>{" "}
												{campaign.owner.slice(0, 4)}....................
												{campaign.owner.slice(38, 42)}
											</p>
										</div>
										<div className="mt-6">
											<div className="bg-gray-800 rounded-full h-2 overflow-hidden">
												<div
													className="bg-blue-500 h-full"
													style={{
														width: `${Math.min(
															(Number(campaign.amountCollected) /
																Number(campaign.target)) *
																100,
															100
														)}%`,
													}}
												/>
											</div>
											<p className="text-right text-sm text-gray-400 mt-1">
												{(
													(Number(campaign.amountCollected) /
														Number(campaign.target)) *
													100
												).toFixed(1)}
												%
											</p>
										</div>

										{/* Updated Input and Donate button */}
										{!campaign.claimed && new Date() < campaign.deadline && (
											<div className="mt-6 flex gap-4">
												<input
													type="number"
													placeholder="ETH Amount"
													className="flex-1 px-3 py-2 bg-gray-800 text-white rounded"
													min="0"
													step="0.01"
													value={donationAmounts[campaign.id] || ""}
													onChange={(e) =>
														setDonationAmounts((prev) => ({
															...prev,
															[campaign.id]: e.target.value,
														}))
													}
												/>
												<button
													onClick={() => {
														const amount = donationAmounts[campaign.id];
														if (amount > 0) {
															handleDonate(campaign.id, amount);
														}
													}}
													disabled={
														loadingCampaigns[campaign.id] ||
														!(donationAmounts[campaign.id] > 0)
													}
													className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
												>
													{loadingCampaigns[campaign.id] ? (
														<Loader sz={25} />
													) : (
														"Donate"
													)}
												</button>
											</div>
										)}
										{campaign.claimed && (
											<p className="mt-4 text-green-500 text-center">
												Campaign funds claimed
											</p>
										)}
										{new Date() >= campaign.deadline && !campaign.claimed && (
											<p className="mt-4 text-red-500 text-center">
												Campaign deadline passed, awaiting claim
											</p>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default CampaignList;
