import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const UpdateModal = ({ isOpen, onClose, campaignId, post }) => {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [images, setImages] = useState([]); // Will store ALL images (existing + new)
	const [imageFiles, setImageFiles] = useState([]); // New image files to upload
	const [existingImages, setExistingImages] = useState([]); // Tracks existing images to potentially remove
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState({});

	useEffect(() => {
		if (post && post.length > 0) {
			const existingPost = post[0];
			setTitle(existingPost.title || "");
			setDescription(existingPost.description || "");

			if (existingPost.images && existingPost.images.length > 0) {
				setImages(
					existingPost.images.map(
						(img) => `https://crypto-crowdfunding-3go8.onrender.com${img}`
					)
				);
				setExistingImages(existingPost.images); // Track server-side images
			} else {
				setImages([]); // Clear all images if none exist
				setExistingImages([]);
			}
			setImageFiles([]); // Reset new image files
		} else {
			// Reset for new post creation
			setTitle("");
			setDescription("");
			setImages([]);
			setExistingImages([]);
			setImageFiles([]);
		}
	}, [post, isOpen]);

	const validateForm = () => {
		const newErrors = {};

		if (!title.trim()) {
			newErrors.title = "Update title is required";
		}

		if (!description.trim()) {
			newErrors.description = "Update description is required";
		}

		// Validate image count dynamically
		const totalImageCount = images.length;
		console.log("Validating image count:", totalImageCount); // Debug

		if (totalImageCount === 0) {
			newErrors.images = "At least one image is required";
		} else if (totalImageCount > 6) {
			newErrors.images = "You can only have up to 6 images";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleImageUpload = (e) => {
		if (!e.target.files?.length) return;

		const newImageFiles = Array.from(e.target.files);

		// Log for debugging
		console.log("Current images count:", images.length);
		console.log("New images selected:", newImageFiles.length);

		const totalImages = images.length + newImageFiles.length;

		console.log("Total images after upload attempt:", totalImages);

		if (totalImages > 6) {
			toast.error(
				<h1 className="text-center font-serif">
					You can only upload up to 6 images.
				</h1>
			);
			return;
		}

		const newImageUrls = newImageFiles.map((file) => URL.createObjectURL(file));

		setImageFiles((prev) => [...prev, ...newImageFiles]);
		setImages((prev) => [...prev, ...newImageUrls]);

		// Clear errors
		if (errors.images) {
			setErrors((prev) => ({ ...prev, images: undefined }));
		}
	};

	const removeImage = (index) => {
		setImages((prevImages) => {
			const updatedImages = prevImages.filter((_, i) => i !== index);

			// Debug: Check updated count after removal
			console.log("Images count after removal:", updatedImages.length);

			return updatedImages;
		});

		if (index < existingImages.length) {
			// If the image is from existingImages
			setExistingImages((prev) => {
				const updatedExistingImages = prev.filter((_, i) => i !== index);

				// Debug: Log remaining existing images
				console.log("Existing images count:", updatedExistingImages.length);

				return updatedExistingImages;
			});
		} else {
			// If the image is a new upload, adjust the index for `imageFiles`
			const newImageIndex = index - existingImages.length;
			setImageFiles((prev) => {
				const updatedImageFiles = prev.filter((_, i) => i !== newImageIndex);

				// Debug: Log remaining new image files
				console.log("New image files count:", updatedImageFiles.length);

				return updatedImageFiles;
			});
		}

		// Clear errors if caused by image validation
		setErrors((prev) => ({ ...prev, images: undefined }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			toast.error(
				<h1 className="text-center font-serif">
					Please fill all required fields
				</h1>
			);
			return;
		}

		setIsSubmitting(true);

		try {
			const formData = new FormData();

			formData.append("campaignId", campaignId);
			formData.append("title", title);
			formData.append("description", description);

			// Add existing images (unchanged)
			existingImages.forEach((img) => formData.append("existingImages", img));

			// Add new image files
			imageFiles.forEach((file) => formData.append("images", file));

			const isUpdate = post && post.length > 0;
			const apiEndpoint = isUpdate
				? `https://crypto-crowdfunding-3go8.onrender.com/api/post/${post[0]._id}`
				: "https://crypto-crowdfunding-3go8.onrender.com/api/post/add-post";
			const method = isUpdate ? "PUT" : "POST";

			const response = await fetch(apiEndpoint, {
				method,
				body: formData,
			});

			const responseData = await response.json();

			if (!response.ok) {
				throw new Error(responseData.message || "Failed to submit update");
			}

			// Reset states and close the modal
			onClose();
			setTitle("");
			setDescription("");
			setImages([]);
			setExistingImages([]);
			setImageFiles([]);
			setErrors({});

			toast.success(
				<h1 className="text-center font-serif">
					{isUpdate ? "Campaign update Edited" : "Campaign update Added"}
				</h1>
			);
		} catch (error) {
			toast.error(<h1 className="text-center font-serif">{error.message}</h1>);
			console.error("Error submitting update:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
					onClick={onClose}
				>
					<motion.div
						initial={{ scale: 0.95, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.95, opacity: 0 }}
						onClick={(e) => e.stopPropagation()}
						className="w-full max-w-lg bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-800"
					>
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-bold text-white">
								{post ? "Edit Campaign Update" : "Give Updates to Backers"}
							</h2>
							<button
								onClick={onClose}
								className="text-gray-400 hover:text-white transition-colors"
							>
								<X className="w-6 h-6" />
							</button>
						</div>

						<form onSubmit={handleSubmit} className="space-y-6">
							<div>
								<input
									type="text"
									placeholder="Update Title"
									value={title}
									onChange={(e) => {
										setTitle(e.target.value);
										if (errors.title) {
											setErrors((prev) => ({ ...prev, title: undefined }));
										}
									}}
									className={`w-full bg-gray-800 border rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
										errors.title
											? "border-red-500 focus:ring-red-500"
											: "border-gray-700 focus:ring-purple-500"
									}`}
									required
								/>
								{errors.title && (
									<p className="text-red-500 text-sm mt-1">{errors.title}</p>
								)}
							</div>

							<div>
								<textarea
									placeholder="Update Description"
									value={description}
									onChange={(e) => {
										setDescription(e.target.value);
										if (errors.description) {
											setErrors((prev) => ({
												...prev,
												description: undefined,
											}));
										}
									}}
									className={`w-full bg-gray-800 border rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 min-h-[120px] ${
										errors.description
											? "border-red-500 focus:ring-red-500"
											: "border-gray-700 focus:ring-purple-500"
									}`}
									required
								/>
								{errors.description && (
									<p className="text-red-500 text-sm mt-1">
										{errors.description}
									</p>
								)}
							</div>

							<div className="space-y-4">
								<motion.div className="flex flex-wrap gap-4" layout>
									{images.map((image, index) => (
										<motion.div
											key={index}
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											exit={{ scale: 0 }}
											className="relative group"
										>
											<img
												src={image}
												alt={`Update ${index + 1}`}
												className="w-24 h-24 object-cover rounded-lg border border-gray-700"
											/>
											<button
												type="button"
												onClick={() => removeImage(index)}
												className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
											>
												<X className="w-4 h-4 text-white" />
											</button>
										</motion.div>
									))}
								</motion.div>

								<div>
									<input
										type="file"
										accept="image/*"
										onChange={handleImageUpload}
										multiple
										className="hidden"
										id="image-upload"
									/>
									<label
										htmlFor="image-upload"
										className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg cursor-pointer hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									>
										<Upload className="w-5 h-5" />
										Add Images
									</label>
									{errors.images && (
										<p className="text-red-500 text-sm mt-1">{errors.images}</p>
									)}
								</div>
							</div>

							<div className="flex justify-end gap-3">
								<button
									type="button"
									onClick={onClose}
									className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={isSubmitting}
									className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
								>
									{isSubmitting ? (
										<>
											<Loader2 className="w-5 h-5 animate-spin" />
											Submitting...
										</>
									) : post ? (
										"Update"
									) : (
										"Submit Update"
									)}
								</button>
							</div>
						</form>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default UpdateModal;
