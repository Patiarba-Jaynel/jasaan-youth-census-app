
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

const Index = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-40 gradient-bg">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center text-white">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  POPCOM JASAAN {currentYear}
                </h1>
                <p className="mx-auto max-w-[700px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-white/80">
                  Be counted. Be heard. Shape the future of Jasaan.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Internal Features Section */}
        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Centralized Data Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Manage and review demographic records from all 15 barangays in one unified system, ensuring consistent and secure data access.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Real-Time Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Instantly track census activity, submissions, and trends to support timely and informed decision-making.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Secure Admin Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Tools for authorized personnel to manage user access, export data, and maintain system integrity.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="w-full py-12 md:py-24 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 md:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  About the Census
                </h2>
                <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  POPCOM JASAAN is a comprehensive data storage and monitoring initiative aimed at understanding
                  the demographic profile, needs, and aspirations of the local population in 15 barangays within Jasaan, Misamis Oriental.
                  This system supports evidence-based policy-making and program development for youth and families in the community.
                </p>
                <Button asChild>
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Admin CTA Section */}
        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Admin Access
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  This census system is for internal use only and accessible by authorized personnel.
                  Please log in with your admin credentials to proceed.
                </p>
              </div>
              <Button size="lg" asChild>
                <Link to="/login">Admin Login</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
