import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSecurityAudit } from '@/hooks/useSecurityAudit';
import { useUserRole } from '@/hooks/useUserRole';

interface SecurityContextType {
  isSecurityEnabled: boolean;
  hasAdminAccess: boolean;
  userRole: string | null;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider = ({ children }: SecurityProviderProps) => {
  const { user } = useAuth();
  const { logSecurityEvent } = useSecurityAudit();
  // Use the centralized useUserRole hook instead of fetching separately
  const { userRole, isAdmin } = useUserRole();
  
  // Refs to prevent duplicate session logging
  const sessionLoggedRef = useRef<string | null>(null);
  const visibilityHandlerRef = useRef<(() => void) | null>(null);

  // Debounced visibility change handler
  const handleVisibilityChange = useCallback(() => {
    if (!user) return;
    if (document.hidden) {
      logSecurityEvent('SESSION_INACTIVE', 'auth', user.id);
    } else {
      logSecurityEvent('SESSION_ACTIVE', 'auth', user.id);
    }
  }, [user, logSecurityEvent]);

  useEffect(() => {
    if (!user || !userRole) {
      // Clean up if user logs out
      if (visibilityHandlerRef.current) {
        document.removeEventListener('visibilitychange', visibilityHandlerRef.current);
        visibilityHandlerRef.current = null;
      }
      sessionLoggedRef.current = null;
      return;
    }

    // Only log session start once per user session
    const sessionKey = `${user.id}-${userRole}`;
    if (sessionLoggedRef.current !== sessionKey) {
      sessionLoggedRef.current = sessionKey;
      logSecurityEvent('SESSION_START', 'auth', user.id, {
        login_time: new Date().toISOString(),
        user_agent: navigator.userAgent,
        role: userRole,
        user_email: user.email
      });
    }

    // Set up visibility handler only once
    if (!visibilityHandlerRef.current) {
      visibilityHandlerRef.current = handleVisibilityChange;
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      if (visibilityHandlerRef.current) {
        document.removeEventListener('visibilitychange', visibilityHandlerRef.current);
        visibilityHandlerRef.current = null;
      }
    };
  }, [user, userRole, logSecurityEvent, handleVisibilityChange]);

  const value = {
    isSecurityEnabled: true,
    hasAdminAccess: isAdmin,
    userRole
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};
