import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

import useAuth from '../../hooks/useAuth';
import projectService from '../services/projectService';

// UI Components
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';

const NewProject = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get today's date and format for min date in date inputs
  const today = format(new Date(), 'yyyy-MM-dd');

  // Submit handler
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);

      // Parse dates to ISO format
  const projectData = {
      name: data.name,
      description: data.description,
      start_date: data.start_date, // Make sure this is in YYYY-MM-DD format
      end_date: data.end_date,     // Make sure this is in YYYY-MM-DD format
      status: data.status || 'Active'
    };

console.log('Submitting project data:', projectData);

      // Call API to create project
      const result = await projectService.createProject(projectData);

      // Redirect to new project page
      navigate(`/projects/${result.id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
      setError(
        err.response?.data?.detail ||
        'Failed to create project. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Check if user can create projects
  useEffect(() => {
    if (user && user.role !== 'Admin' && user.role !== 'Manager') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/dashboard')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Create New Project</CardTitle>
          <CardDescription>
            Fill in the details below to create a new project
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-6">
              <div className="bg-red-50 text-red-800 p-4 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                <div>{error}</div>
              </div>
            </div>
          )}

          <form id="project-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">
                  Project Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter project name"
                  {...register('name', {
                    required: 'Project name is required',
                    maxLength: {
                      value: 100,
                      message: 'Project name cannot exceed 100 characters'
                    }
                  })}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Project Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter project description"
                  className="min-h-[100px]"
                  {...register('description')}
                />
              </div>

              {/* Project Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="start_date" className="text-base">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    min={today}
                    {...register('start_date', {
                      required: 'Start date is required'
                    })}
                  />
                  {errors.start_date && (
                    <p className="text-sm text-red-500">{errors.start_date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date" className="text-base">
                    End Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="end_date"
                    type="date"
                    min={today}
                    {...register('end_date', {
                      required: 'End date is required',
                      validate: {
                        afterStartDate: (value, formValues) =>
                          !formValues.start_date || new Date(value) >= new Date(formValues.start_date) ||
                          'End date must be after start date'
                      }
                    })}
                  />
                  {errors.end_date && (
                    <p className="text-sm text-red-500">{errors.end_date.message}</p>
                  )}
                </div>
              </div>

              {/* Project Status */}
              <div className="space-y-3">
                <Label className="text-base">
                  Status <span className="text-red-500">*</span>
                </Label>
                <RadioGroup defaultValue="Active" className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="Active"
                      id="status-active"
                      {...register('status', { required: true })}
                    />
                    <Label htmlFor="status-active" className="font-normal">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="On Hold"
                      id="status-onhold"
                      {...register('status')}
                    />
                    <Label htmlFor="status-onhold" className="font-normal">On Hold</Label>
                  </div>
                </RadioGroup>
                {errors.status && (
                  <p className="text-sm text-red-500">Status is required</p>
                )}
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="project-form"
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={loading}
          >
            {loading ? 'Creating Project...' : 'Create Project'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NewProject;