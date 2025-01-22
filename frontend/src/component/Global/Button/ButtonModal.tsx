import { getPermissionsForRole } from 'component/Permisstions/Permissions';
import React from 'react';
import { useSelector } from 'react-redux';

interface RoleBasedButtonProps {
  requiredPermission: string;
  onClick: () => void;
  children: React.ReactNode;
}

const RoleBasedButton: React.FC<RoleBasedButtonProps> = ({ requiredPermission, onClick, children }) => {
  const userRole = useSelector((state: any) => state.role); 
  const permissions = getPermissionsForRole(userRole);

  if (!permissions.includes(requiredPermission)) {
    return null;
  }

  return (
    <button onClick={onClick}>
      {children}
    </button>
  );
};

export default RoleBasedButton;
