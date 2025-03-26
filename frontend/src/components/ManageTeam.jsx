import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Trash2 } from 'lucide-react';
import userService from '../services/userService';
import { useToast } from "@/components/ui/toast"; // Keep the original import

const ManageTeam = ({ isOpen, onClose, teamMembers = [], projectId, onRoleChange, onRemove }) => {
  // Create a fallback toast object that will work even if ToastProvider is missing
  let toast;
  try {
    // Try to use the hook first
    const toastContext = useToast();
    toast = toastContext.toast;
  } catch (e) {
    // Fallback to console methods if the hook fails
    toast = {
      success: (msg) => console.log('SUCCESS:', msg),
      error: (msg) => console.error('ERROR:', msg),
      warning: (msg) => console.warn('WARNING:', msg),
      info: (msg) => console.info('INFO:', msg)
    };
  }

  const [members, setMembers] = useState([]);
  const [hasIncompleteData, setHasIncompleteData] = useState(false);

  useEffect(() => {
    // Map server response format to the component format
    console.log("Team members received:", teamMembers);

    const formattedMembers = teamMembers.map(member => {
      // Handle the server-side format (user_id, user_name) vs client-side expectations (id, name)
      return {
        id: member.id || member.user_id,
        user_id: member.user_id || member.id, // Ensure we have user_id for API calls
        name: member.name || member.user_name,
        email: member.email || member.user_email || '',
        role: member.role || 'Team Member',
        project_id: member.project_id || projectId
      };
    }).filter(member => member.id); // Filter out any that still don't have an id

    console.log("Formatted members:", formattedMembers);
    setMembers(formattedMembers);

    // Check if any members have incomplete data
    const hasIncomplete = formattedMembers.some(m => !m.name || !m.email);
    setHasIncompleteData(hasIncomplete);
  }, [teamMembers, projectId]);

  // Move the handleChangeMemberRole inside the component to access state and props
  const handleChangeMemberRole = async (memberId, newRole) => {
    if (!projectId || !memberId) {
      console.error("Missing project ID or member ID for role change");
      toast.error && toast.error('Unable to update role: missing project or member ID');
      return;
    }

    console.log(`Changing role for member ${memberId} in project ${projectId} to ${newRole}`);

    try {
      // Use the renamed method from userService
      await userService.changeProjectMemberRole(projectId, memberId, newRole);

      // Update the local state to reflect the change
      setMembers(prevMembers =>
        prevMembers.map(member =>
          member.user_id === memberId
            ? {...member, role: newRole}
            : member
        )
      );

      // Notify parent component about the change
      if (onRoleChange) {
        onRoleChange(memberId, newRole);
      }

      // Show a success notification
      toast.success && toast.success('Team member role updated successfully');
    } catch (error) {
      console.error('Failed to update member role:', error);
      toast.error && toast.error('Failed to update team member role');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Manage Team Members</DialogTitle>
        </DialogHeader>

        {hasIncompleteData && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Some team members have incomplete data. This may cause issues when changing roles or removing members.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          {members.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No team members assigned to this project.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {members.map((member, index) => (
                    <tr key={member.id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <div className="font-medium">{member.name || 'Unknown User'}</div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {member.email || 'No email available'}
                      </td>
                      <td className="px-4 py-2">
                        <Select
                          value={member.role}
                          onValueChange={(newRole) => handleChangeMemberRole(member.user_id, newRole)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Project Manager">Project Manager</SelectItem>
                            <SelectItem value="Team Member">Team Member</SelectItem>
                            <SelectItem value="Observer">Observer</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-2">
                        {member.id ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            onClick={() => onRemove(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 cursor-not-allowed"
                            disabled
                            title="Cannot remove - missing member ID"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageTeam;