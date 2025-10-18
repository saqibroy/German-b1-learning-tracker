import { useState, useEffect } from 'react';
import { initialDataStructure } from '../data/initialData';

/**
 * Custom hook for managing learning data with localStorage persistence
 */
export const useLearningData = () => {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('germanLearningData');
      return saved ? JSON.parse(saved) : initialDataStructure;
    } catch (e) {
      console.error("Could not load data from localStorage, resetting.", e);
      return initialDataStructure;
    }
  });

  useEffect(() => {
    localStorage.setItem('germanLearningData', JSON.stringify(data));
  }, [data]);

  const startPlan = () => {
    const today = new Date().toISOString().split('T')[0];
    setData(prev => ({
      ...prev,
      startDate: today
    }));
  };

  const toggleSubtask = (weekNum, dayNum, subtaskIndex) => {
    setData(prev => ({
      ...prev,
      weeks: prev.weeks.map(w =>
        w.week === weekNum
          ? {
              ...w,
              days: w.days.map(d =>
                d.day === dayNum ? (
                    (() => {
                        const newSubtasks = d.subtasks.map((sub, index) =>
                            index === subtaskIndex ? { ...sub, completed: !sub.completed } : sub
                        );
                        const allSubtasksCompleted = newSubtasks.every(sub => sub.completed);
                        return { ...d, subtasks: newSubtasks, completed: allSubtasksCompleted };
                    })()
                ) : d
              )
            }
          : w
      )
    }));
  };

  const updateNotes = (weekNum, dayNum, notes) => {
    setData(prev => ({
      ...prev,
      weeks: prev.weeks.map(w =>
        w.week === weekNum
          ? {
              ...w,
              days: w.days.map(d =>
                d.day === dayNum ? { ...d, notes } : d
              )
            }
          : w
      )
    }));
  };

  const updateGoal = (weekNum, goal) => {
    setData(prev => ({
      ...prev,
      weeks: prev.weeks.map(w =>
        w.week === weekNum
          ? { ...w, goal }
          : w
      )
    }));
  };

  const resetProgress = () => {
    localStorage.removeItem('germanLearningData');
    setData(initialDataStructure);
  };

  return {
    data,
    startPlan,
    toggleSubtask,
    updateNotes,
    updateGoal,
    resetProgress,
  };
};
