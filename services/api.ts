import { User, Task, Role, AppFile, Priority, GoogleProfile } from '../types';

// --- MOCK DATABASE ---

let nextUserId = 3;
let nextTaskId = 5;
let nextFileId = 3;

const mockUsers: (User & { passwordHash: string })[] = [
  {
    user_id: 1,
    email: 'admin@example.com',
    passwordHash: 'adminpassword', // In a real app, this would be a hash
    role: Role.ADMIN,
    name: 'Admin User',
  },
  {
    user_id: 2,
    email: 'user@example.com',
    passwordHash: 'userpassword', // In a real app, this would be a hash
    role: Role.USER,
    name: 'Normal User',
  },
];

const mockTasks: Task[] = [];

const mockFiles: AppFile[] = [
    {
        id_file: 1,
        id_user: 1,
        name: 'design_brief.pdf',
        url: 'about:blank', // In a real app, this would be a real URL
    },
    {
        id_file: 2,
        id_user: 2,
        name: 'final_marketing_copy.docx',
        url: 'about:blank',
    }
];


// This token will be stored in memory. For a production app, you might use localStorage or an in-memory store.
let authToken: string | null = null;
let loggedInUser: User | null = null;

// Helper to simulate network delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- MOCK API IMPLEMENTATION ---

export const api = {
    // AUTH
    async login(email: string, password: string): Promise<User | null> {
        await sleep(500); // Simulate network delay
        const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (user && user.passwordHash === password) {
            // In a real app, you would use bcrypt.compare()
            const { passwordHash, ...userWithoutPassword } = user;
            authToken = `mock-token-for-${user.user_id}`;
            loggedInUser = userWithoutPassword;
            return userWithoutPassword;
        } else {
            throw new Error("User not found or incorrect password.");
        }
    },
    
    async loginWithGoogle(profile: GoogleProfile): Promise<User | null> {
        await sleep(500);
        let user = mockUsers.find(u => u.email.toLowerCase() === profile.email.toLowerCase());

        if (user) {
            // User exists, update their name and picture from Google profile
            user.name = profile.name;
            user.picture = profile.picture;
        } else {
            // User does not exist, create a new one
            const newUser: User & { passwordHash: string } = {
                user_id: nextUserId++,
                email: profile.email,
                name: profile.name,
                picture: profile.picture,
                passwordHash: `google-user-${new Date().getTime()}`, // A random non-usable password
                role: Role.USER,
            };
            mockUsers.push(newUser);
            user = newUser;
        }

        const { passwordHash, ...userWithoutPassword } = user;
        authToken = `mock-token-for-${user.user_id}`;
        loggedInUser = userWithoutPassword;
        return userWithoutPassword;
    },

    async register(email: string, name: string, password: string): Promise<User | null> {
        await sleep(500);
        const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existingUser) {
            throw new Error("This email is already in use.");
        }
        
        const newUser: User & { passwordHash: string } = {
            user_id: nextUserId++,
            email,
            name,
            passwordHash: password, // In a real app, hash this
            role: Role.USER,
        };
        mockUsers.push(newUser);

        const { passwordHash, ...userWithoutPassword } = newUser;
        authToken = `mock-token-for-${newUser.user_id}`;
        loggedInUser = userWithoutPassword;
        return userWithoutPassword;
    },

    logout() {
        authToken = null;
        loggedInUser = null;
    },
    
    // DATA FETCHING
    async getUsers(): Promise<User[]> {
        await sleep(300);
        if (!authToken) throw new Error("Not authenticated");
        return mockUsers.map(({ passwordHash, ...user }) => user);
    },

    async getTasks(): Promise<Task[]> {
        await sleep(300);
        if (!authToken) throw new Error("Not authenticated");
        return [...mockTasks];
    },
    
    async getFiles(): Promise<AppFile[]> {
        await sleep(200);
        if (!authToken) throw new Error("Not authenticated");
        return [...mockFiles];
    },
    
    // TASK MANAGEMENT
    async saveTask(
        taskData: Omit<Task, 'id_task' | 'date_created'> & { id_task?: number },
        descriptionFile: File | null,
        currentUser: User,
    ): Promise<Task> {
        await sleep(500);
        if (!authToken) throw new Error("Not authenticated");
        
        if (descriptionFile) {
            const newFile: AppFile = {
                id_file: nextFileId++,
                id_user: currentUser.user_id,
                name: descriptionFile.name,
                url: URL.createObjectURL(descriptionFile),
            };
            mockFiles.push(newFile);
            taskData.id_file = newFile.id_file;
        }

        if (taskData.id_task) { // Update existing task
            const taskIndex = mockTasks.findIndex(t => t.id_task === taskData.id_task);
            if (taskIndex > -1) {
                mockTasks[taskIndex] = { ...mockTasks[taskIndex], ...taskData };
                return mockTasks[taskIndex];
            } else {
                throw new Error("Task not found");
            }
        } else { // Create new task
            const newTask: Task = {
                ...taskData,
                id_task: nextTaskId++,
                date_created: new Date().toISOString(),
                assigner_id: currentUser.user_id,
            };
            mockTasks.push(newTask);
            return newTask;
        }
    },

    async deleteTask(taskId: number): Promise<boolean> {
        await sleep(400);
        if (!authToken) throw new Error("Not authenticated");
        const taskIndex = mockTasks.findIndex(t => t.id_task === taskId);
        if (taskIndex > -1) {
            mockTasks.splice(taskIndex, 1);
            return true;
        }
        return false;
    },
    
    async submitTask(taskId: number, file: File, currentUser: User): Promise<Task> {
        await sleep(600);
        if (!authToken) throw new Error("Not authenticated");

        const taskIndex = mockTasks.findIndex(t => t.id_task === taskId);
        if (taskIndex === -1) {
            throw new Error("Task not found");
        }

        const newFile: AppFile = {
            id_file: nextFileId++,
            id_user: currentUser.user_id,
            name: file.name,
            url: URL.createObjectURL(file),
        };
        mockFiles.push(newFile);

        const taskToSubmit = mockTasks[taskIndex];
        const submissionDate = new Date();
        const deadlineDate = new Date(taskToSubmit.deadline);

        // Normalize dates to compare day-by-day, ignoring time
        const submissionDay = new Date(submissionDate.getFullYear(), submissionDate.getMonth(), submissionDate.getDate());
        const deadlineDay = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
        
        let newScore = 0;
        if (submissionDay < deadlineDay) {
            newScore = 1; // Submitted before deadline
        } else if (submissionDay > deadlineDay) {
            newScore = -1; // Submitted after deadline
        } else {
            newScore = 0; // Submitted on the deadline
        }

        const updatedTask = {
            ...taskToSubmit,
            status: 'Completed' as 'Completed',
            date_submit: submissionDate.toISOString(),
            submit_file_id: newFile.id_file,
            score: newScore,
        };
        mockTasks[taskIndex] = updatedTask;
        return updatedTask;
    },
    
    // USER MANAGEMENT
    async addUser(email: string, role: Role): Promise<User> {
        await sleep(400);
        if (!authToken || loggedInUser?.role !== Role.ADMIN) throw new Error("Unauthorized");
        
        if (mockUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            throw new Error("User with this email already exists.");
        }
        
        const newUser: User & { passwordHash: string } = {
            user_id: nextUserId++,
            email,
            passwordHash: 'defaultpassword123', // Set a default password
            role,
            name: email.split('@')[0],
        };
        mockUsers.push(newUser);
        const { passwordHash, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    },

    async updateUserRole(userId: number, role: Role): Promise<User> {
        await sleep(300);
        if (!authToken || loggedInUser?.role !== Role.ADMIN) throw new Error("Unauthorized");
        
        const userIndex = mockUsers.findIndex(u => u.user_id === userId);
        if (userIndex > -1) {
            mockUsers[userIndex].role = role;
            const { passwordHash, ...userWithoutPassword } = mockUsers[userIndex];
            return userWithoutPassword;
        } else {
            throw new Error("User not found");
        }
    },

    async deleteUser(userId: number): Promise<boolean> {
        await sleep(400);
        if (!authToken || loggedInUser?.role !== Role.ADMIN) throw new Error("Unauthorized");

        if (userId === 1) throw new Error("Cannot delete super admin.");
        
        const userIndex = mockUsers.findIndex(u => u.user_id === userId);
        if (userIndex > -1) {
            mockUsers.splice(userIndex, 1);
            // Also un-assign tasks from this user, or re-assign them
            mockTasks.forEach(task => {
                if (task.assignee_id === userId) {
                    task.assignee_id = 1; // Re-assign to admin
                }
            });
            return true;
        }
        return false;
    }
};