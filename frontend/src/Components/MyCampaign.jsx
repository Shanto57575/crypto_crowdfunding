import { useEffect, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { getContract } from "../helper/contract";
import Loader from "./Loader";
import { Link } from "react-router-dom";

const MyCampaign = () => {
	const { userAddress } = useWallet();
	const [campaigns, setCampaigns] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

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

	if (isLoading)
		return (
			<div className="min-h-screen bg-gray-950 flex justify-center items-center">
				<Loader sz={100} />
			</div>
		);

	if (error) {
		return (
			<div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
				<div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl p-6 border-l-4 border-red-500">
					<div className="flex items-center text-red-400">
						<svg
							className="w-6 h-6 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span className="font-medium">Error: {error}</span>
					</div>
				</div>
			</div>
		);
	}

	if (!campaigns.length) {
		return (
			<div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
				<div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl p-8 text-center">
					<svg
						className="w-16 h-16 mx-auto text-gray-500 mb-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
						/>
					</svg>
					<h3 className="text-xl font-semibold text-gray-100 mb-2">
						No Campaigns Yet
					</h3>
					<p className="text-gray-400">
						Start your first fundraising campaign today!
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-900 pb-12 px-4 sm:px-6 lg:px-8 pt-36">
			<div className="max-w-7xl mx-auto">
				<div className="flex items-center justify-between mb-8">
					<h2 className="text-3xl font-bold text-gray-100">My Campaigns</h2>
					<span className="bg-blue-200 text-blue-700 text-sm font-medium px-4 py-2 rounded-full">
						Total: {campaigns.length}
					</span>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{campaigns.map((campaign, index) => (
						<div
							key={index}
							className="bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-700"
						>
							{console.log("cmapiagn", campaign)}

							<div className="relative pb-48">
								<img
									src={campaign.metadataHash.image}
									alt="Campaign"
									className="absolute h-full w-full object-cover"
								/>
								<div className="absolute top-4 right-4">
									<span
										className={`px-3 py-1 rounded-full text-sm font-medium ${
											campaign.status == 0
												? "bg-green-200 text-green-700"
												: "bg-red-900 text-red-200"
										}`}
									>
										{campaign.status == 0 ? "Active" : "Inactive"}
									</span>
								</div>
							</div>

							<div className="p-6">
								<div className="mb-4">
									<h3 className="text-xl font-semibold text-gray-100 mb-2">
										{campaign.metadataHash.title}
									</h3>
									<p className="text-gray-400 line-clamp-2">
										{campaign.metadataHash.description}
									</p>
								</div>

								<div className="space-y-4">
									<div className="bg-gray-900 rounded-lg p-4">
										<div className="flex justify-between mb-2">
											<span className="text-gray-400">Progress</span>
											<span className="text-gray-200 font-medium">
												{(
													(Number(campaign.amountCollected) /
														Number(campaign.target)) *
													100
												).toFixed(1)}
												%
											</span>
										</div>
										<div className="w-full bg-gray-700 rounded-full h-2">
											<div
												className="bg-blue-600 rounded-full h-2"
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
										<div>
											<p className="text-gray-400 text-sm">Target</p>
											<p className="font-semibold text-gray-200">
												{(Number(campaign.target) / 1e18).toFixed(4)} ETH
											</p>
										</div>
										<div>
											<p className="text-gray-400 text-sm">Collected</p>
											<p className="font-semibold text-gray-200">
												{(Number(campaign.amountCollected) / 1e18).toFixed(4)}{" "}
												ETH
											</p>
										</div>
									</div>

									<div className="space-y-2">
										<div className="flex items-center text-sm">
											<span className="text-gray-400 mr-2">Category:</span>
											<span className="bg-gray-900 px-2 py-1 rounded text-gray-300">
												{campaign.category}
											</span>
										</div>
										<div className="flex items-center text-sm">
											<span className="text-gray-400 mr-2">Deadline:</span>
											<span className="text-gray-300">
												{new Date(
													Number(campaign.deadline) * 1000
												).toLocaleDateString()}
											</span>
										</div>
									</div>
								</div>

								<div className="mt-6">
									<Link to={`view-details/${campaign.id}`}>
										<button className="w-full bg-blue-600 text-gray-100 py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center">
											View Details
											<svg
												className="w-4 h-4 ml-2"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M9 5l7 7-7 7"
												/>
											</svg>
										</button>
									</Link>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default MyCampaign;
