import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { RefreshCw, ExternalLink } from "lucide-react";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const RealtimeHealthNews: React.FC = () => {
  const [healthNews, setHealthNews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHealthNews = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://newsapi.org/v2/top-headlines", {
        params: {
          category: "health",
          country: "us", // Change to your preferred country code
          apiKey: "798f9ad2f6dc4befab3ec46c5b0da2b4", // Replace with your NewsAPI key
        },
      });

      // Filter out invalid news articles
      const validArticles = response.data.articles.filter(
        (article: any) =>
          article.title &&
          article.description &&
          article.urlToImage &&
          !article.title.includes("[Removed]")
      );

      // Shuffle the articles randomly
      const shuffledArticles = validArticles.sort(() => Math.random() - 0.5);

      setHealthNews(shuffledArticles.slice(0, 6)); // Limit to 6 articles
    } catch (error) {
      console.error("Error fetching health news:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthNews();
  }, []);

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={staggerContainer}
      className="py-24 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeIn} className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Latest Health News
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-3xl">
              Stay informed with the latest developments in healthcare and medical research.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchHealthNews}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Refreshing..." : "Refresh News"}
          </motion.button>
        </motion.div>

        {loading && healthNews.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : healthNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {healthNews.map((newsItem, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 flex flex-col h-full"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={newsItem.urlToImage || "https://via.placeholder.com/400x200?text=Health+News"}
                    alt={newsItem.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-6 flex-grow">
                  <p className="text-sm text-blue-600 font-semibold mb-2">{newsItem.source.name}</p>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{newsItem.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{newsItem.description}</p>
                </div>
                <div className="px-6 pb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {new Date(newsItem.publishedAt).toLocaleDateString()}
                    </span>
                    <a
                      href={newsItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Read More
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={fadeIn}
            className="bg-gray-50 rounded-lg p-8 text-center"
          >
            <p className="text-gray-600 text-lg">No health news available at the moment. Please try again later.</p>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};

export default RealtimeHealthNews;
