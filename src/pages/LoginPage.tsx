
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

import { pbClient } from "@/lib/pb-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card className="w-full max-w-4xl mx-4 shadow-xl bg-white">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            {/* Left side - Logo and Seal */}
            <div className="flex-1 flex items-center justify-center p-12 bg-white">
              <div className="text-center">
                <img
                  src="/jasaan-logo.png"
                  alt="Municipality of Jasaan Official Seal"
                  className="h-80 w-80 mx-auto mb-8 object-contain"
                />
              </div>
            </div>

            {/* Right side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-12 bg-gray-50">
              <div className="w-full max-w-md">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-red-600 mb-2">Welcome!</h1>
                  <p className="text-gray-600 text-lg">Monitor Jasaan Population</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="h-12 bg-gray-100 border-0 text-gray-800 placeholder-gray-600"
                      required
                    />
                  </div>
                  
                  <div>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="h-12 bg-gray-100 border-0 text-gray-800 placeholder-gray-600"
                      required
                    />
                  </div>

                  <div className="text-right">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setIsForgotPasswordOpen(true)}
                      className="text-red-500 hover:text-red-600 p-0 h-auto text-sm"
                    >
                      Forgot Password?
                    </Button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold text-lg" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Login"}
                  </Button>
                </form>

                <div className="text-center mt-8">
                  <p className="text-gray-500 text-sm">
                    © 2025 POPCOM Jasaan. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
