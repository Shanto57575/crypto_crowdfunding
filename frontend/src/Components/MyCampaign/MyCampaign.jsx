import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import { getContract } from "../../helper/contract";
import { fetchCampaigns } from "./utils/campaignUtils";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";
import UpdateCampaign from "../UpdateCampaign";
import WithdrawalRequestModal from "../WithdrawalRequestModal";
import { Bookmark, PlusCircle } from "lucide-react";
import MyCampaignList from "./MyCampaignList";

const MyCampaign = () => {
	const { userAddress } = useWallet();
	const [campaigns, setCampaigns] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
	const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
	const [selectedCampaign, setSelectedCampaign] = useState(null);

	const getMyCampaigns = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const contract = await getContract();
			const fetchedCampaigns = await fetchCampaigns(contract, userAddress);
			setCampaigns(fetchedCampaigns);
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

	if (isLoading) return <LoadingState />;
	if (error) return <ErrorState error={error} />;
	if (!campaigns.length) return <EmptyState />;

	return (
		<div className="min-h-screen bg-black pt-24 pb-16 px-4">
			<div className="max-w-7xl mx-auto">
				<div className="mb-12 space-y-4">
					<div className="flex items-center gap-3">
						<Bookmark className="w-8 h-8 text-indigo-500" />
						<h2 className="text-3xl font-bold text-white">My Campaigns</h2>
					</div>
					<div className="flex items-center justify-between">
						<p className="text-gray-400">
							Managing {campaigns.length} active fundraising campaigns
						</p>
						<Link to="/dashboard/create-campaign">
							<button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
								<PlusCircle className="w-4 h-4" />
								New Campaign
							</button>
						</Link>
					</div>
				</div>

				<MyCampaignList
					campaigns={campaigns}
					onUpdate={(campaign) => {
						setSelectedCampaign(campaign);
						setIsUpdateModalOpen(true);
					}}
					onWithdraw={(campaign) => {
						setSelectedCampaign(campaign);
						setIsWithdrawModalOpen(true);
					}}
					onUpdateSuccess={getMyCampaigns}
				/>

				<UpdateCampaign
					campaign={selectedCampaign}
					isOpen={isUpdateModalOpen}
					onClose={() => {
						setIsUpdateModalOpen(false);
						setSelectedCampaign(null);
					}}
					onUpdateSuccess={getMyCampaigns}
				/>
				<WithdrawalRequestModal
					campaign={selectedCampaign}
					isOpen={isWithdrawModalOpen}
					onClose={() => {
						setIsWithdrawModalOpen(false);
						setSelectedCampaign(null);
					}}
					onWithDrawSuccess={getMyCampaigns}
				/>
			</div>
		</div>
	);
};

export default MyCampaign;
