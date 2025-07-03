import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'Active' | 'Inactive';
  tickets: number;
  joinDate: string;
}

interface TicketStats {
  total: number;
  resolved: number;
  open: number;
  inProgress: number;
  avgResponseTime: string;
  satisfaction: number;
}

interface DataContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'tickets' | 'joinDate'> & { password: string }) => void;
  ticketStats: TicketStats;
  updateProfile: (data: { firstName: string; lastName: string; email: string }) => Promise<boolean>;
  updateNotificationSettings: (settings: { email: boolean; desktop: boolean; slack: boolean }) => void;
  notificationSettings: { email: boolean; desktop: boolean; slack: boolean };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, login } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    desktop: true,
    slack: false
  });

  // Initialize with mock data
  useEffect(() => {
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 (555) 123-4567',
        company: 'Acme Corp',
        status: 'Active',
        tickets: 5,
        joinDate: '2024-01-15',
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1 (555) 987-6543',
        company: 'TechStart Inc',
        status: 'Active',
        tickets: 12,
        joinDate: '2023-11-20',
      },
      {
        id: '3',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        phone: '+1 (555) 456-7890',
        company: 'Design Co',
        status: 'Inactive',
        tickets: 3,
        joinDate: '2024-03-10',
      },
    ];

    const storedCustomers = localStorage.getItem('customers');
    if (storedCustomers) {
      setCustomers(JSON.parse(storedCustomers));
    } else {
      setCustomers(mockCustomers);
      localStorage.setItem('customers', JSON.stringify(mockCustomers));
    }

    const storedNotifications = localStorage.getItem('notificationSettings');
    if (storedNotifications) {
      setNotificationSettings(JSON.parse(storedNotifications));
    }
  }, []);

  const addCustomer = (customerData: Omit<Customer, 'id' | 'tickets' | 'joinDate'> & { password: string }) => {
    const { password, ...customerInfo } = customerData;
    
    const newCustomer: Customer = {
      ...customerInfo,
      id: Date.now().toString(),
      tickets: 0,
      joinDate: new Date().toISOString().split('T')[0],
    };
    
    // Store password separately (in a real app, this would be hashed and stored securely)
    console.log(`Password for ${customerData.email}: ${password}`);
    
    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    localStorage.setItem('customers', JSON.stringify(updatedCustomers));
  };

  const updateProfile = async (data: { firstName: string; lastName: string; email: string }): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Update user in localStorage
      const updatedUser = {
        ...user,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update in users array if it exists
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = storedUsers.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        storedUsers[userIndex] = { ...storedUsers[userIndex], ...updatedUser };
        localStorage.setItem('users', JSON.stringify(storedUsers));
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const updateNotificationSettings = (settings: { email: boolean; desktop: boolean; slack: boolean }) => {
    setNotificationSettings(settings);
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    
    // Send to Slack webhook if enabled
    if (settings.slack) {
      console.log('Slack notifications enabled - webhook would be called here');
    }
  };

  // Calculate real-time ticket stats
  const ticketStats: TicketStats = {
    total: customers.reduce((acc, customer) => acc + customer.tickets, 0),
    resolved: Math.floor(customers.reduce((acc, customer) => acc + customer.tickets, 0) * 0.8),
    open: Math.floor(customers.reduce((acc, customer) => acc + customer.tickets, 0) * 0.15),
    inProgress: Math.floor(customers.reduce((acc, customer) => acc + customer.tickets, 0) * 0.05),
    avgResponseTime: '2.4h',
    satisfaction: 94,
  };

  return (
    <DataContext.Provider value={{
      customers,
      addCustomer,
      ticketStats,
      updateProfile,
      updateNotificationSettings,
      notificationSettings
    }}>
      {children}
    </DataContext.Provider>
  );
};
