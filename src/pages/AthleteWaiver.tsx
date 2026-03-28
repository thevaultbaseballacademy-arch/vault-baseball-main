import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Shield, Heart, FileText } from "lucide-react";

const AthleteWaiver = () => {
  const effectiveDate = "January 18, 2026";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <h1 className="font-bebas text-4xl md:text-5xl tracking-wide mb-2">Athlete Waiver & Liability Release</h1>
        <p className="text-muted-foreground mb-8">Effective Date: {effectiveDate}</p>
        
        <Card className="border-border/50">
          <CardContent className="p-6 md:p-8">
            <ScrollArea className="h-auto">
              <div className="prose prose-invert max-w-none space-y-6">
                {/* Important Notice */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-amber-400 mb-2">IMPORTANT: Please Read Carefully</h3>
                      <p className="text-sm text-muted-foreground">
                        This document affects your legal rights. By participating in VAULT™ programs, you voluntarily 
                        assume all risks associated with athletic training activities and release VAULT™ from liability.
                      </p>
                    </div>
                  </div>
                </div>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">Parties</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    This Waiver and Liability Release Agreement ("Agreement") is entered into by and between 
                    VAULT™ ("Company," "we," "us," or "our") and the undersigned Athlete and/or Parent/Legal Guardian 
                    ("Participant," "Athlete," "you," or "your").
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    1. Acknowledgment of Risks
                  </h2>
                  
                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">1.1 Nature of Activities</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    I understand that participation in VAULT™ training programs, including but not limited to the 
                    12-Week Velocity System, 12-Week Athleticism Program, 8-Week Utility Development Program, arm care 
                    systems, and any associated physical training, involves inherent risks of physical injury.
                  </p>

                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">1.2 Specific Risks</h3>
                  <p className="text-muted-foreground mb-3">I acknowledge that baseball and athletic training activities may result in, but are not limited to, the following:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Muscle strains, sprains, tears, and pulls</li>
                    <li>Joint injuries including shoulder, elbow, wrist, knee, and ankle damage</li>
                    <li>Bone fractures and stress fractures</li>
                    <li>Concussions and head injuries</li>
                    <li>Back and spinal injuries</li>
                    <li>Heat exhaustion, dehydration, and heat stroke</li>
                    <li>Cardiac events</li>
                    <li>Overuse injuries</li>
                    <li>Injuries from equipment (bats, balls, weights, resistance bands, etc.)</li>
                    <li>Injuries from falls, collisions, or contact with objects or surfaces</li>
                    <li>Aggravation of pre-existing conditions</li>
                    <li>Permanent disability or death</li>
                  </ul>

                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">1.3 Voluntary Assumption of Risk</h3>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-muted-foreground leading-relaxed font-medium">
                      I VOLUNTARILY ASSUME ALL RISKS associated with participation in VAULT™ programs, whether known 
                      or unknown, foreseeable or unforeseeable. I understand that these risks cannot be eliminated 
                      entirely, regardless of the care taken to avoid injuries.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    2. Waiver and Release of Liability
                  </h2>
                  
                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">2.1 Release of Claims</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    In consideration for being permitted to participate in VAULT™ programs and services, I, on behalf 
                    of myself, my heirs, executors, administrators, legal representatives, assigns, and successors in 
                    interest, hereby RELEASE, WAIVE, DISCHARGE, AND COVENANT NOT TO SUE VAULT™, its owners, officers, 
                    directors, employees, agents, coaches, trainers, affiliates, partners, volunteers, sponsors, and 
                    representatives (collectively, "Released Parties") from any and all liability, claims, demands, 
                    actions, causes of action, costs, and expenses of any nature whatsoever arising out of or related 
                    to any loss, damage, or injury, including death, that may be sustained by me or my property while 
                    participating in VAULT™ programs.
                  </p>

                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">2.2 Scope of Release</h3>
                  <p className="text-muted-foreground mb-3">This release applies to:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>All in-person training sessions, camps, clinics, and events</li>
                    <li>All digital programs, video instruction, and online training content</li>
                    <li>Use of the VAULT™ metrics dashboard and tracking tools</li>
                    <li>Any exercises, drills, or activities performed independently based on VAULT™ programming</li>
                    <li>Travel to and from any VAULT™ events or training locations</li>
                    <li>Use of any equipment, facilities, or training aids</li>
                  </ul>

                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">2.3 Negligence Waiver</h3>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-muted-foreground leading-relaxed">
                      I EXPRESSLY AGREE THAT THIS RELEASE, WAIVER, AND INDEMNITY AGREEMENT IS INTENDED TO BE AS BROAD 
                      AND INCLUSIVE AS PERMITTED BY LAW AND THAT IF ANY PORTION IS HELD INVALID, THE REMAINING 
                      PORTIONS SHALL CONTINUE IN FULL LEGAL FORCE AND EFFECT.
                    </p>
                    <p className="text-muted-foreground leading-relaxed mt-2">
                      I agree that this release includes claims based on the negligence, action, or inaction of the 
                      Released Parties, but does not include claims arising from gross negligence or intentional misconduct.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">3. Indemnification</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    I agree to INDEMNIFY, DEFEND, AND HOLD HARMLESS the Released Parties from any and all claims, 
                    actions, suits, procedures, costs, expenses, damages, and liabilities, including attorney's fees, 
                    brought as a result of my involvement in VAULT™ programs and to reimburse them for any such 
                    expenses incurred.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    4. Medical Acknowledgments
                  </h2>
                  
                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">4.1 Physical Fitness</h3>
                  <p className="text-muted-foreground mb-3">I certify that:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>I am physically fit and capable of participating in athletic training activities</li>
                    <li>I have no medical conditions that would prevent safe participation</li>
                    <li>I have consulted with a physician regarding my ability to participate in strenuous physical activity</li>
                    <li>I am not aware of any medical reason that would make participation dangerous to my health</li>
                  </ul>

                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">4.2 Disclosure of Conditions</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    I agree to disclose any medical conditions, injuries, or limitations that may affect my 
                    participation. I understand that failure to disclose such information may increase my risk of 
                    injury and may affect my ability to seek damages from the Released Parties.
                  </p>

                  <h3 className="text-lg font-medium text-foreground mt-4 mb-2">4.3 Medical Authorization</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    In the event of an emergency, I authorize VAULT™ and its representatives to seek emergency 
                    medical care on my behalf. I agree to bear all costs associated with such emergency care.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-500" />
                    5. Parent/Guardian Consent (For Minors)
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If the Participant is under 18 years of age, a parent or legal guardian must sign this Agreement 
                    on behalf of the minor. By signing, the parent/guardian:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-3">
                    <li>Acknowledges all risks described herein on behalf of the minor</li>
                    <li>Releases and waives all claims on behalf of the minor</li>
                    <li>Agrees to indemnify the Released Parties for any claims brought by or on behalf of the minor</li>
                    <li>Represents that they have legal authority to bind the minor to this Agreement</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">6. Media Release</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    I grant VAULT™ permission to use my name, likeness, image, voice, and/or appearance in any 
                    photographs, videos, or other media for promotional, marketing, and educational purposes without 
                    compensation. I waive any right to inspect or approve any such materials.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">7. Governing Law & Dispute Resolution</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    This Agreement shall be governed by and construed in accordance with the laws of the State of 
                    Texas, without regard to conflict of law principles. Any disputes arising under this Agreement 
                    shall be resolved through binding arbitration in Texas, in accordance with the rules of the 
                    American Arbitration Association.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">8. Severability</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If any provision of this Agreement is found to be unenforceable, the remaining provisions shall 
                    continue in full force and effect. The unenforceable provision shall be modified to the minimum 
                    extent necessary to make it enforceable.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">9. Entire Agreement</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    This Agreement constitutes the entire agreement between the parties regarding the subject matter 
                    hereof and supersedes all prior agreements and understandings, whether written or oral.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">10. Acknowledgment</h2>
                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                    <p className="text-muted-foreground leading-relaxed font-medium">
                      BY CREATING AN ACCOUNT OR USING VAULT™ SERVICES, I ACKNOWLEDGE THAT I HAVE READ THIS AGREEMENT, 
                      FULLY UNDERSTAND ITS TERMS, UNDERSTAND THAT I HAVE GIVEN UP SUBSTANTIAL RIGHTS BY AGREEING TO 
                      IT, AND AGREE TO BE BOUND BY ITS TERMS FREELY AND VOLUNTARILY WITHOUT ANY INDUCEMENT.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">Contact Information</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have questions about this Waiver, please contact us at:<br />
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

export default AthleteWaiver;
