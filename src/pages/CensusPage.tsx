
import { NavBar } from "@/components/NavBar";
import { CensusForm } from "@/components/CensusForm";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { pbClient } from "@/lib/pb-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CensusPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const isAuth = pbClient.auth.isValid;
        setIsAuthenticated(isAuth);
        
        if (!isAuth) {
          // Redirect to login if not authenticated
          navigate("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate]);

  if (!isAuthenticated) {
    return null; // Don't render anything while checking auth or redirecting
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate("/dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Youth Census Registration</h1>
            <p className="text-muted-foreground mt-2">
              Admin Portal: Add new youth registrations to the census database
            </p>
          </div>
          <CensusForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CensusPage;
