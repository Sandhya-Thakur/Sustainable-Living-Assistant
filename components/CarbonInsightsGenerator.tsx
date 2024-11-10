import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface Insight {
  id: number;
  date: string;
  insight: string;
}

const CarbonInsightsGenerator: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showOlderInsights, setShowOlderInsights] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-insight');
      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast.error('Failed to fetch insights');
    } finally {
      setIsLoading(false);
    }
  };

  const generateInsight = async () => {
    setIsLoading(true);
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const response = await fetch('/api/generate-insight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: currentDate }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insight');
      }

      const data = await response.json();
      setInsights([data.insight, ...insights]);
      setShowOlderInsights(false); // Hide older insights when a new one is generated
      toast.success('New insight generated successfully');
    } catch (error) {
      console.error('Error generating insight:', error);
      toast.error('Failed to generate insight');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteInsight = async (id: number) => {
    try {
      const response = await fetch(`/api/generate-insight?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete insight');
      }

      setInsights(insights.filter(insight => insight.id !== id));
      toast.success('Insight deleted successfully');
    } catch (error) {
      console.error('Error deleting insight:', error);
      toast.error('Failed to delete insight');
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleOlderInsights = () => {
    setShowOlderInsights(!showOlderInsights);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-green-900 bg-opacity-30 p-6 rounded-lg shadow-lg border border-green-500 h-full"
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-green-400">Carbon Insights</h2>
      <button
        onClick={generateInsight}
        className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-green-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        disabled={isLoading}
      >
        {isLoading ? 'Generating...' : 'Generate New Insight for Today'}
      </button>
      {insights.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {insights.slice(0, showOlderInsights ? undefined : 1).map((insight) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-green-800 bg-opacity-50 p-4 rounded-md relative"
              >
                <p className="text-sm text-green-300 mb-2">{formatDate(insight.date)}</p>
                <p className="text-green-200">{insight.insight}</p>
                <button
                  onClick={() => deleteInsight(insight.id)}
                  className="absolute top-2 right-2 text-red-400 hover:text-red-300"
                  title="Delete Insight"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {insights.length > 1 && (
            <button
              onClick={toggleOlderInsights}
              className="w-full mt-4 bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-green-900 transition-colors duration-200 flex items-center justify-center"
            >
              {showOlderInsights ? (
                <>
                  <ChevronUp size={16} className="mr-2" />
                  Hide Older Insights
                </>
              ) : (
                <>
                  <ChevronDown size={16} className="mr-2" />
                  Show Older Insights ({insights.length - 1})
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
              transition: { duration: 4, repeat: Infinity }
            }}
          >
            <Leaf className="text-green-500 w-16 h-16 mb-4" />
          </motion.div>
          <p className="text-green-300 text-center">No insights yet. Generate your first insight!</p>
        </div>
      )}
    </motion.div>
  );
};

export default CarbonInsightsGenerator;