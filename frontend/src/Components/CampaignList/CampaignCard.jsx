import { useState } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import {
	Wallet,
	Clock,
	ChevronRight,
	Heart,
	Share2,
	Target,
	TrendingUp,
	RefreshCw,
	CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { getContract } from "../../helper/contract";
import { serializeError } from "@metamask/rpc-errors";

export function CampaignCard({ campaign }) {
	const [donationAmount, setDonationAmount] = useState("");
	const [donationCurrency, setDonationCurrency] = useState("ETH");
	const [isLoading, setIsLoading] = useState(false);

	const handleDonate = async () => {
		try {
			setIsLoading(true);
			if (!donationAmount) {
				toast.error(
					<h1 className="font-serif text-center">
						Please enter a donation amount
					</h1>
				);
				return;
			}

			let ethAmount = parseFloat(donationAmount);

			if (donationCurrency !== "ETH") {
				const apiEndpoint = `${
					import.meta.env.VITE_PRICE_CONVERSION_URL
				}/${donationCurrency}-ETH/spot`;
				const response = await fetch(apiEndpoint);
				const data = await response.json();

				if (response.ok) {
					const conversionRate = parseFloat(data.data.amount);
					ethAmount = donationAmount * conversionRate;

					// Currency-specific minimum donation checks
					if (donationCurrency === "BDT" && donationAmount < 10) {
						toast.error(
							<div className="text-center font-serif">
								<p>
									The minimum donation is{" "}
									<span className="font-sans font-bold">10</span> BDT
								</p>
							</div>
						);
						return;
					}

					if (donationCurrency === "USD" && donationAmount < 0.085) {
						toast.error(
							<div className="text-center font-serif">
								<p>
									The minimum donation is{" "}
									<span className="font-sans font-bold">$0.085</span> USD
								</p>
							</div>
						);
						return;
					}
				} else {
					throw new Error(
						`Failed to fetch conversion rate for ${donationCurrency}`
					);
				}
			}

			// ETH-specific minimum check
			if (donationCurrency === "ETH" && donationAmount < 0.00025) {
				toast.error(
					<div className="text-center font-serif">
						<p>
							The minimum donation is{" "}
							<span className="font-sans font-bold">0.00025</span> ETH
						</p>
					</div>
				);
				return;
			}

			if (!ethAmount || ethAmount <= 0) {
				toast.error("Invalid donation amount");
				return;
			}

			// Round to 6 decimal places to prevent overflow
			const roundedEthAmount = parseFloat(ethAmount.toFixed(6));

			// Ensure minimum donation amount
			if (roundedEthAmount < 0.000001) {
				toast.error(
					<div className="font-serif text-center">
						<h1>Donation Too Small</h1>
						<p>The donation amount is too small to process.</p>
						<p>Minimum donation: 0.000001 ETH</p>
					</div>
				);
				return;
			}

			const contract = await getContract();
			if (!contract) {
				toast.error(
					<h1 className="font-serif text-center">
						Please connect your wallet to donate
					</h1>
				);
				return;
			}

			try {
				const tx = await contract.donateToCampaign(campaign.id, {
					value: ethers.parseEther(roundedEthAmount.toString()),
				});
				await tx.wait();

				toast.success(
					<div className="text-center font-serif">
						<h1>Donation Successful</h1>
						<p>
							You donated {roundedEthAmount.toFixed(6)} ETH ({donationAmount}{" "}
							{donationCurrency})
						</p>
					</div>
				);
				setDonationAmount("");
			} catch (contractErr) {
				const error = serializeError(contractErr);
				console.error("Contract donation error:", error);

				// Comprehensive error handling using message.includes()
				const errorMessage = error.message.toLowerCase();

				if (errorMessage.includes("owner cannot donate")) {
					toast.error(
						<div className="text-center font-serif">
							<h1 className="font-bold">Donation Restricted</h1>
							<p>
								Campaign owners are not allowed to donate to their own campaign
							</p>
						</div>
					);
				} else if (errorMessage.includes("campaign has ended")) {
					toast.error(
						<div className="text-center font-serif">
							<h1 className="font-bold">Campaign Closed</h1>
							<p>
								This campaign has already ended and is no longer accepting
								donations
							</p>
						</div>
					);
				} else if (errorMessage.includes("user denied transaction")) {
					toast.error(
						<p className="text-center font-serif">Transaction Cancelled</p>
					);
				} else if (errorMessage.includes("insufficient funds")) {
					const requiredAmount = errorMessage.match(/want (\d+)/);
					const currentBalance = errorMessage.match(/have (\d+)/);

					toast.error(
						<div className="text-center font-serif">
							<h1 className="font-bold">Insufficient Funds</h1>
							<p>
								Your wallet does not have enough ETH to complete this
								transaction.
							</p>
							{currentBalance && requiredAmount && (
								<p>
									Current Balance: {ethers.formatEther(currentBalance[1])} ETH
									<br />
									Required Amount: {ethers.formatEther(requiredAmount[1])} ETH
								</p>
							)}
							<p>Please add funds to your wallet and try again.</p>
						</div>
					);
				} else if (error.code === "NUMERIC_FAULT") {
					toast.error(
						<div>
							<h1 className="font-bold">Invalid Donation Amount</h1>
							<p>The donation amount is too precise to process.</p>
							<p>Please round to 6 decimal places or higher.</p>
						</div>
					);
				} else {
					// Fallback for any unhandled errors
					toast.error(
						<div className="text-center font-serif">
							<h1 className="font-bold">Donation Error</h1>
							<p>{error.message || "Failed to process donation"}</p>
						</div>
					);
				}
			}
		} catch (err) {
			const error = serializeError(err);
			console.error("Unexpected donation error:", error);

			toast.error(
				<div className="text-center font-serif">
					<h1 className="font-bold">Unexpected Error</h1>
					<p>
						{error.message || "An unexpected error occurred during donation"}
					</p>
				</div>
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleClaimFunds = async () => {
		try {
			setIsLoading(true);

			const contract = await getContract();
			if (!contract) {
				throw new Error("Please connect your wallet to claim funds");
			}

			const tx = await contract.claimFunds(campaign.id);
			await tx.wait();

			toast.success(
				<h1 className="text-center font-serif">Funds Claimed Successfully</h1>
			);
		} catch (err) {
			const error = serializeError(err);
			console.error("Claim funds error:", error);

			// Comprehensive error handling for fund claiming
			const errorMessage = error.message.toLowerCase();

			if (errorMessage.includes("only owner can claim funds")) {
				toast.error(
					<h1 className="text-center font-serif">
						Only the campaign owner can claim funds
					</h1>
				);
			} else if (errorMessage.includes("campaign is not active")) {
				toast.error(
					<h1 className="text-center font-serif">
						This campaign is not active
					</h1>
				);
			} else if (errorMessage.includes("campaign has not ended yet")) {
				toast.error(
					<h1 className="text-center font-serif">Campaign has not ended yet</h1>
				);
			} else if (errorMessage.includes("funds already claimed")) {
				toast.error(
					<h1 className="text-center font-serif">
						Funds have already been claimed
					</h1>
				);
			} else if (errorMessage.includes("no funds left to claim")) {
				toast.error(
					<h1 className="text-center font-serif">No funds left to claim</h1>
				);
			} else if (errorMessage.includes("user denied transaction")) {
				toast.error(
					<h1 className="text-center font-serif">Transaction Cancelled</h1>
				);
			} else {
				toast.error(
					<h1 className="text-center font-serif">
						{error.message || "An error occurred while claiming funds"}
					</h1>
				);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const progressPercentage = Math.min(
		(Number(campaign.amountCollected) / Number(campaign.target)) * 100,
		100
	);

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.3 }}
			className="relative max-w-md mx-auto"
		>
			<div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-purple-500/10 rounded-3xl blur-2xl opacity-50"></div>

			<div className="relative bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
				{/* Image Section */}
				{campaign.image && (
					<div className="relative h-56 overflow-hidden">
						<img
							src={campaign.image}
							alt={campaign.title}
							className="absolute inset-0 w-full h-full object-cover filter brightness-75"
						/>
						<div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
							<div className="bg-black/50 rounded-full px-4 py-2 flex items-center space-x-2">
								<span className="text-white text-sm">
									{`${campaign.owner.slice(0, 6)}...${campaign.owner.slice(
										-4
									)}`}
								</span>
							</div>
							<div className="flex space-x-2">
								<motion.button
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}
									className="bg-black/50 p-2 rounded-full backdrop-blur-sm"
								>
									<Heart className="text-white w-5 h-5" />
								</motion.button>
								<motion.button
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}
									className="bg-black/50 p-2 rounded-full backdrop-blur-sm"
								>
									<Share2 className="text-white w-5 h-5" />
								</motion.button>
							</div>
						</div>
					</div>
				)}

				{/* Content Section */}
				<div className="p-6 space-y-6">
					{/* Campaign Title and Description */}
					<div>
						<h2 className="text-2xl font-bold text-white mb-2">
							{campaign.title.length > 30
								? `${campaign.title.slice(0, 30)}...`
								: campaign.title}
						</h2>
						<p className="text-gray-400 text-sm line-clamp-2">
							{campaign.description.slice(0, 50)}...
						</p>
					</div>

					{/* Campaign Stats */}
					<div className="grid grid-cols-2 gap-4">
						<div className="bg-gray-800 rounded-xl p-4 space-y-2">
							<div className="flex items-center space-x-2">
								<Target className="w-5 h-5 text-cyan-400" />
								<span className="text-gray-300 text-xs">Target</span>
							</div>
							<p className="text-white font-bold">{campaign.target} ETH</p>
						</div>
						<div className="bg-gray-800 rounded-xl p-4 space-y-2">
							<div className="flex items-center space-x-2">
								<TrendingUp className="w-5 h-5 text-green-400" />
								<span className="text-gray-300 text-xs">Raised</span>
							</div>
							<p className="text-white font-bold">
								{campaign.amountCollected.slice(0, 8)}+ ETH
							</p>
						</div>
					</div>

					{/* Progress Bar */}
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-gray-400">Progress</span>
							<span className="text-white">
								{progressPercentage.toFixed(1)}%
							</span>
						</div>
						<div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
							<motion.div
								initial={{ width: 0 }}
								animate={{ width: `${progressPercentage}%` }}
								transition={{ duration: 0.5, type: "spring" }}
								className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
							/>
						</div>
					</div>

					{/* Donation Section */}
					{!campaign.claimed && new Date() < campaign.deadline && (
						<div className="space-y-4">
							<div className="flex space-x-2">
								<input
									type="number"
									placeholder="Donation Amount"
									className="flex-grow px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500/50"
									value={donationAmount}
									onChange={(e) => setDonationAmount(e.target.value)}
								/>
								<select
									className="px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl"
									value={donationCurrency}
									onChange={(e) => setDonationCurrency(e.target.value)}
								>
									<option value="ETH">ETH</option>
									<option value="USD">USD</option>
									<option value="BDT">BDT</option>
								</select>
							</div>
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={handleDonate}
								disabled={isLoading}
								className="w-full px-6 py-3 bg-gradient-to-r from-purple-700 via-purple-600 to-purple-700 border-purple-400 text-purple-100 rounded-xl 
                                    disabled:opacity-50 flex items-center justify-center space-x-2"
							>
								{isLoading ? (
									<>
										<RefreshCw className="w-4 h-4 animate-spin" />
										<span>Donating...</span>
									</>
								) : (
									<>
										<span>Donate</span>
										<ChevronRight className="w-4 h-4" />
									</>
								)}
							</motion.button>
						</div>
					)}

					{/* Campaign Claimed Section */}
					{campaign.claimed && (
						<div className="text-center bg-green-900/20 border border-green-500/30 rounded-xl p-4 flex items-center space-x-3">
							<CheckCircle2 className="w-5 h-5 text-green-400" />
							<p className="text-green-400">Campaign Funds Claimed</p>
						</div>
					)}

					{/* View Details and Claim Funds Sections */}
					<div className="space-y-4">
						<Link to={`view-details/${campaign.id}`}>
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="w-full bg-gray-800 text-white py-3 px-6 rounded-xl flex items-center justify-center space-x-2"
							>
								<span>View Details</span>
								<ChevronRight className="w-4 h-4" />
							</motion.button>
						</Link>

						{new Date() >= campaign.deadline && !campaign.claimed && (
							<>
								{Number(campaign.amountCollected) > 0 ? (
									<div className="space-y-4">
										<div className="bg-gray-800 rounded-xl p-4 flex items-center space-x-3">
											<Clock className="w-5 h-5 text-gray-400" />
											<p className="text-gray-300">
												Campaign Ended, Awaiting Claim
											</p>
										</div>
										<motion.button
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											onClick={handleClaimFunds}
											disabled={isLoading}
											className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 
												text-white rounded-xl disabled:opacity-50 flex items-center justify-center space-x-2"
										>
											{isLoading ? (
												<>
													<RefreshCw className="w-4 h-4 animate-spin" />
													<span>Claiming...</span>
												</>
											) : (
												<>
													<Wallet className="w-4 h-4" />
													<span>Claim Funds</span>
												</>
											)}
										</motion.button>
									</div>
								) : (
									<div className="bg-gray-800 rounded-xl p-4 flex items-center space-x-3">
										<Clock className="w-5 h-5 text-gray-400" />
										<p className="text-gray-300">
											Campaign Ended, No Funds to Claim
										</p>
									</div>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</motion.div>
	);
}
