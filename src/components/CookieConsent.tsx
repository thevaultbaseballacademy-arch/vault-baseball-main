import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X, Settings, Shield, BarChart3, Target, Cog } from "lucide-react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCookieConsent, CookiePreferences } from "@/hooks/useCookieConsent";
import { toast } from "sonner";

const cookieCategories = [
  {
    key: "essential" as const,
    title: "Essential Cookies",
    description: "These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.",
    details: "Includes: Session cookies, authentication tokens, security cookies, load balancing cookies.",
    icon: Shield,
    required: true,
  },
  {
    key: "functional" as const,
    title: "Functional Cookies",
    description: "These cookies enable personalized features and functionality like remembering your preferences and settings.",
    details: "Includes: Language preferences, theme settings, user interface customizations, recently viewed content.",
    icon: Cog,
    required: false,
  },
  {
    key: "analytics" as const,
    title: "Analytics Cookies",
    description: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.",
    details: "Includes: Page visit tracking, scroll depth, click patterns, session duration, bounce rate analysis.",
    icon: BarChart3,
    required: false,
  },
  {
    key: "marketing" as const,
    title: "Marketing Cookies",
    description: "These cookies are used to track visitors across websites to display relevant advertisements.",
    details: "Includes: Advertising IDs, remarketing pixels, conversion tracking, social media integration cookies.",
    icon: Target,
    required: false,
  },
];

export const CookieConsent = () => {
  const {
    consentStatus,
    showBanner,
    setShowBanner,
    preferences,
    acceptAll,
    declineAll,
    saveCustomPreferences,
  } = useCookieConsent();

  const [showPreferences, setShowPreferences] = useState(false);
  const [localPrefs, setLocalPrefs] = useState<CookiePreferences>(preferences);
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  // Show floating button after consent has been given
  useEffect(() => {
    if (consentStatus !== "pending" && !showBanner) {
      // Small delay to avoid appearing immediately after consent
      const timer = setTimeout(() => setShowFloatingButton(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowFloatingButton(false);
    }
  }, [consentStatus, showBanner]);

  const handleOpenPreferences = () => {
    setLocalPrefs(preferences);
    setShowPreferences(true);
  };

  const handleSavePreferences = () => {
    saveCustomPreferences(localPrefs);
    setShowPreferences(false);
    toast.success("Cookie preferences saved");
  };

  const handleLocalToggle = (key: keyof CookiePreferences) => {
    if (key === "essential") return;
    setLocalPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAcceptAll = () => {
    acceptAll();
    toast.success("All cookies accepted");
  };

  const handleDecline = () => {
    declineAll();
    toast.success("Only essential cookies enabled");
  };

  return (
    <>
      {/* Floating Cookie Settings Button */}
      {showFloatingButton && !showPreferences && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleOpenPreferences}
              className="fixed bottom-4 left-4 z-40 p-3 bg-card border border-border rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
              aria-label="Cookie settings"
            >
              <Cookie className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Cookie Settings</p>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Cookie Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5 duration-300">
          <div className="max-w-4xl mx-auto bg-card border border-border rounded-lg shadow-lg p-4 md:p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <Cookie className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm text-foreground font-medium">
                    We value your privacy
                  </p>
                  <p className="text-xs text-muted-foreground">
                    We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                    You can choose to accept all cookies, decline non-essential cookies, or customize your preferences.{" "}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
                <button
                  onClick={handleDecline}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  aria-label="Close cookie banner"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={handleAcceptAll}>
                  Accept All
                </Button>
                <Button variant="outline" size="sm" onClick={handleDecline}>
                  Essential Only
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleOpenPreferences}
                  className="gap-1.5"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Customize
                </Button>
                <Link 
                  to="/cookie-settings" 
                  className="text-xs text-muted-foreground hover:text-foreground ml-auto"
                >
                  Manage settings page
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Preferences Dialog */}
      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary" />
              Cookie Preferences
            </DialogTitle>
            <DialogDescription>
              Customize which cookies you allow. Essential cookies cannot be disabled as they are required for the website to function.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="preferences" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="details">Cookie Details</TabsTrigger>
            </TabsList>

            <TabsContent value="preferences" className="mt-4">
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {cookieCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div 
                        key={category.key} 
                        className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
                      >
                        <div className="p-2 bg-background rounded-md shrink-0">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <Label 
                              htmlFor={`pref-${category.key}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {category.title}
                              {category.required && (
                                <span className="ml-1.5 text-[10px] text-primary font-normal uppercase">
                                  Always On
                                </span>
                              )}
                            </Label>
                            <Switch
                              id={`pref-${category.key}`}
                              checked={localPrefs[category.key]}
                              onCheckedChange={() => handleLocalToggle(category.key)}
                              disabled={category.required}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {category.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t">
                <Button onClick={handleSavePreferences} className="flex-1">
                  Save Preferences
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setLocalPrefs({
                      essential: true,
                      functional: true,
                      analytics: true,
                      marketing: true,
                    });
                  }}
                  className="flex-1"
                >
                  Accept All
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setLocalPrefs({
                      essential: true,
                      functional: false,
                      analytics: false,
                      marketing: false,
                    });
                  }}
                  className="flex-1"
                >
                  Essential Only
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              <ScrollArea className="h-[350px] pr-4">
                <div className="space-y-4">
                  {cookieCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div key={category.key} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className="h-4 w-4 text-primary" />
                          <h4 className="font-medium text-sm">{category.title}</h4>
                          {category.required ? (
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase">
                              Required
                            </span>
                          ) : (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${
                              localPrefs[category.key] 
                                ? "bg-green-500/10 text-green-600" 
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {localPrefs[category.key] ? "Enabled" : "Disabled"}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {category.description}
                        </p>
                        <p className="text-xs text-muted-foreground/80 italic">
                          {category.details}
                        </p>
                      </div>
                    );
                  })}

                  <div className="border rounded-lg p-4 bg-muted/30">
                    <h4 className="font-medium text-sm mb-2">More Information</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      For complete details about our cookie usage and data practices, please visit:
                    </p>
                    <div className="flex gap-3">
                      <Link 
                        to="/cookie-settings" 
                        className="text-xs text-primary hover:underline"
                        onClick={() => setShowPreferences(false)}
                      >
                        Full Cookie Settings
                      </Link>
                      <Link 
                        to="/privacy" 
                        className="text-xs text-primary hover:underline"
                        onClick={() => setShowPreferences(false)}
                      >
                        Privacy Policy
                      </Link>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};
