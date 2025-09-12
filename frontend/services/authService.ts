export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  level: number;
  xp: number;
  totalXp: number;
  currentStreak: number;
  achievements: string[];
  portfolio: {
    cashBalance: number;
    totalValue: number;
    dayChange: number;
    dayChangePercent: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

class AuthService {
  private currentUser: User | null = null;
  private isAuthenticated = false;

  // Mock users for demo purposes
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'demo@trading.com',
      name: 'Demo Trader',
      level: 5,
      xp: 1250,
      totalXp: 2500,
      currentStreak: 7,
      achievements: ['first_trade', 'risk_master', 'strategy_builder'],
      portfolio: {
        cashBalance: 10000,
        totalValue: 12500,
        dayChange: 250,
        dayChangePercent: 2.04
      }
    },
    {
      id: '2',
      email: 'test@trading.com',
      name: 'Test User',
      level: 3,
      xp: 800,
      totalXp: 1200,
      currentStreak: 3,
      achievements: ['first_trade'],
      portfolio: {
        cashBalance: 5000,
        totalValue: 5500,
        dayChange: -100,
        dayChangePercent: -1.79
      }
    }
  ];

  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user = this.mockUsers.find(u => u.email === credentials.email);
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // For demo purposes, accept any password
      if (credentials.password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      this.currentUser = user;
      this.isAuthenticated = true;

      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('trading_user', JSON.stringify(user));
        localStorage.setItem('trading_auth', 'true');
      }

      return { success: true, user };
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  async register(credentials: RegisterCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Validation
      if (credentials.password !== credentials.confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }

      if (credentials.password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      if (this.mockUsers.find(u => u.email === credentials.email)) {
        return { success: false, error: 'Email already exists' };
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: credentials.email,
        name: credentials.name,
        level: 1,
        xp: 0,
        totalXp: 0,
        currentStreak: 0,
        achievements: [],
        portfolio: {
          cashBalance: 10000,
          totalValue: 10000,
          dayChange: 0,
          dayChangePercent: 0
        }
      };

      this.mockUsers.push(newUser);
      this.currentUser = newUser;
      this.isAuthenticated = true;

      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('trading_user', JSON.stringify(newUser));
        localStorage.setItem('trading_auth', 'true');
      }

      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    this.isAuthenticated = false;

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('trading_user');
      localStorage.removeItem('trading_auth');
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  async checkAuthStatus(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      const authStatus = localStorage.getItem('trading_auth');
      const userData = localStorage.getItem('trading_user');

      if (authStatus === 'true' && userData) {
        this.currentUser = JSON.parse(userData);
        this.isAuthenticated = true;
        return true;
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }

    return false;
  }

  // Demo credentials for easy testing
  getDemoCredentials(): LoginCredentials[] {
    return [
      { email: 'demo@trading.com', password: 'password123' },
      { email: 'test@trading.com', password: 'password123' }
    ];
  }
}

export const authService = new AuthService();
