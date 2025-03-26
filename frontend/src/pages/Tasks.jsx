// src/pages/Tasks.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import taskService from '../services/taskService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Call your actual API service to get tasks assigned to the current user
      const response = await taskService.getMyTasks();
      setTasks(response);

    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus);

      // Update local state
      setTasks(tasks.map(task =>
        task.id === taskId
          ? { ...task, status: newStatus }
          : task
      ));

      console.log(`Task ${taskId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowTaskDialog(true);
  };

  const handleSaveTask = async () => {
    if (!selectedTask) return;

    try {
      setIsSubmitting(true);

      await taskService.updateTask(selectedTask.id, selectedTask);

      // Update the task in the local state
      setTasks(tasks.map(task =>
        task.id === selectedTask.id ? selectedTask : task
      ));

      setShowTaskDialog(false);
      console.log('Task updated successfully');
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to determine task status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Done':
        return 'text-green-500';
      case 'In Progress':
        return 'text-blue-500';
      case 'Pending':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  // Function to determine priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format the date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format date for input field
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <Button onClick={() => fetchTasks()}>
          Refresh Tasks
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading tasks...</p>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-red-400" />
              <h3 className="mt-2 text-lg font-medium">Error Loading Tasks</h3>
              <p className="mt-1 text-gray-500">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => fetchTasks()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No tasks yet</h3>
              <p className="mt-1 text-gray-500">You don't have any assigned tasks currently.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex justify-between border-b p-4">
                  <div className="flex-1">
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-gray-500">
                      Project: {task.project_name || task.project?.name || 'Unknown project'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditTask(task)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'Pending')}>
                          Mark as Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'In Progress')}>
                          Mark as In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'Done')}>
                          Mark as Done
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Due: {formatDate(task.due_date)}</span>
                  </div>
                  <div className={`flex items-center text-sm ${getStatusColor(task.status)}`}>
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{task.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Task Edit Dialog */}
      {selectedTask && (
        <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={selectedTask.title || ''}
                  onChange={(e) => setSelectedTask({...selectedTask, title: e.target.value})}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={selectedTask.description || ''}
                  onChange={(e) => setSelectedTask({...selectedTask, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={selectedTask.status}
                    onValueChange={(value) => setSelectedTask({...selectedTask, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={selectedTask.priority}
                    onValueChange={(value) => setSelectedTask({...selectedTask, priority: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formatDateForInput(selectedTask.due_date)}
                  onChange={(e) => setSelectedTask({...selectedTask, due_date: e.target.value})}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTaskDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveTask} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Tasks;