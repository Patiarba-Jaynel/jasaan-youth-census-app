
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">About POPCOM JASAAN</h1>
            
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Purpose</h2>
              <p className="text-gray-700 mb-4">
                POPCOM JASAAN is a comprehensive data collection and monitoring initiative designed to capture the 
                demographic profile, needs, and aspirations of the population across the 15 barangays of Jasaan, 
                Misamis Oriental, Philippines. This centralized database serves as a vital tool for evidence-based 
                policy-making and the development of targeted programs that support the well-being of youth and families 
                within the community.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Main Objectives</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>To create a comprehensive database of youth and overall sample population in Jasaan</li>
                <li>To identify the demographic characteristics of residents in each barangay</li>
                <li>To understand the educational and employment status of residents</li>
                <li>To assess the level of civic participation among young people</li>
                <li>To identify needs and priorities for youth and family development programs</li>
                <li>To inform the allocation of resources for youth-focused and family-focused initiatives</li>
              </ul>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">How The Data Will Be Used</h2>
              <p className="text-gray-700 mb-4">
                All information collected through the help of BPO (Barangay Population Officers) will be used solely for planning 
                and implementing youth and family development programs. Any personal information will be kept 
                confidential and will only be presented in aggregate form for statistical purposes.
              </p>
              <p className="text-gray-700">
                The data will help local government officials, youth organizations, and other stakeholders 
                design targeted interventions and allocate resources more effectively to address the 
                specific needs of young people and families in Jasaan.
              </p>
            </section>
            
            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Youth Classifications</h2>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">In-School Youth (ISY)</h3>
                  <p className="text-gray-700">Young people who are currently enrolled in formal education.</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Out-of-School Youth (OSY)</h3>
                  <p className="text-gray-700">Young people who are not currently enrolled in formal education.</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Working Youth (WY)</h3>
                  <p className="text-gray-700">Young people who are employed or self-employed.</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Youth with Special Needs (YSN)</h3>
                  <p className="text-gray-700">Young people with disabilities or special requirements.</p>
                </div>
              </div>
            </section>
            
            <div className="mt-10 text-center">
              <p className="mb-4 text-gray-700">Ready to participate in shaping the future of Jasaan?</p>
              <Button size="lg" asChild>
                <Link to="/census">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
