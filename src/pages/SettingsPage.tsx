/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit, Trash2, Save, Users, Settings, Database } from "lucide-react";
import { pbClient } from "@/lib/pb-client";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created: string;
  updated: string;
}

const SettingsPage = () => {
  const navigate = useNavigate();
   
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  
  const [userForm, setUserForm] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    role: "user"
  });

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = pbClient.auth.isLoggedIn();
      if (!isLoggedIn) {
        toast.error("Authentication required");
        navigate("/login");
        return;
      }

      try {
        const authData = pbClient.auth.getAuthData();
        setCurrentUser(authData?.record);
        
        if (authData?.record) {
          setProfileForm({
            name: authData.record.name || "",
            email: authData.record.email || "",
            newPassword: "",
            confirmPassword: ""
          });
        }

        // Only load users if current user is admin
        if (authData?.record?.role === 'admin') {
          await loadUsers();
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      const records = await pbClient.collection('users').getFullList();
      const typedUsers: User[] = records.map(record => ({
        id: record.id,
        email: record.email || "",
        name: record.name || "",
        role: record.role || "user",
        created: record.created,
        updated: record.updated
      }));
      setUsers(typedUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    }
  };

  const handleCreateUser = async () => {
    if (userForm.password !== userForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!userForm.email || !userForm.name || !userForm.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      console.log("Creating user with data:", {
        email: userForm.email,
        name: userForm.name,
        role: userForm.role
      });

      const userData = {
        email: userForm.email,
        name: userForm.name,
        password: userForm.password,
        passwordConfirm: userForm.confirmPassword,
        role: userForm.role
      };

      const createdUser = await pbClient.collection('users').create(userData);
      console.log("User created successfully:", createdUser);

      toast.success("User created successfully");
      setIsUserDialogOpen(false);
      setUserForm({ email: "", name: "", password: "", confirmPassword: "", role: "user" });
      await loadUsers();
    } catch (error: any) {
      console.error("Error creating user:", error);
      const errorMessage = error?.data?.message || error?.message || "Failed to create user";
      toast.error(errorMessage);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    if (!userForm.email || !userForm.name) {
      toast.error("Email and name are required");
      return;
    }

    const updateData: any = {
      email: userForm.email,
      name: userForm.name,
      role: userForm.role
    };

    if (userForm.password) {
      if (userForm.password !== userForm.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      updateData.password = userForm.password;
      updateData.passwordConfirm = userForm.confirmPassword;
    }

    try {
      console.log("Updating user with data:", updateData);
      const updatedUser = await pbClient.collection('users').update(editingUser.id, updateData);
      console.log("User updated successfully:", updatedUser);
      
      toast.success("User updated successfully");
      setIsUserDialogOpen(false);
      setEditingUser(null);
      setUserForm({ email: "", name: "", password: "", confirmPassword: "", role: "user" });
      await loadUsers();
    } catch (error: any) {
      console.error("Error updating user:", error);
      const errorMessage = error?.data?.message || error?.message || "Failed to update user";
      toast.error(errorMessage);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error("Cannot delete your own account");
      return;
    }

    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await pbClient.collection('users').delete(userId);
      toast.success("User deleted successfully");
      await loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleUpdateProfile = async () => {
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (!profileForm.email || !profileForm.name) {
      toast.error("Email and name are required");
      return;
    }

    try {
      const updateData: any = {
        name: profileForm.name,
        email: profileForm.email
      };

      if (profileForm.newPassword) {
        updateData.password = profileForm.newPassword;
        updateData.passwordConfirm = profileForm.confirmPassword;
      }

      console.log("Updating profile with data:", updateData);
      const updatedUser = await pbClient.collection('users').update(currentUser.id, updateData);
      console.log("Profile updated successfully:", updatedUser);
      
      toast.success("Profile updated successfully");
      setIsProfileDialogOpen(false);
      
      // Refresh auth data
      const authData = pbClient.auth.getAuthData();
      setCurrentUser(authData?.record);
      
      // Update profile form with new data
      if (authData?.record) {
        setProfileForm({
          name: authData.record.name || "",
          email: authData.record.email || "",
          newPassword: "",
          confirmPassword: ""
        });
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage = error?.data?.message || error?.message || "Failed to update profile";
      toast.error(errorMessage);
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setUserForm({
      email: user.email,
      name: user.name,
      password: "",
      confirmPassword: "",
      role: user.role
    });
    setIsUserDialogOpen(true);
  };

  const setSpecificUserAsAdmin = async () => {
    try {
      // Find the user with email saguilayan.keshiadawn21@gmail.com
      const users = await pbClient.collection('users').getFullList({
        filter: 'email = "saguilayan.keshiadawn21@gmail.com"'
      });
      
      if (users.length > 0) {
        const user = users[0];
        await pbClient.collection('users').update(user.id, { role: 'admin' });
        toast.success("User saguilayan.keshiadawn21@gmail.com has been set as admin");
        if (isAdmin) {
          await loadUsers();
        }
      } else {
        toast.error("User saguilayan.keshiadawn21@gmail.com not found");
      }
    } catch (error) {
      console.error("Error setting user as admin:", error);
      toast.error("Failed to set user as admin");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-center h-[60vh]">
              <p className="text-lg">Loading settings...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate("/dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <h1 className="text-3xl font-bold mb-8">Settings</h1>

          <div className="grid gap-6">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <p className="text-sm text-muted-foreground">{currentUser?.name || "N/A"}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm text-muted-foreground">{currentUser?.email || "N/A"}</p>
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Badge variant={currentUser?.role === 'admin' ? 'default' : 'secondary'}>
                      {currentUser?.role === 'admin' ? 'Admin' : 'User'}
                    </Badge>
                  </div>
                  <Button onClick={() => setIsProfileDialogOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* User Management - Only show for admins */}
            {isAdmin && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={setSpecificUserAsAdmin}>
                      Set Keshia as Admin
                    </Button>
                    <Button onClick={() => setIsUserDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name || "N/A"}</TableCell>
                          <TableCell>{user.email || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role === 'admin' ? 'Admin' : 'User'}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(user.created).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => openEditDialog(user)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              {user.id !== currentUser?.id && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Role Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Role Permissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-600">Admin Role</h4>
                    <p className="text-sm text-muted-foreground">
                      Full access to all features including data management (CRUD operations) and user management
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-600">User Role</h4>
                    <p className="text-sm text-muted-foreground">
                      Access to data operations (Create, Read, Update, Delete) but cannot manage users
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />

      {/* User Create/Edit Dialog */}
      {isAdmin && (
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={userForm.name}
                  onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={userForm.role} onValueChange={(value) => setUserForm({...userForm, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User (CRUD access only)</SelectItem>
                    <SelectItem value="admin">Admin (Full access)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="password">{editingUser ? 'New Password (optional)' : 'Password *'}</Label>
                <Input
                  id="password"
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                  placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={userForm.confirmPassword}
                  onChange={(e) => setUserForm({...userForm, confirmPassword: e.target.value})}
                  placeholder="Confirm password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={editingUser ? handleUpdateUser : handleCreateUser}>
                <Save className="mr-2 h-4 w-4" />
                {editingUser ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Profile Edit Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="profileName">Name *</Label>
              <Input
                id="profileName"
                value={profileForm.name}
                onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="profileEmail">Email *</Label>
              <Input
                id="profileEmail"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                placeholder="Enter your email address"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password (optional)</Label>
              <Input
                id="newPassword"
                type="password"
                value={profileForm.newPassword}
                onChange={(e) => setProfileForm({...profileForm, newPassword: e.target.value})}
                placeholder="Leave blank to keep current password"
              />
            </div>
            <div>
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={profileForm.confirmPassword}
                onChange={(e) => setProfileForm({...profileForm, confirmPassword: e.target.value})}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProfile}>
              <Save className="mr-2 h-4 w-4" />
              Update Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
