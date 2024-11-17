import { useEffect, useState } from "react";
import { getContract } from "../helper/contract";

const CampaignWithdrawalStatus = ({ isOpen, onClose, campaign }) => {
  const [withdrawalRequest, setWithdrawalRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWithdrawalStatus = async () => {
    try {
      setLoading(true);
      const contract = await getContract();

      const [isActive, metadataHash, totalVotes, votesInFavor, hasVoted] =
        await contract.checkWithdrawalStatus(campaign.id);

      if (!isActive) {
        setWithdrawalRequest(null);
        return;
      }

      const response = await fetch(metadataHash);
      const metadata = await response.json();

      setWithdrawalRequest({
        isActive,
        totalVotes,
        votesInFavor,
        hasVoted,
        ...metadata,
      });
    } catch (err) {
      setError("Failed to fetch withdrawal request status");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawalStatus();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchWithdrawalStatus, 30000);
    return () => clearInterval(interval);
  }, [campaign]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }

  if (!withdrawalRequest) {
    return (
      <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No active withdrawal requests
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          There are currently no early withdrawal requests for this campaign.
        </p>
      </div>
    );
  }
  if (!isOpen) return null;
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {withdrawalRequest.title}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Requested Amount: {withdrawalRequest.requestedAmount} ETH
          </p>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-900">
            Request Description
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            {withdrawalRequest.description}
          </p>
        </div>

        <div className="mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span>Total Votes: {withdrawalRequest.totalVotes}</span>
              <span>Votes in Favor: {withdrawalRequest.votesInFavor}</span>
            </div>
          </div>
        </div>

        {withdrawalRequest.votesInFavor > withdrawalRequest.totalVotes / 2 && (
          <div className="mt-6 text-center text-green-600 font-medium">
            Withdrawal request has been approved
          </div>
        )}

        {withdrawalRequest.votesInFavor <= withdrawalRequest.totalVotes / 2 && (
          <div className="mt-6 text-center text-red-600 font-medium">
            Withdrawal request has been rejected
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignWithdrawalStatus;
