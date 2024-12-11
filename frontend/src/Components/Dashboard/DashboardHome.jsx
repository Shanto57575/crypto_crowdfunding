import { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useWallet } from "../../context/WalletContext";
import { getContract } from "../../helper/contract";
import { fetchCampaigns } from "../MyCampaign/utils/campaignUtils";
import HashLoader from "react-spinners/HashLoader";

const DashboardHome = () => {
	const { userAddress } = useWallet();
	const [isLoading, setIsLoading] = useState(true);
	const [campaigns, setCampaigns] = useState([]);
	const [error, setError] = useState("");
	const [totalRaised, setTotalRaised] = useState(0);
	const [totalBackers, setTotalBackers] = useState(0);
	const [averageDonation, setAverageDonation] = useState(0);
	const [allDonations, setAllDonations] = useState([]);
	const [chartOptions, setChartOptions] = useState({
		chart: { type: "column" },
		title: { text: "Campaign Progress" },
		xAxis: { categories: [] },
		yAxis: {
			min: 0,
			title: { text: "Amount (ETH)" },
		},
		tooltip: {
			headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
			pointFormat:
				'<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
				'<td style="padding:0"><b>{point.y:.4f} ETH</b></td></tr>',
			footerFormat: "</table>",
			shared: true,
			useHTML: true,
		},
		plotOptions: {
			column: {
				pointPadding: 0.2,
				borderWidth: 0,
			},
		},
		series: [
			{ name: "Amount Raised", data: [] },
			{ name: "Target Amount", data: [] },
		],
	});

	const getMyCampaigns = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const contract = await getContract();
			const fetchedCampaigns = await fetchCampaigns(contract, userAddress);
			console.log("fetched campaigns", fetchedCampaigns);

			if (!Array.isArray(fetchedCampaigns)) {
				throw new Error("Fetched campaigns is not an array");
			}

			const totalRaised = fetchedCampaigns.reduce(
				(sum, campaign) => sum + parseFloat(campaign.amountCollected1 || 0),
				0
			);

			let allDonations = [];
			let donorId = 1;
			const totalBackers = fetchedCampaigns.reduce((sum, campaign) => {
				if (campaign.donorList && typeof campaign.donorList === "object") {
					if (Array.isArray(campaign.donorList.Target)) {
						campaign.donorList.Target.forEach((donation) => {
							allDonations.push({
								id: donorId++,
								donorId: donation[0],
								amount: parseFloat(donation[1]) / 1000000000000000000,
								campaignTitle: campaign.metadataHash.title,
							});
						});
						return sum + campaign.donorList.Target.length;
					} else if (Array.isArray(campaign.donorList)) {
						campaign.donorList.forEach((donor) => {
							allDonations.push({
								id: donorId++,
								donorId: donor.donorAddress,
								amount: parseFloat(donor.totalDonated) / 1000000000000000000,
								campaignTitle: campaign.metadataHash.title,
							});
						});
						return sum + campaign.donorList.length;
					}
				}
				return sum;
			}, 0);

			allDonations.sort((a, b) => b.amount - a.amount);

			const averageDonation = totalBackers > 0 ? totalRaised / totalBackers : 0;

			// Prepare Highcharts data
			const categories = fetchedCampaigns.map(
				(campaign) => campaign.metadataHash.title
			);
			const amountRaised = fetchedCampaigns.map((campaign) =>
				parseFloat(campaign.amountCollected1 || 0)
			);
			const targetAmounts = fetchedCampaigns.map(
				(campaign) => parseFloat(campaign.target) / 1000000000000000000
			);

			setChartOptions((prevOptions) => ({
				...prevOptions,
				xAxis: { ...prevOptions.xAxis, categories: categories },
				series: [
					{ name: "Amount Raised", data: amountRaised },
					{ name: "Target Amount", data: targetAmounts },
				],
			}));

			setCampaigns(fetchedCampaigns);
			console.log("campaigns", fetchedCampaigns);
			setTotalRaised(totalRaised);
			setTotalBackers(totalBackers);
			setAverageDonation(averageDonation);
			setAllDonations(allDonations);
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
			<div className="flex justify-center items-center h-screen">
				<HashLoader color="#36d7b7" />
			</div>
		);
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	return (
		<div className="w-full mr-6 text-white p-6">
			<header className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Dashboard</h1>
			</header>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				<div className="bg-gray-800 p-6 rounded-lg">
					<h3 className="text-lg font-semibold mb-2">Total Raised</h3>
					<p className="text-3xl font-bold">{totalRaised.toFixed(4)} ETH</p>
				</div>
				<div className="bg-gray-800 p-6 rounded-lg">
					<h3 className="text-lg font-semibold mb-2">Total Campaigns</h3>
					<p className="text-3xl font-bold">{campaigns.length}</p>
				</div>
				<div className="bg-gray-800 p-6 rounded-lg">
					<h3 className="text-lg font-semibold mb-2">Total Backers</h3>
					<p className="text-3xl font-bold">{totalBackers}</p>
				</div>
				<div className="bg-gray-800 p-6 rounded-lg">
					<h3 className="text-lg font-semibold mb-2">Avg. Donation</h3>
					<p className="text-3xl font-bold">{averageDonation.toFixed(4)} ETH</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div className="bg-gray-800 p-6 rounded-lg">
					<h2 className="text-xl font-bold mb-4">Campaign Progress</h2>
					<HighchartsReact highcharts={Highcharts} options={chartOptions} />
				</div>

				<div className="bg-gray-800 p-6 rounded-lg">
					<h2 className="text-xl font-bold mb-4">Donations List</h2>
					<div className="space-y-4 max-h-[400px] overflow-y-auto">
						{allDonations.length > 0 ? (
							allDonations.map((donation, index) => (
								<div
									key={donation.id}
									className="flex justify-between items-center"
								>
									<div className="flex gap-4">
										<p className="text-gray-400">{index + 1}.</p>
										<p
											className="font-medium truncate max-w-[200px]"
											title={donation.donorId}
										>
											{donation.donorId}
										</p>
									</div>
									<span className="font-bold text-green-400 whitespace-nowrap">
										{donation.amount.toFixed(4)} ETH
									</span>
								</div>
							))
						) : (
							<p>No donations found.</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default DashboardHome;
