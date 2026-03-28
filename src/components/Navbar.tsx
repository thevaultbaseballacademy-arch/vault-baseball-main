import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, ChevronRight, Loader2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import vaultLogo from "@/assets/vault-logo-new.webp";
import NotificationBell from "@/components/notifications/NotificationBell";
import NavSportToggle from "@/components/NavSportToggle";


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCoach, setIsCoach] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setMobileExpanded(null);
    setActiveDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        checkUserRoles(session.user.id);
        checkOwner(session.user.email);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => checkUserRoles(session.user.id), 0);
        checkOwner(session.user.email);
      } else {
        setIsCoach(false);
        setIsAdmin(false);
        setIsOwner(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkOwner = async (email?: string | null) => {
    if (!email) {
      setIsOwner(false);
      return;
    }
    try {
      const { data } = await supabase
        .from("team_whitelist")
        .select("admin_access, full_access")
        .eq("email", email.toLowerCase())
        .maybeSingle();
      setIsOwner(!!(data?.admin_access && data?.full_access));
    } catch {
      setIsOwner(false);
    }
  };

  const checkUserRoles = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (data) {
        setIsCoach(data.some(r => r.role === 'coach'));
        setIsAdmin(data.some(r => r.role === 'admin'));
      }
    } catch (error) {
      console.error('Error checking user roles:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleNavigate = useCallback((href: string) => {
    setIsOpen(false);
    setActiveDropdown(null);
    setMobileExpanded(null);
    
    if (href.startsWith("#") || href.includes("#")) {
      if (href.startsWith("/#")) {
        navigate("/");
        setTimeout(() => {
          const el = document.querySelector(href.replace("/", ""));
          el?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        const el = document.querySelector(href);
        el?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(href);
    }
  }, [navigate]);

  // Desktop dropdown handlers with debounced close
  const handleMouseEnter = (name: string) => {
    if (dropdownTimeout.current) {
      clearTimeout(dropdownTimeout.current);
      dropdownTimeout.current = null;
    }
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Programs", href: "/courses" },
    { name: "Book Session", href: "/book-session" },
    { name: "Pricing", href: "/pricing" },
    { name: "Submit Video", href: "/evaluate" },
    {
      name: "Train",
      href: "/strength-conditioning",
      submenu: [
        { name: "Strength & Conditioning", href: "/strength-conditioning" },
        { name: "Nutrition Coach", href: "/nutrition-coach" },
        { name: "Mental Performance", href: "/mental-performance" },
        { name: "Workload Tracker", href: "/workload" },
        { name: "Device Metrics", href: "/device-metrics" },
        { name: "Recovery System", href: "/recovery-system" },
        { name: "Game Intelligence™", href: "/game-intelligence" },
        { name: "Prospect Grader™", href: "/prospect-grader" },
        { name: "State of the Game™", href: "/state-of-game" },
        { name: "Game Intelligence™", href: "/game-intelligence" },
      ],
    },
    { 
      name: "Products", 
      href: "/products",
      dropdown: [
        { name: "All Products", href: "/products" },
        { name: "12-Week Velocity System", href: "/products/velocity-system" },
        { name: "Velocity Accelerator", href: "/products/velocity-accelerator" },
        { name: "Velo-Check Analysis", href: "/products/velo-check" },
        { name: "Recruitment Audit", href: "/products/recruitment" },
        { name: "Longevity System", href: "/products/longevity" },
        { name: "Transfer System", href: "/products/transfer" },
        { name: "Team Licenses", href: "/products/teams" },
        { name: "Coach Certification", href: "/products/certified-coach" },
        { name: "Bundles", href: "/products/bundles" },
      ]
    },
    { 
      name: "Coaching", 
      href: "/marketplace",
      dropdown: [
        { name: "Coach Marketplace", href: "/marketplace" },
        { name: "Find a Coach", href: "/find-coach" },
        { name: "Lesson Packages", href: "/lesson-packages" },
        { name: "Group Sessions", href: "/group-sessions" },
        { name: "Become a Coach", href: "/coach-register" },
      ]
    },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <button onClick={() => handleNavigate("/")} className="flex items-center">
            <img 
              src={vaultLogo} 
              alt="The Vault Baseball Academy" 
              className="h-12 md:h-14 w-auto"
            />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => link.dropdown ? handleMouseEnter(link.name) : undefined}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => handleNavigate(link.href)}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
                >
                  {link.name}
                  {link.dropdown && <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdown === link.name ? "rotate-180" : ""}`} />}
                </button>
                
                {/* Desktop Dropdown */}
                <AnimatePresence>
                  {link.dropdown && activeDropdown === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-56 bg-card rounded-xl shadow-xl border border-border overflow-hidden z-50"
                      onMouseEnter={() => handleMouseEnter(link.name)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {link.dropdown.map((item) => (
                        <button
                          key={item.name}
                          onClick={() => handleNavigate(item.href)}
                          className="w-full text-left block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        >
                          {item.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={() => handleNavigate("/products/founders-access")}
              className="mr-1 bg-amber-500 hover:bg-amber-600 text-[#181818] font-bold text-xs"
            >
              🔥 $499 Lifetime
            </Button>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : user ? (
              <div className="flex items-center gap-1">
                <NavSportToggle />
                <NotificationBell userId={user.id} />
                {isOwner && (
                  <Button variant="ghost" size="sm" onClick={() => handleNavigate("/owner")} className="text-primary">
                    <Crown className="w-4 h-4 mr-1" />
                    Owner
                  </Button>
                )}
                {isAdmin && !isOwner && (
                  <Button variant="ghost" size="sm" onClick={() => handleNavigate("/admin")}>
                    Admin
                  </Button>
                )}
                {isCoach && (
                  <Button variant="ghost" size="sm" onClick={() => handleNavigate("/coach")}>
                    Coach
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleNavigate("/dashboard")}>
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleNavigate("/remote-lessons")}>
                  My Lessons
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleNavigate("/account")}>
                  Account
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleNavigate("/auth")}>
                  Log In
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleNavigate("/auth")}>
                  Join Vault
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-border overflow-hidden max-h-[80vh] overflow-y-auto"
            >
              <div className="py-3 flex flex-col gap-0.5">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    <button
                      onClick={() => {
                        if (link.dropdown) {
                          setMobileExpanded(mobileExpanded === link.name ? null : link.name);
                        } else {
                          handleNavigate(link.href);
                        }
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors rounded-lg font-medium"
                    >
                      <span>{link.name}</span>
                      {link.dropdown && (
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileExpanded === link.name ? "rotate-180" : ""}`} />
                      )}
                    </button>
                    
                    {/* Mobile Sub-menu */}
                    <AnimatePresence>
                      {link.dropdown && mobileExpanded === link.name && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-4 pl-3 border-l-2 border-primary/30 mb-2">
                            {link.dropdown.map((item) => (
                              <button
                                key={item.name}
                                onClick={() => handleNavigate(item.href)}
                                className="w-full text-left block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                              >
                                {item.name}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                {/* Mobile Auth/User Section */}
                <div className="flex flex-col gap-1.5 pt-3 mt-2 border-t border-border px-2">
                  <Button 
                    className="justify-center bg-amber-500 hover:bg-amber-600 text-[#181818] font-bold" 
                    onClick={() => handleNavigate("/products/founders-access")}
                  >
                    🔥 $499 Lifetime - Limited Window
                  </Button>
                  {user ? (
                    <>
                      <div className="flex justify-center py-2">
                        <NavSportToggle />
                      </div>
                      {isOwner && (
                        <Button variant="ghost" className="justify-center text-primary" onClick={() => handleNavigate("/owner")}>
                          <Crown className="w-4 h-4 mr-2" />
                          Owner Command Center
                        </Button>
                      )}
                      {isAdmin && !isOwner && (
                        <Button variant="ghost" className="justify-center" onClick={() => handleNavigate("/admin")}>
                          Admin
                        </Button>
                      )}
                      {isCoach && (
                        <Button variant="ghost" className="justify-center" onClick={() => handleNavigate("/coach")}>
                          Coach Dashboard
                        </Button>
                      )}
                      <Button variant="ghost" className="justify-center" onClick={() => handleNavigate("/dashboard")}>
                        Dashboard
                      </Button>
                      <Button variant="ghost" className="justify-center" onClick={() => handleNavigate("/remote-lessons")}>
                        My Lessons
                      </Button>
                      <Button variant="ghost" className="justify-center" onClick={() => handleNavigate("/vault")}>
                        VAULT™
                      </Button>
                      <Button variant="ghost" className="justify-center" onClick={() => handleNavigate("/community")}>
                        Community
                      </Button>
                      <Button variant="ghost" className="justify-center" onClick={() => handleNavigate("/account")}>
                        Account
                      </Button>
                      <Button variant="outline" className="justify-center" onClick={handleSignOut}>
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="ghost" className="flex-1 justify-center" onClick={() => handleNavigate("/auth")}>
                        Log In
                      </Button>
                      <Button variant="vault" className="flex-1 justify-center" onClick={() => handleNavigate("/auth")}>
                        Join Vault
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
