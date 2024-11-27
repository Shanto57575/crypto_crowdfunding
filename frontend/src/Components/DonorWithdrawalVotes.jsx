/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
	CheckCircle,
	AlertCircle,
	Clock,
	DollarSign,
	FileText,
	User,
} from "lucide-react";

import { getContract } from "../helper/contract";

const DonorWithdrawalVotes = () => {
	const [donations, setDonations] = useState([]);
	const [withdrawalRequests, setWithdrawalRequests] = useState({});
	const [campaignDetails, setCampaignDetails] = useState({});
	const [loading, setLoading] = useState(true);
	const [voting, setVoting] = useState({});
	const [error, setError] = useState("");
	const [hasDonations, setHasDonations] = useState(true);

	const fetchDonations = async () => {
		try {
			const contract = await getContract();
			const myDonations = await contract.getMyDonations();

			if (!myDonations || myDonations.length === 0) {
				setHasDonations(false);
				setLoading(false);
				return;
			}

			setDonations(myDonations);
			setHasDonations(true);

			const requests = {};
			const details = {};

			for (const donation of myDonations) {
				const [withdrawalStatus, campaignInfo] = await Promise.all([
					contract.checkWithdrawalStatus(donation.campaignId),
					contract.getCampaignDetails(donation.campaignId),
				]);

				const status = {
					isActive: withdrawalStatus[0],
					metadataHash: withdrawalStatus[1],
					totalVotes: withdrawalStatus[2].toString(),
					votesInFavor: withdrawalStatus[3].toString(),
					votesAgainst: withdrawalStatus[4].toString(),
					totalDonors: withdrawalStatus[5].toString(),
					hasVoted: withdrawalStatus[6],
					allVoted: withdrawalStatus[7],
					canClaim: withdrawalStatus[8],
					requested: ethers.formatEther(withdrawalStatus[9]),
				};

				if (status.isActive) {
					try {
						const [metadataResponse, campaignMetadataResponse] =
							await Promise.all([
								fetch(status.metadataHash),
								fetch(campaignInfo.metadataHash),
							]);

						const [metadata, campaignMetadata] = await Promise.all([
							metadataResponse.json(),
							campaignMetadataResponse.json(),
						]);

						requests[donation.campaignId] = {
							...status,
							campaignTitle: donation.title,
							...metadata,
						};

						details[donation.campaignId] = {
							owner: campaignInfo.owner,
							title: campaignMetadata.title,
							image: campaignMetadata.image,
							target: ethers.formatEther(campaignInfo.target),
							amountCollected: ethers.formatEther(campaignInfo.amountCollected),
							deadline: new Date(
								Number(campaignInfo.deadline) * 1000
							).toLocaleDateString(),
							category: campaignInfo.category,
						};
					} catch (err) {
						console.error(
							`Failed to fetch metadata for campaign ${donation.campaignId}`,
							err
						);
					}
				}
			}
			setWithdrawalRequests(requests);
			setCampaignDetails(details);
		} catch (err) {
			setError("Failed to fetch donations");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const handleVote = async (campaignId, vote) => {
		try {
			setVoting((prev) => ({ ...prev, [campaignId]: true }));
			const contract = await getContract();

			const tx = await contract.earlyWithdrawalRequest(
				campaignId,
				"",
				true,
				0,
				vote
			);

			await tx.wait();
			await fetchDonations();
		} catch (err) {
			setError("Failed to submit vote");
			console.error(err);
		} finally {
			setVoting((prev) => ({ ...prev, [campaignId]: false }));
		}
	};

	useEffect(() => {
		fetchDonations();
		const interval = setInterval(fetchDonations, 30000);
		return () => clearInterval(interval);
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-2">
				<Clock className="animate-spin h-12 w-12 text-blue-400" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-2">
				<div className="bg-red-900/20 border border-red-700 text-red-400 rounded-xl p-6 text-center max-w-xs w-full">
					<AlertCircle className="mx-auto h-12 w-12 mb-4" />
					<p className="text-sm">{error}</p>
				</div>
			</div>
		);
	}

	if (!hasDonations) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-2">
				<div className="bg-gray-800/50 rounded-xl p-6 text-center max-w-xs w-full border border-gray-700">
					<DollarSign className="mx-auto h-12 w-12 text-gray-500 mb-4" />
					<h3 className="text-gray-200 font-bold mb-2">No Donations Found</h3>
					<p className="text-gray-400 text-xs mb-4">
						You haven't made any donations to campaigns yet.
					</p>
					<button
						className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
						onClick={() => (window.location.href = "/all-campaigns")}
					>
						View Campaigns
					</button>
				</div>
			</div>
		);
	}

	const activeRequests = Object.entries(withdrawalRequests);

	if (activeRequests.length === 0) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-2">
				<div className="bg-gray-800/50 rounded-xl p-6 text-center max-w-xs w-full border border-gray-700">
					<FileText className="mx-auto h-12 w-12 text-gray-500 mb-4" />
					<h3 className="text-gray-200 font-bold mb-2">No Active Requests</h3>
					<p className="text-gray-400 text-xs mb-4">
						No early withdrawal requests for your campaigns.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-2 sm:p-4">
			<div className="container mx-auto max-w-md space-y-4">
				{activeRequests.map(([campaignId, request]) => {
					const campaign = campaignDetails[campaignId] || {};
					return (
						<div
							key={campaignId}
							className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-blue-600 transition-all"
						>
							<div className="flex items-center space-x-4 mb-4">
								<img
									src={campaign.image || "/placeholder.jpg"}
									alt={campaign.title}
									className="w-16 h-16 rounded-lg object-cover"
								/>
								<div>
									<h2 className="text-lg font-bold text-blue-300">
										{campaign.title}
									</h2>
									<p className="text-xs text-gray-400 flex items-center">
										<User className="w-3 h-3 mr-1" />
										Owner: {campaign.owner?.slice(0, 6)}...
										{campaign.owner?.slice(-4)}
									</p>
								</div>
							</div>

							<div className="space-y-2 mb-4">
								<div className="flex justify-between bg-gray-900 p-2 rounded-lg">
									<span className="text-sm text-gray-400">Request Amount</span>
									<span className="text-green-400 font-bold">
										{request.requested} ETH
									</span>
								</div>
								<div className="flex justify-between bg-gray-900 p-2 rounded-lg">
									<span className="text-sm text-gray-400">Votes</span>
									<div className="flex space-x-2">
										<span className="text-green-400 font-bold">
											{request.votesInFavor} ✓
										</span>
										<span className="text-red-400 font-bold">
											{request.votesAgainst} ✗
										</span>
									</div>
								</div>
							</div>

							{!request.hasVoted ? (
								<div className="flex space-x-2">
									<button
										onClick={() => handleVote(campaignId, true)}
										disabled={voting[campaignId]}
										className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center disabled:opacity-50"
									>
										<CheckCircle className="w-4 h-4 mr-2" />
										{voting[campaignId] ? "Processing..." : "Approve"}
									</button>
									<button
										onClick={() => handleVote(campaignId, false)}
										disabled={voting[campaignId]}
										className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center justify-center disabled:opacity-50"
									>
										<AlertCircle className="w-4 h-4 mr-2" />
										{voting[campaignId] ? "Processing..." : "Reject"}
									</button>
								</div>
							) : (
								<div className="bg-gray-900 p-2 rounded-lg text-center">
									<p className="text-gray-400 text-sm flex items-center justify-center">
										<CheckCircle className="w-4 h-4 mr-2 text-green-500" />
										You've already voted
									</p>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default DonorWithdrawalVotes;
