import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import userService from '../services/userService';

const UserSelectForm = ({ isOpen, onClose, projectId, onUserAdded, existingMembers = [] }) => {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('Team Member');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch available users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await userService.getUsers();

        // Filter out users already in the project
        const existingMemberIds = existingMembers.map(member => member.id);
        const availableUsers = response.filter(user => !existingMemberIds.includes(user.id));

        setUsers(availableUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, existingMembers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setError('Please select a user');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await userService.addUserToProject(projectId, userId, role);
      onUserAdded(response);
      onClose();
    } catch (err) {
      console.error('Error adding user to project:', err);
      setError('Failed to add user to project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <div className="bg-red-50 p-3 rounded-md text-red-800 text-sm">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="user">Select User</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger id="user">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
                              <SelectContent>
                  {users.length === 0 ? (
                    <SelectItem value="_no_users" disabled>No available users</SelectItem>
                  ) : (
                    users.map((user) => (
                      <SelectItem key={user.id} value={user.id || `user-${Math.random()}`}>
                        {user.name || user.user_name || 'Unknown'} {user.email ? `(${user.email})` : ''}
                      </SelectItem>
                    ))
                  )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role in Project</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Project Manager">Project Manager</SelectItem>
                <SelectItem value="Team Member">Team Member</SelectItem>
                <SelectItem value="Observer">Observer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !userId}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserSelectForm;