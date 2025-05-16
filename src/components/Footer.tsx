
import { Link } from "react-router-dom";

export function Footer() {
  // Function to scroll to top when clicking home link
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <footer className="border-t bg-background py-8 mt-12">
      <div className="container px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand/Intro */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">POPCOM JASAAN</h3>
            <p className="text-sm text-muted-foreground">
              A comprehensive database system for local population across 15 barangays in Jasaan, Misamis Oriental, Philippines.
              Empowering through data.
            </p>
          </div>

          {/* Contact and Quick Links in one line */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Municipality of Jasaan</p>
                <p>Misamis Oriental, Region 10</p>
                <p>Email: mpojasaan@gmail.com</p>
                <p>Contact: +639973084028 | +639754687528</p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Quick Links</h3>
              <nav className="flex flex-col space-y-2">
                <Link 
                  to="/" 
                  className="text-sm text-muted-foreground hover:underline"
                  onClick={scrollToTop}
                >
                  Home
                </Link>
                <Link to="/census" className="text-sm text-muted-foreground hover:underline">
                  Register
                </Link>
                <Link 
                  to="/about" 
                  className="text-sm text-muted-foreground hover:underline"
                  onClick={scrollToTop}
                >
                  About
                </Link>
                <a
                  href="https://mail.google.com/mail/?view=cm&to=saguilayan.keshiadawn21@gmail.com&su=Inquiry&body=Good%20day!%0A%0AI%20am%20writing%20this%20email%20to%20[reason].%20Thank%20you%20for%20your%20time."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Help
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} POPCOM Jasaan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
