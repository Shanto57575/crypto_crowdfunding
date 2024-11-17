import { ethers } from "ethers";
import { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiFileText,
  FiUsers,
  FiGift,
  FiUser,
} from "react-icons/fi";
import { FaDollarSign } from "react-icons/fa";

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

        // Convert BigNumber values to strings and create status object
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
      <div className="flex items-center justify-center p-6">
        <FiClock className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-700 text-red-400 rounded-lg flex items-center">
        <FiAlertCircle className="w-5 h-5 mr-2" />
        {error}
      </div>
    );
  }

  if (!hasDonations) {
    return (
      <div className="p-6 text-center bg-gray-900 rounded-lg border border-gray-800">
        <FaDollarSign className="mx-auto h-12 w-12 text-gray-600" />
        <h3 className="mt-2 text-sm font-medium text-gray-200">
          No Donations Found
        </h3>
        <p className="mt-1 text-sm text-gray-400">
          You haven't made any donations to campaigns yet. Once you donate to a
          campaign, you'll be able to vote on withdrawal requests here.
        </p>
        <button
          onClick={() => (window.location.href = "/all-campaigns")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Available Campaigns
        </button>
      </div>
    );
  }

  const activeRequests = Object.entries(withdrawalRequests);

  if (activeRequests.length === 0) {
    return (
      <div className="p-6 text-center bg-gray-900 rounded-lg border border-gray-800">
        <FiFileText className="mx-auto h-12 w-12 text-gray-600" />
        <h3 className="mt-2 text-sm font-medium text-gray-200">
          No active withdrawal requests
        </h3>
        <p className="mt-1 text-sm text-gray-400">
          There are currently no early withdrawal requests for campaigns you've
          donated to.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activeRequests.map(([campaignId, request]) => {
        const campaign = campaignDetails[campaignId] || {};
        return (
          <div
            key={campaignId}
            className="bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors"
          >
            <div className="p-6">
              {/* Campaign Header with Image */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-48 h-48 rounded-lg overflow-hidden flex-shrink-0">
                  {" "}
                  {/* Increased size */}
                  <img
                    src={campaign.image || "/placeholder.jpg"}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {campaign.title}
                  </h2>
                  <div className="flex items-center space-x-2 mt-2">
                    <FiUser className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-400 text-sm">
                      Owner: {campaign.owner?.slice(0, 6)}...
                      {campaign.owner?.slice(-4)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-3 py-1 text-xs font-medium bg-blue-900/30 text-blue-400 rounded-full">
                      {campaign.category}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium bg-purple-900/30 text-purple-400 rounded-full">
                      Target: {campaign.target} ETH
                    </span>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="border-t border-b border-gray-800 py-4 my-4">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">
                  Withdrawal Request Details
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 font-medium">Title:</span>
                    <p className="text-gray-300">{request.title}</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-400 font-medium">Reason:</span>
                    <p className="text-gray-300">{request.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400 font-medium">
                      Request Amount:
                    </span>
                    <p className="flex items-center text-green-400">
                      <FiDollarSign className="w-4 h-4 mr-1" />
                      {request.requested} ETH
                    </p>
                  </div>
                </div>
              </div>

              {/* Voting Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-blue-400">
                      <FiUsers className="w-4 h-4 mr-2" />
                      <span>Total Donors:</span>
                    </div>
                    <span className="text-lg font-semibold text-white">
                      {request.totalDonors || 0}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-green-400">
                      <FiCheckCircle className="w-4 h-4 mr-2" />
                      <span>In Favor:</span>
                    </div>
                    <span className="text-lg font-semibold text-white">
                      {request.votesInFavor || 0}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-red-400">
                      <FiAlertCircle className="w-4 h-4 mr-2" />
                      <span>Against:</span>
                    </div>
                    <span className="text-lg font-semibold text-white">
                      {request.votesAgainst || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Voting Status */}
              <div className="mt-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <span className="text-yellow-400 font-medium mr-2">
                      All Voted:
                    </span>
                    <span
                      className={
                        request.allVoted ? "text-green-400" : "text-gray-400"
                      }
                    >
                      {request.allVoted ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Voting Actions */}
              {!request.hasVoted ? (
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => handleVote(campaignId, true)}
                    disabled={voting[campaignId]}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {voting[campaignId] ? (
                      <>
                        <FiClock className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleVote(campaignId, false)}
                    disabled={voting[campaignId]}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {voting[campaignId] ? (
                      <>
                        <FiClock className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FiAlertCircle className="w-4 h-4 mr-2" />
                        Reject
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="mt-6 flex items-center justify-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <FiCheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <p className="text-sm text-gray-300">
                    You have already voted on this request
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DonorWithdrawalVotes;
