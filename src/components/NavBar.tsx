import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { pbClient } from "@/lib/pb-client";
import { useEffect, useState } from "react";

export const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuthStatus = () => {
      setIsLoggedIn(pbClient.auth.isLoggedIn());
    };

    checkAuthStatus();

    const authListener = () => {
      checkAuthStatus();
    };

    document.addEventListener("auth-change", authListener);

    return () => {
      document.removeEventListener("auth-change", authListener);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between px-4 sm:px-8">
        {/* Logo and Title */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/popcom-logo.jpg"
              alt="POPCOM Logo"
              className="h-14 w-14 object-contain"
            />
            <span className="text-xl font-bold">POPCOM JASAAN</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex gap-4">
          <Link to="/">
            <Button variant="ghost">Home</Button>
          </Link>
          <Link to="/about">
            <Button variant="ghost">About</Button>
          </Link>
          {isLoggedIn ? (
            <Link to="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button>Login</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
