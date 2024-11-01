import { useState, useEffect } from "react";
import { X, Loader2, Image as ImageIcon } from "lucide-react";
import { ethers } from "ethers";
import { getContract } from "../helper/contract";
import { uploadToIPFS } from "../helper/ipfsService";
import toast from "react-hot-toast";

const UpdateCampaign = ({ campaign, isOpen, onClose, onUpdateSuccess }) => {
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		target: "",
		image: "",
		deadline: "",
	});

	const [loading, setLoading] = useState(false);
	const [imagePreview, setImagePreview] = useState("");
	const [image, setImage] = useState(null);
	const [imageMethod, setImageMethod] = useState("url");

	useEffect(() => {
		if (campaign) {
			setFormData({
				title: campaign.title || "",
				description: campaign.description || "",
				target: campaign.target || "",
				image: campaign.image || "",
				deadline: new Date(campaign.deadline).toISOString().split("T")[0] || "",
			});
			setImagePreview(campaign.image);
		}
	}, [campaign]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const contract = await getContract();
			if (!contract) throw new Error("Failed to load contract");

			// Handle image upload/URL
			let finalImageUrl = formData.image;
			if (imageMethod === "upload" && image) {
				const imageUpload = await uploadToIPFS(image);
				if (!imageUpload?.url) throw new Error("Failed to upload image");
				finalImageUrl = imageUpload.url;
			}

			// Create and upload metadata
			const metadata = {
				title: formData.title,
				description: formData.description,
				image: finalImageUrl,
			};

			const metadataBlob = new Blob([JSON.stringify(metadata)], {
				type: "application/json",
			});
			const metadataUpload = await uploadToIPFS(metadataBlob);
			if (!metadataUpload?.url) throw new Error("Failed to upload metadata");

			const targetAmount = ethers.parseUnits(
				formData.target.toString(),
				"ether"
			);
			const deadlineTimestamp = Math.floor(
				new Date(formData.deadline).getTime() / 1000
			);

			const tx = await contract.updateCampaign(
				campaign.id,
				metadataUpload.url,
				targetAmount,
				deadlineTimestamp
			);

			await tx.wait();
			toast.success("Campaign updated successfully!");
			onUpdateSuccess();
			onClose();
		} catch (err) {
			console.error("Error updating campaign:", err);
			toast.error(err.message || "Failed to update campaign");
		} finally {
			setLoading(false);
		}
	};

	const handleImageChange = (e) => {
		if (e.target.files?.[0]) {
			setImage(e.target.files[0]);
			const reader = new FileReader();
			reader.onloadend = () => setImagePreview(reader.result);
			reader.readAsDataURL(e.target.files[0]);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			<div className="bg-gray-900 rounded-2xl w-full max-w-4xl relative flex">
				{/* Image Preview Section */}
				<div className="w-1/3 p-6 bg-gray-800 rounded-l-2xl flex flex-col items-center justify-center relative">
					<button
						onClick={onClose}
						className="absolute right-4 top-4 text-gray-400 hover:text-white"
					>
						<X className="w-6 h-6" />
					</button>

					{imagePreview ? (
						<div className="w-64 h-64 rounded-xl overflow-hidden mb-4 shadow-lg">
							<img
								src={imagePreview}
								alt="Campaign Preview"
								className="w-full h-full object-cover"
							/>
						</div>
					) : (
						<div className="w-64 h-64 bg-gray-700 rounded-xl flex items-center justify-center">
							<ImageIcon className="w-16 h-16 text-gray-500" />
						</div>
					)}

					<div className="mt-4 w-full">
						<label className="block text-sm font-medium text-gray-400 mb-2">
							Image Method
						</label>
						<select
							value={imageMethod}
							onChange={(e) => setImageMethod(e.target.value)}
							className="w-full rounded-xl bg-gray-700 text-white border-gray-600 p-2 focus:ring-2 focus:ring-indigo-500"
						>
							<option value="url">URL</option>
							<option value="upload">Upload</option>
						</select>

						{imageMethod === "url" ? (
							<input
								type="url"
								className="mt-2 w-full rounded-xl bg-gray-700 text-white border-gray-600 p-2 focus:ring-2 focus:ring-indigo-500"
								value={formData.image}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, image: e.target.value }))
								}
								placeholder="Enter image URL"
								required
							/>
						) : (
							<input
								type="file"
								accept="image/*"
								onChange={handleImageChange}
								className="mt-2 w-full text-gray-400 file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white file:px-4 file:py-2"
							/>
						)}
					</div>
				</div>

				{/* Form Section */}
				<form onSubmit={handleSubmit} className="w-2/3 p-6 space-y-4">
					<h2 className="text-2xl font-bold text-white mb-6">
						Update Campaign
					</h2>

					<div className="grid grid-cols-2 gap-4">
						{/* Title Input */}
						<div>
							<label className="block text-sm font-medium text-gray-400">
								Campaign Title
							</label>
							<input
								type="text"
								className="mt-1 w-full rounded-xl bg-gray-800 text-white border-gray-700 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
								value={formData.title}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, title: e.target.value }))
								}
								required
							/>
						</div>

						{/* Target Input */}
						<div>
							<label className="block text-sm font-medium text-gray-400">
								Funding Target (ETH)
							</label>
							<input
								type="number"
								className="mt-1 w-full rounded-xl bg-gray-800 text-white border-gray-700 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
								value={formData.target}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, target: e.target.value }))
								}
								required
							/>
						</div>

						{/* Deadline Input */}
						<div>
							<label className="block text-sm font-medium text-gray-400">
								Campaign Deadline
							</label>
							<input
								type="date"
								className="mt-1 w-full rounded-xl bg-gray-800 text-white border-gray-700 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
								value={formData.deadline}
								onChange={(e) =>
									setFormData((prev) => ({ ...prev, deadline: e.target.value }))
								}
								min={new Date().toISOString().split("T")[0]}
								required
							/>
						</div>

						{/* Description Input */}
						<div className="col-span-2">
							<label className="block text-sm font-medium text-gray-400">
								Description
							</label>
							<textarea
								className="mt-1 w-full rounded-xl bg-gray-800 text-white border-gray-700 p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
								value={formData.description}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										description: e.target.value,
									}))
								}
								required
								rows={4}
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading}
						className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
					>
						{loading ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" />
								<span>Updating...</span>
							</>
						) : (
							"Update Campaign"
						)}
					</button>
				</form>
			</div>
		</div>
	);
};

export default UpdateCampaign;
