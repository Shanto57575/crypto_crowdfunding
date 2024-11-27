import { providerErrors, rpcErrors } from "@metamask/rpc-errors";
import { ethers, parseEther } from "ethers";
import {
  AlertCircle,
  Award,
  Bookmark,
  ChevronRight,
  Clock,
  Edit3,
  Loader2,
  MessageSquarePlus,
  PlusCircle,
  Tag,
  Target,
  Trash2,
  Wallet2,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { getContract } from "../helper/contract";
import CreatePostModal from "./CreatePostModal";
import UpdateCampaign from "./UpdateCampaign";
import WithdrawalRequestModal from "./WithdrawalRequestModal";

const MyCampaign = () => {
  const { userAddress } = useWallet();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loadingStates, setLoadingStates] = useState({
    delete: {},
    update: {},
    claim: {},
    withdraw: {},
  });

  const handleUpdate = (campaign) => {
    setSelectedCampaign(campaign);
    setIsUpdateModalOpen(true);
  };
  const handleWithdraw = async (campaign, campaignId) => {
    try {
      setLoadingStates((prev) => ({
        ...prev,
        withdraw: { ...prev.withdraw, [campaignId]: true },
      }));

      const contract = await getContract();
      const status = await contract.checkWithdrawalStatus(campaignId);

      const {
        isActive,
        totalVotes,
        votesInFavor,
        votesAgainst,
        allVoted,
        canClaim,
      } = status;

      if (isActive) {
        if (allVoted) {
          if (canClaim) {
            const tx = await contract.withdrawFundsAfterVote(campaignId);
            toast.success(
              <h1 className="font-serif text-center">
                Donors Accepted the Request
              </h1>
            );
            await tx.wait();
            toast.success(
              <h1 className="font-serif text-center">
                Funds withdrawn successfully
              </h1>
            );
          } else {
            const tx = await contract.donorsRefuseEarlyWithdraw(campaignId);
            await tx.wait();
            toast.error("Donors did not accept the request");
          }
        } else {
          toast(
            <h1 className="font-serif text-center">
              {`Total donors: ${totalVotes}. Voting in progress: ${votesInFavor}
							in favor & ${votesAgainst} against`}
            </h1>
          );
        }
      } else {
        setSelectedCampaign(campaign);
        setIsWithdrawModalOpen(true);
      }
    } catch (error) {
      console.error("Error handling withdrawal:", error);
      toast.error(error.message || "Failed to process withdrawal request");
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        withdraw: { ...prev.withdraw, [campaignId]: false },
      }));
    }
  };

  const handleDelete = async (campaignId) => {
    try {
      setLoadingStates((prev) => ({
        ...prev,
        delete: { ...prev.delete, [campaignId]: true },
      }));

      if (!window.ethereum) {
        throw providerErrors.custom({
          code: 4200,
          message: "Please install MetaMask",
        });
      }

      // Check network
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0xaa36a7") {
        // Sepolia chainId
        throw providerErrors.custom({
          code: 4901,
          message: "Please switch to Sepolia network",
        });
      }

      const contract = await getContract();
      if (!contract) throw rpcErrors.invalidRequest("Failed to load contract");

      try {
        const tx = await contract.deleteCampaign(campaignId);
        await tx.wait();
        toast.success(
          <p className="font-serif">Campaign Deleted Successfully</p>
        );
        getMyCampaigns();
      } catch (txError) {
        if (txError.code === "ACTION_REJECTED") {
          throw providerErrors.userRejectedRequest("Transaction was rejected");
        } else if (txError.code === "INSUFFICIENT_FUNDS") {
          throw providerErrors.custom({
            code: 4100,
            message: "Insufficient funds for gas",
          });
        } else if (txError.code === "UNPREDICTABLE_GAS_LIMIT") {
          // Check if the error message contains "Cannot delete campaign with donations"
          if (
            txError.message.includes("Cannot delete campaign with donations")
          ) {
            throw providerErrors.custom({
              code: 4901,
              message: "Cannot delete campaign with active donations",
            });
          } else {
            throw txError;
          }
        } else {
          throw txError;
        }
      }
    } catch (err) {
      console.error("Error deleting campaign:", err);
      toast.error(
        <p className="font-serif">
          {err.message || "Failed to delete campaign"}
        </p>
      );
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        delete: { ...prev.delete, [campaignId]: false },
      }));
    }
  };

  const handleClaimFunds = async (campaignId) => {
    try {
      setLoadingStates((prev) => ({
        ...prev,
        claim: { ...prev.claim, [campaignId]: true },
      }));

      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw providerErrors.custom({
          code: 4200,
          message: "Please install MetaMask",
        });
      }

      // Verify connected account
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (!accounts || accounts.length === 0) {
        throw providerErrors.unauthorized("Please connect your wallet");
      }

      // Check network
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0xaa36a7") {
        throw providerErrors.custom({
          code: 4901,
          message: "Please switch to Sepolia network",
        });
      }

      const contract = await getContract();
      if (!contract) throw rpcErrors.invalidRequest("Failed to load contract");

      try {
        const tx = await contract.claimFunds(campaignId);
        await tx.wait();
        toast.success(<p className="font-serif">Claimed Funds Successfully</p>);
        getMyCampaigns();
      } catch (txError) {
        if (txError.code === "ACTION_REJECTED") {
          throw providerErrors.userRejectedRequest("Transaction was rejected");
        } else if (txError.code === "INSUFFICIENT_FUNDS") {
          throw providerErrors.custom({
            code: 4100,
            message: "Insufficient funds for gas",
          });
        } else if (txError.code === "UNPREDICTABLE_GAS_LIMIT") {
          throw rpcErrors.invalidRequest(
            "Unable to estimate gas. The claim may fail"
          );
        }
        throw txError;
      }
    } catch (err) {
      console.error("Error claiming funds:", err);
      toast.error(
        <p className="font-serif">{err.message || "Failed to claim funds"}</p>
      );
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        claim: { ...prev.claim, [campaignId]: false },
      }));
    }
  };

  const getMyCampaigns = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw providerErrors.custom({
          code: 4200,
          message: "Please install MetaMask",
        });
      }

      // Check for user address
      if (!userAddress) {
        throw providerErrors.unauthorized("Please connect your wallet first");
      }

      try {
        // Verify the account is still connected
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (!accounts || accounts.length === 0) {
          throw providerErrors.unauthorized("Please connect your wallet");
        }

        // Check network
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        if (chainId !== "0xaa36a7") {
          throw providerErrors.custom({
            code: 4901,
            message: "Please switch to Sepolia network",
          });
        }

        const contract = await getContract();
        if (!contract) {
          throw rpcErrors.invalidRequest("Failed to load contract");
        }

        const allCampaigns = await contract.getCampaignsByOwner(userAddress);

        const formattedCampaigns = await Promise.all(
          allCampaigns.map(async (campaign) => {
            try {
              const metadataResponse = await fetch(campaign.metadataHash);
              if (!metadataResponse.ok) {
                throw providerErrors.custom({
                  code: 4200,
                  message: "Failed to fetch campaign metadata",
                });
              }
              const metadata = await metadataResponse.json();

              return {
                id: campaign.id,
                owner: campaign.owner,
                metadataHash: metadata,
                target: campaign.target.toString(),
                target1: ethers.formatEther(campaign.target),
                deadline: campaign.deadline.toString(),
                amountCollected: campaign.amountCollected.toString(),
                amountCollected1: ethers.formatEther(campaign.amountCollected),
                claimed: campaign.claimed,
                status: campaign.status,
                category: campaign.category,
                canClaimed: campaign.canClaimed,
              };
            } catch (fetchError) {
              console.error("Error fetching metadata:", fetchError);
              return {
                ...campaign,
                metadataHash: { error: "Failed to load metadata" },
              };
            }
          })
        );

        setCampaigns(formattedCampaigns);
      } catch (contractError) {
        if (contractError.code === -32002) {
          throw providerErrors.custom({
            code: -32002,
            message: "MetaMask request pending. Please check your MetaMask",
          });
        }
        throw contractError;
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching campaigns:", err);
      toast.error(
        <p className="font-serif">
          {err.message || "Failed to fetch campaigns"}
        </p>
      );
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
      <div className="min-h-screen bg-black flex justify-center items-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto" />
          <p className="text-indigo-400 animate-pulse font-medium">
            Loading campaigns...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md bg-gray-900 rounded-xl p-8 border border-red-900">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl text-red-500 font-bold text-center mb-2">
            Error
          </h3>
          <p className="text-gray-400 text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (!campaigns.length) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md bg-gray-900 rounded-xl p-8 border border-indigo-900/30">
          <div className="text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-pulse" />
              <PlusCircle className="w-24 h-24 text-indigo-500 relative z-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No Campaigns Yet
              </h3>
              <p className="text-gray-400 mb-6">
                Start your fundraising journey today
              </p>
            </div>
            <Link to="/create-campaign">
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2">
                Create Your First Campaign
                <ChevronRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <Link to="/create-campaign">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
                <PlusCircle className="w-4 h-4" />
                New Campaign
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {campaigns.map((campaign, index) => (
            <div
              key={index}
              className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-indigo-900 transition-all duration-300"
            >
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
                          (Number(campaign.amountCollected) /
                            Number(campaign.target)) *
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
                      <p className="text-white font-semibold">
                        {campaign.target1} ETH
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Wallet2 className="w-4 h-4" />
                        <span className="text-sm">Raised</span>
                      </div>
                      <p className="text-white font-semibold">
                        {campaign.amountCollected1}
                        ETH
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
                            onClick={() => handleUpdate(campaign)}
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
                        onClick={() => handleDelete(campaign.id)}
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
                      <button
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setIsPostModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
                      >
                        <MessageSquarePlus className="w-4 h-4" />
                        Post Update
                      </button>
                      {campaign.canClaimed > 0 && campaign.claimed == false ? (
                        <button
                          onClick={() => handleWithdraw(campaign, campaign.id)}
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
                          onClick={() => handleClaimFunds(campaign.id)}
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
          ))}
        </div>
      </div>
      <UpdateCampaign
        campaign={selectedCampaign}
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedCampaign(null);
        }}
        onUpdateSuccess={() => {
          getMyCampaigns();
        }}
      />
      <WithdrawalRequestModal
        campaign={selectedCampaign}
        isOpen={isWithdrawModalOpen}
        onClose={() => {
          setIsWithdrawModalOpen(false);
          setSelectedCampaign(null);
        }}
        onWithDrawSuccess={() => {
          getMyCampaigns();
        }}
      />
      <CreatePostModal
        campaignId={selectedCampaign?.id}
        isOpen={isPostModalOpen}
        onClose={() => {
          setIsPostModalOpen(false);
          setSelectedCampaign(null);
        }}
        onPostSuccess={() => {
          getMyCampaigns();
        }}
      />
    </div>
  );
};

export default MyCampaign;
