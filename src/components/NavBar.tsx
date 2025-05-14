
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
    
    // Check on initial load
    checkAuthStatus();
    
    // Set up a listener for auth changes (e.g. logout events)
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
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-2">
          <Link to={isLoggedIn ? "/dashboard" : "/login"} className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">JY</div>
            <span>Jasaan Youth Census</span>
          </Link>
        </div>
        <nav className="flex gap-4">
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
