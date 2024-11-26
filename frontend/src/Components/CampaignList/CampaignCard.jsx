import { useState } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import {
	Users,
	HeartIcon,
	Share2Icon,
	Target,
	TrendingUp,
	ArrowUpRight,
	Loader2,
	Wallet,
	Clock,
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
				console.error("Contract donation error:", contractErr);

				if (contractErr.code === "NUMERIC_FAULT") {
					toast.error(
						<div>
							<h1 className="font-bold">Invalid Donation Amount</h1>
							<p>The donation amount is too precise to process.</p>
							<p>Please round to 6 decimal places or higher.</p>
						</div>
					);
				} else {
					throw contractErr;
				}
			}
		} catch (err) {
			// Previous error handling remains the same
			if (err.code === 4001 || err.action === "sendTransaction") {
				toast.error(
					<p className="text-center font-serif">Transaction Cancelled</p>
				);
			} else if (
				err.code === -32000 ||
				err.message.includes("insufficient funds")
			) {
				const requiredAmount = err.message.match(/want (\d+)/);
				const currentBalance = err.message.match(/have (\d+)/);

				toast.error(
					<div className="text-center font-serif">
						<h1 className="font-bold">Insufficient Funds</h1>
						<p>
							Your wallet does not have enough ETH to complete this transaction.
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
			} else {
				console.error("Error donating:", err);
				toast.error(err.message || "Failed to process donation");
			}
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
			const message =
				error.data?.message ||
				error.message ||
				"An error occurred while claiming funds";

			toast.error(
				<h1 className="text-center font-serif">
					{message.includes("Only owner can claim funds")
						? "Only the campaign owner can claim funds"
						: message.includes("Campaign is not active")
						? "This campaign is not active"
						: message.includes("Campaign has not ended yet")
						? "Campaign has not ended yet"
						: message.includes("Funds already claimed")
						? "Funds have already been claimed"
						: message}
				</h1>
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="group relative">
			<div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
			<div className="relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700 backdrop-blur-xl">
				{campaign.image && (
					<div className="relative h-48 overflow-hidden">
						<img
							src={campaign.image}
							alt={campaign.title}
							className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent">
							<div className="absolute bottom-4 left-4 flex items-center space-x-2">
								<div className="h-10 w-10 rounded-full bg-gray-800/80 backdrop-blur-sm flex items-center justify-center">
									<Users className="h-5 w-5 text-indigo-400" />
								</div>
								<div className="px-4 py-2 rounded-full bg-gray-800/80 backdrop-blur-sm">
									<p className="text-sm text-gray-100">
										{`${campaign.owner.slice(0, 6)}...${campaign.owner.slice(
											-4
										)}`}
									</p>
								</div>
							</div>
						</div>
					</div>
				)}

				<div className="p-6 space-y-6">
					<div className="flex justify-between items-start">
						<h2 className="text-xl font-semibold text-gray-100 group-hover:text-white transition-colors">
							{campaign.title.slice(0, 23)}
							{campaign.title.length > 23 && "..."}
						</h2>
						<div className="flex gap-2">
							<button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors group/btn">
								<HeartIcon className="w-4 h-4 text-gray-400 group-hover/btn:text-red-400 transition-colors" />
							</button>
							<button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors group/btn">
								<Share2Icon className="w-4 h-4 text-gray-400 group-hover/btn:text-indigo-400 transition-colors" />
							</button>
						</div>
					</div>

					<p className="text-gray-400 text-sm line-clamp-2">
						{campaign.description}
					</p>

					<div className="grid grid-cols-2 gap-4">
						<div className="bg-gray-700 rounded-xl p-4 backdrop-blur-sm border border-gray-600 group-hover:border-indigo-500/20 transition-colors">
							<div className="flex items-center gap-2 text-gray-400 mb-2">
								<Target className="w-4 h-4" />
								<span className="text-xs font-medium">Target</span>
							</div>
							<p className="text-gray-100 font-bold">{campaign.target} ETH</p>
						</div>
						<div className="bg-gray-700 rounded-xl p-4 backdrop-blur-sm border border-gray-600 group-hover:border-indigo-500/20 transition-colors">
							<div className="flex items-center gap-2 text-gray-400 mb-2">
								<TrendingUp className="w-4 h-4" />
								<span className="text-xs font-medium">Raised</span>
							</div>
							<p className="text-gray-100 font-bold overflow-x-scroll">
								{campaign.amountCollected} ETH
							</p>
						</div>
					</div>

					<div className="space-y-3">
						<div className="flex justify-between text-sm">
							<span className="text-gray-400">Progress</span>
							<span className="text-gray-300">
								{(
									(Number(campaign.amountCollected) / Number(campaign.target)) *
									100
								).toFixed(1)}
								%
							</span>
						</div>
						<div className="h-2 bg-gray-700 rounded-full overflow-hidden">
							<div
								className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-300"
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

					{!campaign.claimed && new Date() < campaign.deadline && (
						<div className="space-y-4">
							<div className="flex flex-col gap-4">
								<div className="flex gap-2">
									<input
										type="number"
										placeholder="Amount"
										className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder-gray-500"
										value={donationAmount}
										onChange={(e) => setDonationAmount(e.target.value)}
									/>
									<select
										className="px-4 py-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all"
										value={donationCurrency}
										onChange={(e) => setDonationCurrency(e.target.value)}
									>
										<option value="ETH">ETH</option>
										<option value="USD">USD</option>
										<option value="BDT">BDT</option>
									</select>
								</div>
								<button
									onClick={handleDonate}
									disabled={isLoading}
									className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group/btn"
								>
									{isLoading ? (
										<>
											<Loader2 className="w-4 h-4 animate-spin" />
											<span>Donating</span>
										</>
									) : (
										<>
											<span>Donate</span>
											<ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
										</>
									)}
								</button>
							</div>
						</div>
					)}

					{campaign.claimed && (
						<div className="bg-green-900/20 border border-green-500/20 rounded-xl p-4 flex items-center gap-3 backdrop-blur-sm">
							<CheckCircle2 className="w-5 h-5 text-green-400" />
							<p className="text-green-400 font-medium">
								Campaign funds claimed
							</p>
						</div>
					)}

					<Link
						to={`view-details/${campaign.id}`}
						className="block mt-6 group/link"
					>
						<button className="w-full bg-gray-700 hover:bg-gray-600 text-gray-100 py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
							<span>View Details</span>
							<ArrowUpRight className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
						</button>
					</Link>

					{new Date() >= campaign.deadline && !campaign.claimed && (
						<div className="space-y-4">
							<div className="bg-gray-700 border border-gray-600 rounded-xl p-4 flex items-center gap-3">
								<Clock className="w-5 h-5 text-gray-400" />
								<p className="text-gray-400 font-medium">
									Campaign ended, awaiting claim
								</p>
							</div>
							<button
								onClick={handleClaimFunds}
								disabled={isLoading}
								className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
							>
								{isLoading ? (
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
	);
}
