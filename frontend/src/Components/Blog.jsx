import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, X, Edit3, Trash2, Eye, Upload, ChevronRight, Tags, Calendar, User, Hash, Loader2 } from 'lucide-react';
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
    author: "",
    userAddress: "",
    tags: [],
    image: null,
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
        tags: selectedBlog.tags,
        image: null,
      });
      setPreviewImage(selectedBlog.imageUrl);
    }
  }, [selectedBlog]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/all-blogs`);
      console.log(response.data.data);
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
      setFormData((prev) => ({
        ...prev,
        image: file
      }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Original formData:', formData);

    if (!authToken || !userAddress) {
        toast.error("Please connect your wallet and sign in first");
        setError("Please connect your wallet and sign in first");
        return;
    }

    if (!formData.title?.trim() || !formData.content?.trim() || !formData.author?.trim() || formData.tags.length === 0 || !formData.image) {
        toast.error("All fields including image are required");
        return;
    }

    try {
        setLoading(true);
        const formDataToSend = new FormData();

        // Log the form values before FormData creation
        console.log('Form values before FormData creation:', {
            title: formData.title,
            content: formData.content,
            author: formData.author,
            userAddress: userAddress,
            tags: formData.tags,
            image: formData.image
        });

        // Append form fields to FormData
        formDataToSend.append('title', formData.title.trim());
        formDataToSend.append('content', formData.content.trim());
        formDataToSend.append('author', formData.author.trim());
        formDataToSend.append('userAddress', userAddress);
        
        // Append tags as a comma-separated string
        formDataToSend.append('tags', formData.tags.join(','));

        // Append the single image file
        if (formData.image) {
            formDataToSend.append('image', formData.image);
        }

        // Log the FormData entries to verify content
        for (let pair of formDataToSend.entries()) {
            console.log(pair[0] + ':', pair[1]);
        }

        const response = await axios.post(`${API_BASE_URL}/add-blog`, formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        console.log('Response from server:', response.data);

        await fetchBlogs();
        handleCloseModal();
        toast.success("Blog created successfully");
    } catch (error) {
        console.error('Error in API call:', error.response?.data || error.message);
        setError(error.response?.data?.error || "An error occurred");
        toast.error(error.response?.data?.error || "An error occurred");
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
      author: "",
      userAddress: "",
      tags: [],
      image: null,
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
              key={blog._id}
              className="group relative bg-gradient-to-br from-zinc-900 to-black rounded-3xl overflow-hidden border border-zinc-800/50 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative aspect-video overflow-hidden">
                <img
                  src={`http://localhost:3000/public/${blog?.image}`}
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

          {/* Image upload section */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Image
            </label>
            {previewImage && (
              <div className="relative group mb-4">
                <img
                  src={previewImage}
                  alt="Blog preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-700"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, image: null }));
                    setPreviewImage("");
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700/50 border-dashed rounded-xl cursor-pointer bg-gray-800/30 hover:bg-gray-800/50 transition-colors duration-200">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-4 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                </div>
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
              value={formData.tags.join(', ')}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()) }))
              }
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500 transition-all duration-200"
              placeholder="web3, blockchain, crypto"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{isEditMode ? "Update Blog" : "Create Blog"}</>
            )}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Blog;

