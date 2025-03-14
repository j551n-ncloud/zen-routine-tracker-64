
import { useState, useEffect, createContext, useContext } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

// Define types
export interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize auth state on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Check for token in localStorage
        const token = localStorage.getItem('authToken');
        
        if (token) {
          // Validate token with backend
          try {
            const response = await axios.get('/api/users/me', {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data) {
              setUser(response.data);
              console.log("User loaded from token:", response.data.username);
            }
          } catch (error) {
            console.error("Invalid token:", error);
            localStorage.removeItem('authToken');
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, []);
  
  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post('/api/auth/login', { 
        username, 
        password 
      });
      
      const { user, token } = response.data;
      
      if (user && token) {
        // Save token to localStorage
        localStorage.setItem('authToken', token);
        
        // Set user in state
        setUser(user);
        
        toast.success(`Welcome, ${user.username}!`);
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.response?.status === 401) {
        toast.error("Invalid username or password");
      } else {
        toast.error("Login failed. Please try again.");
      }
      
      return false;
    }
  };
  
  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('authToken');
    
    // Clear user from state
    setUser(null);
    
    toast.success("You've been logged out");
  };
  
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
