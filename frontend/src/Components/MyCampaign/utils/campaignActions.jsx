import { getContract } from "../../../helper/contract";
import { providerErrors, rpcErrors } from "@metamask/rpc-errors";
import toast from "react-hot-toast";

export const handleDelete = async (
	campaignId,
	setLoadingStates,
	onUpdateSuccess
) => {
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

		try {
			const tx = await contract.deleteCampaign(campaignId);
			await tx.wait();
			toast.success(
				<p className="font-serif text-center">Campaign Deleted Successfully</p>
			);
			onUpdateSuccess();
		} catch (contractError) {
			// Specific user rejection handling
			if (
				contractError.code === 4001 ||
				contractError.message?.includes("user rejected") ||
				contractError.reason === "rejected"
			) {
				toast.error(
					<p className="font-serif text-center">Campaign deletion cancelled</p>
				);
				return; // Exit without further error handling
			}

			// Existing contract-level error handling
			if (
				contractError.code === 3 ||
				contractError.message.includes("Cannot delete campaign with donations")
			) {
				toast.error(
					<p className="font-serif text-center">
						Cannot delete campaign: Campaign has existing donations
					</p>
				);
			} else if (
				contractError.message.includes("Only owner can delete the campaign")
			) {
				toast.error(
					<p className="font-serif">
						Only the campaign owner can delete this campaign
					</p>
				);
			} else {
				// Fallback for any other contract-related errors
				toast.error(
					<p className="font-serif">
						{contractError.message || "Failed to delete campaign"}
					</p>
				);
			}
			// Re-throw the error for additional logging if needed
			throw contractError;
		}
	} catch (err) {
		// Specific user rejection handling at the top-level catch
		if (
			err.code === 4001 ||
			err.message?.includes("user rejected") ||
			err.reason === "rejected"
		) {
			toast.info(
				<p className="font-serif text-center">Campaign deletion cancelled</p>
			);
			return;
		}

		console.error("Error deleting campaign:", err);
		// Generic error handling for non-contract errors
		if (!err.message.includes("Cannot delete campaign")) {
			toast.error(
				<p className="font-serif">
					{err.message || "Failed to delete campaign"}
				</p>
			);
		}
	} finally {
		setLoadingStates((prev) => ({
			...prev,
			delete: { ...prev.delete, [campaignId]: false },
		}));
	}
};

export const handleClaimFunds = async (
	campaignId,
	setLoadingStates,
	onUpdateSuccess
) => {
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
