import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const TermsOfService = () => {
  const lastUpdated = "January 16, 2026";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <h1 className="font-bebas text-4xl md:text-5xl tracking-wide mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: {lastUpdated}</p>
        
        <Card className="border-border/50">
          <CardContent className="p-6 md:p-8">
            <ScrollArea className="h-auto">
              <div className="prose prose-invert max-w-none space-y-6">
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    By accessing or using VAULT™ Baseball Academy's website, mobile applications, courses, training programs, 
                    and related services (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). 
                    If you do not agree to these Terms, please do not use our Services.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">2. Eligibility</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You must be at least 13 years of age to use our Services. If you are under 18, you represent that you have 
                    your parent or guardian's permission to use the Services. Parents or guardians who register on behalf of 
                    minors accept these Terms on the minor's behalf and are responsible for the minor's use of the Services.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">3. Account Registration</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    To access certain features, you must create an account. You agree to provide accurate, current, and complete 
                    information and to update such information as necessary. You are responsible for safeguarding your account 
                    credentials and for all activities under your account. Notify us immediately of any unauthorized use.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">4. Subscription and Payment Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Certain Services require payment. By subscribing or purchasing, you authorize us to charge the payment 
                    method you provide. Subscriptions automatically renew unless canceled before the renewal date. Prices are 
                    subject to change with notice. All fees are non-refundable except as stated in our Refund Policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">5. License and Content Usage</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We grant you a limited, non-exclusive, non-transferable license to access and use the Services for personal, 
                    non-commercial purposes. All content, including videos, text, graphics, logos, and software, is owned by 
                    VAULT™ Baseball Academy or its licensors. You may not copy, modify, distribute, sell, or lease any part of 
                    our Services or content without express written permission.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">6. User Conduct</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You agree not to: (a) use the Services for any unlawful purpose; (b) harass, abuse, or harm others; 
                    (c) post content that is defamatory, obscene, or infringes intellectual property rights; (d) attempt to 
                    gain unauthorized access to any part of the Services; (e) interfere with the proper operation of the Services; 
                    or (f) share your account credentials with others.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">7. User-Generated Content</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You may post content to community features. You retain ownership of your content but grant us a worldwide, 
                    royalty-free license to use, display, and distribute it in connection with the Services. You represent that 
                    you have all rights necessary to grant this license. We may remove content that violates these Terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">8. Certifications and Credentials</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Certificates earned through our programs are issued at our discretion and may be revoked for violations 
                    of these Terms or professional misconduct. Certificates are for personal use and do not constitute 
                    professional licensing. We reserve the right to modify certification requirements and validity periods.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">9. Disclaimer of Warranties</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    THE SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR 
                    IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT 
                    WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED OR ERROR-FREE.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">10. Limitation of Liability</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, VAULT™ BASEBALL ACADEMY SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                    INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICES. OUR TOTAL 
                    LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">11. Physical Activity Disclaimer</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our training programs involve physical activity that carries inherent risks of injury. You acknowledge that 
                    you participate at your own risk. Consult a physician before beginning any exercise program. We are not 
                    responsible for any injuries sustained during training activities.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">12. Termination</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may terminate or suspend your account at any time for violations of these Terms or for any other reason 
                    at our discretion. Upon termination, your right to use the Services ceases immediately. Provisions that 
                    should survive termination will remain in effect.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">13. Governing Law</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    These Terms are governed by the laws of the State of Texas, United States, without regard to conflict of 
                    law principles. Any disputes shall be resolved in the courts located in Texas.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">14. Changes to Terms</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may update these Terms from time to time. We will notify you of material changes by posting the updated 
                    Terms on our website and updating the "Last updated" date. Your continued use of the Services after changes 
                    constitutes acceptance of the new Terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">15. Contact Us</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have questions about these Terms, please contact us at:<br />
                    <strong className="text-foreground">VAULT™ Baseball Academy</strong><br />
                    Email: legal@vaultbaseball.com
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

export default TermsOfService;
