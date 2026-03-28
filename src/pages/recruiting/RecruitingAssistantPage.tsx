import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RecruitingAssistant from "@/components/profile/RecruitingAssistant";

const RecruitingAssistantPage = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/recruiting" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Recruiting Hub
          </Link>
          <RecruitingAssistant />
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default RecruitingAssistantPage;
