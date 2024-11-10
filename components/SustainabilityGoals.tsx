import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Calendar,
  Check,
  Edit,
  Trash,
  ChevronDown,
  Percent,
  FileText,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type SustainabilityGoal = {
  id?: number;
  userId: string;
  goal: string;
  targetDate: string;
  completed: boolean;
  progress: number;
  notes?: string;
  createdAt?: string;
};

const predefinedGoals = [
  "Reduce plastic usage",
  "Start composting",
  "Use public transportation more",
  "Switch to renewable energy",
  "Adopt a plant-based diet",
  "Reduce water consumption",
  "Start a vegetable garden",
  "Use eco-friendly cleaning products",
  "Reduce energy consumption at home",
  "Support sustainable businesses",
];

const SustainabilityGoalsComponent: React.FC = () => {
  const [goals, setGoals] = useState<SustainabilityGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState<
    Omit<SustainabilityGoal, "id" | "userId" | "createdAt">
  >({
    goal: "",
    targetDate: new Date().toISOString().split("T")[0],
    completed: false,
    progress: 0,
    notes: "",
  });
  const [editingGoal, setEditingGoal] = useState<SustainabilityGoal | null>(
    null
  );
  const [showPredefinedGoals, setShowPredefinedGoals] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/sustainabilityGoals");
      if (!response.ok) throw new Error("Failed to fetch goals");
      const data = await response.json();
      setGoals(data);
      toast.success("Sustainability goals loaded successfully");
    } catch (err) {
      setError("Failed to load sustainability goals. Please try again later.");
      toast.error("Failed to load sustainability goals");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setNewGoal((prev) => ({
      ...prev,
      [name]: name === "progress" ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const goalToSubmit = {
        ...newGoal,
        targetDate: new Date(newGoal.targetDate).toISOString(),
      };
      const response = await fetch("/api/sustainabilityGoals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalToSubmit),
      });
      if (!response.ok) throw new Error("Failed to add goal");
      await fetchGoals();
      setNewGoal({
        goal: "",
        targetDate: new Date().toISOString().split("T")[0],
        completed: false,
        progress: 0,
        notes: "",
      });
      toast.success("Goal added successfully");
    } catch (err) {
      setError(
        (err as Error).message || "An error occurred while adding the goal."
      );
      toast.error("Failed to add goal");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (goal: SustainabilityGoal) => {
    setLoading(true);
    try {
      const updatedGoal = {
        ...goal,
        targetDate: new Date(goal.targetDate).toISOString(),
      };
      const response = await fetch(`/api/sustainabilityGoals`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedGoal),
      });
      if (!response.ok) throw new Error("Failed to update goal");
      await fetchGoals();
      setEditingGoal(null);
      toast.success("Goal updated successfully");
    } catch (err) {
      setError(
        (err as Error).message || "An error occurred while updating the goal."
      );
      toast.error("Failed to update goal");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      setLoading(true);
      try {
        const response = await fetch(`/api/sustainabilityGoals?id=${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete goal");
        await fetchGoals();
        toast.success("Goal deleted successfully");
      } catch (err) {
        setError(
          (err as Error).message || "An error occurred while deleting the goal."
        );
        toast.error("Failed to delete goal");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const InputField: React.FC<{
    name: keyof Omit<SustainabilityGoal, "id" | "userId" | "createdAt">;
    label: string;
    icon: React.ReactNode;
    value: string | number;
    onChange: (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => void;
    type?: string;
  }> = ({ name, label, icon, value, onChange, type = "text" }) => (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-green-300 mb-1"
      >
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
        {type === "textarea" ? (
          <textarea
            id={name}
            name={name}
            value={value as string}
            onChange={onChange}
            className="mt-1 block w-full pl-10 pr-3 py-2 text-green-200 bg-green-900 bg-opacity-50 border border-green-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            rows={3}
          />
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="mt-1 block w-full pl-10 pr-3 py-2 text-green-200 bg-green-900 bg-opacity-50 border border-green-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required={name !== "notes"}
          />
        )}
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
      <h2 className="text-2xl font-bold mb-6 text-center text-green-400">
        Sustainability Goals
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <InputField
            name="goal"
            label="Goal"
            icon={<Target size={18} className="text-green-500" />}
            value={newGoal.goal}
            onChange={handleInputChange}
          />
          <button
            type="button"
            onClick={() => setShowPredefinedGoals(!showPredefinedGoals)}
            className="absolute right-2 top-9 text-green-400 hover:text-green-300"
          >
            <ChevronDown size={18} />
          </button>
          {showPredefinedGoals && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 mt-1 w-full bg-green-800 border border-green-600 rounded-md shadow-lg"
            >
              {predefinedGoals.map((goal, index) => (
                <button
                  key={index}
                  type="button"
                  className="block w-full text-left px-4 py-2 text-sm text-green-200 hover:bg-green-700"
                  onClick={() => {
                    setNewGoal((prev) => ({ ...prev, goal }));
                    setShowPredefinedGoals(false);
                  }}
                >
                  {goal}
                </button>
              ))}
            </motion.div>
          )}
        </div>
        <InputField
          name="targetDate"
          label="Target Date"
          icon={<Calendar size={18} className="text-green-500" />}
          value={newGoal.targetDate}
          onChange={handleInputChange}
          type="date"
        />
        <InputField
          name="progress"
          label="Progress (%)"
          icon={<Percent size={18} className="text-green-500" />}
          value={newGoal.progress}
          onChange={handleInputChange}
          type="number"
        />
        <InputField
          name="notes"
          label="Notes"
          icon={<FileText size={18} className="text-green-500" />}
          value={newGoal.notes || ""}
          onChange={handleInputChange}
          type="textarea"
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-green-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Goal"}
        </button>
      </form>
      {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-green-300 mb-4">
          Your Sustainability Goals
        </h3>
        {loading ? (
          <p className="text-green-200">Loading...</p>
        ) : goals.length > 0 ? (
          <ul className="space-y-2">
            {goals.map((goal) => (
              <li
                key={goal.id}
                className="bg-green-800 bg-opacity-50 p-3 rounded-md"
              >
                {editingGoal && editingGoal.id === goal.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdate(editingGoal);
                    }}
                    className="space-y-2"
                  >
                    <input
                      type="text"
                      value={editingGoal.goal}
                      onChange={(e) =>
                        setEditingGoal({ ...editingGoal, goal: e.target.value })
                      }
                      className="w-full p-2 bg-green-700 text-green-200 rounded-md"
                      required
                    />
                    <input
                      type="date"
                      value={editingGoal.targetDate.split("T")[0]}
                      onChange={(e) =>
                        setEditingGoal({
                          ...editingGoal,
                          targetDate: e.target.value,
                        })
                      }
                      className="w-full p-2 bg-green-700 text-green-200 rounded-md"
                      required
                    />
                    <input
                      type="number"
                      value={editingGoal.progress}
                      onChange={(e) =>
                        setEditingGoal({
                          ...editingGoal,
                          progress: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full p-2 bg-green-700 text-green-200 rounded-md"
                      required
                    />
                    <textarea
                      value={editingGoal.notes || ""}
                      onChange={(e) =>
                        setEditingGoal({
                          ...editingGoal,
                          notes: e.target.value,
                        })
                      }
                      className="w-full p-2 bg-green-700 text-green-200 rounded-md"
                      rows={3}
                    />
                    <div className="flex justify-between">
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingGoal(null)}
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-green-200">{goal.goal}</p>
                      <p className="text-sm text-green-400">
                        Target: {new Date(goal.targetDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-green-400">
                        Progress: {goal.progress}%
                      </p>
                      {goal.notes && (
                        <p className="text-sm text-green-300 mt-1">
                          Notes: {goal.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          handleUpdate({ ...goal, completed: !goal.completed })
                        }
                        className={`p-1 rounded-md ${
                          goal.completed
                            ? "bg-yellow-400 hover:bg-yellow-500"
                            : "bg-gray-600 hover:bg-gray-700"
                        } transition-colors duration-200`}
                        title={
                          goal.completed
                            ? "Mark as incomplete"
                            : "Mark as complete"
                        }
                      >
                        <Check
                          size={18}
                          className={
                            goal.completed ? "text-green-800" : "text-white"
                          }
                        />
                      </button>
                      <button
                        onClick={() => setEditingGoal(goal)}
                        className="p-1 bg-yellow-600 rounded-md hover:bg-yellow-700"
                        title="Edit goal"
                      >
                        <Edit size={18} className="text-white" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id!)}
                        className="p-1 bg-red-600 rounded-md hover:bg-red-700"
                        title="Delete goal"
                      >
                        <Trash size={18} className="text-white" />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-green-200">No sustainability goals added yet.</p>
        )}
      </div>
    </motion.div>
  );
};

export default SustainabilityGoalsComponent;
