
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const NavBar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">JY</div>
            <span>Jasaan Youth Census</span>
          </Link>
        </div>
        <nav className="flex gap-4">
          <Link to="/">
            <Button variant="ghost">Home</Button>
          </Link>
          <Link to="/census">
            <Button variant="ghost">Register</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};
