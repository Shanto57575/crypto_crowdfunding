import { useState, useEffect } from "react";
import axios from "axios";
import {
	Plus,
	X,
	Edit3,
	Trash2,
	Eye,
	Upload,
	ChevronRight,
	Tags,
	Calendar,
	User,
	Hash,
} from "lucide-react";
import toast from "react-hot-toast";

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/blog`;

const Modal = ({ isOpen, onClose, children, title }) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
			<div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700/50 shadow-2xl">
				<div className="p-6 space-y-6">
					<div className="flex justify-between items-center">
						<h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
							{title}
						</h2>
						<button
							onClick={onClose}
							className="p-2 hover:bg-gray-700/50 rounded-full transition-colors duration-200"
						>
							<X className="w-5 h-5" />
						</button>
					</div>
					{children}
				</div>
			</div>
		</div>
	);
};

const Blog = () => {
	const [blogs, setBlogs] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [selectedBlog, setSelectedBlog] = useState(null);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const [formData, setFormData] = useState({
		title: "",
		content: "",
		imageUrl: "",
		author: "",
		userAddress: "",
		tags: "",
	});
	const [previewImage, setPreviewImage] = useState("");

	const authToken = localStorage.getItem("authToken");
	const userAddress = localStorage.getItem("userAddress");

	useEffect(() => {
		fetchBlogs();
	}, []);

	useEffect(() => {
		if (selectedBlog) {
			setFormData({
				...selectedBlog,
				tags: selectedBlog.tags.join(","),
			});
			setPreviewImage(selectedBlog.imageUrl);
		}
	}, [selectedBlog]);

	const fetchBlogs = async () => {
		try {
			setLoading(true);
			const response = await axios.get(`${API_BASE_URL}/all-blogs`);
			setBlogs(response.data.data);
		} catch (error) {
			setError("Failed to fetch blogs");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreviewImage(reader.result);
				setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!authToken || !userAddress) {
			toast.error(`Please Please connect your wallet and sign in first`);
			setError("Please connect your wallet and sign in first");
			return;
		}

		try {
			setLoading(true);
			const blogData = {
				...formData,
				tags: formData.tags.split(",").map((tag) => tag.trim()),
				userAddress,
			};

			if (isEditMode) {
				await axios.put(`${API_BASE_URL}/${selectedBlog._id}`, blogData);
			} else {
				const response = await axios.post(`${API_BASE_URL}/add-blog`, blogData);
				console.log(response);
			}

			await fetchBlogs();
			handleCloseModal();
		} catch (error) {
			setError(error.response?.data?.error || "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (blogId) => {
		if (!authToken || !userAddress) {
			setError("Please connect your wallet and sign in first");
			return;
		}

		try {
			setLoading(true);
			await axios.delete(`${API_BASE_URL}/remove-blog/${blogId}`);
			await fetchBlogs();
		} catch (error) {
			setError(error.response?.data?.error || "Failed to delete blog");
		} finally {
			setLoading(false);
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setIsEditMode(false);
		setSelectedBlog(null);
		setFormData({
			title: "",
			content: "",
			imageUrl: "",
			author: "",
			userAddress: "",
			tags: "",
		});
		setPreviewImage("");
	};

	const handleEdit = (blog) => {
		setSelectedBlog(blog);
		setIsEditMode(true);
		setIsModalOpen(true);
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100 pt-20 px-2 sm:px-4 pb-20">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-4">
					<div className="text-center sm:text-left">
						<h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
							Web3 Blog
						</h1>
						<p className="text-gray-400 mt-2">Explore the future of the web</p>
					</div>
					<button
						onClick={() => setIsModalOpen(true)}
						className="group relative inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-200 hover:-translate-y-0.5"
					>
						<Plus className="w-5 h-5" />
						<span>Create Post</span>
						<div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
					</button>
				</div>

				{/* Blog Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{blogs.map((blog) => (
						<div
							key={blog.id}
							className="group relative bg-gradient-to-br from-zinc-900 to-black rounded-3xl overflow-hidden border border-zinc-800/50 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1"
						>
							<div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

							<div className="relative aspect-video overflow-hidden">
								<img
									src={blog.imageUrl}
									alt={blog.title}
									className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
							</div>

							<div className="p-6 space-y-4">
								<h3 className="text-xl font-bold line-clamp-1 group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
									{blog.title}
								</h3>

								<p className="text-gray-400 text-sm line-clamp-3">
									{blog.content}
								</p>

								<div className="flex flex-wrap gap-2">
									{blog.tags.map((tag, index) => (
										<span
											key={index}
											className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800/50 rounded-full text-xs font-medium text-gray-300 hover:bg-gray-700/50 transition-colors duration-200"
										>
											<Hash className="w-3 h-3" />
											{tag}
										</span>
									))}
								</div>

								<div className="flex flex-col gap-2 text-sm text-gray-400">
									<div className="flex items-center gap-2">
										<User className="w-4 h-4" />
										<span>{blog.author}</span>
									</div>
									<div className="flex items-center gap-2">
										<Calendar className="w-4 h-4" />
										<span>{blog.createdAt}</span>
									</div>
								</div>

								<div className="flex flex-wrap gap-2 pt-2">
									<button className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-sm font-medium transition-colors duration-200">
										<Eye className="w-4 h-4" />
										View
										<ChevronRight className="w-4 h-4" />
									</button>

									{userAddress === blog.userAddress && (
										<>
											<button
												onClick={() => handleEdit(blog)}
												className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium transition-colors duration-200"
											>
												<Edit3 className="w-4 h-4" />
												Edit
											</button>
											<button
												onClick={() => handleDelete(blog.id)}
												className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors duration-200"
											>
												<Trash2 className="w-4 h-4" />
												Delete
											</button>
										</>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Modal */}
			<Modal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={isEditMode ? "Update Blog" : "Create New Blog"}
			>
				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label className="block text-sm font-medium mb-2 text-gray-300">
							Title
						</label>
						<input
							type="text"
							value={formData.title}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, title: e.target.value }))
							}
							className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500 transition-all duration-200"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2 text-gray-300">
							Image
						</label>
						<div className="flex items-center justify-center w-full">
							<label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-700/50 border-dashed rounded-xl cursor-pointer bg-gray-800/30 hover:bg-gray-800/50 transition-colors duration-200">
								{previewImage ? (
									<div className="relative w-full h-full">
										<img
											src={previewImage}
											alt="Preview"
											className="w-full h-full object-cover rounded-xl"
										/>
										<button
											type="button"
											onClick={() => {
												setPreviewImage("");
												setFormData((prev) => ({ ...prev, imageUrl: "" }));
											}}
											className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-500 rounded-full transition-colors duration-200"
										>
											<X className="w-4 h-4" />
										</button>
									</div>
								) : (
									<div className="flex flex-col items-center justify-center pt-5 pb-6">
										<Upload className="w-10 h-10 mb-4 text-gray-400" />
										<p className="mb-2 text-sm text-gray-400">
											<span className="font-semibold">Click to upload</span> or
											drag and drop
										</p>
									</div>
								)}
								<input
									type="file"
									className="hidden"
									onChange={handleImageChange}
									accept="image/*"
								/>
							</label>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2 text-gray-300">
							Content
						</label>
						<textarea
							value={formData.content}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, content: e.target.value }))
							}
							className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500 min-h-[200px] transition-all duration-200"
							required
						/>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium mb-2 text-gray-300">
								Author
							</label>
							<div className="relative">
								<User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
								<input
									type="text"
									value={formData.author}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, author: e.target.value }))
									}
									className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500 transition-all duration-200"
									required
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium mb-2 text-gray-300">
								User Address
							</label>
							<div className="relative">
								<Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
								<input
									type="text"
									value={formData.userAddress}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											userAddress: e.target.value,
										}))
									}
									className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
									disabled={isEditMode}
									required
								/>
							</div>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium mb-2 text-gray-300">
							<div className="flex items-center gap-2">
								<Tags className="w-4 h-4" />
								Tags (comma separated)
							</div>
						</label>
						<input
							type="text"
							value={formData.tags}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, tags: e.target.value }))
							}
							className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500 transition-all duration-200"
							placeholder="web3, blockchain, crypto"
							required
						/>
					</div>

					<button
						type="submit"
						className="group relative w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-200 hover:-translate-y-0.5"
					>
						{isEditMode ? "Update Blog" : "Create Blog"}
						<div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
					</button>
				</form>
			</Modal>
		</div>
	);
};

export default Blog;
