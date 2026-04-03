import re, os, subprocess

open('capacitor.config.ts','w').write('import type { CapacitorConfig } from "@capacitor/cli";\nconst config: CapacitorConfig = {\n  appId: "com.vaultbaseball.os",\n  appName: "VAULT OS",\n  webDir: "dist",\n  server: { androidScheme: "https", iosScheme: "app", hostname: "vaultos" },\n  plugins: {\n    PushNotifications: { presentationOptions: ["badge", "sound", "alert"] },\n    NativeBiometric: { useFallback: true },\n    SplashScreen: { launchShowDuration: 2000, launchAutoHide: true, backgroundColor: "#0d0d0d", androidScaleType: "CENTER_CROP", showSpinner: false },\n    StatusBar: { style: "Dark", backgroundColor: "#0d0d0d" },\n  },\n  ios: { scheme: "App", contentInset: "automatic", backgroundColor: "#0d0d0d", preferredContentMode: "mobile", limitsNavigationsToAppBoundDomains: false, allowsLinkPreview: false },\n  android: { allowMixedContent: false, backgroundColor: "#0d0d0d", captureInput: true, webContentsDebuggingEnabled: false },\n};\nexport default config;\n')
print("capacitor.config.ts rewritten")

open('src/components/ui/sonner.tsx','w').write('import { Toaster as Sonner, toast } from "sonner";\ntype ToasterProps = React.ComponentProps<typeof Sonner>;\nconst Toaster = ({ ...props }: ToasterProps) => {\n  return (\n    <Sonner\n      theme="dark"\n      className="toaster group"\n      toastOptions={{\n        classNames: {\n          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",\n          description: "group-[.toast]:text-muted-foreground",\n          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",\n          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",\n        },\n      }}\n      {...props}\n    />\n  );\n};\nexport { Toaster, toast };\n')
print("sonner.tsx patched")

content = open('index.html').read()
content = re.sub(r'    <link rel="preconnect" href="https://fonts\.googleapis\.com"[^\n]*\n', '', content)
content = re.sub(r'    <link rel="preconnect" href="https://fonts\.gstatic\.com"[^\n]*\n', '', content)
content = re.sub(r'    <link href="https://fonts\.googleapis\.com[^\n]*\n', '', content)
open('index.html','w').write(content)
print("index.html Google Fonts removed")

content = open('src/App.tsx').read()
content = content.replace('import { Toaster as Sonner } from "@/components/ui/sonner";\n', '')
content = content.replace('import { Toaster as Sonner } from "@/components/ui/sonner"', '')
content = content.replace('        <Sonner />\n', '')
content = content.replace('        <Sonner/>\n', '')
content = content.replace('        <Sonner />', '')
content = content.replace('        <Sonner/>', '')
open('src/App.tsx','w').write(content)
print("App.tsx Sonner removed")

for path in ['src/contexts/SubscriptionContext.tsx', 'src/contexts/SportContext.tsx']:
    c = open(path).read()
    c = c.replace('useState(true)', 'useState(false)')
    c = c.replace('loading: true,', 'loading: false,')
    open(path,'w').write(c)
    print(f"{path} patched")

path = 'src/hooks/useBiometricAuth.ts'
if os.path.exists(path):
    c = open(path).read()
    c = c.replace('isChecking: true,', 'isChecking: false,')
    open(path,'w').write(c)
    print("useBiometricAuth patched")

content = open('vite.config.ts').read()
if 'base:' not in content:
    content = content.replace("export default defineConfig(({ mode }) => ({", "export default defineConfig(({ mode }) => ({\n  base: \"./\",")
    open('vite.config.ts','w').write(content)
    print("vite.config.ts base path set to ./")
else:
    content = re.sub(r'base:\s*["\'].*?["\']', 'base: "./"', content)
    open('vite.config.ts','w').write(content)
    print("vite.config.ts base path confirmed ./")

print("ALL PATCHES COMPLETE")
