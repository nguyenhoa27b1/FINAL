
import React from 'react';
import { Task, Priority, User } from '../types';

interface TaskItemProps {
  task: Task;
  assignee?: User;
  onSelectTask: (task: Task) => void;
}

const priorityClasses = {
  [Priority.LOW]: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-500',
  },
  [Priority.MEDIUM]: {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    text: 'text-yellow-800 dark:text-yellow-200',
    border: 'border-yellow-500',
  },
  [Priority.HIGH]: {
    bg: 'bg-red-100 dark:bg-red-900',
    text: 'text-red-800 dark:text-red-200',
    border: 'border-red-500',
  },
};

const TaskItem: React.FC<TaskItemProps> = ({ task, assignee, onSelectTask }) => {
  const isOverdue = new Date(task.deadline) < new Date() && task.status === 'Pending';

  const priorityConfig = priorityClasses[task.priority];

  return (
    <div
      onClick={() => onSelectTask(task)}
      className={`p-4 rounded-lg shadow-md cursor-pointer transition-transform transform hover:scale-105 border-l-4 ${isOverdue ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/50' : priorityConfig.border} ${isOverdue ? '' : priorityConfig.bg}`}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{task.title}</h3>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityConfig.bg} ${priorityConfig.text}`}>
          {Priority[task.priority]}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 truncate">{task.description}</p>
      <div className="mt-4 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
        <div>
          <span>Deadline: </span>
          <span className={`font-medium ${isOverdue ? 'text-pink-600 dark:text-pink-400' : 'text-gray-700 dark:text-gray-200'}`}>
            {new Date(task.deadline).toLocaleDateString()}
          </span>
        </div>
        {assignee && (
          <div className="flex items-center">
            <span className="mr-2">Assignee:</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">{assignee.name || assignee.email.split('@')[0]}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
