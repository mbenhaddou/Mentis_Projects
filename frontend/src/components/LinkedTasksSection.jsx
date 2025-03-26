// src/components/LinkedTasksSection.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, CircleDashed, CircleAlert } from 'lucide-react';
import taskService from '@/services/taskService';


const LinkedTasksSection = ({ taskIds = [] }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!taskIds.length) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch all tasks in parallel
        const tasksPromises = taskIds.map(id => taskService.getTask(id));
        const tasksData = await Promise.all(tasksPromises);

        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching linked tasks:', error);
        setError('Could not load linked tasks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [taskIds]);

  if (isLoading) {
    return <div className="text-center py-4">Loading linked tasks...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  if (!taskIds.length) {
    return null; // Don't show anything if no tasks are linked
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Done':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'In Progress':
        return <CircleDashed className="h-4 w-4 text-blue-500" />;
      case 'Pending':
        return <CircleAlert className="h-4 w-4 text-yellow-500" />;
      default:
        return <CircleAlert className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Linked Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <ul className="space-y-2">
            {tasks.map(task => (
              <li key={task.id} className="flex items-center p-2 rounded-md hover:bg-gray-50">
                <div className="mr-2">{getStatusIcon(task.status)}</div>
                <div className="flex-1">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-xs text-gray-500">
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    task.status === 'Done'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : task.status === 'In Progress'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }
                >
                  {task.status}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No tasks could be loaded
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LinkedTasksSection;