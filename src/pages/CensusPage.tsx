
import { NavBar } from "@/components/NavBar";
import { CensusForm } from "@/components/CensusForm";
import { Footer } from "@/components/Footer";

const CensusPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Youth Census Registration</h1>
            <p className="text-muted-foreground mt-2">
              Complete this form to register for the Jasaan Youth Census
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
