"use client"
import React from "react";
import { motion } from "framer-motion";
import { Leaf, BarChart2, ArrowRight, Globe, Sun, Droplet } from "lucide-react";
import { useRouter } from "next/navigation";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  animationDelay?: number;
  onClick?: () => void;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon, 
  title, 
  description, 
  animationDelay = 0,
  onClick,
  className = ""
}) => {
  return (
    <motion.div 
      className={`p-6 border border-green-500 rounded-lg bg-black shadow-lg transition-all cursor-pointer hover:shadow-green-500/50 hover:border-green-400 ${className}`}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: animationDelay, duration: 0.5 }}
      onClick={onClick}
    >
      <motion.div
        animate={{ 
          y: [0, -5, 0],
          rotate: [-5, 5, -5]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="h-16 flex items-center justify-center"
      >
        {icon}
      </motion.div>
      <h2 className="mt-4 text-xl font-semibold text-green-400">{title}</h2>
      <p className="mt-2 text-gray-400">{description}</p>
    </motion.div>
  );
};

const GreenWave = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-green-900/10 to-green-500/10"
      animate={{
        x: ['-100%', '100%'],
        opacity: [0.1, 0.2, 0.1]
      }}
      transition={{
        repeat: Infinity,
        duration: 20,
        ease: "linear"
      }}
    />
  </div>
);

const Home: React.FC = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/dashboard');
  };

  return (
    <div className="relative grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-black text-white overflow-hidden">
      <GreenWave />
      <header className="w-full text-center relative z-10">
        <motion.h1 
          className="text-5xl font-bold text-green-500 drop-shadow-lg"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Sustainable Living Assistant
        </motion.h1>
      </header>
      
      <main className="grid gap-12 text-center w-full max-w-6xl relative z-10">
        <motion.p 
          className="text-2xl text-green-300 drop-shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Your personal guide to a more sustainable lifestyle
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Leaf className="w-16 h-16 text-green-500" />}
            title="Eco Tips"
            description="Daily suggestions for sustainable living"
            animationDelay={0.2}
          />
          <FeatureCard 
            icon={<BarChart2 className="w-16 h-16 text-blue-500" />}
            title="Carbon Footprint"
            description="Track and reduce your environmental impact"
            animationDelay={0.4}
          />
          <FeatureCard 
            icon={<ArrowRight className="w-16 h-16 text-purple-500" />}
            title="Get Started"
            description="Begin your journey to sustainability"
            animationDelay={0.6}
            onClick={handleGetStarted}
            className="hover:scale-105 transition-transform"
          />
        </div>
        <motion.div 
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="flex flex-col items-center p-6 bg-green-900/20 rounded-lg">
            <Globe className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-green-300">Global Impact</h3>
            <p className="text-gray-400">Join a community of eco-conscious individuals</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-green-900/20 rounded-lg">
            <Sun className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-lg font-semibold text-green-300">Renewable Energy</h3>
            <p className="text-gray-400">Learn about and adopt clean energy solutions</p>
          </div>
          <div className="flex flex-col items-center p-6 bg-green-900/20 rounded-lg">
            <Droplet className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-green-300">Water Conservation</h3>
            <p className="text-gray-400">Discover ways to reduce water consumption</p>
          </div>
        </motion.div>
      </main>
      
      <footer className="w-full text-center text-sm text-green-600 relative z-10">
        © {new Date().getFullYear()} Sustainable Living Assistant. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;