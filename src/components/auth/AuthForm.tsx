
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

interface AuthFormProps {
  databaseInitialized: boolean;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
}

const AuthForm = ({ 
  databaseInitialized, 
  email, 
  setEmail, 
  password, 
  setPassword 
}: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [role, setRole] = useState('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!databaseInitialized) {
      toast({
        title: "Database Not Ready",
        description: "Please initialize the database first by clicking the 'Initialize Database' button.",
        variant: "destructive",
      });
      return;
    }
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!isLogin && !name) {
      toast({
        title: "Error",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }

    if (!isLogin && password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let result = null;
      
      if (isLogin) {
        console.log('Attempting login with:', email);
        result = await login(email, password);
        if (result.success) {
          toast({
            title: "Success",
            description: "Logged in successfully",
          });
          navigate('/');
        } else {
          if (result.error?.code === 'email_not_confirmed') {
            toast({
              title: "Email Not Confirmed",
              description: "Please check your email and click the confirmation link before logging in.",
              variant: "destructive",
            });
          } else if (result.error?.code === 'invalid_credentials') {
            toast({
              title: "Invalid Credentials",
              description: "Invalid email or password. Please check your credentials and try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login Failed",
              description: result.error?.message || "Unable to log in. Please try again.",
              variant: "destructive",
            });
          }
        }
      } else {
        console.log('Attempting signup with:', email, role);
        result = await signup(email, password, name, role);
        if (result.success) {
          toast({
            title: "Account Created",
            description: "Account created successfully! You can now sign in.",
          });
          setIsLogin(true);
          setPassword('');
        } else {
          toast({
            title: "Signup Failed",
            description: result.error?.message || "Unable to create account. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setPassword('');
    setName('');
    setEmail('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isLogin && (
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required={!isLogin}
            placeholder="Enter your full name"
            disabled={!databaseInitialized}
          />
        </div>
      )}
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email address"
          disabled={!databaseInitialized}
        />
      </div>
      
      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder={isLogin ? "Enter your password" : "Create a password (min 6 characters)"}
            minLength={6}
            disabled={!databaseInitialized}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={!databaseInitialized}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {!isLogin && (
        <div>
          <Label htmlFor="role">Account Type</Label>
          <Select value={role} onValueChange={setRole} disabled={!databaseInitialized}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="agent">Support Agent</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={loading || !databaseInitialized}
      >
        {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
      </Button>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={toggleMode}
          className="text-indigo-600 hover:text-indigo-800 text-sm"
          disabled={!databaseInitialized}
        >
          {isLogin 
            ? "Don't have an account? Create one" 
            : "Already have an account? Sign in"
          }
        </button>
      </div>
    </form>
  );
};

export default AuthForm;
