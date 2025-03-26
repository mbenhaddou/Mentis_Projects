import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Search,
  Mail,
  Phone,
  Briefcase,
  CheckCircle2,
  Users,
  Loader2,
  UserPlus,
  Filter,
  AlertTriangle,
  Trash,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import DeleteUserDialog from '../components/DeleteUserDialog';

const TeamPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const isManager = user?.role === 'Admin' || user?.role === 'Manager';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch team data on initial load
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Make API call to fetch team members
        const response = await api.get('/users', {
          params: {
            limit: 100
          }
        });

        // Process the response data with default values
        const processedTeamData = response.data.map(user => {
          return {
            id: user.id,
            name: user.name || 'Unnamed User',
            email: user.email || 'No email',
            role: user.role || 'User',
            phone: user.phone || 'Not available',
            // Set default values for stats that might not be available
            projects: 0,
            completedTasks: 0,
            activeProjects: [],
            skills: []
          };
        });

        setTeamMembers(processedTeamData);
        setFilteredMembers(processedTeamData);
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError('Failed to load team data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  // Filter team members based on search and role
  useEffect(() => {
    let filtered = [...teamMembers];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(member =>
        member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply role filter (not empty string filter)
    if (roleFilter && roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role === roleFilter);
    }

    // Apply tab filter
    if (activeTab === 'managers') {
      filtered = filtered.filter(member =>
        member.role === 'Manager' || member.role === 'Admin'
      );
    } else if (activeTab === 'contributors') {
      filtered = filtered.filter(member => member.role === 'Contributor');
    }

    setFilteredMembers(filtered);
  }, [teamMembers, searchQuery, roleFilter, activeTab]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle role filter change
  const handleRoleFilterChange = (value) => {
    setRoleFilter(value);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setActiveTab('all');
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (member) => {
    // Don't allow deleting yourself
    if (member.id === user.id) {
      toast({
        title: "Cannot delete own account",
        description: "You cannot delete your own user account.",
        variant: "destructive"
      });
      return;
    }
    setUserToDelete(member);
    setDeleteDialogOpen(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  // Confirm user deletion
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(`/users/${userToDelete.id}`);

      // Remove user from state
      setTeamMembers(prev => prev.filter(member => member.id !== userToDelete.id));

      toast({
        title: "User deleted",
        description: `${userToDelete.name} has been removed along with all their associated data.`,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Failed to delete user",
        description: error.response?.data?.detail || "An error occurred while deleting the user.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  // Handle navigation to user profile
  const handleViewProfile = (userId) => {
    navigate(`/users/${userId}`);
  };

  // Handle editing a user
  const handleEditUser = (userId) => {
    navigate(`/users/${userId}/edit`);
  };

  // Handle adding a new team member
  const handleAddTeamMember = () => {
    navigate('/users/new');
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Get badge variant based on role
  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'Admin': return 'destructive';
      case 'Manager': return 'default';
      case 'Contributor': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-2" />
        <span className="text-gray-700 font-medium">Loading team data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">Error Loading Team Data</h3>
        <div className="text-gray-500 mb-4 text-center max-w-md">{error}</div>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Team</h1>
          <div className="text-gray-500 mt-1">Manage and view team members across all projects</div>
        </div>

        {isAdmin && (
          <Button className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700" onClick={handleAddTeamMember}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Team Member
          </Button>
        )}
      </div>

      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-8"
            />
          </div>

          <div className="w-full md:w-52">
            <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Contributor">Contributor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchQuery || roleFilter !== 'all') && (
            <Button variant="outline" onClick={resetFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Team Members</TabsTrigger>
          <TabsTrigger value="managers">Managers</TabsTrigger>
          <TabsTrigger value="contributors">Contributors</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredMembers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No team members found</h3>
          <div className="text-gray-500 mb-4">Try adjusting your search or filter criteria</div>
          <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Avatar className="h-12 w-12">
                    {member.avatarUrl ? (
                      <AvatarImage src={member.avatarUrl} alt={member.name} />
                    ) : (
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleBadgeVariant(member.role)}>{member.role}</Badge>

                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewProfile(member.id)}>
                            <Users className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditUser(member.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleOpenDeleteDialog(member)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
                <CardTitle className="mt-2">{member.name}</CardTitle>
                {/* Use a custom div to avoid nesting issues */}
                <div className="text-sm text-muted-foreground mt-1">
                  <span className="flex items-center">
                    <Mail className="h-3.5 w-3.5 mr-1 text-gray-500" />
                    {member.email}
                  </span>
                  <span className="flex items-center mt-1">
                    <Phone className="h-3.5 w-3.5 mr-1 text-gray-500" />
                    {member.phone}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="pb-2">
                <div className="flex justify-between text-sm mb-2">
                  <div className="flex items-center">
                    <Briefcase className="h-3.5 w-3.5 mr-1 text-gray-500" />
                    <span>{member.projects || 0} Projects</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-gray-500" />
                    <span>{member.completedTasks || 0} Tasks</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-sm font-medium mb-1">Active Projects</div>
                  {member.activeProjects && member.activeProjects.length > 0 ? (
                    <ul className="space-y-1">
                      {member.activeProjects.map((project, idx) => (
                        <li key={project.id || idx} className="text-sm flex justify-between">
                          <span>{project.name}</span>
                          <Badge variant={project.status === 'Active' ? 'outline' : 'secondary'} className="text-xs">
                            {project.status || 'Unknown'}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-gray-500">No active projects</div>
                  )}
                </div>

                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Skills</div>
                  {member.skills && member.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {member.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="font-normal">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No skills listed</div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleViewProfile(member.id)}
                >
                  View Profile
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Team Overview</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks Completed</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                {isAdmin && (
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-gray-50"
                  onClick={() => handleViewProfile(member.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium text-gray-900">{member.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getRoleBadgeVariant(member.role)}>{member.role}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.projects || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.completedTasks || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full"
                          style={{ width: `${Math.min(100, Math.round((member.completedTasks || 0) / 50 * 100))}%` }}
                        ></div>
                      </div>
                      <span className="text-xs">{Math.min(100, Math.round((member.completedTasks || 0) / 50 * 100))}%</span>
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditUser(member.id);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800 ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDeleteDialog(member);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete User Confirmation Dialog */}
      <DeleteUserDialog
        isOpen={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        userName={userToDelete?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default TeamPage;