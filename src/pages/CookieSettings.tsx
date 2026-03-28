import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Cookie, Shield, BarChart3, Target, Cog, ArrowLeft, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { 
  useCookieConsent, 
  CookiePreferences, 
  COOKIE_PREFERENCES_KEY,
  defaultPreferences 
} from "@/hooks/useCookieConsent";

const CookieSettings = () => {
  const { resetBanner } = useCookieConsent();
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed, essential: true });
      } catch {
        setPreferences(defaultPreferences);
      }
    }
  }, []);

  const handleToggle = (key: keyof CookiePreferences) => {
    if (key === "essential") return; // Cannot disable essential cookies
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
    localStorage.setItem("vault_cookie_consent", "customized");
    setSaved(true);
    toast.success("Cookie preferences saved successfully");
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(allAccepted));
    localStorage.setItem("vault_cookie_consent", "accepted");
    setSaved(true);
    toast.success("All cookies accepted");
  };

  const handleRejectAll = () => {
    const onlyEssential: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    setPreferences(onlyEssential);
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(onlyEssential));
    localStorage.setItem("vault_cookie_consent", "declined");
    setSaved(true);
    toast.success("Only essential cookies enabled");
  };

  const cookieTypes = [
    {
      key: "essential" as const,
      title: "Essential Cookies",
      description: "These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot disable these cookies.",
      icon: Shield,
      required: true,
    },
    {
      key: "functional" as const,
      title: "Functional Cookies",
      description: "These cookies enable personalized features and functionality. They may be set by us or by third-party providers whose services we have added to our pages. If you disable these cookies, some or all of these features may not function properly.",
      icon: Cog,
      required: false,
    },
    {
      key: "analytics" as const,
      title: "Analytics Cookies",
      description: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website and services.",
      icon: BarChart3,
      required: false,
    },
    {
      key: "marketing" as const,
      title: "Marketing Cookies",
      description: "These cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user. They also help measure the effectiveness of advertising campaigns.",
      icon: Target,
      required: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-4xl mx-auto px-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Cookie className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-display text-foreground">Cookie Settings</h1>
              <p className="text-muted-foreground">Manage your cookie preferences</p>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>About Cookies</CardTitle>
              <CardDescription>
                We use cookies and similar technologies to help personalize content, tailor and measure ads, 
                and provide a better experience. By clicking "Accept All", you consent to this as further 
                described in our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleAcceptAll} className="gap-2">
                  <Check className="h-4 w-4" />
                  Accept All
                </Button>
                <Button variant="outline" onClick={handleRejectAll}>
                  Reject All
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4 mb-8">
            {cookieTypes.map((cookie) => {
              const Icon = cookie.icon;
              return (
                <Card key={cookie.key}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-muted rounded-lg shrink-0">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <Label 
                            htmlFor={cookie.key} 
                            className="text-base font-semibold cursor-pointer"
                          >
                            {cookie.title}
                            {cookie.required && (
                              <span className="ml-2 text-xs text-muted-foreground font-normal">
                                (Required)
                              </span>
                            )}
                          </Label>
                          <Switch
                            id={cookie.key}
                            checked={preferences[cookie.key]}
                            onCheckedChange={() => handleToggle(cookie.key)}
                            disabled={cookie.required}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {cookie.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              You can change your preferences at any time by returning to this page.
            </p>
            <Button 
              onClick={handleSavePreferences} 
              disabled={saved}
              className="w-full sm:w-auto"
            >
              {saved ? "Preferences Saved" : "Save Preferences"}
            </Button>
          </div>

          <Card className="mt-8 bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">More Information</h3>
              <p className="text-sm text-muted-foreground mb-4">
                For more details about how we use cookies and process your data, please read our:
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/privacy" className="text-sm text-primary hover:underline">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-sm text-primary hover:underline">
                  Terms of Service
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CookieSettings;
