// Authentication and User Management System
// Handles user signup, login, staff management, and admin dashboard

class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('pulserelief_users')) || [];
        this.staff = JSON.parse(localStorage.getItem('pulserelief_staff')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('pulserelief_currentUser')) || null;
        this.currentUserType = localStorage.getItem('pulserelief_currentUserType') || null;
        this.initializeDefaultAdmin();
    }

    // Initialize default admin account
    initializeDefaultAdmin() {
        const adminExists = this.staff.some(s => s.email === 'admin@pulserelief.com' && s.role === 'admin');
        if (!adminExists) {
            this.staff.push({
                id: 'admin_' + Date.now(),
                name: 'Admin User',
                email: 'admin@pulserelief.com',
                password: this.hashPassword('admin123'),
                role: 'admin',
                department: 'Administration',
                createdAt: new Date().toISOString(),
                status: 'active'
            });
            this.saveStaff();
        }
        
        // Initialize sample staff accounts
        this.initializeSampleStaff();
        
        // Initialize sample user accounts
        this.initializeSampleUsers();
    }
    
    // Initialize sample staff accounts for testing
    initializeSampleStaff() {
        const sampleStaff = [
            {
                email: 'reviewer@pulserelief.com',
                name: 'John Reviewer',
                role: 'reviewer',
                password: 'reviewer123'
            },
            {
                email: 'manager@pulserelief.com',
                name: 'Sarah Manager',
                role: 'manager',
                password: 'manager123'
            },
            {
                email: 'support@pulserelief.com',
                name: 'Mike Support',
                role: 'support',
                password: 'support123'
            }
        ];
        
        sampleStaff.forEach(staffData => {
            const staffExists = this.staff.some(s => s.email === staffData.email);
            if (!staffExists) {
                this.staff.push({
                    id: 'staff_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    name: staffData.name,
                    email: staffData.email,
                    password: this.hashPassword(staffData.password),
                    role: staffData.role,
                    department: staffData.role === 'reviewer' ? 'Case Review' : staffData.role === 'manager' ? 'Partnership' : 'Support',
                    createdAt: new Date().toISOString(),
                    createdBy: 'admin_sample',
                    status: 'active',
                    casesClosed: 0,
                    casesReviewed: 0
                });
            }
        });
        
        this.saveStaff();
    }
    
    // Initialize sample user accounts for testing
    initializeSampleUsers() {
        const sampleUsers = [
            {
                name: 'John Donor',
                email: 'john@example.com',
                password: 'donor123',
                country: 'US',
                accountType: 'donor'
            },
            {
                name: 'Maya Donor',
                email: 'maya.donor@pulserelief.com',
                password: 'donor456',
                country: 'IN',
                accountType: 'donor'
            },
            {
                name: 'Daniel Donor',
                email: 'daniel.donor@pulserelief.com',
                password: 'donor789',
                country: 'UK',
                accountType: 'donor'
            },
            {
                name: 'Sarah Helper',
                email: 'sarah@example.com',
                password: 'helper123',
                country: 'UK',
                accountType: 'user'
            },
            {
                name: 'Priya Contributor',
                email: 'priya@example.com',
                password: 'contributor123',
                country: 'IN',
                accountType: 'user'
            },
            {
                name: 'Ahmed Supporter',
                email: 'ahmed@example.com',
                password: 'support456',
                country: 'NG',
                accountType: 'donor'
            }
        ];
        
        sampleUsers.forEach(userData => {
            const userExists = this.users.some(u => u.email === userData.email);
            if (!userExists) {
                this.users.push({
                    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    name: userData.name,
                    email: userData.email,
                    password: this.hashPassword(userData.password),
                    country: userData.country,
                    accountType: userData.accountType || 'user',
                    createdAt: new Date().toISOString(),
                    joinDate: new Date().toLocaleDateString(),
                    status: 'active',
                    donations: Math.floor(Math.random() * 10) + 1,
                    bankDetails: {}
                });
            }
        });
        
        this.saveUsers();
    }

    // Simple password hash (for demo only - use bcrypt in production)
    hashPassword(password) {
        return btoa(password); // Base64 encoding for demo
    }

    // Simple password verification (for demo only)
    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }

    // User Signup
    createUser(name, email, password, country, phone, accountType) {
        // Check if user already exists
        if (this.users.some(u => u.email === email)) {
            return { success: false, message: 'Email already registered' };
        }

        const newUser = {
            id: 'user_' + Date.now(),
            name: name,
            email: email,
            password: this.hashPassword(password),
            country: country,
            phone: phone,
            accountType: accountType === 'donor' ? 'donor' : 'user',
            createdAt: new Date().toISOString(),
            joinDate: new Date().toLocaleDateString(),
            status: 'active',
            donations: 0,
            bankDetails: {}
        };

        this.users.push(newUser);
        this.saveUsers();
        return { success: true, message: 'Account created successfully', user: newUser };
    }

    // User Login
    loginUser(email, password) {
        const user = this.users.find(u => u.email === email);
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        if (user.accountType === 'donor') {
            return { success: false, message: 'Please login using Donor Login' };
        }

        if (!this.verifyPassword(password, user.password)) {
            return { success: false, message: 'Invalid password' };
        }

        this.currentUser = user;
        this.currentUserType = 'user';
        this.saveSession();
        return { success: true, message: 'Login successful', user: user };
    }

    loginDonor(email, password) {
        const user = this.users.find(u => u.email === email);
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        if (user.accountType && user.accountType !== 'donor') {
            return { success: false, message: 'Please login using Volunteer Login' };
        }

        if (!this.verifyPassword(password, user.password)) {
            return { success: false, message: 'Invalid password' };
        }

        this.currentUser = user;
        this.currentUserType = 'donor';
        this.saveSession();
        return { success: true, message: 'Donor login successful', user: user };
    }

    // Staff Login
    loginStaff(email, password) {
        const staff = this.staff.find(s => s.email === email);
        if (!staff) {
            return { success: false, message: 'Staff account not found' };
        }

        if (!this.verifyPassword(password, staff.password)) {
            return { success: false, message: 'Invalid password' };
        }

        this.currentUser = staff;
        this.currentUserType = 'staff';
        this.saveSession();
        return { success: true, message: 'Staff login successful', user: staff };
    }

    // Admin Login
    loginAdmin(email, password) {
        const admin = this.staff.find(s => s.email === email && s.role === 'admin');
        if (!admin) {
            return { success: false, message: 'Admin account not found' };
        }

        if (!this.verifyPassword(password, admin.password)) {
            return { success: false, message: 'Invalid password' };
        }

        this.currentUser = admin;
        this.currentUserType = 'admin';
        this.saveSession();
        return { success: true, message: 'Admin login successful', user: admin };
    }

    // Create Staff Member (Admin only)
    createStaffMember(name, email, password, role, department) {
        if (this.currentUserType !== 'admin') {
            return { success: false, message: 'Only admins can create staff' };
        }

        if (this.staff.some(s => s.email === email)) {
            return { success: false, message: 'Email already in use' };
        }

        const newStaff = {
            id: 'staff_' + Date.now(),
            name: name,
            email: email,
            password: this.hashPassword(password),
            role: role,
            department: department,
            createdAt: new Date().toISOString(),
            createdBy: this.currentUser.id,
            status: 'active',
            casesClosed: 0,
            casesReviewed: 0
        };

        this.staff.push(newStaff);
        this.saveStaff();
        return { success: true, message: 'Staff member created successfully', staff: newStaff };
    }

    // Update Staff Member
    updateStaffMember(staffId, updates) {
        if (this.currentUserType !== 'admin') {
            return { success: false, message: 'Only admins can update staff' };
        }

        const staff = this.staff.find(s => s.id === staffId);
        if (!staff) {
            return { success: false, message: 'Staff member not found' };
        }

        Object.assign(staff, updates);
        this.saveStaff();
        return { success: true, message: 'Staff member updated', staff: staff };
    }

    // Delete Staff Member
    deleteStaffMember(staffId) {
        if (this.currentUserType !== 'admin') {
            return { success: false, message: 'Only admins can delete staff' };
        }

        const index = this.staff.findIndex(s => s.id === staffId);
        if (index === -1) {
            return { success: false, message: 'Staff member not found' };
        }

        this.staff.splice(index, 1);
        this.saveStaff();
        return { success: true, message: 'Staff member deleted' };
    }

    // Get all staff members
    getAllStaff() {
        return this.staff.filter(s => s.status === 'active');
    }

    // Get all users
    getAllUsers() {
        return this.users.filter(u => u.status === 'active');
    }

    // Get user by ID
    getUser(userId) {
        return this.users.find(u => u.id === userId);
    }

    // Get staff by ID
    getStaffMember(staffId) {
        return this.staff.find(s => s.id === staffId);
    }

    // Update user profile
    updateUserProfile(userId, updates) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        Object.assign(user, updates);
        this.saveUsers();
        return { success: true, message: 'Profile updated', user: user };
    }

    // Logout
    logout() {
        this.currentUser = null;
        this.currentUserType = null;
        this.clearSession();
        return { success: true, message: 'Logged out successfully' };
    }

    // Save session to localStorage
    saveSession() {
        localStorage.setItem('pulserelief_currentUser', JSON.stringify(this.currentUser));
        localStorage.setItem('pulserelief_currentUserType', this.currentUserType);
    }

    // Clear session from localStorage
    clearSession() {
        localStorage.removeItem('pulserelief_currentUser');
        localStorage.removeItem('pulserelief_currentUserType');
    }

    // Get dashboard stats
    getDashboardStats() {
        return {
            totalUsers: this.users.length,
            totalStaff: this.staff.length,
            activeCases: Math.floor(Math.random() * 50) + 10, // Demo data
            activeToday: Math.floor(Math.random() * 20) + 5
        };
    }

    // Save users to localStorage
    saveUsers() {
        localStorage.setItem('pulserelief_users', JSON.stringify(this.users));
    }

    // Save staff to localStorage
    saveStaff() {
        localStorage.setItem('pulserelief_staff', JSON.stringify(this.staff));
    }

    // Get analytics data
    getAnalyticsData() {
        return {
            registrationTrend: '+' + Math.floor(Math.random() * 100) + ' this week',
            successRate: Math.floor(Math.random() * 30) + 70 + '%',
            responseTime: Math.floor(Math.random() * 15) + 10 + ' minutes',
            systemHealth: 'Healthy - ' + (Math.floor(Math.random() * 5) + 95) + '% uptime'
        };
    }
}

// Create global instance
const authSystem = new AuthSystem();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = authSystem;
}
