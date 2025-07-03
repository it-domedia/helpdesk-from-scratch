
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseInitializerProps {
  databaseInitialized: boolean;
  onInitialized: () => void;
  onCredentialsFill: (email: string, password: string) => void;
}

const DatabaseInitializer = ({ 
  databaseInitialized, 
  onInitialized, 
  onCredentialsFill 
}: DatabaseInitializerProps) => {
  const [initializingDatabase, setInitializingDatabase] = useState(false);
  const { toast } = useToast();

  const initializeDatabase = async () => {
    setInitializingDatabase(true);
    try {
      toast({
        title: "Initializing Database",
        description: "Setting up fresh database and creating initial user accounts...",
      });

      const { data, error } = await supabase.functions.invoke('create-initial-users', {
        body: {}
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        onInitialized();
        toast({
          title: "Database Initialized! 🎉",
          description: `Successfully created ${data.summary.successful} user accounts. You can now login with the provided credentials.`,
        });
        
        // Auto-fill admin credentials
        onCredentialsFill('mohammadddigham@gmail.com', 'admin123456');
      } else {
        throw new Error(data.error || 'Failed to initialize database');
      }
    } catch (error: any) {
      console.error('Database initialization error:', error);
      toast({
        title: "Initialization Failed",
        description: error.message || "Failed to initialize database. Please try again.",
        variant: "destructive",
      });
    } finally {
      setInitializingDatabase(false);
    }
  };

  if (databaseInitialized) {
    return (
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">Database Ready</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="h-5 w-5 text-yellow-600" />
        <span className="font-medium text-yellow-800">Database Setup Required</span>
      </div>
      <p className="text-sm text-yellow-700 mb-3">
        The database needs to be initialized with fresh tables and user accounts.
      </p>
      <Button 
        onClick={initializeDatabase}
        disabled={initializingDatabase}
        className="w-full"
      >
        {initializingDatabase ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Initializing Database...
          </>
        ) : (
          'Initialize Database & Create Users'
        )}
      </Button>
    </div>
  );
};

export default DatabaseInitializer;
