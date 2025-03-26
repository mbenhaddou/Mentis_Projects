import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import useAuth from "@/hooks/useAuth";

import userService from '../services/userService';

// UI Components
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Checkbox } from '../components/ui/checkbox';

const UserForm = () => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  // Determine if we're editing a user
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      fetchUser(id);
    }
  }, [id]);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'Admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch user data if editing
  const fetchUser = async (userId) => {
    try {
      setLoading(true);
      const userData = await userService.getUser(userId);
      setCurrentUser(userData);

      // Set form values
      setValue('name', userData.name);
      setValue('email', userData.email);
      setValue('role', userData.role);
      setValue('is_active', userData.is_active);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setError('Failed to load user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit handler
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);

      if (isEditing) {
        // Update existing user
        await userService.updateUser(id, data);
      } else {
        // Create new user
        await userService.createUser(data);
      }

      // Redirect to users list
      navigate('/users');
    } catch (err) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} user:`, err);
      setError(
        err.response?.data?.detail ||
        `Failed to ${isEditing ? 'update' : 'create'} user. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/users')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">
            {isEditing ? 'Edit User' : 'Create New User'}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? 'Update user information and permissions'
              : 'Fill in the details to create a new user'}
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

          <form id="user-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter user's full name"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    },
                    maxLength: {
                      value: 100,
                      message: 'Name cannot exceed 100 characters'
                    }
                  })}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Password - only for new users */}
              {!isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Password must be at least 8 characters.
                  </p>
                </div>
              )}

              {/* Role */}
              <div className="space-y-3">
                <Label className="text-base">
                  Role <span className="text-red-500">*</span>
                </Label>
                <RadioGroup defaultValue="Contributor" className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="Admin"
                      id="role-admin"
                      {...register('role', { required: true })}
                    />
                    <Label htmlFor="role-admin" className="font-normal">Admin</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="Manager"
                      id="role-manager"
                      {...register('role')}
                    />
                    <Label htmlFor="role-manager" className="font-normal">Project Manager</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="Contributor"
                      id="role-contributor"
                      {...register('role')}
                    />
                    <Label htmlFor="role-contributor" className="font-normal">Contributor</Label>
                  </div>
                </RadioGroup>
                {errors.role && (
                  <p className="text-sm text-red-500">Role is required</p>
                )}
              </div>

              {/* Active status - only for editing */}
              {isEditing && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    {...register('is_active')}
                  />
                  <Label htmlFor="is_active" className="font-normal">
                    User is active
                  </Label>
                </div>
              )}
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/users')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="user-form"
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={loading}
          >
            {loading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create User')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserForm;