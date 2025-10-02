import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createUser } from './actions';
import { toast } from 'sonner';

export function useSignup() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const signup = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'employer' | 'candidate';
  }) => {
    setIsLoading(true);
    try {
      const result = await createUser(userData);
      
      if (result!.success) {
        toast.success('Account created successfully!');
        
        // Redirect based on role
        if (userData.role === 'candidate') {
          router.push('/dashboard/candidate');
        } else {
          router.push('/dashboard/employer');
        }
        
        return result;
      } else {
        toast.error(result!.message || 'Failed to create account');
        return result;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signup,
    isLoading
  };
}
