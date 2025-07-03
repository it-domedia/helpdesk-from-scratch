
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TicketIcon, Users, Clock, CheckCircle } from 'lucide-react';

const Index = () => {
  const { user, isLoading } = useAuth();
  const { ticketStats } = useData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-9 w-64 mb-2" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h1>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="capitalize">
              {user.role}
            </Badge>
            <span className="text-gray-600">{user.email}</span>
          </div>
        </div>

        {user.role === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                <TicketIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ticketStats.total}</div>
                <p className="text-xs text-muted-foreground">All tickets in system</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ticketStats.open}</div>
                <p className="text-xs text-muted-foreground">Awaiting resolution</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ticketStats.resolved}</div>
                <p className="text-xs text-muted-foreground">Successfully resolved</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ticketStats.avgResponseTime}</div>
                <p className="text-xs text-muted-foreground">Average response time</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              {user.role === 'customer' 
                ? 'Manage your support tickets and get help from our team.'
                : user.role === 'agent'
                ? 'View and respond to tickets assigned to you.'
                : 'Full administrative access to the helpdesk system.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.role === 'customer' && (
                <div>
                  <h3 className="font-medium mb-2">What you can do:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>View and manage your support tickets</li>
                    <li>Chat with our support team</li>
                    <li>Update your account settings</li>
                  </ul>
                </div>
              )}
              
              {user.role === 'agent' && (
                <div>
                  <h3 className="font-medium mb-2">What you can do:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>View tickets assigned to you</li>
                    <li>Create new tickets for customers</li>
                    <li>Update ticket status and priority</li>
                    <li>Chat with customers</li>
                  </ul>
                </div>
              )}

              {user.role === 'admin' && (
                <div>
                  <h3 className="font-medium mb-2">What you can do:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>View all tickets across the system</li>
                    <li>Manage customers and support agents</li>
                    <li>Access analytics and reporting</li>
                    <li>Configure system settings</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
