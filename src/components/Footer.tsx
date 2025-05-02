
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t bg-background py-8 mt-12">
      <div className="container px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Jasaan Youth Census</h3>
            <p className="text-sm text-muted-foreground">
              A comprehensive census system for the youth of Jasaan, Misamis Oriental.
              Empowering through data.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-sm text-muted-foreground hover:underline">
                Home
              </Link>
              <Link to="/census" className="text-sm text-muted-foreground hover:underline">
                Register
              </Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:underline">
                About the Census
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:underline">
                Contact Us
              </Link>
            </nav>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Municipality of Jasaan</p>
              <p>Misamis Oriental, Region X</p>
              <p>Email: youth@jasaan.gov.ph</p>
              <p>Tel: (088) 555-1234</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Jasaan Youth Census. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
