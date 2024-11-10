import React, { useEffect, useState } from 'react';
import { Recycle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';

interface CarbonSavedData {
  carbonSaved: number;
  avgDailySavings: number;
  daysRecorded: number;
  timeFrame: number;
}

const CarbonSaved: React.FC = () => {
  const [carbonData, setCarbonData] = useState<CarbonSavedData | null>(null);
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    async function fetchCarbonSaved() {
      if (isLoaded && isSignedIn) {
        try {
          const response = await fetch('/api/carbonSaved');
          if (!response.ok) {
            throw new Error('Failed to fetch carbon saved data');
          }
          const data = await response.json();
          setCarbonData(data);
        } catch (error) {
          console.error('Error fetching carbon saved:', error);
          // Handle error (e.g., show error message to user)
        }
      }
    }

    fetchCarbonSaved();
  }, [isLoaded, isSignedIn]);

  if (!carbonData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-green-900/20 p-6 rounded-lg shadow-md border border-green-500 hover:border-green-400 transition-colors w-full">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-green-300 mb-1">Carbon Saved</p>
          <p className="text-3xl font-bold text-green-400">
            {carbonData.carbonSaved.toFixed(2)} <span className="text-xl">kg</span>
          </p>
          <p className="text-sm text-green-300 mt-2">
            Avg. Daily Savings: {carbonData.avgDailySavings.toFixed(2)} kg
          </p>
          <p className="text-xs text-green-300">
            Based on {carbonData.daysRecorded} days of data (last {carbonData.timeFrame} days)
          </p>
        </div>
        <motion.div
          animate={{
            x: [0, 10, 0], // Move 10px to the right and back
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Recycle className="text-green-500" size={32} />
        </motion.div>
      </div>
    </div>
  );
};

export default CarbonSaved;