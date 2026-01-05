import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

interface PagePermission {
  id: string;
  page_name: string;
  route: string;
  admin_access: boolean;
  manager_access: boolean;
  user_access: boolean;
}

// In-memory cache for page permissions
let permissionsCache: { data: PagePermission[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const usePageAccess = (route: string) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const { userRole, loading: roleLoading } = useUserRole();

  // Normalize route once
  const normalizedRoute = useMemo(() => {
    return route === '/' ? '/dashboard' : route.replace(/\/$/, '');
  }, [route]);

  const checkAccess = useCallback(async () => {
    // Wait for auth and role to finish loading
    if (authLoading || roleLoading) {
      return;
    }

    if (!user) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    try {
      let permissions: PagePermission[];

      // Check cache first
      if (permissionsCache && Date.now() - permissionsCache.timestamp < CACHE_TTL) {
        permissions = permissionsCache.data;
      } else {
        // Fetch all permissions and cache them
        const { data, error } = await supabase
          .from('page_permissions')
          .select('*');

        if (error) {
          console.error('Error fetching permissions:', error);
          setHasAccess(true); // Default to allow on error
          setLoading(false);
          return;
        }

        permissions = data || [];
        permissionsCache = { data: permissions, timestamp: Date.now() };
      }

      // Find permission for this route
      const permissionData = permissions.find(p => p.route === normalizedRoute);

      if (!permissionData) {
        // If no permission record exists, allow access
        setHasAccess(true);
        setLoading(false);
        return;
      }

      // Check access based on user role (from useUserRole hook)
      let canAccess = false;
      switch (userRole) {
        case 'admin':
          canAccess = permissionData.admin_access;
          break;
        case 'manager':
          canAccess = permissionData.manager_access;
          break;
        case 'user':
        default:
          canAccess = permissionData.user_access;
          break;
      }

      setHasAccess(canAccess);
    } catch (error) {
      console.error('Error checking page access:', error);
      // On error, default to allowing access to prevent lockouts
      setHasAccess(true);
    } finally {
      setLoading(false);
    }
  }, [user, normalizedRoute, authLoading, roleLoading, userRole]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  return { hasAccess, loading: loading || authLoading || roleLoading, refetch: checkAccess };
};

export const useAllPagePermissions = () => {
  const [permissions, setPermissions] = useState<PagePermission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        // Check cache first
        if (permissionsCache && Date.now() - permissionsCache.timestamp < CACHE_TTL) {
          setPermissions(permissionsCache.data);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('page_permissions')
          .select('*');

        if (error) throw error;
        
        const perms = data || [];
        setPermissions(perms);
        permissionsCache = { data: perms, timestamp: Date.now() };
      } catch (error) {
        console.error('Error fetching page permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  return { permissions, loading };
};

// Helper to clear permissions cache (useful after updates)
export const clearPermissionsCache = () => {
  permissionsCache = null;
};
