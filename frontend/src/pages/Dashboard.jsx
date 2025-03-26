import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '../components/ui/tabs';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Plus,
  Search as SearchIcon,
  Settings,
  Users
} from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import useAuth from "@/hooks/useAuth";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch projects - either all projects or just user's projects
        const projectsData = await projectService.getMyProjects();
        setProjects(projectsData);
        setFilteredProjects(projectsData);

        // Fetch tasks assigned to current user
        const tasksData = await taskService.getMyTasks();
        setMyTasks(tasksData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter projects when search term or status filter changes
  useEffect(() => {
    if (!projects.length) return;

    let filtered = [...projects];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        project =>
          project.name.toLowerCase().includes(term) ||
          project.description.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    setFilteredProjects(filtered);
  }, [searchTerm, statusFilter, projects]);

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

  // Get status badge color
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

  // Get priority badge
  const getPriorityBadge = (priority) => {
    if (!priority) return null;

    let className = '';
    switch(priority) {
      case 'High':
        className = 'bg-red-100 text-red-800';
        break;
      case 'Medium':
        className = 'bg-yellow-100 text-yellow-800';
        break;
      case 'Low':
        className = 'bg-green-100 text-green-800';
        break;
      default:
        className = 'bg-gray-100 text-gray-800';
    }

    return <Badge className={className}>{priority}</Badge>;
  };

  // Handle creating a new project
  const handleCreateProject = () => {
    console.log('Create project button clicked');
    navigate('/projects/new');
    console.log('Navigation attempted');
  };

  // Handle completing a task
  const handleCompleteTask = async (taskId, e) => {
    e.stopPropagation();
    try {
      await taskService.completeTask(taskId);

      // Update local state
      setMyTasks(myTasks.map(task =>
        task.id === taskId ? {...task, status: 'Done'} : task
      ));
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
        </div>

        {(user?.role === 'Admin' || user?.role === 'Manager') && (
          <Button
            className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700"
            onClick={handleCreateProject}
          >
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-8">
          <div className="bg-red-50 text-red-800 p-4 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <div>{error}</div>
          </div>
        </div>
      )}

      <Tabs defaultValue="projects">
        <TabsList className="mb-8">
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                className="pl-10 max-w-sm"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <select
                className="px-3 py-2 border rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>

              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" /> More Filters
              </Button>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-600">No projects found</h3>
              <p className="text-gray-500 mt-2">
                {projects.length > 0
                  ? "Try adjusting your filters"
                  : "You're not assigned to any projects yet"}
              </p>

              {(user?.role === 'Admin' || user?.role === 'Manager') && projects.length === 0 && (
                <Button
                  className="mt-4 bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleCreateProject}
                >
                  <Plus className="mr-2 h-4 w-4" /> Create Your First Project
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Admin Tools Card - Only shown to Admins */}
              {user?.role === 'Admin' && (
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2 bg-indigo-50">
                    <CardTitle className="text-xl">Admin Tools</CardTitle>
                    <CardDescription>
                      Manage users and system settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => navigate('/users')}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        User Management
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => navigate('/settings')}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        System Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl truncate">{project.name}</CardTitle>
                      {getStatusBadge(project.status)}
                    </div>
                    <CardDescription className="line-clamp-2 h-10">
                      {project.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pb-2">
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{project.progress || 0}%</span>
                      </div>
                      <Progress value={project.progress || 0} className="h-2" />
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>
                        {formatDate(project.start_date)} - {formatDate(project.end_date)}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="border-t pt-4">
                    <Button
                      variant="ghost"
                      className="ml-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}`);
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

        <TabsContent value="tasks">
          {myTasks.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-600">No tasks assigned to you</h3>
              <p className="text-gray-500 mt-2">
                You don't have any tasks assigned at the moment
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-md shadow">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-left">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {myTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className={task.status === 'Done' ? 'line-through text-gray-500' : ''}>
                            {task.title}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {/* In a real application, you'd look up the project name */}
                          <span className="text-gray-900">Project Name</span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {formatDate(task.due_date)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(task.status)}
                        </td>
                        <td className="px-6 py-4">
                          {getPriorityBadge(task.priority)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {task.status !== 'Done' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleCompleteTask(task.id, e)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Complete
                            </Button>
                          ) : (
                            <span className="text-sm text-gray-500">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;