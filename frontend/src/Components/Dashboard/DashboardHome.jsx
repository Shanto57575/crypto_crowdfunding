import { useEffect, useState } from "react";
import { useWallet } from "../../context/WalletContext";
import { getContract } from "../../helper/contract";
import { fetchCampaigns } from "../MyCampaign/utils/campaignUtils";

const DashboardHome = () => {
  const { userAddress } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState("");
  const [totalRaised, setTotalRaised] = useState(0);
  const [totalBackers, setTotalBackers] = useState(0);
  const [averageDonation, setAverageDonation] = useState(0);

  const recentDonations = [
    { id: 1, name: "Anonymous", amount: 150, campaign: "Tech Innovators Fund" },
    { id: 2, name: "Sarah L.", amount: 75, campaign: "Green Energy Project" },
    {
      id: 3,
      name: "Michael R.",
      amount: 200,
      campaign: "Community Art Initiative",
    },
    { id: 4, name: "Emma T.", amount: 50, campaign: "Tech Innovators Fund" },
  ];

  const getMyCampaigns = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching campaigns for address:", userAddress);
      const contract = await getContract();
      console.log("Contract obtained:", contract);
      const fetchedCampaigns = await fetchCampaigns(contract, userAddress);
      console.log("Fetched campaigns:", fetchedCampaigns);

      if (!Array.isArray(fetchedCampaigns)) {
        throw new Error("Fetched campaigns is not an array");
      }

      // Summation of total raised
      const totalRaised = fetchedCampaigns.reduce(
        (sum, campaign) => sum + parseFloat(campaign.amountCollected1 || 0),
        0
      );
      console.log("Total raised:", totalRaised);

      // Count total backers
      const totalBackers = fetchedCampaigns.reduce((sum, campaign) => {
        if (campaign.donorList && typeof campaign.donorList === "object") {
          if (Array.isArray(campaign.donorList.Target)) {
            return sum + campaign.donorList.Target.length;
          } else if (Array.isArray(campaign.donorList)) {
            return sum + campaign.donorList.length;
          }
        }
        console.warn(
          `Unexpected donorList structure for campaign ${campaign.id}:`,
          campaign.donorList
        );
        return sum;
      }, 0);
      console.log("Total backers:", totalBackers);

      // Calculate average donation
      const averageDonation = totalBackers > 0 ? totalRaised / totalBackers : 0;
      console.log("Average donation:", averageDonation);

      // Update state
      setCampaigns(fetchedCampaigns);
      setTotalRaised(totalRaised);
      setTotalBackers(totalBackers);
      setAverageDonation(averageDonation);
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="h-screen w-full mr-6 text-white p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Total Raised</h3>
          <p className="text-3xl font-bold">{totalRaised.toFixed(10)} ETH</p>
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
          <p className="text-3xl font-bold">
            {averageDonation.toFixed(10)} ETH
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Your Active Campaigns</h2>
          <div className="space-y-4">
            {campaigns.length > 0 ? (
              campaigns.map((campaign) => (
                <div key={campaign.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{campaign.name}</span>
                    <span className="text-sm text-gray-400">
                      {campaign.amountCollected1} / {campaign.target} ETH
                    </span>
                  </div>
                  <div className="bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full"
                      style={{
                        width: `${
                          (parseFloat(campaign.amountCollected1) /
                            parseFloat(campaign.target)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p>No active campaigns found.</p>
            )}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Recent Donations</h2>
          <div className="space-y-4">
            {recentDonations.map((donation) => (
              <div
                key={donation.id}
                className="flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{donation.name}</p>
                  <p className="text-sm text-gray-400">{donation.campaign}</p>
                </div>
                <span className="font-bold text-green-400">
                  ${donation.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
