import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, XCircle, Ban, ShieldAlert } from "lucide-react";

const RefundPolicy = () => {
  const effectiveDate = "January 18, 2026";
  const lastUpdated = "January 18, 2026";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <h1 className="font-bebas text-4xl md:text-5xl tracking-wide mb-2">Strict Refund & Cancellation Policy</h1>
        <p className="text-muted-foreground mb-8">Effective Date: {effectiveDate} | Last Updated: {lastUpdated}</p>
        
        <Card className="border-border/50">
          <CardContent className="p-6 md:p-8">
            <ScrollArea className="h-auto">
              <div className="prose prose-invert max-w-none space-y-6">
                {/* Critical Notice */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-red-400 text-lg mb-2">ALL SALES ARE FINAL — NO REFUNDS</h3>
                      <p className="text-muted-foreground">
                        VAULT™ maintains a strict NO REFUND policy. By completing any purchase on our Platform, you 
                        acknowledge that you have read, understood, and agree to be bound by this Policy in its entirety.
                      </p>
                    </div>
                  </div>
                </div>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">1. Overview</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    This Refund & Cancellation Policy ("Policy") governs all purchases made through VAULT™, operated 
                    via https://vault-baseball.lovable.app/ ("Platform," "we," "us," or "our"). By completing any 
                    purchase on our Platform, you ("Customer," "Athlete," "Organization," or "you") acknowledge that 
                    you have read, understood, and agree to be bound by this Policy in its entirety.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Ban className="w-5 h-5 text-red-500" />
                    2. No Refund Policy
                  </h2>
                  
                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">2.1 All Sales Are Final</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    All purchases made through VAULT™—including but not limited to individual memberships, Lifetime 
                    Athlete Access, Organization Fast-Pass licenses, training programs, digital content, video 
                    analysis tools, dashboard access, and any other products or services—are <strong className="text-foreground">non-refundable 
                    and non-transferable</strong>.
                  </p>

                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">2.2 Nature of Digital Products and Services</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    VAULT™ provides immediate access to proprietary digital training programs, frameworks, metrics 
                    dashboards, video libraries, and other digital content upon purchase. Due to the instant-access 
                    nature of our digital products and services, refunds cannot be issued once access has been granted.
                  </p>

                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">2.3 Acknowledgment Upon Purchase</h3>
                  <p className="text-muted-foreground mb-3">By completing a purchase, you expressly acknowledge and agree that:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>You are making an informed decision to purchase our products or services</li>
                    <li>You understand that all sales are final and non-refundable</li>
                    <li>You waive any right to request a refund, chargeback, or payment reversal</li>
                    <li>You have reviewed all product descriptions, program details, and terms prior to purchase</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">3. Cancellation Terms</h2>
                  
                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">3.1 Subscription Cancellation</h3>
                  <p className="text-muted-foreground mb-3">
                    For any subscription-based services, you may cancel your subscription at any time to prevent 
                    future billing. However:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>No partial refunds will be issued for unused portions of any billing period</li>
                    <li>Cancellation must be submitted in writing at least seven (7) days before your next billing date</li>
                    <li>Access to subscription services will continue through the end of the current paid billing cycle</li>
                    <li>Failure to cancel before the renewal date will result in automatic charge, which is non-refundable</li>
                  </ul>

                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">3.2 Auto-Renewal</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    All subscriptions auto-renew unless canceled in accordance with Section 3.1 above. You are 
                    solely responsible for managing your subscription status and cancellation.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">4. Organization & Partner Terms</h2>
                  
                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">4.1 Organization Fast-Pass and Partner Licenses</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    All Organization Fast-Pass licenses, annual agreements, and partner arrangements are non-refundable 
                    upon execution. Fees paid represent access to proprietary systems, dashboard features, and athlete 
                    management tools that are delivered immediately upon agreement.
                  </p>

                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">4.2 Early Termination</h3>
                  <p className="text-muted-foreground mb-3">
                    If an Organization or Partner terminates an agreement prior to the end of the contracted term:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>No refund or proration of fees will be issued</li>
                    <li>All outstanding balances become immediately due and payable</li>
                    <li>Access to VAULT™ systems will be revoked upon termination</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-500" />
                    5. Chargeback Policy
                  </h2>
                  
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground text-sm">
                        <strong className="text-amber-400">Warning:</strong> Initiating a chargeback in violation of 
                        this Policy constitutes a breach of contract and may result in account termination, 
                        collection action, and reporting to fraud prevention databases.
                      </p>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">5.1 Chargeback Policy</h3>
                  <p className="text-muted-foreground mb-3">
                    Initiating a chargeback or payment dispute with your bank, credit card company, or payment 
                    processor in violation of this Policy constitutes a breach of contract. If you initiate a 
                    chargeback or dispute:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Your access to all VAULT™ services will be immediately and permanently revoked</li>
                    <li>VAULT™ reserves the right to pursue collection of the original amount plus any fees, costs, 
                        and expenses incurred, including but not limited to chargeback fees, administrative costs, 
                        and attorney's fees</li>
                    <li>Your account may be flagged, and you may be prohibited from future purchases</li>
                    <li>VAULT™ may report the incident to fraud prevention databases and credit reporting agencies 
                        as permitted by law</li>
                  </ul>

                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">5.2 Dispute Resolution</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Before initiating any chargeback or dispute, you agree to contact VAULT™ directly at the contact 
                    information provided below to attempt resolution. Failure to do so will be considered a breach 
                    of this Policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">6. Limited Exceptions</h2>
                  
                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">6.1 Duplicate Charges</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    In the rare event of a verified duplicate charge caused by a technical error on our Platform, 
                    VAULT™ will refund the duplicate amount only. Proof of duplicate charge is required.
                  </p>

                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">6.2 Fraudulent Transactions</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    If your payment method was used fraudulently without your authorization, please contact us 
                    immediately along with a police report or fraud affidavit from your financial institution. 
                    Verified fraud cases will be addressed in compliance with applicable laws.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">7. Modifications</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    VAULT™ reserves the right to modify this Policy at any time. Changes will be effective upon 
                    posting to the Platform. Your continued use of the Platform after such changes constitutes 
                    acceptance of the modified Policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">8. Governing Law</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    This Policy shall be governed by and construed in accordance with the laws of the State of 
                    Texas, United States, without regard to its conflict of law provisions.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">9. Contact Information</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have questions about this Policy or believe you qualify for one of the limited 
                    exceptions, please contact us at:<br />
                    <strong className="text-foreground">VAULT™ Baseball Academy</strong><br />
                    Email: billing@vaultbaseball.com
                  </p>
                </section>

                {/* Final acknowledgment */}
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mt-6">
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    <strong className="text-foreground">By completing a purchase on VAULT™, you acknowledge that 
                    you have read, understood, and agree to this Strict Refund & Cancellation Policy. You confirm 
                    that all sales are final and that you waive any right to seek a refund except as expressly 
                    provided herein.</strong>
                  </p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default RefundPolicy;
