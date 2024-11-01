import { useState, useEffect } from "react";
import { getContract } from "../helper/contract";
import { uploadToIPFS } from "../helper/ipfsService";
import Loader from "./Loader";
import toast from "react-hot-toast";

const UpdateCampaign = ({ campaignId, onUpdate }) => {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [category, setCategory] = useState("MEDICAL_TREATMENT");
	const [imageMethod, setImageMethod] = useState("upload");
	const [imageUrl, setImageUrl] = useState("");
	const [image, setImage] = useState(null);
	const [imagePreview, setImagePreview] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [originalData, setOriginalData] = useState(null);

	const categories = [
		{ id: "DISASTER_RELIEF", label: "Disaster Relief" },
		{ id: "MEDICAL_TREATMENT", label: "Medical Treatment" },
		{ id: "EDUCATION", label: "Education" },
		{ id: "STARTUP_BUSINESS", label: "Startup Business" },
		{ id: "CREATIVE_PROJECTS", label: "Creative Projects" },
		{ id: "COMMUNITY_SERVICE", label: "Community Service" },
		{ id: "TECHNOLOGY", label: "Technology" },
		{ id: "ENVIRONMENTAL", label: "Environmental" },
	];

	useEffect(() => {
		if (campaignId) {
			loadCampaignData();
		}
	}, [campaignId]);

	const loadCampaignData = async () => {
		try {
			setIsLoading(true);
			const contract = await getContract();
			const campaign = await contract.getCampaign(campaignId);

			// Fetch metadata from IPFS
			const response = await fetch(campaign.metadataHash);
			const metadata = await response.json();

			setOriginalData(metadata);
			setTitle(metadata.title);
			setDescription(metadata.description);
			setCategory(categories[campaign.category].id);

			if (metadata.image) {
				setImageUrl(metadata.image);
				setImagePreview(metadata.image);
				setImageMethod("url");
			}

			setError("");
		} catch (error) {
			console.error("Error loading campaign:", error);
			setError("Failed to load campaign data");
		} finally {
			setIsLoading(false);
		}
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			if (file.size > 10 * 1024 * 1024) {
				setError("File size should be less than 10MB");
				return;
			}
			setImage(file);
			setImagePreview(URL.createObjectURL(file));
			setError("");
		}
	};

	const handleUrlChange = (e) => {
		const url = e.target.value;
		setImageUrl(url);
		setImagePreview(url);
	};

	const removeImage = () => {
		setImage(null);
		setImageUrl("");
		setImagePreview("");
		setError("");
	};

	const validateForm = () => {
		if (!title) return "Title is required";
		if (!description) return "Description is required";
		if (imageMethod === "upload" && !image && !imagePreview)
			return "Campaign image is required";
		if (imageMethod === "url" && !imageUrl) return "Image URL is required";
		return null;
	};

	const updateCampaign = async (event) => {
		event.preventDefault();
		try {
			const validationError = validateForm();
			if (validationError) {
				setError(validationError);
				return;
			}

			setIsLoading(true);
			setError("");

			if (!window.ethereum) {
				throw new Error("Please install MetaMask to update the campaign");
			}

			const accounts = await window.ethereum.request({
				method: "eth_requestAccounts",
			});

			if (!accounts || accounts.length === 0) {
				throw new Error("No connected account found");
			}

			const contract = await getContract();
			if (!contract) {
				throw new Error("Failed to load contract");
			}

			// Handle image upload/URL
			let finalImageUrl = imagePreview;
			if (imageMethod === "upload" && image) {
				const imageUpload = await uploadToIPFS(image);
				if (!imageUpload || !imageUpload.url) {
					throw new Error("Failed to upload image");
				}
				finalImageUrl = imageUpload.url;
			}

			// Create and upload updated metadata
			const metadata = {
				...originalData,
				title,
				description,
				image: finalImageUrl,
				updatedAt: new Date().toISOString(),
			};

			const metadataBlob = new Blob([JSON.stringify(metadata)], {
				type: "application/json",
			});

			const metadataUpload = await uploadToIPFS(metadataBlob);
			if (!metadataUpload || !metadataUpload.url) {
				throw new Error("Failed to upload metadata");
			}

			// Get category index
			const categoryIndex = categories.findIndex((cat) => cat.id === category);
			if (categoryIndex === -1) {
				throw new Error("Invalid category selected");
			}

			// Update campaign transaction
			const tx = await contract.updateCampaign(
				campaignId,
				metadataUpload.url,
				categoryIndex
			);

			const receipt = await tx.wait();

			if (receipt.status === 0) {
				throw new Error("Transaction failed");
			}

			toast.success(
				<p className="font-serif">Campaign updated successfully!</p>
			);

			if (onUpdate) {
				onUpdate();
			}
		} catch (error) {
			console.error("Error updating campaign:", error);
			setError(error.message || "Failed to update campaign");
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoading && !originalData) {
		return (
			<div className="min-h-screen bg-gray-950 flex items-center justify-center">
				<Loader sz={40} />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-950 py-8 px-4 sm:px-6 lg:px-8 pt-32">
			<div className="max-w-2xl mx-auto">
				<div className="bg-gray-900 rounded-lg shadow-lg p-6 space-y-6">
					<div className="text-center">
						<h2 className="text-3xl font-bold text-white">Update Campaign</h2>
						<p className="mt-2 text-gray-300 text-xl">
							Modify your campaign details
						</p>
					</div>

					<form onSubmit={updateCampaign} className="space-y-4">
						{/* Title field */}
						<div>
							<label
								htmlFor="title"
								className="block text-sm font-medium text-gray-400"
							>
								Campaign Title
							</label>
							<input
								id="title"
								type="text"
								placeholder="Your Campaign Title"
								className="mt-1 block w-full bg-gray-950 text-white rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								disabled={isLoading}
								maxLength={100}
							/>
						</div>

						{/* Category Selection */}
						<div>
							<label
								htmlFor="category"
								className="block text-sm font-medium text-gray-400"
							>
								Campaign Category
							</label>
							<select
								id="category"
								className="mt-1 block w-full bg-gray-950 text-white rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
								value={category}
								onChange={(e) => setCategory(e.target.value)}
								disabled={isLoading}
							>
								{categories.map((cat) => (
									<option key={cat.id} value={cat.id}>
										{cat.label}
									</option>
								))}
							</select>
						</div>

						{/* Description field */}
						<div>
							<label
								htmlFor="description"
								className="block text-sm font-medium text-gray-400"
							>
								Description
							</label>
							<textarea
								id="description"
								rows={4}
								placeholder="Your Campaign Description"
								className="mt-1 block w-full rounded-md border-gray-300 bg-gray-950 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								disabled={isLoading}
								maxLength={1000}
							/>
						</div>

						{/* Image Upload Method Selection */}
						<div>
							<label className="block text-sm font-medium text-gray-400 mb-2">
								Image Upload Method
							</label>
							<div className="flex space-x-4">
								<label className="inline-flex items-center">
									<input
										type="radio"
										className="form-radio"
										name="imageMethod"
										value="upload"
										checked={imageMethod === "upload"}
										onChange={(e) => setImageMethod(e.target.value)}
										disabled={isLoading}
									/>
									<span className="ml-2 text-gray-400 cursor-pointer">
										Upload Image
									</span>
								</label>
								<label className="inline-flex items-center">
									<input
										type="radio"
										className="form-radio"
										name="imageMethod"
										value="url"
										checked={imageMethod === "url"}
										onChange={(e) => setImageMethod(e.target.value)}
										disabled={isLoading}
									/>
									<span className="ml-2 text-gray-400 cursor-pointer">
										Image URL
									</span>
								</label>
							</div>
						</div>

						{/* Image Upload/URL Input */}
						<div>
							<label className="block text-sm font-medium text-gray-400">
								Campaign Image
							</label>
							{imageMethod === "upload" ? (
								<div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative">
									{imagePreview ? (
										<div className="relative w-full">
											<img
												src={imagePreview}
												alt="Campaign preview"
												className="w-full h-64 object-cover rounded-md"
											/>
											<button
												type="button"
												onClick={removeImage}
												className="absolute top-2 right-2 text-xl p-3 font-sans bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
												disabled={isLoading}
											>
												×
											</button>
										</div>
									) : (
										<div className="space-y-1 text-center">
											<input
												type="file"
												accept="image/*"
												onChange={handleImageChange}
												className="hidden"
												id="file-upload"
												disabled={isLoading}
											/>
											<label
												htmlFor="file-upload"
												className="relative px-4 py-2 cursor-pointer hover:border hover:bg-transparent font-medium rounded text-white bg-gray-950 duration-300 focus-within:outline-none"
											>
												Upload a file
											</label>
										</div>
									)}
								</div>
							) : (
								<div>
									<input
										type="url"
										className="mt-1 block w-full bg-gray-950 text-white rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
										placeholder="Enter image URL"
										value={imageUrl}
										onChange={handleUrlChange}
										disabled={isLoading}
									/>
									{imagePreview && (
										<div className="mt-2 relative">
											<img
												src={imagePreview}
												alt="Campaign preview"
												className="w-full h-64 object-cover rounded-md"
											/>
											<button
												type="button"
												onClick={removeImage}
												className="absolute top-2 right-2 text-xl p-3 font-sans bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
												disabled={isLoading}
											>
												×
											</button>
										</div>
									)}
								</div>
							)}
						</div>

						{/* Error Display */}
						{error && (
							<div
								className="bg-rose-100 text-center border border-rose-400 text-rose-700 px-4 py-3 rounded relative"
								role="alert"
							>
								<span className="block sm:inline">{error}</span>
							</div>
						)}

						{/* Submit Button */}
						<div className="pt-4">
							<button
								type="submit"
								disabled={isLoading}
								className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-950 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed"
							>
								{isLoading ? <Loader sz={25} /> : "Update Campaign"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default UpdateCampaign;
