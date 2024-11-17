import { ethers } from "ethers";
import { ChartBarIcon, WalletIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { getContract } from "../helper/contract";
import DonorWithdrawalVotes from "./DonorWithdrawalVotes";
const MyDonation = () => {
  const [donations, setDonations] = useState([]);
  const [donationTotals, setDonationTotals] = useState(null);
  const [campaignDetails, setCampaignDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMetadata = async (metadataHash) => {
    try {
      const response = await fetch(metadataHash);
      if (!response.ok) {
        throw new Error("Failed to fetch campaign metadata");
      }
      return await response.json();
    } catch (err) {
      console.error("Error fetching metadata:", err);
      return { error: "Failed to load metadata" };
    }
  };

  const fetchCampaignDetails = async (campaignId) => {
    try {
      const contract = await getContract();
      const details = await contract.getCampaignDetails(campaignId);

      // Fetch metadata from IPFS hash
      const metadata = await fetchMetadata(details.metadataHash);

      return {
        ...metadata, // Spread the metadata (title, description, image, etc.)
        target: ethers.formatEther(details.target),
        deadline: details.deadline.toString(),
        amountCollected: ethers.formatEther(details.amountCollected),
        owner: details.owner,
      };
    } catch (err) {
      console.error(`Error fetching details for campaign ${campaignId}:`, err);
      return null;
    }
  };

  const getMyDonations = async () => {
    try {
      setLoading(true);
      setError(null);
      const contract = await getContract();
      const [donationData, totalsData] = await Promise.all([
        contract.getMyDonations(),
        contract.getMyDonationTotals(),
      ]);

      const formattedDonations = donationData.map((donation) => ({
        campaignId: donation.campaignId,
        amount: ethers.formatEther(donation.amount),
        isRefunded: donation.isRefunded,
        category: donation.category,
        timestamp: donation.timestamp.toString(),
      }));

      // Fetch campaign details with metadata for all donations
      const detailsPromises = [
        ...new Set(formattedDonations.map((d) => d.campaignId)),
      ].map((campaignId) => fetchCampaignDetails(campaignId));
      const details = await Promise.all(detailsPromises);
      const campaignDetailsMap = Object.fromEntries(
        [...new Set(formattedDonations.map((d) => d.campaignId))].map(
          (id, index) => [id, details[index]]
        )
      );

      const formattedTotals = {
        totalAmount: ethers.formatEther(totalsData.totalDonationsAllCampaigns),
        campaignTotals: totalsData.campaignDonations.map((camp) => ({
          campaignId: camp.campaignId,
          category: camp.campaignCategory,
          total: ethers.formatEther(camp.totalDonated),
        })),
      };

      setDonations(formattedDonations);
      setDonationTotals(formattedTotals);
      setCampaignDetails(campaignDetailsMap);
    } catch (err) {
      console.error("Error fetching donations:", err);
      setError("Failed to fetch donations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMyDonations();
  }, []);

  const formatDate = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const renderCampaignTitle = (details) => {
    if (!details) return "Loading...";
    if (details.error) return "Failed to load campaign details";
    return details.title || "Untitled Campaign";
  };

  const renderCampaignImage = (details) => {
    if (!details || details.error) {
      return (
        <img
          src="/api/placeholder/400/200"
          alt="Campaign placeholder"
          className="w-full h-32 object-cover rounded-t-lg"
        />
      );
    }
    return (
      <img
        src={details.image || "/api/placeholder/400/200"}
        alt={details.title || "Campaign image"}
        className="w-full h-32 object-cover rounded-t-lg"
        onError={(e) => {
          e.target.src = "/api/placeholder/400/200";
        }}
      />
    );
  };

  return (
    <div className="p-4 pt-32 max-w-6xl mx-auto bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">My Donations</h1>
        {loading && <div className="text-blue-400">Loading...</div>}
      </div>

      {error && (
        <div className="bg-red-900/50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {donationTotals && (
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-900/50 rounded-lg">
                <WalletIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Total Donations
                </h2>
                <p className="text-gray-400">Across all campaigns</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {donationTotals.totalAmount}
              ETH
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-900/50 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Campaigns Supported
                </h2>
                <p className="text-gray-400">Total unique campaigns</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {donationTotals.campaignTotals.length}
            </p>
          </div>
        </div>
      )}

      {donationTotals && donationTotals.campaignTotals.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Campaign Totals
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {donationTotals.campaignTotals.map((campaign, index) => (
              <div
                key={`${campaign.campaignId}-${index}`}
                className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
              >
                {renderCampaignImage(campaignDetails[campaign.campaignId])}
                <div className="p-6 space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Campaign Title</p>
                    <p className="text-lg font-semibold text-white">
                      {renderCampaignTitle(
                        campaignDetails[campaign.campaignId]
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Campaign ID</p>
                    <p className="font-mono text-sm text-gray-300">
                      {campaign.campaignId.slice(0, 10)}...
                      {campaign.campaignId.slice(32, 42)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Category</p>
                    <p className="text-gray-300 capitalize">
                      {campaign.category}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Donated</p>
                    <p className="text-lg font-semibold text-white">
                      {campaign.total}
                      ETH
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold text-white mb-4">
        Donation History
      </h2>
      {donations.length === 0 && !loading ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <p className="text-gray-400">No donations found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {donations.map((donation, index) => (
            <div
              key={`${donation.campaignId}-${index}`}
              className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors duration-200 overflow-hidden"
            >
              {renderCampaignImage(campaignDetails[donation.campaignId])}
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      donation.isRefunded
                        ? "bg-yellow-900/50 text-yellow-300"
                        : "bg-green-900/50 text-green-300"
                    }`}
                  >
                    {donation.isRefunded ? "Refunded" : "Active"}
                  </span>
                  <span className="text-sm text-gray-400">
                    {formatDate(donation.timestamp)}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Campaign Title</p>
                    <p className="text-lg font-semibold text-white">
                      {renderCampaignTitle(
                        campaignDetails[donation.campaignId]
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Campaign ID</p>
                    <p className="font-mono text-sm text-gray-300">
                      {donation.campaignId.slice(0, 10)}...
                      {donation.campaignId.slice(32, 42)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Amount</p>
                    <p className="text-lg font-semibold text-white">
                      {donation.amount}
                      ETH
                    </p>
                  </div>

                  {campaignDetails[donation.campaignId] && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Target</p>
                        <p className="text-gray-300">
                          {campaignDetails[donation.campaignId].target}
                          ETH
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Collected</p>
                        <p className="text-gray-300">
                          {campaignDetails[donation.campaignId].amountCollected}
                          ETH
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Category</p>
                    <p className="text-gray-300 capitalize">
                      {donation.category}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="my-5">
        <DonorWithdrawalVotes />
      </div>
    </div>
  );
};

export default MyDonation;
