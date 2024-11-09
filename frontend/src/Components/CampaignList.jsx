import { providerErrors, rpcErrors } from "@metamask/rpc-errors";
import { ethers } from "ethers";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  HeartIcon,
  Loader2,
  Search,
  Share2Icon,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { getContract } from "../helper/contract";

const CampaignList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [donationAmounts, setDonationAmounts] = useState({});
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(true);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);

  const [loadingStates, setLoadingStates] = useState({
    donate: {},
    claim: {},
  });

  const setLoadingState = (action, campaignId, isLoading) => {
    setLoadingStates((prev) => ({
      ...prev,
      [action]: { ...prev[action], [campaignId]: isLoading },
    }));
  };

  const handleSearch = () => {
    setIsSearching(true);
    const searchResults = allCampaigns.filter((campaign) => {
      const searchableText =
        `${campaign.title} ${campaign.description} ${campaign.owner} ${campaign.category}`.toLowerCase();
      return searchableText.includes(searchTerm.toLowerCase());
    });
    setFilteredCampaigns(searchResults);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setIsSearching(false);
    setShowSearch(true);
  };

  // const applyFilter = (selectedFilter) => {
  //   let filtered = [...allCampaigns];
  //   console.table(filtered);

  //   switch (selectedFilter) {
  //     case "active":
  //       filtered = filtered.filter((campaign) => campaign.status === 0n);
  //       break;
  //     case "inactive":
  //       filtered = filtered.filter((campaign) => campaign.status == 1n);
  //       break;
  //     default:
  //       break;
  //   }
  //   setFilteredCampaigns(filtered);
  // };

  const handleFilterChange = (selectedValue) => {
    setFilter(selectedValue);

    if (selectedValue === "all") {
      fetchAllCampaigns();
    } else {
      // Convert the numeric value to category name

      fetchCampaignsByCategory(selectedValue);
    }
  };

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
  const fetchCampaignsByCategory = async (category) => {
    console.log("Fetching campaigns for category:", category);
    try {
      setLoading(true);

      // Validate category
      if (!category || typeof category !== "string") {
        throw rpcErrors.invalidParams({
          message: "Invalid category parameter",
          data: { providedCategory: category },
        });
      }

      const contract = await getContract();
      if (!contract) {
        throw providerErrors.unauthorized({
          message: "Please connect your wallet to view campaigns",
          code: 4100,
        });
      }

      const onChainCampaigns = await contract.getCampaignsByCategory(category);

      const campaignsWithData = await Promise.all(
        onChainCampaigns.map(async (campaign) => {
          try {
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
          } catch (ipfsError) {
            console.error("Error fetching IPFS data:", ipfsError);
            throw rpcErrors.internal({
              message: "Failed to fetch campaign metadata",
              data: { campaignId: campaign.id },
            });
          }
        })
      );
      console.log(campaignsWithData);
      setAllCampaigns(campaignsWithData);
      setFilteredCampaigns(campaignsWithData);
      // applyFilter(category);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setError("");
      if (err.code === 4001) {
        throw providerErrors.userRejectedRequest({
          message: "You rejected the connection request",
        });
      } else if (err.code === -32002) {
        throw providerErrors.disconnected({
          message: "Please unlock your MetaMask wallet",
        });
      } else if (err.code === -32603) {
        throw rpcErrors.internal({
          message: "Network error. Please check your connection",
        });
      } else if (err.code === 4100) {
        throw providerErrors.unauthorized({
          message: "Please connect your wallet to continue",
        });
      } else {
        throw rpcErrors.invalidRequest({
          message: err.message || "Failed to fetch campaigns",
          data: { originalError: err },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCampaigns = async () => {
    try {
      setLoading(true);
      const contract = await getContract();

      if (!contract) {
        throw providerErrors.unauthorized({
          message: "Please connect your wallet to view campaigns",
          code: 4100,
        });
      }

      const onChainCampaigns = await contract.getAllCampaigns();

      const campaignsWithData = await Promise.all(
        onChainCampaigns.map(async (campaign) => {
          try {
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
          } catch (ipfsError) {
            console.error("Error fetching IPFS data:", ipfsError);
            throw rpcErrors.internal({
              message: "Failed to fetch campaign metadata",
              data: { campaignId: campaign.id },
            });
          }
        })
      );

      setAllCampaigns(campaignsWithData);
      setFilteredCampaigns(campaignsWithData);
      // applyFilter(filter);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setError("");
      if (err.code === 4001) {
        throw providerErrors.userRejectedRequest({
          message: "You rejected the connection request",
        });
      } else if (err.code === -32002) {
        throw providerErrors.disconnected({
          message: "Please unlock your MetaMask wallet",
        });
      } else if (err.code === -32603) {
        throw rpcErrors.internal({
          message: "Network error. Please check your connection",
        });
      } else if (err.code === 4100) {
        throw providerErrors.unauthorized({
          message: "Please connect your wallet to continue",
        });
      } else {
        throw rpcErrors.invalidRequest({
          message: err.message || "Failed to fetch campaigns",
          data: { originalError: err },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async (campaignId, amount) => {
    try {
      if (!amount || amount <= 0) {
        throw rpcErrors.invalidParams({
          message: "Please enter a valid donation amount",
          data: { campaignId, amount },
        });
      }

      setLoadingState("donate", campaignId, true);
      const contract = await getContract();
      if (!contract) {
        throw providerErrors.unauthorized({
          message: "Please connect your wallet to donate",
          code: 4100,
        });
      }

      const tx = await contract.donateToCampaign(campaignId, {
        value: ethers.parseEther(amount),
      });
      await tx.wait();

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <p className="font-medium">Donation Successful</p>
        </div>
      );
      setDonationAmounts({});
      fetchAllCampaigns();
    } catch (err) {
      console.error("Error donating:", err);

      let errorMessage;
      // Check for insufficient funds error
      if (err.message?.toLowerCase().includes("insufficient funds")) {
        errorMessage = "Insufficient funds in your wallet";
      } else if (err.code === 4001) {
        errorMessage = "You rejected the transaction";
      } else if (err.code === -32603) {
        errorMessage =
          "Transaction failed. Please check your balance and try again";
      } else if (err.code === 4100) {
        errorMessage = "Please connect your wallet to donate";
      } else {
        errorMessage =
          err.reason ||
          err.data?.message ||
          err.error?.data?.message ||
          err.message?.split(":", 1)[0] ||
          "Failed to process donation";
      }

      toast.error(
        <div className="font-serif flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <p className="font-medium">{errorMessage}</p>
        </div>
      );
    } finally {
      setLoadingState("donate", campaignId, false);
    }
  };

  const handleClaimingFunds = async (campaignId) => {
    try {
      setLoadingState("claim", campaignId, true);
      const contract = await getContract();
      if (!contract) {
        throw providerErrors.unauthorized({
          message: "Please connect your wallet to claim funds",
          code: 4100,
        });
      }

      const tx = await contract.claimFunds(campaignId);
      await tx.wait();

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <p className="font-medium">Funds Claimed Successfully</p>
        </div>
      );
      fetchAllCampaigns();
    } catch (err) {
      console.error("Error claiming funds:", err);

      let errorMessage;
      if (err.code === 4001) {
        errorMessage = "You rejected the claim transaction";
      } else if (err.code === -32603) {
        errorMessage = "Claim failed. Please check contract conditions";
      } else if (err.code === 4100) {
        errorMessage = "Please connect your wallet to claim";
      } else {
        errorMessage =
          err.data?.message ||
          err.error?.data?.message ||
          err.reason ||
          err.message ||
          "Failed to claim funds";
      }

      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <p className="font-medium">
            {errorMessage.replace("execution reverted:", "").trim()}
          </p>
        </div>
      );
    } finally {
      setLoadingState("claim", campaignId, false);
    }
  };

  useEffect(() => {
    fetchAllCampaigns();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex justify-center items-center">
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
      <div className="min-h-screen bg-[#080808] flex justify-center items-center p-4">
        <div className="bg-gray-900/50 backdrop-blur-xl border border-red-500/10 rounded-2xl p-8 max-w-md">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-400 text-lg font-medium">{error}</p>
            <button
              onClick={fetchAllCampaigns}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <Loader2 className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] py-12 px-4 sm:px-6 lg:px-8 pt-28">
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

          {/* Search and Filter Container */}
          <div className="max-w-4xl mx-auto px-2 mb-10">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Filter Dropdown */}
              <div className="relative min-w-[140px] sm:min-w-[180px]">
                <select
                  value={filter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-gray-900/50 border border-gray-800 rounded-xl sm:rounded-2xl text-gray-100 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm sm:text-base"
                >
                  <option value="all">All Campaigns</option>
                  <option value="0">Medical Treatment</option>
                  <option value="1">Disaster Relief</option>
                  <option value="2">Education</option>
                  <option value="3">Startup Business</option>
                  <option value="4">Creative Projects</option>
                  <option value="5">Community Service</option>
                  <option value="6">Technology</option>
                  <option value="7">Environmental</option>
                </select>

                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Search Section */}
              <div className="flex-1 relative">
                {showSearch ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search campaigns..."
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-gray-900/50 border border-gray-800 rounded-xl sm:rounded-2xl pr-24 sm:pr-32 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm sm:text-base"
                    />
                    <button
                      onClick={() => {
                        handleSearch();
                        setShowSearch(false);
                      }}
                      disabled={!searchTerm}
                      className="absolute right-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg sm:rounded-xl transition-all flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                    >
                      <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Search</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 sm:px-4 py-3 sm:py-4 bg-gray-900/50 border border-gray-800 rounded-xl sm:rounded-2xl text-gray-100 text-sm sm:text-base">
                      <span className="flex items-center gap-2">
                        <Search className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" />
                        <span className="truncate">
                          Results for: {searchTerm}
                        </span>
                      </span>
                    </div>
                    <button
                      onClick={clearSearch}
                      className="px-3 sm:px-4 py-3 sm:py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl sm:rounded-2xl transition-all flex items-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Clear</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-800 rounded-2xl p-12 max-w-lg mx-auto text-center space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
              <div className="relative flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
              {isSearching ? "No Matching Campaigns" : "No Campaigns Yet"}
            </h2>
            <p className="text-gray-500">
              {isSearching
                ? "Try adjusting your search terms"
                : "Be the first to start a campaign!"}
            </p>
            {isSearching && (
              <button
                onClick={clearSearch}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all inline-flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear Search
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-screen-xl mx-auto mt-10">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-gray-900/90 rounded-xl overflow-hidden border border-gray-800/50 backdrop-blur-xl">
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
                            {`${campaign.owner.slice(
                              0,
                              6
                            )}...${campaign.owner.slice(-4)}`}
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
                      <button className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 transition-colors group/btn">
                        <HeartIcon className="w-4 h-4 text-gray-400 group-hover/btn:text-red-400 transition-colors" />
                      </button>
                      <button className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 transition-colors group/btn">
                        <Share2Icon className="w-4 h-4 text-gray-400 group-hover/btn:text-indigo-400 transition-colors" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm line-clamp-2">
                    {campaign.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/30 rounded-xl p-4 backdrop-blur-sm border border-gray-700/50 group-hover:border-indigo-500/20 transition-colors">
                      <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <Target className="w-4 h-4" />
                        <span className="text-xs font-medium">Target</span>
                      </div>
                      <p className="text-gray-100 font-bold">
                        {campaign.target} ETH
                      </p>
                    </div>
                    <div className="bg-gray-800/30 rounded-xl p-4 backdrop-blur-sm border border-gray-700/50 group-hover:border-indigo-500/20 transition-colors">
                      <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-medium">Raised</span>
                      </div>
                      <p className="text-gray-100 font-bold">
                        {campaign.amountCollected} ETH
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-gray-300">
                        {(
                          (Number(campaign.amountCollected) /
                            Number(campaign.target)) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
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
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="ETH Amount"
                          className="flex-1 px-4 py-3 bg-gray-800/30 border border-gray-700/50 text-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder-gray-500"
                          value={donationAmounts[campaign.id] || ""}
                          onChange={(e) =>
                            setDonationAmounts((prev) => ({
                              ...prev,
                              [campaign.id]: e.target.value,
                            }))
                          }
                        />
                        <button
                          onClick={() =>
                            handleDonate(
                              campaign.id,
                              donationAmounts[campaign.id]
                            )
                          }
                          disabled={loadingStates.donate[campaign.id]}
                          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group/btn"
                        >
                          {loadingStates.donate[campaign.id] ? (
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
                    <button className="w-full bg-gray-800 hover:bg-gray-700 text-gray-100 py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                      <span>View Details</span>
                      <ArrowUpRight className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </button>
                  </Link>

                  {new Date() >= campaign.deadline && !campaign.claimed && (
                    <div className="space-y-4">
                      <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <p className="text-gray-400 font-medium">
                          Campaign ended, awaiting claim
                        </p>
                      </div>
                      <button
                        onClick={() => handleClaimingFunds(campaign.id)}
                        disabled={loadingStates.claim[campaign.id]}
                        className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loadingStates.claim[campaign.id] ? (
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
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignList;
