import React from 'react';
import { User, Task } from '../types';
import TaskList from './TaskList';

interface UserTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  tasks: Task[];
  users: User[];
  onSelectTask: (task: Task) => void;
}

const UserTasksModal: React.FC<UserTasksModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  tasks, 
  users, 
  onSelectTask 
}) => {
  if (!isOpen || !user) return null;

  const userTasks = tasks.filter(task => task.assignee_id === user.user_id);
  const pendingTasks = userTasks.filter(task => task.status === 'Pending');
  const completedTasks = userTasks.filter(task => task.status === 'Completed');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tasks for <span className="text-indigo-600 dark:text-indigo-400">{user.email}</span>
          </h2>
          <button onClick={onClose} className="text-gray-500 text-3xl font-light hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">&times;</button>
        </div>
        
        <div className="space-y-8">
            <TaskList
                title="Pending Tasks"
                tasks={pendingTasks}
                users={users}
                onSelectTask={onSelectTask}
            />
            <TaskList
                title="Completed Tasks"
                tasks={completedTasks}
                users={users}
                onSelectTask={onSelectTask}
            />
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={onClose} className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 font-bold py-2 px-4 rounded-md">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserTasksModal;
