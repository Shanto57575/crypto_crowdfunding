import { providerErrors, rpcErrors } from "@metamask/rpc-errors";
import { ethers } from "ethers";
import { LoaderPinwheel } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { getContract } from "../helper/contract";
import { uploadToIPFS } from "../helper/ipfsService";

const CreateCampaign = () => {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [target, setTarget] = useState("");
	const [deadline, setDeadline] = useState("");
	const [category, setCategory] = useState("MEDICAL_TREATMENT");
	const [imageMethod, setImageMethod] = useState("upload");
	const [imageUrl, setImageUrl] = useState("");
	const [image, setImage] = useState(null);
	const [imagePreview, setImagePreview] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

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

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				setError("File size should be less than or equal 5MB");
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
		if (!target || parseFloat(target) <= 0)
			return "Valid target amount is required";
		if (!deadline) return "Deadline is required";
		if (imageMethod === "upload" && !image) return "Campaign image is required";
		if (imageMethod === "url" && !imageUrl) return "Image URL is required";

		const deadlineDate = new Date(deadline);
		if (deadlineDate <= new Date()) return "Deadline must be in the future";

		return null;
	};

	const resetForm = () => {
		setTitle("");
		setDescription("");
		setTarget("");
		setDeadline("");
		setCategory("DISASTER_RELIEF");
		removeImage();
		setImageMethod("upload");
		setError("");
	};

	const createCampaign = async (event) => {
		event.preventDefault();
		try {
			const timestamp = Date.now().toString(16);
			const random = Math.random().toString(16).slice(2);
			const campaignId =
				"0x" + (timestamp + random).padEnd(64, "abcdef123456789");

			const validationError = validateForm();
			if (validationError) {
				throw providerErrors.userRejectedRequest(validationError);
			}

			setIsLoading(true);
			setError("");

			// Check for MetaMask installation
			if (!window.ethereum) {
				throw providerErrors.custom({
					code: 4200,
					message: "Please install MetaMask to create a campaign",
				});
			}

			let accounts;
			try {
				accounts = await window.ethereum.request({
					method: "eth_requestAccounts",
				});
			} catch (err) {
				if (err.code === 4001) {
					throw providerErrors.userRejectedRequest();
				} else if (err.code === -32002) {
					throw providerErrors.custom({
						code: -32002,
						message:
							"MetaMask connection request already pending. Please check your MetaMask",
					});
				} else if (err.code === -32603) {
					throw rpcErrors.internal();
				}
				throw err;
			}

			if (!accounts || accounts.length === 0) {
				throw providerErrors.unauthorized();
			}

			const chainId = await window.ethereum.request({ method: "eth_chainId" });
			if (chainId !== "0xaa36a7") {
				// Sepolia chainId
				try {
					await window.ethereum.request({
						method: "wallet_switchEthereumChain",
						params: [{ chainId: "0xaa36a7" }],
					});
				} catch (switchError) {
					if (switchError.code === 4902) {
						throw providerErrors.custom({
							code: 4902,
							message: "Please add Sepolia network to your MetaMask",
						});
					}
					throw providerErrors.custom({
						code: 4901,
						message: "Please switch to Sepolia network in MetaMask",
					});
				}
			}

			const contract = await getContract();
			if (!contract) {
				throw rpcErrors.invalidRequest("Failed to load contract");
			}

			let finalImageUrls;
			if (imageMethod === "upload" && image) {
				const imageUpload = await uploadToIPFS(image);
				if (!imageUpload || !imageUpload.url) {
					throw providerErrors.custom({
						code: 4200,
						message: "Failed to upload image to IPFS",
					});
				}
				finalImageUrls = imageUpload.url;
			} else if (imageMethod === "url" && imageUrl) {
				finalImageUrls = imageUrl;
			}

			const metadata = {
				title,
				description,
				image: finalImageUrls,
				owner: accounts[0],
				createdAt: new Date().toISOString(),
			};

			const metadataBlob = new Blob([JSON.stringify(metadata)], {
				type: "application/json",
			});

			const metadataUpload = await uploadToIPFS(metadataBlob);
			if (!metadataUpload || !metadataUpload.url) {
				throw providerErrors.custom({
					code: 4200,
					message: "Failed to upload metadata to IPFS",
				});
			}

			let parsedTarget;
			try {
				parsedTarget = ethers.parseEther(target.toString().trim());
			} catch (err) {
				console.log(err);
				throw providerErrors.invalidInput(
					"Invalid target amount. Please enter a valid number"
				);
			}

			const deadlineTimestamp = Math.floor(Date.parse(deadline) / 1000);
			const categoryIndex = categories.findIndex((cat) => cat.id === category);

			if (categoryIndex === -1) {
				throw providerErrors.invalidInput("Invalid category selected");
			}

			try {
				const tx = await contract.createCampaign(
					campaignId,
					metadataUpload.url,
					parsedTarget,
					deadlineTimestamp,
					categoryIndex
				);

				const receipt = await tx.wait();

				if (receipt.status === 0) {
					throw rpcErrors.internal("Transaction failed");
				}
				toast.success(
					<h1 className="text-center font-serif">
						Campaign created successfully!
					</h1>
				);
				resetForm();
			} catch (txError) {
				// Handle transaction-specific errors
				if (txError.code === "ACTION_REJECTED") {
					throw providerErrors.userRejectedRequest(
						"Transaction rejected by user"
					);
				} else if (txError.code === "INSUFFICIENT_FUNDS") {
					throw providerErrors.custom({
						code: 4100,
						message: "Insufficient funds for transaction",
					});
				} else if (txError.code === "UNPREDICTABLE_GAS_LIMIT") {
					throw rpcErrors.invalidRequest(
						"Unable to estimate gas. The transaction may fail"
					);
				}
				throw txError;
			}
		} catch (error) {
			console.error("Error creating campaign:", error);

			// Handle the error based on its type
			let errorMessage;
			if (error.code && error.message) {
				errorMessage = error.message;
			} else {
				errorMessage = "Failed to create campaign";
			}

			setError(errorMessage);
			toast.error(<h1 className="font-serif">{errorMessage}</h1>);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#111827] py-12 px-4 sm:px-6 lg:px-8 pt-32">
			<div className="max-w-3xl mx-auto">
				<div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
					<div className="text-center mb-8">
						<h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
							Create New Campaign
						</h2>
						<p className="mt-3 text-gray-400 text-lg">
							Launch your fundraising journey
						</p>
					</div>

					<form onSubmit={createCampaign} className="space-y-6">
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							{/* Title field */}
							<div className="col-span-2">
								<label className="block text-sm font-medium text-gray-300">
									Campaign Title
								</label>
								<input
									type="text"
									placeholder="Enter your campaign title"
									className="mt-1 w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									disabled={isLoading}
									maxLength={100}
								/>
							</div>

							{/* Category Selection */}
							<div>
								<label className="block text-sm font-medium text-gray-300">
									Category
								</label>
								<select
									className="mt-1 w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
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

							{/* Target Amount field */}
							<div>
								<label className="block text-sm font-medium text-gray-300">
									Target Amount (ETH)
								</label>
								<input
									type="number"
									placeholder="0.0"
									className="mt-1 w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
									value={target}
									onChange={(e) => setTarget(e.target.value)}
									disabled={isLoading}
								/>
							</div>

							{/* Description field */}
							<div className="col-span-2">
								<label className="block text-sm font-medium text-gray-300">
									Description
								</label>
								<textarea
									rows={4}
									placeholder="Describe your campaign..."
									className="mt-1 w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									disabled={isLoading}
									minLength={10}
									maxLength={300}
								/>
							</div>

							{/* Deadline field */}
							<div className="col-span-2">
								<label className="block text-sm font-medium text-gray-300">
									Campaign Deadline
								</label>
								<input
									type="date"
									className="mt-1 w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
									value={deadline}
									onChange={(e) => setDeadline(e.target.value)}
									disabled={isLoading}
									min={new Date().toISOString().split("T")[0]}
								/>
							</div>

							{/* Image Upload Section */}
							<div className="col-span-2">
								<label className="block text-sm font-medium text-gray-300 mb-2">
									Campaign Image
								</label>
								<div className="flex gap-4 mb-4">
									<label className="inline-flex items-center">
										<input
											type="radio"
											className="form-radio text-blue-500"
											name="imageMethod"
											value="upload"
											checked={imageMethod === "upload"}
											onChange={(e) => setImageMethod(e.target.value)}
											disabled={isLoading}
										/>
										<span className="ml-2 text-gray-300">Upload Image</span>
									</label>
									<label className="inline-flex items-center">
										<input
											type="radio"
											className="form-radio text-blue-500"
											name="imageMethod"
											value="url"
											checked={imageMethod === "url"}
											onChange={(e) => setImageMethod(e.target.value)}
											disabled={isLoading}
										/>
										<span className="ml-2 text-gray-300">Image URL</span>
									</label>
								</div>

								{imageMethod === "upload" ? (
									<div className="mt-1 border-2 border-dashed border-gray-600 rounded-lg p-6">
										{imagePreview ? (
											<div className="relative">
												<img
													src={imagePreview}
													alt="Preview"
													className="w-full h-64 object-cover rounded-lg"
												/>
												<button
													type="button"
													onClick={removeImage}
													className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
													disabled={isLoading}
												>
													×
												</button>
											</div>
										) : (
											<div className="text-center">
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
													className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-colors inline-block"
												>
													Choose Image
												</label>
											</div>
										)}
									</div>
								) : (
									<div>
										<input
											type="url"
											placeholder="Enter image URL"
											className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200"
											value={imageUrl}
											onChange={handleUrlChange}
											disabled={isLoading}
										/>
										{imagePreview && (
											<div className="mt-4 relative">
												<img
													src={imagePreview}
													alt="Preview"
													className="w-full h-64 object-cover rounded-lg"
												/>
												<button
													type="button"
													onClick={removeImage}
													className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
													disabled={isLoading}
												>
													×
												</button>
											</div>
										)}
									</div>
								)}
							</div>
						</div>

						{/* Error Display */}
						{error && (
							<div className="text-center bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
								{error}
							</div>
						)}

						{/* Submit Button */}
						<button
							type="submit"
							disabled={isLoading}
							className="flex items-center justify-center w-full text-center mx-auto py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? (
								<LoaderPinwheel className="w-6 h-6 animate-spin text-white mx-auto" />
							) : (
								"Launch Campaign"
							)}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default CreateCampaign;
