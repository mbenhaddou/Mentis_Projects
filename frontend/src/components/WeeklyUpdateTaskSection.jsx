// src/components/WeeklyUpdateTaskSection.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, CheckCircle2, CircleAlert, CircleDashed } from 'lucide-react';
import taskService from '@/services/taskService';

const WeeklyUpdateTaskSection = ({ projectId, onTasksSelected, selectedTaskIds = [] }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    completionRate: 0
  });

  useEffect(() => {
    if (projectId) {
      fetchProjectTasks();
    }
  }, [projectId]);

  const fetchProjectTasks = async () => {
    try {
      setIsLoading(true);
      const response = await taskService.getProjectTasks(projectId);
      setTasks(response);
      
      // Calculate statistics
      const total = response.length;
      const completed = response.filter(task => task.status === 'Done').length;
      const inProgress = response.filter(task => task.status === 'In Progress').length;
      const pending = response.filter(task => task.status === 'Pending').length;
      
      setStatistics({
        total,
        completed,
        inProgress,
        pending,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      });
    } catch (error) {
      console.error('Failed to fetch project tasks:', error);
      setError('Could not load project tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskToggle = (taskId) => {
    // If already selected, remove it
    if (selectedTaskIds.includes(taskId)) {
      onTasksSelected(selectedTaskIds.filter(id => id !== taskId));
    } else {
      // Otherwise add it
      onTasksSelected([...selectedTaskIds, taskId]);
    }
  };

  if (isLoading) {
    return <div className="py-4 text-center">Loading tasks...</div>;
  }

  if (error) {
    return (
      <div className="py-4 text-center text-red-500">
        <p>{error}</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={fetchProjectTasks}>
          Try Again
        </Button>
      </div>
    );
  }

  // Group tasks by status
  const completedTasks = tasks.filter(task => task.status === 'Done');
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress');
  const pendingTasks = tasks.filter(task => task.status === 'Pending');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Progress</CardTitle>
          <CardDescription>Current project task statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Overall Completion</span>
                <span className="text-sm font-medium">{statistics.completionRate}%</span>
              </div>
              <Progress value={statistics.completionRate} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="rounded-lg border p-3">
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <div className="text-sm font-medium">Completed</div>
                </div>
                <div className="mt-1 text-2xl font-bold">{statistics.completed}</div>
              </div>
              
              <div className="rounded-lg border p-3">
                <div className="flex items-center">
                  <CircleDashed className="h-5 w-5 text-blue-500 mr-2" />
                  <div className="text-sm font-medium">In Progress</div>
                </div>
                <div className="mt-1 text-2xl font-bold">{statistics.inProgress}</div>
              </div>
              
              <div className="rounded-lg border p-3">
                <div className="flex items-center">
                  <CircleAlert className="h-5 w-5 text-yellow-500 mr-2" />
                  <div className="text-sm font-medium">Pending</div>
                </div>
                <div className="mt-1 text-2xl font-bold">{statistics.pending}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Link Tasks to Update</CardTitle>
          <CardDescription>Select tasks relevant to this weekly update</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedTasks.length > 0 && (
              <div>
                <h4 className="font-medium text-green-600 mb-2 flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Completed Tasks
                </h4>
                <div className="space-y-2 pl-2">
                  {completedTasks.map(task => (
                    <div key={task.id} className="flex items-start space-x-2">
                      <Checkbox 
                        id={`task-${task.id}`} 
                        checked={selectedTaskIds.includes(task.id)}
                        onCheckedChange={() => handleTaskToggle(task.id)}
                      />
                      <Label 
                        htmlFor={`task-${task.id}`}
                        className="text-sm leading-tight cursor-pointer"
                      >
                        {task.title}
                        <div className="text-xs text-gray-500">Completed on: {new Date(task.updated_at || task.due_date).toLocaleDateString()}</div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {inProgressTasks.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-600 mb-2 flex items-center">
                  <CircleDashed className="h-4 w-4 mr-1" /> In Progress Tasks
                </h4>
                <div className="space-y-2 pl-2">
                  {inProgressTasks.map(task => (
                    <div key={task.id} className="flex items-start space-x-2">
                      <Checkbox 
                        id={`task-${task.id}`} 
                        checked={selectedTaskIds.includes(task.id)}
                        onCheckedChange={() => handleTaskToggle(task.id)}
                      />
                      <Label 
                        htmlFor={`task-${task.id}`}
                        className="text-sm leading-tight cursor-pointer"
                      >
                        {task.title}
                        <div className="text-xs text-gray-500">Due: {new Date(task.due_date).toLocaleDateString()}</div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {pendingTasks.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-600 mb-2 flex items-center">
                  <CircleAlert className="h-4 w-4 mr-1" /> Pending Tasks
                </h4>
                <div className="space-y-2 pl-2">
                  {pendingTasks.map(task => (
                    <div key={task.id} className="flex items-start space-x-2">
                      <Checkbox 
                        id={`task-${task.id}`} 
                        checked={selectedTaskIds.includes(task.id)}
                        onCheckedChange={() => handleTaskToggle(task.id)}
                      />
                      <Label 
                        htmlFor={`task-${task.id}`}
                        className="text-sm leading-tight cursor-pointer"
                      >
                        {task.title}
                        <div className="text-xs text-gray-500">Due: {new Date(task.due_date).toLocaleDateString()}</div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No tasks found for this project.</p>
                <Button variant="outline" size="sm" className="mt-4">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyUpdateTaskSection;