import { motion } from "framer-motion";
import {
  ExternalLink,
  Loader2,
  MessageCircle,
  Share2,
  ThumbsUp,
  UserRound,
} from "lucide-react";
import React, { useEffect, useState } from "react";

const CampaignUpdates = ({ campaignId }) => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUpdates = async () => {
    try {
      setLoading(true);

      // Assuming you have a list of IPFS hashes or an API endpoint to fetch all updates
      // This could be stored in a database or another indexing service
      const response = await fetch("YOUR_API_ENDPOINT/updates");
      if (!response.ok) throw new Error("Failed to fetch updates");
      const allUpdates = await response.json();

      // Filter updates for this campaign
      const campaignUpdates = allUpdates.filter((update) => {
        try {
          // Parse the IPFS data
          const updateData = update.metadata;
          return updateData.campaignId === campaignId;
        } catch (err) {
          console.error("Error parsing update:", err);
          return false;
        }
      });

      // Sort updates by timestamp (newest first)
      const sortedUpdates = campaignUpdates.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      setUpdates(sortedUpdates);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      fetchUpdates();
    }
  }, [campaignId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
        {error}
      </div>
    );
  }

  if (!updates.length) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <MessageCircle className="w-12 h-12 text-gray-500 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-300">No updates yet</h3>
        <p className="text-gray-500 mt-2">
          Check back later for campaign updates
        </p>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {updates.map((update, index) => (
        <motion.div
          key={update.metadata.url}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <UserRound className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold">{update.metadata.title}</h3>
                <p className="text-sm text-gray-400">
                  {formatDate(update.timestamp)}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <p className="text-gray-300 whitespace-pre-wrap">
              {update.metadata.description}
            </p>

            {/* Image if exists */}
            {update.metadata.image && (
              <div className="mt-4">
                <img
                  src={update.metadata.image}
                  alt="Update"
                  className="rounded-xl w-full object-cover max-h-96"
                />
              </div>
            )}

            {/* Links */}
            {update.metadata.links?.length > 0 && (
              <div className="mt-4 space-y-2">
                {update.metadata.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{link.title}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <ThumbsUp className="w-4 h-4" />
                <span>Like</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>Comment</span>
              </button>
            </div>
            <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default CampaignUpdates;
