// utils.ts

import { rolesPermissions } from "component/Permisstions/rolesPermissions";


export const getPermissionsForRole = (role: string) => {
  return rolesPermissions[role] || [];
};
