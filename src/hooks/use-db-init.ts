
import { useEffect, useState } from 'react';
import { initDatabase, setMockMode, isMockMode } from '../services/db-service';

export function useDbInit() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;

  useEffect(() => {
    let isMounted = true;
    
    // Check if mock mode is enabled in localStorage
    const storedMockMode = localStorage.getItem('zentracker-mock-mode') === 'true';
    
    if (storedMockMode) {
      console.log('Mock database mode is enabled from localStorage');
      setMockMode(true);
      
      if (isMounted) {
        setIsInitialized(true);
        setIsLoading(false);
        setError(null);
      }
      return;
    }
    
    // For browser environments, automatically enable mock mode
    if (typeof window !== 'undefined') {
      console.log('Browser environment detected, enabling mock mode');
      setMockMode(true);
      
      if (isMounted) {
        setIsInitialized(true);
        setIsLoading(false);
        setError(null);
      }
      return;
    }
    
    const init = async () => {
      try {
        setIsLoading(true);
        const success = await initDatabase();
        
        if (isMounted) {
          setIsInitialized(success);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to initialize database:', err);
        
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          
          // Auto-enable mock mode after all retries fail
          if (retryCount >= MAX_RETRIES) {
            console.log('Max retries reached, enabling mock mode');
            setMockMode(true);
            setIsInitialized(true);
            setError(null);
            return;
          }
          
          // Retry logic
          if (retryCount < MAX_RETRIES) {
            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
            console.log(`Retrying database initialization in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
            
            setTimeout(() => {
              if (isMounted) {
                setRetryCount(prev => prev + 1);
              }
            }, delay);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    init();
    
    return () => {
      isMounted = false;
    };
  }, [retryCount]);

  return { 
    isInitialized, 
    error, 
    isLoading, 
    retryCount, 
    maxRetries: MAX_RETRIES,
    isMockMode: isMockMode(),
    setMockMode
  };
}
