import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Left Side - Logo */}
        <div className="w-1/2 bg-white flex items-center justify-center p-8">
          <img
            src="/jasaan-logo.png"
            alt="Municipality of Jasaan Logo"
            className="object-contain w-60 h-60"
          />
        </div>

        {/* Right Side - Login Form */}
        <div className="w-1/2 p-8 flex flex-col justify-center">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-red-600 mb-1">Welcome!</h2>
            <p className="text-gray-700 mb-6">Monitor Jasaan Population</p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Email"
                          type="email"
                          {...field}
                          className="bg-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Password"
                          type="password"
                          {...field}
                          className="bg-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-right text-sm text-red-500 hover:underline cursor-pointer">
                  Forgot Password?
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </Form>

            <div className="text-center mt-4 text-sm">
              Don’t have an account?{" "}
              <a
                href="https://mail.google.com/mail/?view=cm&to=mpojasaan@gmail.com&su=Account%20Registration&body=Good%20day%2C%20this%20email%20serves%20as%20a%20registration%20for%20an%20account.%20Please%20see%20the%20details%20below%20for%20personal%20information%20for%20the%20account%20creation%20as%20an%20admin%3A%0A%0AName%3A%0AEmail%3A%0APassword%3A%0A%0AThank%20you."

                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 font-semibold hover:underline"
              >
                Sign Up
              </a>
            </div>
          </div>

          {/* Footer Text */}
          <div className="mt-10">
            <p className="text-xs text-center text-gray-400">
              &copy; 2025 <span className="font-medium">POPCOM Jasaan</span>. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
