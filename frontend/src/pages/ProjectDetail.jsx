import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import updateService from '../services/updateService';
import userService from '../services/userService';
import TaskForm from '@/components/TaskForm';
import UserSelectForm from '@/components/UserSelectForm';
import ManageTeam from '@/components/ManageTeam';
import ConfirmationDialog from '@/components/ConfirmationDialog';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import useAuth from "@/hooks/useAuth";

import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  Clock,
  Edit,
  Plus,
  Trash2,
  Users
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [showManageTeamDialog, setShowManageTeamDialog] = useState(false);

  // New state for task deletion
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showDeleteTaskDialog, setShowDeleteTaskDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // New component for linked tasks
  const UpdateLinkedTasks = ({ taskIds, projectId }) => {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
      if (expanded && taskIds && taskIds.length > 0) {
        fetchLinkedTasks();
      }
    }, [expanded, taskIds]);

    const fetchLinkedTasks = async () => {
      try {
        setIsLoading(true);

        // Fetch tasks by IDs
        const taskPromises = update.linked_task_ids.map(id => {
          // Convert UUID to string if needed
        const taskId = typeof id === 'object' && id.hasOwnProperty('value')
            ? id.value.toString()
            : id.toString();

          console.log(`Fetching task with ID: ${taskId}`);
          return taskService.getTask(taskId);
        });
        const taskResults = await Promise.all(tasksPromises);

        setTasks(taskResults);
      } catch (err) {
        console.error('Error fetching linked tasks:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!taskIds || taskIds.length === 0) {
      return null;
    }

    return (
      <div className="mt-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none"
        >
          <span className="mr-1">{expanded ? '▼' : '►'}</span>
          {taskIds.length} Related Task{taskIds.length > 1 ? 's' : ''}
        </button>

        {expanded && (
          <div className="mt-2">
            {isLoading ? (
              <div className="text-sm text-gray-500">Loading tasks...</div>
            ) : (
              <div className="border rounded-md overflow-hidden text-sm">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className="p-3 border-b last:border-b-0 flex justify-between items-center hover:bg-gray-50"
                  >
                    <div>
                      <div className={`font-medium ${task.status === 'Done' ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        Due: {formatDate(task.due_date)}
                      </div>
                    </div>
                    {getStatusBadge(task.status)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Fetch project data when component mounts
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch project details
        const projectData = await projectService.getProject(id);
        setProject(projectData);

        // Fetch project updates
        const updatesData = await projectService.getProjectUpdates(id);
        setUpdates(updatesData);

        // Fetch project tasks
        const tasksData = await projectService.getProjectTasks(id);
        setTasks(tasksData);
      } catch (err) {
        console.error('Failed to fetch project data:', err);
        setError('Failed to load project data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
    if (project && project.team_members) {
      // Only normalize if needed - check if any member needs normalization
      const needsNormalization = project.team_members.some(
        member => (member.user_id && !member.id) || (member.user_name && !member.name)
      );

      if (needsNormalization) {
        // Normalize team member data to ensure it has consistent properties
        const normalizedMembers = project.team_members.map(member => ({
          id: member.id || member.user_id,
          name: member.name || member.user_name,
          email: member.email || member.user_email || '',
          role: member.role || 'Team Member',
          project_id: project.id
        }));

        // Update the project with normalized team members
        setProject(prev => ({
          ...prev,
          team_members: normalizedMembers
        }));

        console.log("Normalized team members:", normalizedMembers);
      }
    }
  },  [id]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate days remaining
  const getDaysRemaining = (startDate, endDate) => {
    const today = new Date();
    const end = new Date(endDate);

    // If project is not started yet
    if (new Date(startDate) > today) {
      return `Starts in ${Math.ceil((new Date(startDate) - today) / (1000 * 60 * 60 * 24))} days`;
    }

    // If project is completed
    if (today > end) {
      return 'Completed';
    }

    // Days remaining
    const daysRemaining = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return `${daysRemaining} days remaining`;
  };

  const handleAddMember = (newMember) => {
    setProject((prevProject) => ({
      ...prevProject,
      team_members: [...(prevProject.team_members || []), newMember],
    }));
  };

  // Remove a team member
  const handleRemoveMember = async (memberId) => {
    try {
      console.log("Removing member with ID:", memberId);

      if (!memberId) {
        console.error("Invalid member ID for removal");
        return;
      }

      await userService.removeUserFromProject(id, memberId);

      setProject(prev => ({
        ...prev,
        team_members: (prev.team_members || []).filter(member =>
          (member.id || member.user_id) !== memberId
        )
      }));
    } catch (err) {
      console.error('Failed to remove team member:', err);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      console.log(`Changing role for user ${userId} to ${newRole}`);

      // Call your user service to change the role
      await userService.changeProjectMemberRole(project.id, userId, newRole);

      // Update the local state to reflect the change
      setProject(prevProject => ({
        ...prevProject,
        team_members: prevProject.team_members.map(member =>
          member.user_id === userId || member.id === userId
            ? { ...member, role: newRole }
            : member
        )
      }));

      // Show success message
      console.log('Role updated successfully');
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  // Change a team member's role/privileges
  const handleChangeMemberRole = async (memberId, newRole) => {
    try {
      console.log("Changing role for member ID:", memberId, "to:", newRole);

      if (!memberId) {
        console.error("Invalid member ID for role change");
        return;
      }

      const updatedMember = await userService.changeUserRole(memberId, newRole);

      setProject(prev => ({
        ...prev,
        team_members: (prev.team_members || []).map(member =>
          (member.id || member.user_id) === memberId
            ? { ...member, role: newRole }
            : member
        )
      }));
    } catch (err) {
      console.error('Failed to change member role:', err);
    }
  };

  // Helper function to get the assigned user name from a task
  const getAssignedUserName = (task) => {
    // Check various possible field names for the assignee name
    if (task.assignee_name) return task.assignee_name;
    if (task.assigned_to_name) return task.assigned_to_name;
    if (task.assigned_user_name) return task.assigned_user_name;

    // If we have user data in team_members, try to match by ID
    if (task.assigned_to && project.team_members) {
      const assignedUser = project.team_members.find(
        member => (member.id === task.assigned_to || member.user_id === task.assigned_to)
      );
      if (assignedUser) {
        return assignedUser.name || assignedUser.user_name || 'Assigned User';
      }
    }

    // Check if there's any property that looks like it could be a user name
    for (const key in task) {
      if (
        typeof task[key] === 'string' &&
        key.toLowerCase().includes('user') &&
        key.toLowerCase().includes('name')
      ) {
        return task[key];
      }
    }

    // If we have an ID but no name, just show "Assigned"
    if (task.assigned_to) {
      return 'Assigned';
    }

    return 'Unassigned';
  };

  // Get status badge
  const getStatusBadge = (status) => {
    let className = '';

    switch(status) {
      case 'Active':
      case 'Done':
        className = 'bg-green-100 text-green-800';
        break;
      case 'Completed':
        className = 'bg-blue-100 text-blue-800';
        break;
      case 'On Hold':
        className = 'bg-yellow-100 text-yellow-800';
        break;
      case 'Pending':
        className = 'bg-gray-100 text-gray-800';
        break;
      case 'In Progress':
        className = 'bg-indigo-100 text-indigo-800';
        break;
      case 'Blocked':
        className = 'bg-red-100 text-red-800';
        break;
      default:
        className = 'bg-gray-100 text-gray-800';
    }

    return <Badge className={className}>{status}</Badge>;
  };

  // Handle project deletion
  const handleDeleteProject = async () => {
    try {
      await projectService.deleteProject(id);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to delete project:', err);
      setError('Failed to delete project. Please try again later.');
    }
  };

  // Handle adding a new weekly update
  const handleAddUpdate = () => {
    navigate(`/projects/${id}/updates/new`);
  };

  // Handle adding a new task
  const handleAddTask = () => {
    setSelectedTask(null);
    setShowTaskForm(true);
  };

  const handleTaskCreated = (newTask) => {
    // Add the new task to the tasks list
    setTasks([...tasks, newTask]);
  };

  // New function to handle task deletion
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      setIsDeleting(true);
      await taskService.deleteTask(taskToDelete.id);

      // Update local state to remove the deleted task
      setTasks(tasks.filter(task => task.id !== taskToDelete.id));

      // Show success message (you could implement a toast notification here)
      console.log(`Task "${taskToDelete.title}" deleted successfully`);
    } catch (error) {
      console.error('Failed to delete task:', error);
      // Show error message
    } finally {
      setIsDeleting(false);
      setTaskToDelete(null);
      setShowDeleteTaskDialog(false);
    }
  };

  // Function to confirm task deletion
  const confirmTaskDeletion = (task) => {
    setTaskToDelete(task);
    setShowDeleteTaskDialog(true);
  };

  // Handle editing the project
  const handleEditProject = () => {
    navigate(`/projects/${id}/edit`);
  };

  // Check if user is project manager or admin
  const isManagerOrAdmin = () => {
    return user && (user.role === 'Manager' || user.role === 'Admin');
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

  // Render error state
  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/dashboard')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <div className="bg-red-50 text-red-800 p-4 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <div>{error || 'Project not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/dashboard')}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {getStatusBadge(project.status)}
          </div>
          <p className="text-gray-500 mt-1">{project.description}</p>
        </div>

        {isManagerOrAdmin() && (
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              className="flex items-center"
              onClick={handleEditProject}
            >
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the project
                    and all associated data including weekly updates and tasks.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteProject}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {getStatusBadge(project.status)}
              <span className="ml-2 text-2xl font-semibold">{project.progress || 0}%</span>
            </div>
            <Progress value={project.progress || 0} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <div className="font-medium">
                  {formatDate(project.start_date)} - {formatDate(project.end_date)}
                </div>
                <div className="text-sm text-gray-500">
                  {getDaysRemaining(project.start_date, project.end_date)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-medium">{project.team_members?.length || 0} Members</span>
                <span className="text-sm text-gray-500">
                  {(project.team_members || []).map(m => m.name || m.user_name || 'Unknown').join(', ') || 'No team members'}
                </span>
              </div>
              {isManagerOrAdmin() && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddMemberForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowManageTeamDialog(true)}
                  >
                    <Users className="h-4 w-4 mr-1" /> Manage
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="updates">
        <TabsList>
          <TabsTrigger value="updates">Weekly Updates</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="updates" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Weekly Updates</h2>
            <Button onClick={handleAddUpdate}>
              <Plus className="h-4 w-4 mr-2" /> New Update
            </Button>
          </div>

          {updates.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 mb-4">No updates yet. Add your first weekly update.</p>
                <Button onClick={handleAddUpdate}>
                  <Plus className="h-4 w-4 mr-2" /> New Update
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {updates.map((update) => (
                <Card key={update.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">{formatDate(update.date)}</CardTitle>
                      {getStatusBadge(update.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Update Notes</h4>
                        <p>{update.notes}</p>
                      </div>
                      {update.ai_summary && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="text-sm font-medium text-gray-500 mb-1">AI Summary</h4>
                          <p className="text-sm">{update.ai_summary}</p>
                        </div>
                      )}

                      {/* Add linked tasks component here */}
                      {update.linked_task_ids && update.linked_task_ids.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Related Tasks</h4>
                          <UpdateLinkedTasks taskIds={update.linked_task_ids} projectId={project.id} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        console.log(`Navigating to update details: /projects/${id}/updates/${update.id}`);
                        navigate(`/projects/${id}/updates/${update.id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Tasks</h2>
            <Button onClick={handleAddTask}>
              <Plus className="h-4 w-4 mr-2" /> Add Task
            </Button>
          </div>

          {tasks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500 mb-4">No tasks yet. Add your first task.</p>
                <Button onClick={handleAddTask}>
                  <Plus className="h-4 w-4 mr-2" /> Add Task
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className={task.status === 'Done' ? 'line-through text-gray-500' : ''}>
                            {task.title}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {getAssignedUserName(task)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {formatDate(task.due_date)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(task.status)}
                        </td>
                        <td className="px-6 py-4">
                          {task.priority && (
                            <Badge className={
                              task.priority === 'High' ? 'bg-red-100 text-red-800' :
                              task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }>
                              {task.priority}
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/projects/${id}/tasks/${task.id}`)}
                          >
                            View
                          </Button>
                          {isManagerOrAdmin() && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => confirmTaskDeletion(task)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {showAddMemberForm && (
        <UserSelectForm
          isOpen={showAddMemberForm}
          onClose={() => setShowAddMemberForm(false)}
          projectId={id}
          existingMembers={project.team_members || []}
          onUserAdded={(newMember) => {
            handleAddMember(newMember);
          }}
        />
      )}

      {showManageTeamDialog && (
        <ManageTeam
          isOpen={showManageTeamDialog}
          onClose={() => setShowManageTeamDialog(false)}
          teamMembers={project.team_members || []}
          projectId={project.id} // Make sure this is defined
          onRoleChange={handleRoleChange}
          onRemove={handleRemoveMember}
        />
      )}

      {showTaskForm && (
        <TaskForm
          isOpen={showTaskForm}
          onClose={() => setShowTaskForm(false)}
          projectId={id}
          onTaskCreated={handleTaskCreated}
        />
      )}

      {/* Task Deletion Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteTaskDialog}
        onClose={() => setShowDeleteTaskDialog(false)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        description={taskToDelete ? `Are you sure you want to delete "${taskToDelete.title}"? This action cannot be undone.` : 'Are you sure you want to delete this task?'}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        confirmVariant="destructive"
      />
    </div>
  );
};

export default ProjectDetail;