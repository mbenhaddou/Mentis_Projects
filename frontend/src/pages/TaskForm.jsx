import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select';
import { Label } from '../components/ui/label';
import {
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { format } from 'date-fns';
import useAuth from "@/hooks/useAuth";


const TaskForm = () => {
  const { id: projectId, taskId } = useParams();

  const isEditing = !!taskId;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Pending',
    priority: 'Medium',
    due_date: '',
    assigned_to: 'none'
  });
  const [project, setProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch project, team members, and task data if editing
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch project details
        const projectData = await projectService.getProject(projectId);
        setProject(projectData);

        // Set team members from project data
        if (projectData.team_members) {
          setTeamMembers(projectData.team_members);
        }

        // If editing, fetch task details
        if (isEditing) {
          const taskData = await taskService.getTask(taskId);

          setFormData({
            title: taskData.title,
            description: taskData.description || '',
            status: taskData.status,
            priority: taskData.priority || 'Medium',
            due_date: taskData.due_date ? format(new Date(taskData.due_date), 'yyyy-MM-dd') : '',
            assigned_to: taskData.assigned_to || 'none'
          });
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, taskId, isEditing]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle select field changes
  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      // Prepare task data
      const taskData = {
        ...formData,
        assigned_to: formData.assigned_to === "none" ? null : formData.assigned_to,
        project_id: projectId
      };

      if (isEditing) {
        // Update existing task
        await taskService.updateTask(taskId, taskData);
      } else {
        // Create new task
        await taskService.createTask(taskData);
      }

      setSuccess(true);

      // Navigate back to project after short delay
      setTimeout(() => {
        navigate(`/projects/${projectId}`);
      }, 1500);
    } catch (err) {
      console.error('Failed to submit task:', err);

      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to submit task. Please try again later.');
      }

      setSubmitting(false);
    }
  };

  // Handle cancellation
  const handleCancel = () => {
    navigate(`/projects/${projectId}`);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={handleCancel}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Project
      </Button>

      <h1 className="text-3xl font-bold mb-2">
        {isEditing ? 'Edit Task' : 'Add Task'}
      </h1>
      <p className="text-gray-500 mb-6">Project: {project?.name}</p>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            {isEditing ? 'Task successfully updated.' : 'Task successfully created.'}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Task' : 'New Task'}</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Update task details below'
              : 'Create a new task for this project'
            }
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter task title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the task in detail"
                className="min-h-20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
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

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleSelectChange('priority', value)}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  name="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_to">Assigned To</Label>
                <Select
                  value={formData.assigned_to}
                  onValueChange={(value) => handleSelectChange('assigned_to', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.user_id} value={member.user_id}>
                        {member.user_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={submitting}
            >
              {submitting
                ? (isEditing ? 'Saving...' : 'Creating...')
                : (isEditing ? 'Save Changes' : 'Create Task')
              }
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default TaskForm;