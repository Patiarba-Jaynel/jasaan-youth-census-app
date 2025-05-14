
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/sonner";
import { Mail, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { pbClient } from "@/lib/pb-client";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (pbClient.auth.isLoggedIn()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginValues) => {
    try {
      setIsLoading(true);
      await pbClient.auth.login(data.email, data.password);
      document.dispatchEvent(new CustomEvent("auth-change"));
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed", {
        description: "Invalid email or password. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Left Side - Logo */}
          <div className="hidden md:flex w-1/2 bg-white items-center justify-center p-8">
            <img
              src="/jasaan-logo.png"
              alt="Municipality of Jasaan Logo"
              className="object-contain w-60 h-60"
            />
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
            <div className="flex-1">
              {/* Show logo on mobile */}
              <div className="md:hidden flex justify-center mb-8">
                <img
                  src="/jasaan-logo.png"
                  alt="Municipality of Jasaan Logo"
                  className="object-contain w-32 h-32"
                />
              </div>
              
              <h2 className="text-3xl font-bold text-red-600 mb-1">Welcome!</h2>
              <p className="text-gray-700 mb-6">Monitor Jasaan Population</p>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <FormControl>
                            <Input
                              placeholder="Email"
                              type="email"
                              {...field}
                              className="bg-white pl-10 h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <FormControl>
                            <Input
                              placeholder="Password"
                              type="password"
                              {...field}
                              className="bg-white pl-10 h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="text-right text-sm text-red-500 hover:underline cursor-pointer">
                    Forgot Password?
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 h-12 text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </Form>

              <div className="text-center mt-4 text-sm">
                Don't have an account?{" "}
                <span className="text-red-600 font-semibold hover:underline cursor-pointer">
                  Sign Up
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t py-10">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-red-600">POPCOM Jasaan</h3>
              <p className="text-sm text-gray-600 max-w-md">
                A comprehensive database management system for the local population of Jasaan, 
                Misamis Oriental, Philippines. Empowering through data.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-red-600">Contact Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Municipality of Jasaan</p>
                <p>Misamis Oriental, Region X</p>
                <p>Email: mpojasaan@gmail.com</p>
                <p>Contact no: +639973084028</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 border-t pt-6 text-center text-sm text-gray-500">
            <p>© 2025 Jasaan Youth Census. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
