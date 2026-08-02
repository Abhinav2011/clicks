import type { Metadata } from "next";
import Header from "@/components/Header";
import ContactCard from "@/components/ContactCard";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact — Still Frames Fujifilm Photo Gallery",
  description:
    "Get in touch with the photographer. Send a message regarding photo prints, licensing, collaborations, or Fujifilm gear inquiries.",
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-paper">
      <Header />

      <main className="flex-1 flex flex-col justify-center items-center py-8 sm:py-12">
        <div className="w-full">
          <ContactCard />
        </div>
      </main>

      <Footer />
    </div>
  );
}
