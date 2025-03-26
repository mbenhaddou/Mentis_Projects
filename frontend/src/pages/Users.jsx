import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/toast"; // Fixed import path
import {
  Plus,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  Check,
  X,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';

import userService from '../services/userService';
import useAuth from "@/hooks/useAuth";
import DeleteUserDialog from '../components/DeleteUserDialog';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    userId: null,
    userName: '',
    isDeleting: false
  });

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // When opening the delete dialog, include the user name
  const openDeleteDialog = (userId, userName) => {
    setDeleteDialog({
      isOpen: true,
      userId,
      userName,
      isDeleting: false
    });
  };

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await userService.getUsers();
        setUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // Only run on mount, not on every render

  // Filter users when search term or role filter changes
  useEffect(() => {
    if (!users.length) return;

    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        user =>
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.role.toLowerCase().includes(term)
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]); // Proper dependencies

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]); // Only depend on error

  // Handle creating a new user
  const handleCreateUser = () => {
    navigate('/users/new');
  };

  // Handle editing a user
  const handleEditUser = (userId) => {
    navigate(`/users/${userId}/edit`);
  };

  // Handle deleting a user
  const handleDeleteUser = async () => {
    if (!deleteDialog.userId) return;
    setError(null);

    try {
      // Set deleting state to true
      setDeleteDialog(prev => ({ ...prev, isDeleting: true }));

      await userService.deleteUser(deleteDialog.userId);

      // Update local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== deleteDialog.userId));
      setDeleteDialog({ isOpen: false, userId: null, userName: '', isDeleting: false });

      toast({
        title: "User deleted",
        description: "The user was successfully deleted.",
      });
    } catch (err) {
      console.error('Failed to delete user:', err);
      //setError('Failed to delete user. Please try again.');

      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });

      // Reset deleting state on error
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // Toggle user active status
  const toggleUserActive = async (userId, currentStatus) => {
    try {
      await userService.setUserActive(userId, !currentStatus);

      // Update local state - use functional update to avoid stale state
      setUsers(prevUsers => prevUsers.map(user =>
        user.id === userId ? {...user, is_active: !currentStatus} : user
      ));
    } catch (err) {
      console.error('Failed to update user status:', err);
      setError('Failed to update user status. Please try again.');

      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Render role badge
  const getRoleBadge = (role) => {
    let className = '';

    switch(role) {
      case 'Admin':
        className = 'bg-red-100 text-red-800';
        break;
      case 'Manager':
        className = 'bg-blue-100 text-blue-800';
        break;
      case 'Contributor':
        className = 'bg-green-100 text-green-800';
        break;
      default:
        className = 'bg-gray-100 text-gray-800';
    }

    return <Badge className={className}>{role}</Badge>;
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  // Render error message with dismiss button
  const errorMessage = error && (
    <div className="mb-8">
      <div className="bg-red-50 text-red-800 p-4 rounded-md flex items-start justify-between">
        <div className="flex">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <div>{error}</div>
        </div>
        <button
          onClick={() => setError(null)}
          className="text-red-600 hover:text-red-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-500 mt-1">Manage system users</p>
        </div>

        {(user?.role === 'Admin') && (
          <Button
            className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700"
            onClick={handleCreateUser}
          >
            <Plus className="mr-2 h-4 w-4" /> New User
          </Button>
        )}
      </div>

      {errorMessage}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10 max-w-sm"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <select
            className="px-3 py-2 border rounded-md"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Contributor">Contributor</option>
          </select>

          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" /> More Filters
          </Button>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-600">No users found</h3>
          <p className="text-gray-500 mt-2">
            {users.length > 0
              ? "Try adjusting your filters"
              : "No users have been created yet"}
          </p>

          {(user?.role === 'Admin') && users.length === 0 && (
            <Button
              className="mt-4 bg-indigo-600 hover:bg-indigo-700"
              onClick={handleCreateUser}
            >
              <Plus className="mr-2 h-4 w-4" /> Create User
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-md shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((userData) => (
                  <tr key={userData.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-800 font-medium">
                              {userData.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{userData.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{userData.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(userData.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {userData.is_active ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(userData.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {/* Toggle active status button */}
                        {user.role === 'Admin' && user.id !== userData.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleUserActive(userData.id, userData.is_active)}
                            title={userData.is_active ? "Deactivate User" : "Activate User"}
                          >
                            {userData.is_active ? (
                              <X className="h-4 w-4 text-red-500" />
                            ) : (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                        )}

                        {/* Edit button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(userData.id)}
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>

                        {/* Delete button - only for admins and not for themselves */}
                        {user.role === 'Admin' && user.id !== userData.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(userData.id, userData.name)}
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteUserDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({
          isOpen: false,
          userId: null,
          userName: '',
          isDeleting: false
        })}
        onConfirm={handleDeleteUser}
        userName={deleteDialog.userName}
        isDeleting={deleteDialog.isDeleting}
      />
    </div>
  );
};

export default Users;