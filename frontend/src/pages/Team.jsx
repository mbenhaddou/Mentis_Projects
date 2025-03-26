import React, { useState, useEffect } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select';
import {
  AlertCircle,
  Mail,
  Plus,
  Search as SearchIcon,
  UserPlus
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import useAuth from '../../hooks/useAuth';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Label } from '../components/ui/label';

// Mock API service for team management (would connect to backend in real app)
const teamService = {
  getTeamMembers: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return [
      {
        id: '1',
        name: 'Jessica Chen',
        email: 'jessica@example.com',
        role: 'Manager',
        projects: 12,
        tasksCompleted: 34
      },
      {
        id: '2',
        name: 'Michael Wong',
        email: 'michael@example.com',
        role: 'Developer',
        projects: 5,
        tasksCompleted: 27
      },
      {
        id: '3',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        role: 'Designer',
        projects: 8,
        tasksCompleted: 19
      },
      {
        id: '4',
        name: 'David Smith',
        email: 'david@example.com',
        role: 'Developer',
        projects: 6,
        tasksCompleted: 23
      },
      {
        id: '5',
        name: 'Emily Brown',
        email: 'emily@example.com',
        role: 'Project Manager',
        projects: 10,
        tasksCompleted: 45
      }
    ];
  },

  inviteTeamMember: async (data) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      id: Math.random().toString(36).substr(2, 9),
      ...data
    };
  }
};

const Team = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'Contributor'
  });
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin' || user?.role === 'Manager';

  // Fetch team members when component mounts
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        setError(null);

        const members = await teamService.getTeamMembers();
        setTeamMembers(members);
        setFilteredMembers(members);
      } catch (err) {
        console.error('Failed to fetch team members:', err);
        setError('Failed to load team members. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  // Filter team members when search term or role filter changes
  useEffect(() => {
    if (!teamMembers.length) return;

    let filtered = [...teamMembers];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        member =>
          member.name.toLowerCase().includes(term) ||
          member.email.toLowerCase().includes(term) ||
          member.role.toLowerCase().includes(term)
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role === roleFilter);
    }

    setFilteredMembers(filtered);
  }, [searchTerm, roleFilter, teamMembers]);

  // Handle invite form changes
  const handleInviteChange = (e) => {
    const { name, value } = e.target;
    setInviteForm({
      ...inviteForm,
      [name]: value
    });
  };

  // Handle role selection in invite form
  const handleRoleSelect = (value) => {
    setInviteForm({
      ...inviteForm,
      role: value
    });
  };

  // Handle invite submission
  const handleInvite = async (e) => {
    e.preventDefault();

    try {
      setInviting(true);
      setError(null);

      // Call API to invite team member
      const newMember = await teamService.inviteTeamMember({
        ...inviteForm,
        projects: 0,
        tasksCompleted: 0
      });

      // Add new member to list
      setTeamMembers([newMember, ...teamMembers]);

      // Show success message and reset form
      setInviteSuccess(true);
      setInviteForm({
        name: '',
        email: '',
        role: 'Contributor'
      });

      // Close dialog after delay
      setTimeout(() => {
        setInviteDialogOpen(false);
        setInviteSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to invite team member:', err);
      setError('Failed to invite team member. Please try again later.');
    } finally {
      setInviting(false);
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800';
      case 'Manager':
        return 'bg-blue-100 text-blue-800';
      case 'Project Manager':
        return 'bg-indigo-100 text-indigo-800';
      case 'Developer':
        return 'bg-green-100 text-green-800';
      case 'Designer':
        return 'bg-pink-100 text-pink-800';
      case 'Contributor':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-gray-500 mt-1">Manage your team members and their access</p>
        </div>

        {isAdmin && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700"
              >
                <UserPlus className="mr-2 h-4 w-4" /> Invite Team Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your team. They'll receive an email with instructions.
                </DialogDescription>
              </DialogHeader>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {inviteSuccess && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    Invitation sent successfully!
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleInvite}>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={inviteForm.name}
                      onChange={handleInviteChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={inviteForm.email}
                      onChange={handleInviteChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={inviteForm.role}
                      onValueChange={handleRoleSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Contributor">Contributor</SelectItem>
                        <SelectItem value="Developer">Developer</SelectItem>
                        <SelectItem value="Designer">Designer</SelectItem>
                        <SelectItem value="Project Manager">Project Manager</SelectItem>
                        {user?.role === 'Admin' && (
                          <SelectItem value="Manager">Manager</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setInviteDialogOpen(false)}
                    disabled={inviting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={inviting}
                  >
                    {inviting ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10 max-w-sm"
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={roleFilter}
            onValueChange={setRoleFilter}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Project Manager">Project Manager</SelectItem>
              <SelectItem value="Developer">Developer</SelectItem>
              <SelectItem value="Designer">Designer</SelectItem>
              <SelectItem value="Contributor">Contributor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'} found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Tasks Completed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No team members found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback>
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <a href={`mailto:${member.email}`} className="flex items-center text-gray-600 hover:text-indigo-600">
                        <Mail className="h-4 w-4 mr-1" /> {member.email}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(member.role)}>
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{member.projects}</TableCell>
                    <TableCell>{member.tasksCompleted}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                      {isAdmin && (
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Team;