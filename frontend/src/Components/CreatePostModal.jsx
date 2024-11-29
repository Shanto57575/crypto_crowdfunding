import {
	Image as ImageIcon,
	Loader2,
	MessageSquarePlus,
	Plus,
	Send,
	Trash2,
	X,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { uploadToIPFS } from "../helper/ipfsService";

const CreatePostModal = ({ campaignId, isOpen, onClose, onPostSuccess }) => {
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		image: null,
		imagePreview: "",
		links: [{ title: "", url: "" }],
	});
	const [isLoading, setIsLoading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);

	if (!isOpen) return null;

	const handleImageChange = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onloadend = () => {
			setFormData((prev) => ({
				...prev,
				image: file,
				imagePreview: reader.result,
			}));
		};
		reader.readAsDataURL(file);
	};

	const removeImage = () => {
		setFormData((prev) => ({
			...prev,
			image: null,
			imagePreview: "",
		}));
	};

	const addLink = () => {
		setFormData((prev) => ({
			...prev,
			links: [...prev.links, { title: "", url: "" }],
		}));
	};

	const removeLink = (index) => {
		setFormData((prev) => ({
			...prev,
			links: prev.links.filter((_, i) => i !== index),
		}));
	};

	const updateLink = (index, field, value) => {
		setFormData((prev) => ({
			...prev,
			links: prev.links.map((link, i) =>
				i === index ? { ...link, [field]: value } : link
			),
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setUploadProgress(0);

		try {
			// Step 1: Upload image to IPFS if exists
			let imageUrl = "";
			if (formData.image) {
				const imageUploadResult = await uploadToIPFS(formData.image);
				imageUrl = imageUploadResult.url;
				setUploadProgress(25);
			}

			// Step 2: Filter valid links
			const validLinks = formData.links.filter(
				(link) => link.title && link.url
			);

			// Step 3: Create complete post metadata
			const postMetadata = {
				campaignId: campaignId,
				version: "1.0.0",
				metadata: {
					title: formData.title,
					description: formData.description,
					image: imageUrl,
					links: validLinks,
					timestamp: new Date().toISOString(),
					type: "campaign_update",
				},
				content: {
					title: formData.title,
					body: formData.description,
					media: {
						images: imageUrl ? [{ url: imageUrl, type: "image" }] : [],
					},
					references: validLinks.map((link) => ({
						title: link.title,
						url: link.url,
						type: "external_link",
					})),
				},
				properties: {
					campaignId: campaignId,
					creator: window.ethereum?.selectedAddress || "",
					createdAt: new Date().toISOString(),
					updateType: "general",
					contentVersion: "1",
				},
			};

			setUploadProgress(50);

			// Step 4: Upload metadata to IPFS
			const metadataBlob = new Blob([JSON.stringify(postMetadata)], {
				type: "application/json",
			});
			const metadataUploadResult = await uploadToIPFS(metadataBlob);

			setUploadProgress(75);

			// Step 5: Create final IPFS record linking everything
			const finalRecord = {
				version: "1.0.0",
				type: "campaign_update",
				metadata: metadataUploadResult.url,
				timestamp: new Date().toISOString(),
			};

			const finalBlob = new Blob([JSON.stringify(finalRecord)], {
				type: "application/json",
			});
			const finalUploadResult = await uploadToIPFS(finalBlob);

			setUploadProgress(100);
			toast.success(
				<h1 className="text-center font-serif">Post created successfully</h1>
			);

			// Reset form
			setFormData({
				title: "",
				description: "",
				image: null,
				imagePreview: "",
				links: [{ title: "", url: "" }],
			});

			// Return the IPFS hash of the final record
			if (onPostSuccess) {
				onPostSuccess(finalUploadResult.url);
			}

			onClose();
		} catch (error) {
			console.error("Error creating post:", error);
			toast.error(
				<h1 className="font-serif text-center">Failed to create post</h1>
			);
		} finally {
			setIsLoading(false);
			setUploadProgress(0);
		}
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
			<div className="bg-gray-900 w-full max-w-7xl rounded-xl border border-gray-800 shadow-xl max-h-[90vh] overflow-y-auto">
				<div className="p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-bold text-white flex items-center gap-2">
							<MessageSquarePlus className="w-5 h-5 text-indigo-500" />
							Create Campaign Update
						</h2>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-white transition-colors"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					<form onSubmit={handleSubmit}>
						<div className="flex gap-6">
							<div className="flex-1 space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-400 mb-1">
										Title
									</label>
									<input
										type="text"
										value={formData.title}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												title: e.target.value,
											}))
										}
										placeholder="Update title..."
										className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white"
										required
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-400 mb-1">
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
										placeholder="Share your campaign update..."
										className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg h-32 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white"
										required
									/>
								</div>

								<div>
									<div className="flex items-center justify-between mb-2">
										<label className="block text-sm font-medium text-gray-400">
											Links (Optional)
										</label>
										<button
											type="button"
											onClick={addLink}
											className="text-indigo-500 hover:text-indigo-400 flex items-center gap-1 text-sm"
										>
											<Plus className="w-4 h-4" />
											Add Link
										</button>
									</div>
									<div className="space-y-3">
										{formData.links.map((link, index) => (
											<div key={index} className="flex gap-3">
												<input
													type="text"
													value={link.title}
													onChange={(e) =>
														updateLink(index, "title", e.target.value)
													}
													placeholder="Link title"
													className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white"
												/>
												<input
													type="url"
													value={link.url}
													onChange={(e) =>
														updateLink(index, "url", e.target.value)
													}
													placeholder="https://..."
													className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white"
												/>
												<button
													type="button"
													onClick={() => removeLink(index)}
													className="p-2 text-gray-400 hover:text-red-500 transition-colors"
												>
													<Trash2 className="w-5 h-5" />
												</button>
											</div>
										))}
									</div>
								</div>
							</div>

							<div className="w-1/3">
								<label className="block text-sm font-medium text-gray-400 mb-2">
									Image
								</label>
								<div className="h-full relative">
									<label className="flex flex-col items-center justify-center h-[400px] border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-all">
										<div className="flex flex-col items-center justify-center pt-5 pb-6">
											{formData.imagePreview ? (
												<div className="relative">
													<img
														src={formData.imagePreview}
														alt="Preview"
														className="h-80 object-contain"
													/>
													<button
														type="button"
														onClick={removeImage}
														className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
													>
														<X className="w-4 h-4" />
													</button>
												</div>
											) : (
												<div className="text-center">
													<ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
													<p className="text-sm text-gray-400">
														Click to upload image
													</p>
												</div>
											)}
										</div>
										<input
											type="file"
											className="hidden"
											onChange={handleImageChange}
											accept="image/*"
										/>
									</label>

									{uploadProgress > 0 && uploadProgress < 100 && (
										<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
											<div className="w-64 bg-gray-700 rounded-full h-2">
												<div
													className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
													style={{ width: `${uploadProgress}%` }}
												/>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>

						<div className="flex justify-end gap-3 mt-6">
							<button
								type="button"
								onClick={onClose}
								className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={isLoading}
								className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isLoading ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										{uploadProgress > 0 ? "Uploading..." : "Creating..."}
									</>
								) : (
									<>
										<Send className="w-4 h-4" />
										Post Update
									</>
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default CreatePostModal;
