
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, User, Shield, UserCheck, AlertCircle } from 'lucide-react';

interface QuickAccessPanelProps {
  databaseInitialized: boolean;
  onCredentialsFill: (email: string, password: string, name?: string, role?: string) => void;
}

const QuickAccessPanel = ({ databaseInitialized, onCredentialsFill }: QuickAccessPanelProps) => {
  const fillCredentials = (userType: 'admin' | 'customer' | 'agent') => {
    const credentials = {
      admin: { email: 'mohammadddigham@gmail.com', password: 'admin123456', name: 'Mohammad Digham' },
      customer: { email: 'abudosh2@gmail.com', password: 'customer123456', name: 'Abu Dosh' },
      agent: { email: 'it@domedia.me', password: 'agent123456', name: 'IT Support' }
    };
    
    const cred = credentials[userType];
    onCredentialsFill(cred.email, cred.password, cred.name, userType);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          Pre-Created Accounts
        </CardTitle>
        <CardDescription>
          Use these accounts that were created during database initialization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!databaseInitialized ? (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Initialize the database first to access pre-created accounts
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Available Test Accounts</h3>
            <p className="text-sm text-gray-600">
              Click to auto-fill credentials for quick access:
            </p>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => fillCredentials('admin')}
              >
                <Shield className="h-4 w-4 mr-2 text-red-600" />
                <div className="text-left">
                  <div className="font-medium">Admin Account</div>
                  <div className="text-xs text-gray-500">mohammadddigham@gmail.com</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => fillCredentials('agent')}
              >
                <UserCheck className="h-4 w-4 mr-2 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Support Agent</div>
                  <div className="text-xs text-gray-500">it@domedia.me</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => fillCredentials('customer')}
              >
                <User className="h-4 w-4 mr-2 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">Customer Account</div>
                  <div className="text-xs text-gray-500">abudosh2@gmail.com</div>
                </div>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-medium text-gray-900 mb-2">Account Details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-red-600" />
                  <span><strong>Admin:</strong> Full system access, user management</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-3 w-3 text-blue-600" />
                  <span><strong>Agent:</strong> Handle tickets and customer support</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-green-600" />
                  <span><strong>Customer:</strong> Submit tickets and get support</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Email Activation</span>
                </div>
                <p className="text-xs text-blue-700">
                  All accounts are pre-activated and ready to use. No email confirmation required.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickAccessPanel;
