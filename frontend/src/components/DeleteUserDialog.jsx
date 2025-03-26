import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from 'lucide-react';

const DeleteUserDialog = ({
  isOpen,
  onClose,
  onConfirm,
  userName = "this user",
  isDeleting = false
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete User
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {userName}?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">Warning: This action cannot be undone</h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>
                    Deleting this user will also remove:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>All weekly updates created by this user</li>
                    <li>All project memberships for this user</li>
                    <li>User associations with tasks</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;