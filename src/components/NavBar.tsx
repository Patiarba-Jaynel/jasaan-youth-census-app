
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, BarChart3, Table, Settings, Activity } from "lucide-react";
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

  const handleLogout = () => {
    pbClient.auth.logout();
    document.dispatchEvent(new CustomEvent("auth-change"));
    toast.success("Logged out successfully");
    navigate("/");
    setIsOpen(false);
  };

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    ...(isLoggedIn
      ? [
          { href: "/dashboard", label: "Youth Dashboard", icon: Table },
          { href: "/dashboard/table", label: "Youth Table View", icon: Table },
          { href: "/dashboard/youth/activity", label: "Youth Activity", icon: Activity },
          { href: "/dashboard/consolidated", label: "Consolidated Dashboard", icon: BarChart3 },
          { href: "/dashboard/consolidated/activity", label: "Consolidated Activity", icon: Activity },
          { href: "/dashboard/settings", label: "Settings", icon: Settings },
        ]
      : [{ href: "/census", label: "Census Form" }]),
  ];

  const NavLinks = ({ mobile = false }) => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
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
            {Icon && <Icon size={16} />}
            {item.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Youth Census Jasaan
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <NavLinks />
          </nav>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link
              to="/"
              className="flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <span className="font-bold">Youth Census Jasaan</span>
            </Link>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-2">
                <NavLinks mobile />
                {isLoggedIn && (
                  <>
                    <div className="my-2 border-t" />
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="justify-start gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                      <LogOut size={16} />
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link to="/" className="flex items-center space-x-2 md:hidden">
              <span className="font-bold">Youth Census</span>
            </Link>
          </div>
          <nav className="flex items-center">
            {isLoggedIn && (
              <Button variant="ghost" onClick={handleLogout} className="hidden md:flex items-center gap-2">
                <LogOut size={16} />
                Logout
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
