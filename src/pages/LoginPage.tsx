
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

import { pbClient } from "@/lib/pb-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      await pbClient.auth.login(email, password);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMessage = error?.data?.message || error?.message || "Invalid email or password";
      toast.error("Login failed", {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setIsResetLoading(true);
      await pbClient.collection('users').requestPasswordReset(resetEmail);
      toast.success("Password reset email sent!", {
        description: "Please check your email for reset instructions."
      });
      setIsForgotPasswordOpen(false);
      setResetEmail("");
    } catch (error: any) {
      console.error("Password reset failed:", error);
      const errorMessage = error?.data?.message || error?.message || "Failed to send reset email";
      toast.error("Password reset failed", {
        description: errorMessage
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row items-center justify-center min-h-[70vh] gap-12">
          {/* Left side - Logo and Branding */}
          <div className="flex-1 max-w-md text-center lg:text-left">
            <div className="mb-8">
              <img
                src="/jasaan-logo.png"
                alt="Jasaan Logo"
                className="h-32 w-32 mx-auto lg:mx-0 mb-6 object-contain"
              />
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Municipality of Jasaan
              </h1>
              <p className="text-xl text-gray-600 mb-4">Misamis Oriental</p>
              <div className="space-y-2 text-gray-600">
                <p className="text-lg">Data Management System</p>
                <p className="text-sm">Secure access to consolidated data and analytics</p>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="flex-1 max-w-md w-full">
            <Card className="shadow-lg">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Admin Portal
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Enter your credentials to access the dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-11"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
                
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Forgot your password?
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <div>
              <Label htmlFor="resetEmail">Email</Label>
              <Input
                id="resetEmail"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your email address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsForgotPasswordOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleForgotPassword} disabled={isResetLoading}>
              {isResetLoading ? "Sending..." : "Send Reset Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginPage;
