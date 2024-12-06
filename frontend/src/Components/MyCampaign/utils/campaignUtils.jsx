import { ethers } from "ethers";
import { providerErrors, rpcErrors } from "@metamask/rpc-errors";

export const fetchCampaigns = async (contract, userAddress) => {
    if (!window.ethereum) {
        throw providerErrors.custom({
            code: 4200,
            message: "Please install MetaMask",
        });
    }

    if (!userAddress) {
        throw providerErrors.unauthorized("Please connect your wallet first");
    }

    const accounts = await window.ethereum.request({
        method: "eth_accounts",
    });

    if (!accounts || accounts.length === 0) {
        throw providerErrors.unauthorized("Please connect your wallet");
    }

    const chainId = await window.ethereum.request({
        method: "eth_chainId",
    });
    if (chainId !== "0xaa36a7") {
        throw providerErrors.custom({
            code: 4901,
            message: "Please switch to Sepolia network",
        });
    }

    if (!contract) {
        throw rpcErrors.invalidRequest("Failed to load contract");
    }

    const allCampaigns = await contract.getCampaignsByOwner(userAddress);

    return Promise.all(
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
                    donorList: campaign.donorList
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
};

