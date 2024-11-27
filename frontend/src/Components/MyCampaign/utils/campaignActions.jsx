import { getContract } from "../../../helper/contract";
import { providerErrors, rpcErrors } from "@metamask/rpc-errors";
import toast from "react-hot-toast";

export const handleDelete = async (campaignId, setLoadingStates, onUpdateSuccess) => {
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

        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        if (chainId !== "0xaa36a7") {
            throw providerErrors.custom({
                code: 4901,
                message: "Please switch to Sepolia network",
            });
        }

        const contract = await getContract();
        if (!contract) throw rpcErrors.invalidRequest("Failed to load contract");

        const tx = await contract.deleteCampaign(campaignId);
        await tx.wait();
        toast.success(
            <p className="font-serif">Campaign Deleted Successfully</p>
        );
        onUpdateSuccess();
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

export const handleClaimFunds = async (campaignId, setLoadingStates, onUpdateSuccess) => {
    try {
        setLoadingStates((prev) => ({
            ...prev,
            claim: { ...prev.claim, [campaignId]: true },
        }));

        if (!window.ethereum) {
            throw providerErrors.custom({
                code: 4200,
                message: "Please install MetaMask",
            });
        }

        const accounts = await window.ethereum.request({
            method: "eth_accounts",
        });

        if (!accounts || accounts.length === 0) {
            throw providerErrors.unauthorized("Please connect your wallet");
        }

        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        if (chainId !== "0xaa36a7") {
            throw providerErrors.custom({
                code: 4901,
                message: "Please switch to Sepolia network",
            });
        }

        const contract = await getContract();
        if (!contract) throw rpcErrors.invalidRequest("Failed to load contract");

        const tx = await contract.claimFunds(campaignId);
        await tx.wait();
        toast.success(<p className="font-serif">Claimed Funds Successfully</p>);
        onUpdateSuccess();
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

