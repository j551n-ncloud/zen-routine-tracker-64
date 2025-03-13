
import React, { useState } from "react";
import { 
  CheckCircle, 
  Plus,
  Droplets,
  Dumbbell,
  BookOpen,
  BedDouble,
  Coffee
} from "lucide-react";
import StreakBadge from "./StreakBadge";
import { cn } from "@/lib/utils";

// Sample habit categories and their associated icons
const habitCategories = [
  { id: "health", name: "Health", color: "text-green-500" },
  { id: "fitness", name: "Fitness", color: "text-orange-500" },
  { id: "learning", name: "Learning", color: "text-blue-500" },
  { id: "sleep", name: "Sleep", color: "text-purple-500" },
  { id: "mindfulness", name: "Mindfulness", color: "text-teal-500" },
];

// Sample habit data with streaks
const initialHabits = [
  { 
    id: 1, 
    name: "Drink Water", 
    streak: 12, 
    completed: false, 
    category: "health",
    icon: Droplets,
  },
  { 
    id: 2, 
    name: "Exercise", 
    streak: 5, 
    completed: false, 
    category: "fitness",
    icon: Dumbbell,
  },
  { 
    id: 3, 
    name: "Read Book", 
    streak: 8, 
    completed: false, 
    category: "learning",
    icon: BookOpen,
  },
  { 
    id: 4, 
    name: "8h Sleep", 
    streak: 3, 
    completed: false, 
    category: "sleep",
    icon: BedDouble,
  },
  { 
    id: 5, 
    name: "Meditation", 
    streak: 15, 
    completed: false, 
    category: "mindfulness",
    icon: Coffee,
  },
];

const HabitTracker: React.FC = () => {
  const [habits, setHabits] = useState(initialHabits);

  const toggleHabit = (id: number) => {
    setHabits(habits.map(habit => 
      habit.id === id 
        ? { 
            ...habit, 
            completed: !habit.completed,
            streak: !habit.completed ? habit.streak + 1 : habit.streak - 1
          } 
        : habit
    ));
  };

  const getCategoryColor = (categoryId: string) => {
    const category = habitCategories.find(c => c.id === categoryId);
    return category?.color || "text-gray-500";
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {habits.map(habit => (
          <div 
            key={habit.id}
            className="group relative bg-card rounded-xl border p-4 shadow-subtle hover-scale overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => toggleHabit(habit.id)}
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300",
                    habit.completed 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <habit.icon className="h-5 w-5" />
                </button>
                <div>
                  <h3 className="font-medium">{habit.name}</h3>
                  <span className={`text-xs ${getCategoryColor(habit.category)}`}>
                    {habitCategories.find(c => c.id === habit.category)?.name}
                  </span>
                </div>
              </div>
              
              <StreakBadge count={habit.streak} />
            </div>
            
            {/* Progress indicator bar at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-500 ease-out",
                  habit.completed ? "bg-primary" : "bg-primary/20 group-hover:bg-primary/40"
                )}
                style={{ width: `${(habit.streak / 30) * 100}%` }}
              />
            </div>
          </div>
        ))}
        
        {/* Add New Habit Card */}
        <div className="bg-card/50 rounded-xl border border-dashed p-4 flex items-center justify-center hover-scale cursor-pointer">
          <div className="flex flex-col items-center text-muted-foreground">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">Add New Habit</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;
