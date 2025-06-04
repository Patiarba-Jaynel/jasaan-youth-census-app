
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { pbClient } from "@/lib/pb-client";
import { toast } from "@/components/ui/sonner";

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(pbClient.auth.isLoggedIn());
    };

    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };

    document.addEventListener("auth-change", handleAuthChange);
    return () => document.removeEventListener("auth-change", handleAuthChange);
  }, []);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    ...(isLoggedIn
      ? []
      : [{ href: "/census", label: "Census Form" }]),
  ];

  const NavLinks = ({ mobile = false }) => (
    <>
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        
        return (
          <Link
            key={item.href}
            to={item.href}
            className={`${
              mobile
                ? "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors"
                : "text-sm font-medium transition-colors hover:text-primary"
            } ${
              isActive
                ? mobile
                  ? "bg-primary text-primary-foreground"
                  : "text-primary"
                : mobile
                ? "text-muted-foreground hover:text-foreground hover:bg-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => mobile && setIsOpen(false)}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <img 
            src="/popcom-logo.jpg" 
            alt="POPCOM Logo" 
            className="h-10 w-10 rounded-full object-cover"
          />
          <Link to="/" className="text-xl font-bold text-gray-900">
            POPCOM JASAAN
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLinks />
          {isLoggedIn && (
            <Button 
              onClick={() => navigate("/dashboard")} 
              variant="destructive"
              size="sm"
              className="bg-red-600 hover:bg-red-700"
            >
              Dashboard
            </Button>
          )}
        </nav>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="/popcom-logo.jpg" 
                alt="POPCOM Logo" 
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="text-lg font-bold">POPCOM JASAAN</span>
            </div>
            <div className="flex flex-col space-y-2">
              <NavLinks mobile />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
