import toast from "react-hot-toast";
import { formatEther, parseEther } from "ethers";
import { Calendar, Coins, Image as ImageIcon, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getContract } from "../helper/contract";
import { uploadToIPFS } from "../helper/ipfsService";

const UpdateCampaign = ({ campaign, isOpen, onClose, onUpdateSuccess }) => {
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		target: "",
		image: "",
		deadline: "",
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [imagePreview, setImagePreview] = useState("");
	const [image, setImage] = useState(null);
	const [imageMethod, setImageMethod] = useState("url");

	useEffect(() => {
		if (campaign) {
			setFormData({
				title: campaign.metadataHash.title || "",
				description: campaign.metadataHash.description || "",
				target: formatEther(campaign.target || "0"),
				image: campaign.metadataHash.image || "",
				deadline: new Date(Number(campaign.deadline) * 1000)
					.toISOString()
					.split("T")[0],
			});
			setImagePreview(campaign.metadataHash.image);
		}
	}, [campaign]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const contract = await getContract();
			if (!contract) throw new Error("Contract connection failed");

			let finalImageUrl = formData.image;
			if (imageMethod === "upload" && image) {
				const imageUpload = await uploadToIPFS(image);
				if (!imageUpload?.url) throw new Error("Image upload failed");
				finalImageUrl = imageUpload.url;
			}

			const metadata = {
				title: formData.title.trim(),
				description: formData.description.trim(),
				image: finalImageUrl,
			};

			const metadataBlob = new Blob([JSON.stringify(metadata)], {
				type: "application/json",
			});

			const metadataUpload = await uploadToIPFS(metadataBlob);
			if (!metadataUpload?.url) throw new Error("Metadata upload failed");

			const targetAmount = parseEther(formData.target);
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
			onUpdateSuccess();
			onClose();
		} catch (err) {
			const isUserRejected =
				err.code === 4001 ||
				err.reason === "rejected" ||
				err.message.includes("user rejected") ||
				err.message.includes("User denied transaction signature");

			if (isUserRejected) {
				toast.error(
					<h1 className="font-serif text-center">
						Transaction was cancelled by user
					</h1>
				);
			} else {
				const errorMessage = err.message || "Failed to update campaign";
				toast.error(<h1 className="font-serif text-center">{errorMessage}</h1>);
			}

			onClose();
		} finally {
			setLoading(false);
		}
	};

	const handleImageChange = (e) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				setError("Image must be less than 5MB");
				return;
			}
			setImage(file);
			const reader = new FileReader();
			reader.onloadend = () => setImagePreview(reader.result);
			reader.readAsDataURL(file);
		}
	};

	const handleImageUrlChange = (url) => {
		setFormData((prev) => ({ ...prev, image: url }));
		setImagePreview(url);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			<div className="bg-gray-900 rounded-xl w-full max-w-3xl overflow-y-auto max-h-[90vh] relative animate-in fade-in duration-300">
				<button
					onClick={onClose}
					className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors z-10"
				>
					<X className="w-6 h-6" />
				</button>
				<div className="flex flex-col lg:flex-row">
					{/* Image Section */}
					<div className="w-full lg:w-2/5 p-6 border-b lg:border-b-0 lg:border-r border-gray-700">
						<h3 className="text-xl font-semibold text-white mb-6">
							Campaign Image
						</h3>

						<div className="aspect-square rounded-xl overflow-hidden bg-gray-800 mb-4 shadow-lg ring-1 ring-gray-700">
							{imagePreview ? (
								<img
									src={imagePreview}
									alt="Preview"
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center">
									<ImageIcon className="w-16 h-16 text-gray-600" />
								</div>
							)}
						</div>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Image Source
								</label>
								<select
									value={imageMethod}
									onChange={(e) => setImageMethod(e.target.value)}
									className="w-full rounded-lg bg-gray-800 text-white border border-gray-700 p-2.5 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
								>
									<option value="url">Image URL</option>
									<option value="upload">Upload Image</option>
								</select>
							</div>
							{imageMethod === "url" ? (
								<input
									type="url"
									value={formData.image}
									onChange={(e) => handleImageUrlChange(e.target.value)}
									placeholder="Enter image URL"
									className="w-full rounded-lg bg-gray-800 text-white border border-gray-700 p-2.5 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
								/>
							) : (
								<div>
									<input
										type="file"
										accept="image/*"
										onChange={handleImageChange}
										className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 transition-all cursor-pointer"
									/>
									<span className="text-xs text-gray-500 mt-1 block">
										Max size: 5MB
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Form Section */}
					<div className="w-full lg:w-3/5 p-6">
						<h2 className="text-xl font-bold text-white mb-6">
							Update Campaign
						</h2>

						{error && (
							<div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
								{error}
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Campaign Title
								</label>
								<input
									type="text"
									value={formData.title}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, title: e.target.value }))
									}
									className="w-full rounded-lg bg-gray-800 text-white border border-gray-700 p-2.5 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
									placeholder="Enter campaign title"
									required
								/>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">
										Target Amount (ETH)
									</label>
									<div className="relative">
										<Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
										<input
											type="number"
											value={formData.target}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													target: e.target.value,
												}))
											}
											className="w-full rounded-lg bg-gray-800 text-white border border-gray-700 p-2.5 pl-10 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
											placeholder="0.00"
											required
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">
										Deadline
									</label>
									<div className="relative">
										<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
										<input
											type="date"
											value={formData.deadline}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													deadline: e.target.value,
												}))
											}
											min={new Date().toISOString().split("T")[0]}
											className="w-full rounded-lg bg-gray-800 text-white border border-gray-700 p-2.5 pl-10 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
											required
										/>
									</div>
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Description
								</label>
								<textarea
									value={formData.description}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											description: e.target.value,
										}))
									}
									rows={3}
									className="w-full rounded-lg bg-gray-800 text-white border border-gray-700 p-2.5 focus:ring-2 focus:ring-indigo-500 transition-all resize-none outline-none"
									placeholder="Describe your campaign..."
									required
								/>
							</div>
							<button
								type="submit"
								disabled={loading}
								className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
							>
								{loading ? (
									<>
										<Loader2 className="w-5 h-5 animate-spin" />
										<span>Updating Campaign...</span>
									</>
								) : (
									"Update Campaign"
								)}
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UpdateCampaign;
