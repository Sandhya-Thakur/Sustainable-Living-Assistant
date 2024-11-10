import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, RefreshCw, Trash, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface EcoTip {
  id: number;
  tip: string;
  category: string;
  imageUrl: string;
}

const EcoTips: React.FC = () => {
  const [tips, setTips] = useState<EcoTip[]>([]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      const response = await fetch('/api/eco-tips');
      if (!response.ok) throw new Error('Failed to fetch tips');
      const data = await response.json();
      setTips(data);
    } catch (error) {
      console.error('Error fetching tips:', error);
      toast.error('Failed to load eco tips');
    }
  };

  const generateNewTip = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/eco-tips', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to generate new tip');
      const newTip = await response.json();
      setTips(prevTips => [...prevTips, newTip.ecoTip]);
      setCurrentTipIndex(tips.length);
      toast.success('New eco tip generated!');
    } catch (error) {
      console.error('Error generating new tip:', error);
      toast.error('Failed to generate new tip');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTip = async (id: number) => {
    try {
      const response = await fetch(`/api/eco-tips?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete tip');
      setTips(prevTips => prevTips.filter(tip => tip.id !== id));
      if (currentTipIndex >= tips.length - 1) {
        setCurrentTipIndex(tips.length - 2);
      }
      toast.success('Eco tip deleted');
    } catch (error) {
      console.error('Error deleting tip:', error);
      toast.error('Failed to delete tip');
    }
  };

  const nextTip = () => {
    setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
  };

  const prevTip = () => {
    setCurrentTipIndex((prevIndex) => (prevIndex - 1 + tips.length) % tips.length);
  };

  return (
    <motion.div
      className="bg-green-900/20 p-6 rounded-lg border border-green-500 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Lightbulb className="text-yellow-400 mr-2" size={24} />
          <h2 className="text-xl font-bold text-green-400">Eco Tip of the Day</h2>
        </div>
        <button
          onClick={generateNewTip}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <RefreshCw className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} size={18} />
          Generate New Tip
        </button>
      </div>
      <AnimatePresence mode="wait">
        {tips.length > 0 && (
          <motion.div
            key={tips[currentTipIndex].id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 md:pr-4 mb-4 md:mb-0">
                <p className="text-green-200 mb-2">{tips[currentTipIndex].tip}</p>
                <p className="text-green-400 text-sm">Category: {tips[currentTipIndex].category}</p>
              </div>
              {tips[currentTipIndex].imageUrl && (
                <div className="w-full md:w-1/3">
                  <img
                    src={tips[currentTipIndex].imageUrl}
                    alt="Eco Tip Illustration"
                    className="w-full h-auto rounded-lg object-cover"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      const imageElement = e.currentTarget as HTMLImageElement;
                      imageElement.src = 'path/to/placeholder-image.jpg'; // Replace with your placeholder image
                    }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex justify-between items-center mt-4">
        <button onClick={prevTip} className="text-green-400 hover:text-green-300 flex items-center">
          <ChevronLeft size={18} className="mr-1" /> Previous
        </button>
        <button 
          onClick={() => tips[currentTipIndex] && deleteTip(tips[currentTipIndex].id)} 
          className="text-red-400 hover:text-red-300 flex items-center"
        >
          <Trash size={18} className="mr-1" /> Delete
        </button>
        <button onClick={nextTip} className="text-green-400 hover:text-green-300 flex items-center">
          Next <ChevronRight size={18} className="ml-1" />
        </button>
      </div>
    </motion.div>
  );
};

export default EcoTips;