import { useState, useEffect } from "react";
import { CampaignCard } from "./CampaignCard";
import { SearchFilter } from "./SearchFilter";
import { Sparkles } from "lucide-react";
import { ethers } from "ethers";
import { getContract } from "../../helper/contract";

export function CampaignList() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [allCampaigns, setAllCampaigns] = useState([]);
	const [filteredCampaigns, setFilteredCampaigns] = useState([]);
	const [filter, setFilter] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		fetchAllCampaigns();
	}, []);

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

	const fetchAllCampaigns = async () => {
		try {
			setLoading(true);
			const contract = await getContract();
			if (!contract) {
				throw new Error("Please connect your wallet to view campaigns");
			}

			const onChainCampaigns = await contract.getAllCampaigns();
			const campaignsWithData = await Promise.all(
				onChainCampaigns.map(async (campaign) => {
					const ipfsData = await fetchIPFSData(campaign.metadataHash);
					return {
						id: campaign.id,
						owner: campaign.owner,
						target: ethers.formatEther(campaign.target),
						deadline: new Date(Number(campaign.deadline) * 1000),
						amountCollected: ethers.formatEther(campaign.amountCollected),
						claimed: campaign.claimed,
						status: campaign.status,
						category: campaign.category,
						title: ipfsData?.title || "Untitled Campaign",
						description: ipfsData?.description || "No description available",
						image:
							ipfsData?.image?.replace(
								"ipfs://",
								"https://gateway.pinata.cloud/ipfs/"
							) || "",
						donorList: campaign.donorList,
					};
				})
			);

			setAllCampaigns(campaignsWithData);
			console.log("Fetched campaigns:", campaignsWithData);
			setFilteredCampaigns(campaignsWithData);
		} catch (err) {
			console.error("Error fetching campaigns:", err);
			setError(err.message || "Failed to fetch campaigns");
		} finally {
			setLoading(false);
		}
	};

	const handleFilterChange = (selectedValue) => {
		console.log("Selected filter value:", selectedValue);
		setFilter(selectedValue);

		if (selectedValue === "All Campaigns") {
			setFilteredCampaigns(allCampaigns);
		} else {
			console.log(allCampaigns);
			const filtered = allCampaigns.filter(
				(campaign) => campaign.category.toString() === selectedValue
			);
			console.log("Filtered campaigns:", filtered);
			setFilteredCampaigns(filtered);
		}
	};

	const handleSearch = (term) => {
		setSearchTerm(term);
		const searchResults = allCampaigns.filter((campaign) => {
			const searchableText =
				`${campaign.title} ${campaign.description} ${campaign.owner} ${campaign.category}`.toLowerCase();
			return searchableText.includes(term.toLowerCase());
		});
		setFilteredCampaigns(searchResults);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-900 flex justify-center items-center">
				<div className="relative">
					<div className="w-20 h-20 relative">
						<div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
						<div className="absolute inset-0 rounded-full border-2 border-gray-800"></div>
					</div>
					<Sparkles className="absolute inset-0 m-auto w-8 h-8 text-indigo-400 animate-pulse" />
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-900 flex justify-center items-center p-4">
				<div className="bg-gray-800 border border-red-500/10 rounded-2xl p-8 max-w-md">
					<div className="text-center space-y-6">
						<p className="text-red-400 text-lg font-medium">{error}</p>
						<button
							onClick={fetchAllCampaigns}
							className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
						>
							Retry
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 pt-28">
			<div className="max-w-7xl mx-auto space-y-12">
				<div className="text-center space-y-8">
					<div className="space-y-4">
						<h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
							Discover Campaigns
						</h1>
						<p className="text-gray-400 max-w-2xl mx-auto text-lg">
							Support innovative projects & make a difference in the community
						</p>
					</div>
					<SearchFilter
						filter={filter}
						searchTerm={searchTerm}
						onFilterChange={handleFilterChange}
						onSearch={handleSearch}
					/>
				</div>
			</div>

			{filteredCampaigns.length === 0 ? (
				<div className="flex justify-center items-center min-h-[60vh]">
					<div className="bg-gray-800 border border-gray-700 rounded-2xl p-12 max-w-lg mx-auto text-center space-y-6">
						<div className="relative w-16 h-16 mx-auto">
							<div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
							<div className="relative flex items-center justify-center">
								<Sparkles className="w-8 h-8 text-indigo-400" />
							</div>
						</div>
						<h2 className="text-3xl font-bold bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
							{searchTerm ? "No Matching Campaigns" : "No Campaigns Yet"}
						</h2>
						<p className="text-gray-500">
							{searchTerm
								? "Try adjusting your search terms"
								: "Be the first to start a campaign!"}
						</p>
					</div>
				</div>
			) : (
				<div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-auto w-fit mt-10">
					{filteredCampaigns.map((campaign) => (
						<CampaignCard key={campaign.id} campaign={campaign} />
					))}
				</div>
			)}
		</div>
	);
}
