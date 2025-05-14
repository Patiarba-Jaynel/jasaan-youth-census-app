
import React from "react";

export function Footer() {
  return (
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
  );
}

export default Footer;
