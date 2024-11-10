import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Car, Zap, Apple } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface CarbonFootprint {
  id: number;
  userId: string;
  date: string;
  transportation: string;
  energy: string;
  food: string;
  total: string;
}

const CarbonFootprintCalculator: React.FC = () => {
  const [formData, setFormData] = useState({
    transportation: '',
    energy: '',
    food: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [result, setResult] = useState<CarbonFootprint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [footprints, setFootprints] = useState<CarbonFootprint[]>([]);

  useEffect(() => {
    fetchFootprints();
  }, []);

  const fetchFootprints = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/carbonFootprints');
      if (!response.ok) {
        throw new Error('Failed to fetch carbon footprints');
      }
      const data = await response.json();
      setFootprints(data);
      toast.success('Carbon footprints loaded successfully');
    } catch (err) {
      setError('Failed to load carbon footprints. Please try again later.');
      toast.error('Failed to load carbon footprints');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      const transportation = Number(formData.transportation);
      const energy = Number(formData.energy);
      const food = Number(formData.food);

      if (isNaN(transportation) || isNaN(energy) || isNaN(food)) {
        throw new Error('All inputs must be valid numbers');
      }

      const response = await fetch('/api/carbonFootprints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          transportation,
          energy,
          food,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save carbon footprint data');
      }

      setResult(data);
      await fetchFootprints(); // Refresh the list of footprints
      toast.success('Carbon footprint saved successfully');
    } catch (err) {
      setError((err as Error).message || 'An error occurred while saving the data. Please try again.');
      toast.error('Failed to save carbon footprint');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/carbonFootprints?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete carbon footprint');
      }

      await fetchFootprints(); // Refresh the list of footprints
      toast.success('Carbon footprint deleted successfully');
    } catch (err) {
      toast.error('Failed to delete carbon footprint');
      console.error('Error:', err);
    }
  };

  const InputField: React.FC<{
    name: keyof typeof formData;
    label: string;
    icon: React.ReactNode;
  }> = ({ name, label, icon }) => (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-green-300 mb-1">
        {label}
      </label>
      <div className="relative">
        <motion.div
          className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          animate={{ x: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          {icon}
        </motion.div>
        <input
          type={name === 'date' ? 'date' : 'number'}
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={name === 'date' ? undefined : `Enter ${label.toLowerCase()} CO2 in kg`}
          className="mt-1 block w-full pl-10 pr-3 py-2 text-green-200 bg-green-900 bg-opacity-50 border border-green-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          min={name === 'date' ? undefined : "0"}
          step={name === 'date' ? undefined : "0.01"}
          required
        />
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-green-900 bg-opacity-30 p-6 rounded-lg shadow-lg border border-green-500"
    >
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-6 text-center text-green-400">Carbon Footprint Calculator</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField name="transportation" label="Transportation" icon={<Car size={18} className="text-green-500" />} />
        <InputField name="energy" label="Energy" icon={<Zap size={18} className="text-green-500" />} />
        <InputField name="food" label="Food" icon={<Apple size={18} className="text-green-500" />} />
        <InputField name="date" label="Date" icon={<span className="text-green-500">📅</span>} />
        <button
          type="submit"
          className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-green-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Calculating...' : 'Calculate'}
        </button>
      </form>
      {error && (
        <p className="mt-4 text-red-400 text-center">{error}</p>
      )}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-6 text-center"
        >
          <h3 className="text-lg font-semibold text-green-300">Your Total Carbon Footprint:</h3>
          <p className="text-3xl font-bold text-green-400">{parseFloat(result.total).toFixed(2)} kg CO2</p>
        </motion.div>
      )}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-green-300 mb-4">Your Carbon Footprint History</h3>
        {isLoading ? (
          <p className="text-green-200">Loading...</p>
        ) : footprints.length > 0 ? (
          <ul className="space-y-2">
            {footprints.map((footprint) => (
              <li key={footprint.id} className="bg-green-800 bg-opacity-50 p-3 rounded-md flex justify-between items-center">
                <div>
                  <p className="text-green-200">Date: {new Date(footprint.date).toLocaleDateString()}</p>
                  <p className="text-green-200">Total: {parseFloat(footprint.total).toFixed(2)} kg CO2</p>
                </div>
                <button
                  onClick={() => handleDelete(footprint.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-green-900 transition-colors duration-200"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-green-200">No carbon footprint data available.</p>
        )}
      </div>
    </motion.div>
  );
};

export default CarbonFootprintCalculator;