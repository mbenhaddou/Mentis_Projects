import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectService from '../services/projectService';
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
import { format, addMonths } from 'date-fns';
import useAuth from "@/hooks/useAuth";


const ProjectForm = () => {
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(addMonths(new Date(), 3), 'yyyy-MM-dd'),
    status: 'Active',
    team_members: []
  });
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch project data if editing
  useEffect(() => {
    const fetchProject = async () => {
      if (!isEditing) return;

      try {
        setLoading(true);
        setError(null);

        const projectData = await projectService.getProject(id);

        setFormData({
          name: projectData.name,
          description: projectData.description || '',
          start_date: format(new Date(projectData.start_date), 'yyyy-MM-dd'),
          end_date: format(new Date(projectData.end_date), 'yyyy-MM-dd'),
          status: projectData.status,
          team_members: projectData.team_members?.map(member => member.id) || []
        });
      } catch (err) {
        console.error('Failed to fetch project:', err);
        setError('Failed to load project data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, isEditing]);

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

      if (isEditing) {
        // Update existing project
        await projectService.updateProject(id, formData);
      } else {
        // Create new project
        await projectService.createProject(formData);
      }

      setSuccess(true);

      // Navigate back to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Failed to submit project:', err);

      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to submit project. Please try again later.');
      }

      setSubmitting(false);
    }
  };

  // Handle cancellation
  const handleCancel = () => {
    navigate(isEditing ? `/projects/${id}` : '/dashboard');
  };

  // Validate if user can create/edit projects
  useEffect(() => {
    if (user && user.role !== 'Admin' && user.role !== 'Manager') {
      setError('You do not have permission to create or edit projects.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  }, [user, navigate]);

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
        <ChevronLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <h1 className="text-3xl font-bold mb-6">
        {isEditing ? 'Edit Project' : 'Create New Project'}
      </h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            {isEditing ? 'Project successfully updated.' : 'Project successfully created.'}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Project Details' : 'Project Details'}</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Update your project information below'
              : 'Fill in the information to create a new project'
            }
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter project name"
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
                placeholder="Describe the project's purpose and goals"
                className="min-h-32"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

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
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* In a real application, you would add team member selection here */}
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
                : (isEditing ? 'Save Changes' : 'Create Project')
              }
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ProjectForm;