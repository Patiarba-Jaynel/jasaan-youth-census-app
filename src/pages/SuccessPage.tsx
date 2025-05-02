
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const SuccessPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6 max-w-md mx-auto">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="rounded-full bg-green-100 p-4">
              <Check className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold">Registration Successful!</h1>
            <p className="text-muted-foreground">
              Thank you for registering with the Jasaan Youth Census. Your contribution helps us better understand and address the needs of the youth in our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild>
                <Link to="/">Return to Home</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SuccessPage;
