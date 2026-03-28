import { Instagram, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import vaultLogo from "@/assets/vault-logo-new.webp";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Brand */}
          <div className="max-w-sm">
            <div className="mb-4">
              <img 
                src={vaultLogo} 
                alt="The Vault Baseball Academy" 
                className="h-12 w-auto"
              />
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Develop elite baseball athletes through data-driven performance systems.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-8">
            <div>
              <h4 className="font-display text-sm text-foreground mb-3">TRAINING</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/courses" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    All Programs
                  </Link>
                </li>
                <li>
                  <Link to="/my-programs" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    My Programs
                  </Link>
                </li>
                <li>
                  <Link to="/certificate-leaderboard" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Leaderboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-display text-sm text-foreground mb-3">COMMUNITY</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/community" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Community Feed
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Contact & Support
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-display text-sm text-foreground mb-3">COACHES</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/certifications" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Certifications
                  </Link>
                </li>
                <li>
                  <Link to="/certifications/leaderboard" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Cert Leaderboard
                  </Link>
                </li>
                <li>
                  <Link to="/verify" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Verify Certificate
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-display text-sm text-foreground mb-3">LEGAL</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/refunds" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link to="/athlete-waiver" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Athlete Waiver
                  </Link>
                </li>
                <li>
                  <Link to="/cookie-settings" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Cookie Settings
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-display text-sm text-foreground mb-3">CONNECT</h4>
              <div className="flex gap-2">
                <a
                  href="#"
                  className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Vault Baseball. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/refunds" className="hover:text-foreground transition-colors">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;