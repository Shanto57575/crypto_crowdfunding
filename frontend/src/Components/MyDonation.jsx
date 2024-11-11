import { getContract } from "../helper/contract";
import { useState } from "react";

const MyDonation = () => {
	const [donations, setDonations] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const getMyDonations = async () => {
		try {
			setLoading(true);
			setError(null);
			const contract = await getContract();
			const donationData = await contract.getMyDonations();
			console.log("donationData", donationData);

			// Transform the data from the contract into a more usable format
			const formattedDonations = donationData.map((donation) => ({
				campaignId: donation.campaignId,
				amount: donation.amount.toString(), // Convert BigNumber to string
				isRefunded: donation.isRefunded,
				category: donation.category,
			}));

			setDonations(formattedDonations);
		} catch (err) {
			console.error("Error fetching donations:", err);
			setError("Failed to fetch donations. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-4 pt-32">
			<h1 className="text-2xl font-bold mb-4">My Donations</h1>

			<button
				className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
				onClick={getMyDonations}
				disabled={loading}
			>
				{loading ? "Loading..." : "Get My Donations"}
			</button>

			{error && <div className="text-red-500 mt-4">{error}</div>}

			{donations.length > 0 && (
				<div className="mt-4">
					<h2 className="text-xl font-semibold mb-2">Your Donations:</h2>
					<div className="grid gap-4">
						{donations.map((donation, index) => (
							<div
								key={`${donation.campaignId}-${index}`}
								className="border p-4 rounded"
							>
								<p>
									<strong>Campaign ID:</strong>{" "}
									{donation.campaignId.slice(0, 6)}...
									{donation.campaignId.slice(38, 42)}
								</p>
								<p>
									<strong>Amount:</strong> {donation.amount / 1e18} ETH
								</p>
								<p>
									<strong>Category:</strong> {donation.category}
								</p>
								<p>
									<strong>Status:</strong>{" "}
									{donation.isRefunded ? "Refunded" : "Active"}
								</p>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default MyDonation;
