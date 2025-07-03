
import React from 'react';
import { Button } from '@/components/ui/button';
import { User } from '@/hooks/useAdminUsers';

interface UsersPaginationProps {
  currentPage: number;
  totalPages: number;
  users: User[];
  usersPerPage: number;
  startIndex: number;
  onPageChange: (page: number) => void;
}

const UsersPagination: React.FC<UsersPaginationProps> = ({
  currentPage,
  totalPages,
  users,
  usersPerPage,
  startIndex,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-600">
        Showing {startIndex + 1} to {Math.min(startIndex + usersPerPage, users.length)} of {users.length} users
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="px-3 py-2 text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default UsersPagination;
