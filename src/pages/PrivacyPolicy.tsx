import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const PrivacyPolicy = () => {
  const lastUpdated = "January 16, 2026";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <h1 className="font-bebas text-4xl md:text-5xl tracking-wide mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {lastUpdated}</p>
        
        <Card className="border-border/50">
          <CardContent className="p-6 md:p-8">
            <ScrollArea className="h-auto">
              <div className="prose prose-invert max-w-none space-y-6">
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">1. Introduction</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    VAULT™ Baseball Academy ("we," "our," or "us") respects your privacy and is committed to protecting your 
                    personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                    information when you use our website, mobile applications, and services.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">2. Information We Collect</h2>
                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Name, email address, and phone number</li>
                    <li>Date of birth and graduation year</li>
                    <li>Physical attributes (height, weight) for athletic profiling</li>
                    <li>Payment and billing information</li>
                    <li>Profile photos and videos you upload</li>
                    <li>Athletic statistics and performance data</li>
                  </ul>
                  
                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Automatically Collected Information</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Device information (IP address, browser type, operating system)</li>
                    <li>Usage data (pages visited, features used, time spent)</li>
                    <li>Cookies and similar tracking technologies</li>
                    <li>Course progress and completion data</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Provide, operate, and maintain our Services</li>
                    <li>Process transactions and send related information</li>
                    <li>Track your course progress and issue certificates</li>
                    <li>Facilitate coach-athlete communication and assignments</li>
                    <li>Send promotional communications (with your consent)</li>
                    <li>Respond to your comments, questions, and support requests</li>
                    <li>Analyze usage and improve our Services</li>
                    <li>Detect, prevent, and address technical issues and fraud</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">4. Information Sharing</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    We may share your information in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li><strong className="text-foreground">With coaches:</strong> Assigned coaches can view your profile, athletic stats, and training progress</li>
                    <li><strong className="text-foreground">Service providers:</strong> Third parties who perform services on our behalf (payment processing, email delivery, analytics)</li>
                    <li><strong className="text-foreground">Legal requirements:</strong> When required by law or to protect our rights</li>
                    <li><strong className="text-foreground">Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                    <li><strong className="text-foreground">With your consent:</strong> When you explicitly authorize sharing</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Security</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We implement appropriate technical and organizational security measures to protect your personal information, 
                    including encryption, secure servers, and access controls. However, no method of transmission over the Internet 
                    is 100% secure. We cannot guarantee absolute security but strive to protect your information.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">6. Your Privacy Rights</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Depending on your location, you may have the following rights:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li><strong className="text-foreground">Access:</strong> Request a copy of your personal information</li>
                    <li><strong className="text-foreground">Correction:</strong> Request correction of inaccurate information</li>
                    <li><strong className="text-foreground">Deletion:</strong> Request deletion of your personal information</li>
                    <li><strong className="text-foreground">Portability:</strong> Receive your data in a portable format</li>
                    <li><strong className="text-foreground">Opt-out:</strong> Unsubscribe from marketing communications</li>
                    <li><strong className="text-foreground">Privacy controls:</strong> Manage visibility of your profile content</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-3">
                    You can manage many privacy settings directly in your account settings. For other requests, contact us at the 
                    email address below.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">7. Children's Privacy</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our Services are intended for users 13 and older. We do not knowingly collect personal information from 
                    children under 13 without parental consent. If you believe we have collected information from a child under 13, 
                    please contact us immediately so we can delete it.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">8. Cookies and Tracking</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We use cookies and similar technologies to enhance your experience, analyze usage, and deliver personalized 
                    content. You can control cookies through your browser settings, though disabling them may affect functionality.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">9. Third-Party Links</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our Services may contain links to third-party websites. We are not responsible for the privacy practices of 
                    these external sites. We encourage you to read their privacy policies before providing personal information.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">10. Data Retention</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We retain your personal information for as long as necessary to provide our Services, comply with legal 
                    obligations, resolve disputes, and enforce our agreements. When no longer needed, we securely delete or 
                    anonymize your information.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">11. International Transfers</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Your information may be transferred to and processed in countries other than your own. We ensure appropriate 
                    safeguards are in place to protect your information in accordance with this Privacy Policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">12. Changes to This Policy</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may update this Privacy Policy from time to time. We will notify you of material changes by posting the 
                    updated policy and changing the "Last updated" date. Your continued use of our Services after changes 
                    constitutes acceptance.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">13. Contact Us</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at:<br />
                    <strong className="text-foreground">VAULT™ Baseball Academy</strong><br />
                    Email: privacy@vaultbaseball.com
                  </p>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
