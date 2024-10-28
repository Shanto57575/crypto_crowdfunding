import { ethers } from "ethers";
import { useState } from "react";
import { getContract } from "../helper/contract";
import { uploadToIPFS } from "../helper/ipfsService";
import Loader from "./Loader";

const CreateCampaign = () => {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [target, setTarget] = useState("");
	const [deadline, setDeadline] = useState("");
	const [image, setImage] = useState(null);
	const [imagePreview, setImagePreview] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

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

	const removeImage = () => {
		setImage(null);
		setImagePreview("");
		setError("");
	};

	const validateForm = () => {
		if (!title) return "Title is required";
		if (!description) return "Description is required";
		if (!target || parseFloat(target) <= 0)
			return "Valid target amount is required";
		if (!deadline) return "Deadline is required";
		if (!image) return "Campaign image is required";
		return null;
	};

	const createCampaign = async (event) => {
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
				throw new Error("Please install MetaMask to create a campaign");
			}

			await window.ethereum.request({ method: "eth_requestAccounts" });
			const contract = await getContract();

			if (!contract) {
				throw new Error("Failed to load contract");
			}

			// Upload image to IPFS
			const imageUpload = await uploadToIPFS(image);
			if (!imageUpload) {
				throw new Error("Failed to upload image");
			}

			// Create and upload metadata
			const metadata = {
				title,
				description,
				image: imageUpload.url,
			};

			// Convert metadata to file
			const metadataBlob = new Blob([JSON.stringify(metadata)], {
				type: "application/json",
			});
			const metadataFile = new File([metadataBlob], "metadata.json");

			// Upload metadata to IPFS
			const metadataUpload = await uploadToIPFS(metadataFile);
			if (!metadataUpload) {
				throw new Error("Failed to upload metadata");
			}

			console.log("metadata=>", metadataUpload);

			// Parse target amount to Wei
			const parsedTarget = ethers.parseEther(target.toString().trim());

			// Convert deadline to Unix timestamp
			const deadlineTimestamp = Math.floor(Date.parse(deadline) / 1000);

			// Create campaign
			const tx = await contract.createCampaign(
				metadataUpload.hash,
				parsedTarget,
				deadlineTimestamp
			);

			await tx.wait();
			alert("Campaign created successfully!");

			// Reset form
			setTitle("");
			setDescription("");
			setTarget("");
			setDeadline("");
			removeImage();
		} catch (error) {
			console.error("Error creating campaign:", error);
			setError(error.message || "Failed to create campaign");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-950 py-8 px-4 sm:px-6 lg:px-8 pt-32">
			<div className="max-w-2xl mx-auto">
				<div className="bg-gray-900 rounded-lg shadow-lg p-6 space-y-6">
					<div className="text-center">
						<h2 className="text-3xl font-bold text-white">
							Create New Campaign
						</h2>
						<p className="mt-2 text-gray-300 text-xl">
							Start your fundraising campaign
						</p>
					</div>

					<form onSubmit={createCampaign} className="space-y-4">
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
								className="mt-1 block w-full bg-gray-950 text-white rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								disabled={isLoading}
							/>
						</div>

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
								className="mt-1 block w-full rounded-md border-gray-300 bg-gray-950 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								disabled={isLoading}
							/>
						</div>

						<div>
							<label
								htmlFor="target"
								className="block text-sm font-medium text-gray-400"
							>
								Target Amount (ETH)
							</label>
							<input
								id="target"
								type="number"
								step="0.0001"
								min="0.0001"
								className="mt-1 block w-full rounded-md bg-gray-950 text-white border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
								value={target}
								onChange={(e) => setTarget(e.target.value)}
								disabled={isLoading}
							/>
						</div>

						<div>
							<label
								htmlFor="deadline"
								className="block text-sm font-medium text-gray-400"
							>
								Campaign Deadline
							</label>
							<input
								id="deadline"
								type="date"
								className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
								value={deadline}
								onChange={(e) => setDeadline(e.target.value)}
								disabled={isLoading}
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-400">
								Campaign Image
							</label>
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
											className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
										>
											<span className="p-3">Upload a file</span>
										</label>
									</div>
								)}
							</div>
						</div>

						{error && (
							<div
								className="bg-rose-100 text-center border border-rose-400 text-rose-700 px-4 py-3 rounded relative"
								role="alert"
							>
								<span className="block sm:inline">{error}</span>
							</div>
						)}

						<div className="pt-4">
							<button
								type="submit"
								disabled={isLoading}
								className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-950 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed"
							>
								{isLoading ? <Loader /> : "Create Campaign"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default CreateCampaign;
