import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';

interface EnergySavedData {
  energySaved: number;
  avgDailySavings: number;
  daysRecorded: number;
  timeFrame: number;
}

const EnergySaved: React.FC = () => {
  const [energyData, setEnergyData] = useState<EnergySavedData | null>(null);
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    async function fetchEnergySaved() {
      if (isLoaded && isSignedIn) {
        try {
          const response = await fetch('/api/energySaved');
          if (!response.ok) {
            throw new Error('Failed to fetch energy saved data');
          }
          const data = await response.json();
          setEnergyData(data);
        } catch (error) {
          console.error('Error fetching energy saved:', error);
          // Handle error (e.g., show error message to user)
        }
      }
    }

    fetchEnergySaved();
  }, [isLoaded, isSignedIn]);

  if (!energyData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-green-900/20 p-6 rounded-lg shadow-md border border-green-500 hover:border-green-400 transition-colors w-full">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-green-300 mb-1">Energy Saved</p>
          <p className="text-3xl font-bold text-green-400">
            {energyData.energySaved.toFixed(2)} <span className="text-xl">kWh</span>
          </p>
          <p className="text-sm text-green-300 mt-2">
            Avg. Daily Savings: {energyData.avgDailySavings.toFixed(2)} kWh
          </p>
          <p className="text-xs text-green-300">
            Based on {energyData.daysRecorded} days of data (last {energyData.timeFrame} days)
          </p>
        </div>
        <motion.div
          animate={{
            y: [-5, 5, -5], // Move 5px up and down
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Zap className="text-yellow-400" size={32} />
        </motion.div>
      </div>
    </div>
  );
};

export default EnergySaved;