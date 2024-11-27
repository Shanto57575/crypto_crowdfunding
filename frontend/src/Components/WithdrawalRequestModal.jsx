import { ethers, parseEther } from "ethers";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getContract } from "../helper/contract";
import { uploadToIPFS } from "../helper/ipfsService";

const WithdrawalRequestModal = ({
	isOpen,
	onClose,
	campaign,
	onWithDrawSuccess,
}) => {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [amount, setAmount] = useState("");
	const [max, setMax] = useState("0");
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const resetForm = () => {
		setTitle("");
		setDescription("");
		setAmount("");
		setMax("0");
		setErrors({});
		setError("");
	};

	useEffect(() => {
		if (campaign) {
			const maxAmount = ethers.formatEther(campaign.canClaimed);
			setMax(maxAmount);
		}
	}, [campaign]);

	const handleAmountChange = (e) => {
		const value = e.target.value;

		// Check if it's a valid number
		if (!value) {
			toast.error(
				<h1 className="text-center font-serif">
					Please enter a donation amount
				</h1>
			);
			return;
		}

		// Check decimal places
		const decimalPlaces = value.toString().split(".")[1]?.length || 0;
		if (decimalPlaces > 18) {
			toast.warning("Maximum 18 decimal places allowed");
			return;
		}

		try {
			if (!value || parseEther(value) <= parseEther(max)) {
				setAmount(value);
				setErrors((prev) => ({ ...prev, amount: "" }));
			} else {
				setErrors((prev) => ({
					...prev,
					amount: "Amount cannot exceed the maximum allowed.",
				}));
			}
		} catch (err) {
			console.log(err);
			setErrors((prev) => ({
				...prev,
				amount: "Invalid amount format",
			}));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const newErrors = {};

		// Validation
		if (!title.trim()) {
			newErrors.title = "Title is required.";
		}
		if (!description.trim()) {
			newErrors.description = "Description is required.";
		}
		if (!amount || parseEther(amount) > parseEther(max)) {
			newErrors.amount = "Enter a valid amount within the max limit.";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		setLoading(true);
		setError("");

		try {
			const contract = await getContract();
			if (!contract) throw new Error("Contract connection failed");

			const metadata = {
				title: title.trim(),
				description: description.trim(),
			};

			const metadataBlob = new Blob([JSON.stringify(metadata)], {
				type: "application/json",
			});

			const metadataUpload = await uploadToIPFS(metadataBlob);
			if (!metadataUpload?.url) throw new Error("Metadata upload failed");

			const tx = await contract.earlyWithdrawalRequest(
				campaign.id,
				metadataUpload.url,

				false,
				parseEther(amount),
				false
			);

			await tx.wait();
			toast.success("Withdrawal request submitted successfully");
			onClose();
			onWithDrawSuccess();
			resetForm();
		} catch (err) {
			console.error("Withdrawal request failed:", err);
			const errorMessage = err.message || "Failed to submit withdrawal request";
			setError(errorMessage);
			toast.error(<h1 className="font-serif">{errorMessage}</h1>);
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div
				className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
				onClick={onClose}
			/>

			<div className="relative w-full max-w-lg mx-4 bg-gray-900 text-white rounded-xl shadow-lg p-6">
				<div className="flex items-center justify-between border-b border-gray-700 pb-4">
					<h2 className="text-2xl font-semibold">Request Early Withdrawal</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-300 transition-colors"
					>
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4 mt-6">
					{/* Title Field */}
					<div className="flex flex-col">
						<label
							htmlFor="title"
							className="block text-sm font-medium text-gray-300"
						>
							Request Title
						</label>
						<input
							id="title"
							name="title"
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Enter your request title"
							className="w-full px-4 py-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
							required
						/>
						{errors.title && (
							<p className="text-red-500 text-xs mt-1">{errors.title}</p>
						)}
					</div>

					{/* Max Amount Row */}
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<label className="block text-sm font-medium text-gray-300">
								Max Amount Available (ETH)
							</label>
							<div className="w-full px-4 py-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg text-gray-400">
								{max} ETH
							</div>
						</div>

						{/* Request Amount Field */}
						<div className="flex-1 ml-4">
							<label
								htmlFor="amount"
								className="block text-sm font-medium text-gray-300"
							>
								Request Amount (ETH)
							</label>
							<input
								id="amount"
								name="amount"
								type="number"
								value={amount}
								onChange={handleAmountChange}
								placeholder="0.00"
								className="w-full px-4 py-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
								required
							/>
							{errors.amount && (
								<p className="text-red-500 text-xs mt-1">{errors.amount}</p>
							)}
						</div>
					</div>

					{/* Description Field */}
					<div>
						<label
							htmlFor="description"
							className="block text-sm font-medium text-gray-300"
						>
							Description
						</label>
						<textarea
							id="description"
							name="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Explain why you need an early withdrawal..."
							rows="3"
							className="w-full px-4 py-2 mt-1 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
							required
						/>
						{errors.description && (
							<p className="text-red-500 text-xs mt-1">{errors.description}</p>
						)}
					</div>

					{/* Information Block */}
					<div className="p-3 bg-yellow-800 rounded-lg">
						<p className="text-sm text-yellow-200">
							This request will need approval from all donors before funds can
							be withdrawn.
						</p>
					</div>

					{/* Error Block */}
					{error && (
						<div className="p-3 bg-red-800 rounded-lg">
							<p className="text-sm text-red-200">{error}</p>
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex justify-end space-x-4">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300"
							disabled={loading}
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading || !title || !description || !amount}
							className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? "Submitting..." : "Submit Request"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default WithdrawalRequestModal;
