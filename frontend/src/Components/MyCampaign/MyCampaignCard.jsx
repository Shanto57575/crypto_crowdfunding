import { Link } from "react-router-dom";
import { parseEther } from "ethers";
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
} from "lucide-react";

const MyCampaignCard = ({
	campaign,
	loadingStates,
	setLoadingStates,
	onUpdate,
	onWithdraw,
	onUpdateSuccess,
}) => {
	return (
		<div className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-indigo-900 transition-all duration-300">
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
								? "bg-green-100 text-emerald-600 ring-1 ring-green-400"
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
							<div
								className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300"
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
						<div className="grid grid-cols-2 gap-3">
							{!campaign.claimed &&
								parseEther(campaign.amountCollected) <
									parseEther(campaign.target) && (
									<button
										onClick={() => onUpdate(campaign)}
										disabled={loadingStates.update[campaign.id]}
										className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
									>
										{loadingStates.update[campaign.id] ? (
											<Loader2 className="w-4 h-4 animate-spin" />
										) : (
											<>
												<Edit3 className="w-4 h-4" /> Update
											</>
										)}
									</button>
								)}
							<button
								onClick={() =>
									handleDelete(campaign.id, setLoadingStates, onUpdateSuccess)
								}
								disabled={loadingStates.delete[campaign.id]}
								className="w-full text-center hover:border-transparent hover:bg-rose-600 flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg transition-all"
							>
								{loadingStates.delete[campaign.id] ? (
									<Loader2 className="w-4 h-4 animate-spin" />
								) : (
									<>
										<Trash2 className="w-4 h-4" /> Close
									</>
								)}
							</button>
							{campaign.canClaimed > 0 && campaign.claimed == false ? (
								<button
									onClick={() => onWithdraw(campaign)}
									disabled={loadingStates.withdraw[campaign.id]}
									className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
								>
									{loadingStates.withdraw[campaign.id] ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										"Withdraw"
									)}
								</button>
							) : (
								<></>
							)}
						</div>
					)}

					{campaign.claimed && (
						<div className="flex items-center justify-center gap-2 bg-green-500/10 text-green-400 py-3 px-4 rounded-lg ring-1 ring-green-500/30">
							<Award className="w-5 h-5" />
							<span className="font-medium">Funds Claimed</span>
						</div>
					)}

					<div className="grid grid-cols-1 gap-3">
						{parseEther(campaign.amountCollected) >=
							parseEther(campaign.target) &&
							!campaign.claimed && (
								<button
									onClick={() =>
										handleClaimFunds(
											campaign.id,
											setLoadingStates,
											onUpdateSuccess
										)
									}
									disabled={loadingStates.claim[campaign.id]}
									className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition-all flex items-center justify-center gap-2"
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
							<button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition-all flex items-center justify-center gap-2">
								View Details <ChevronRight className="w-4 h-4" />
							</button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MyCampaignCard;
