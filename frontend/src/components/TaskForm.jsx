import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import taskService from '@/services/taskService';
import projectService from '@/services/projectService';

const TaskForm = ({ isOpen, onClose, projectId, onTaskCreated, editTask = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('unassigned');
  const [status, setStatus] = useState('Pending');
  const [priority, setPriority] = useState('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    // Fetch project data to get team members
const fetchProjectData = async () => {
  try {
    // Get project details which should include team members
    const projectData = await projectService.getProject(projectId);
    console.log('Project data:', projectData);

    if (projectData) {
      let teamMembers = [];

      // Check if we have team_members directly on the project
      if (Array.isArray(projectData.team_members)) {
        teamMembers = projectData.team_members.map(member => {
          // If it's a full object with id and name
          if (member && typeof member === 'object' && member.user_id && member.user_name) {
            return member;
          }
          // If it's just an ID string
          else if (typeof member === 'string') {
            return { id: member, name: `Team Member (${member.substring(0, 6)}...)` };
          }
          // If it's an object with user property containing the details
          else if (member && typeof member === 'object' && member.user) {
            return { id: member.user_id, name: member.user_name };
          }
          return null;
        }).filter(Boolean); // Remove any nulls
      }
      // If we have members in a different field like project_members
      else if (Array.isArray(projectData.project_members)) {
        teamMembers = projectData.project_members.map(member => {
          if (member && typeof member === 'object' && member.user) {
            return { id: member.user_id, name: member.user_name };
          }
          return null;
        }).filter(Boolean);
      }

      console.log('Processed team members:', teamMembers);
      setUsers(teamMembers);
    }
  } catch (err) {
    console.error('Error fetching project data:', err);
    setUsers([]);
  }
};

    fetchProjectData();

    // If editing, populate form with task data
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description || '');
      setDueDate(editTask.due_date ? format(new Date(editTask.due_date), 'yyyy-MM-dd') : '');
      setAssignedTo(editTask.assigned_to || 'unassigned');
      setStatus(editTask.status);
      setPriority(editTask.priority || 'Medium');
    }
  }, [projectId, editTask]);

  // Validate form fields
  const validateForm = () => {
    const errors = {};

    if (!title.trim()) {
      errors.title = 'Task title is required';
    }

    if (!status) {
      errors.status = 'Status is required';
    }

    // Due date validation is optional but you can add it if needed
    // if (!dueDate) {
    //   errors.dueDate = 'Due date is required';
    // }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const taskData = {
        title,
        description,
        due_date: dueDate,
        assigned_to: assignedTo === "unassigned" ? null : assignedTo,
        status,
        priority,
        project_id: projectId
      };

      let response;
      if (editTask) {
        response = await taskService.updateTask(editTask.id, taskData);
      } else {
        response = await taskService.createTask(taskData);
      }

      onTaskCreated(response);
      onClose();
    } catch (err) {
      console.error('Error submitting task:', err);

      if (err.response?.data?.detail) {
        const errorDetail = err.response.data.detail[0];
        setError(`API Error: ${errorDetail.msg}`);
      } else {
        setError('Failed to save task. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <div className="bg-red-50 p-3 rounded-md text-red-800 text-sm">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Task Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className={validationErrors.title ? "border-red-500" : ""}
            />
            {validationErrors.title && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assign To</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.user_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
              <Select
                value={status}
                onValueChange={setStatus}
                className={validationErrors.status ? "border-red-500" : ""}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.status && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.status}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? 'Saving...' : editTask ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;