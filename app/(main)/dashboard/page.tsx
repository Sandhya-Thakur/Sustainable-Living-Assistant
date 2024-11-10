
"use client"
import React from "react";
import { motion } from "framer-motion";
import {
  Leaf,
  Zap,
  Droplet,
  Trees,
  Footprints,
  Target,
  Lightbulb
} from "lucide-react";
import CarbonFootprintCalculator from "@/components/CarbonFootprintCalculator";
import SustainabilityGoalsComponent from "@/components/SustainabilityGoals";
import EcoTips from "@/components/EcoTips";
import CarbonInsightsGenerator from "@/components/CarbonInsightsGenerator";
import CarbonSaved from "@/components/CarbonSaved"
import EnergySaved from "@/components/EnergySaved"

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: number;
  unit: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  unit,
}) => (
  <motion.div
    className="bg-green-900/20 p-4 rounded-lg shadow-md border border-green-500 hover:border-green-400 transition-colors flex items-center justify-between"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div>
      <p className="text-sm text-green-300">{title}</p>
      <p className="text-2xl font-bold text-green-400">
        {value} {unit}
      </p>
    </div>
    <Icon className="text-green-500" size={24} />
  </motion.div>
);

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <motion.div
    className="bg-black p-6 rounded-lg shadow-lg border border-green-500 hover:border-green-400 transition-all cursor-pointer hover:shadow-green-500/50 w-full mb-8"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div
      animate={{
        y: [0, -5, 0],
        rotate: [-5, 5, -5],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="h-16 flex items-center justify-center mb-4"
    >
      {icon}
    </motion.div>
    <h2 className="text-xl font-semibold mb-4 text-green-400">{title}</h2>
    {children}
  </motion.div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="relative bg-black min-h-screen text-white p-8 flex flex-col overflow-hidden">
      <header className="mb-8 relative z-10">
        <motion.h1
          className="text-4xl font-bold text-green-500 flex items-center justify-center mb-2"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Leaf className="mr-2 text-green-400" />
          Eco Dashboard
        </motion.h1>
        <motion.p
          className="text-green-300 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Tracking your environmental impact
        </motion.p>
      </header>

      <main className="flex-grow relative z-10">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <CarbonSaved/>
          <EnergySaved/>
          
          <StatCard
            icon={Droplet}
            title="Water Saved"
            value={2000}
            unit="L"
          />
          <StatCard
            icon={Trees}
            title="Trees Planted"
            value={50}
            unit=""
          />
        </motion.div>

        <div className="space-y-8">
          <FeatureCard
            icon={<Footprints className="w-16 h-16 text-blue-500" />}
            title="Carbon Footprint"
          >
            <CarbonFootprintCalculator />
          </FeatureCard>
          
          <FeatureCard
            icon={<Leaf className="w-16 h-16 text-green-500" />}
            title="Carbon Insights"
          >
            <CarbonInsightsGenerator />
          </FeatureCard>
          
          <FeatureCard
            icon={<Target className="w-16 h-16 text-green-500" />}
            title="Sustainability Goals"
          >
            <SustainabilityGoalsComponent />
          </FeatureCard>
          
          <FeatureCard
            icon={<Lightbulb className="w-16 h-16 text-yellow-500" />}
            title="Eco Tips"
          >
            <EcoTips />
          </FeatureCard>
        </div>
      </main>

      <footer className="mt-12 text-green-600 text-center relative z-10">
        © {new Date().getFullYear()} Sustainable Living Assistant. All rights reserved.
      </footer>
    </div>
  );
};

export default Dashboard;