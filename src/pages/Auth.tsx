
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import DatabaseInitializer from '@/components/auth/DatabaseInitializer';
import AuthForm from '@/components/auth/AuthForm';
import QuickAccessPanel from '@/components/auth/QuickAccessPanel';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [databaseInitialized, setDatabaseInitialized] = useState(false);

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (!error && data !== null) {
        setDatabaseInitialized(true);
      }
    } catch (error) {
      console.log('Database not yet initialized');
    }
  };

  const handleCredentialsFill = (newEmail: string, newPassword: string) => {
    setEmail(newEmail);
    setPassword(newPassword);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Welcome
            </CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DatabaseInitializer
              databaseInitialized={databaseInitialized}
              onInitialized={() => setDatabaseInitialized(true)}
              onCredentialsFill={handleCredentialsFill}
            />

            <AuthForm
              databaseInitialized={databaseInitialized}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
            />
          </CardContent>
        </Card>

        <QuickAccessPanel
          databaseInitialized={databaseInitialized}
          onCredentialsFill={handleCredentialsFill}
        />
      </div>
    </div>
  );
};

export default Auth;
