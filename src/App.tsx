import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { SportProvider } from "@/contexts/SportContext";
import { FoundersPricingBanner } from "@/components/FoundersPricingBanner";
import SessionExpiryHandler from "@/components/auth/SessionExpiryHandler";
import TrialProtectedRoute from "@/components/TrialProtectedRoute";
import RoleGuard from "@/components/RoleGuard";
import { Loader2 } from "lucide-react";
import { useAndroidBackButton } from "@/hooks/useAndroidBackButton";

import Index from "./pages/Index";
import Auth from "./pages/Auth";

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Account = lazy(() => import("./pages/Account"));
const Schedule = lazy(() => import("./pages/Schedule"));
const Checkin = lazy(() => import("./pages/Checkin"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const VaultDashboard = lazy(() => import("./pages/VaultDashboard"));
const CoachDashboard = lazy(() => import("./pages/CoachDashboard"));
const CoachDashboardLayout = lazy(() => import("./components/coach/CoachDashboardLayout"));
const CoachAthletes = lazy(() => import("./pages/coach/CoachAthletes"));
const CoachKPIs = lazy(() => import("./pages/coach/CoachKPIs"));
const CoachLessons = lazy(() => import("./pages/coach/CoachLessons"));
const CoachAssignments = lazy(() => import("./pages/coach/CoachAssignments"));
const CoachCreate = lazy(() => import("./pages/coach/CoachCreate"));
const CoachSchedule = lazy(() => import("./pages/coach/CoachSchedule"));
const CoachProfilePage = lazy(() => import("./pages/coach/CoachProfile"));
const CoachDownloads = lazy(() => import("./pages/coach/CoachDownloads"));
const Admin = lazy(() => import("./pages/Admin"));
const OwnerDashboardLayout = lazy(() => import("./components/admin/OwnerDashboardLayout"));
const OwnerOverview = lazy(() => import("./pages/admin/OwnerOverview"));
const OwnerRevenue = lazy(() => import("./pages/admin/OwnerRevenue"));
const OwnerUsers = lazy(() => import("./pages/admin/OwnerUsers"));
const OwnerContentQueue = lazy(() => import("./pages/admin/OwnerContentQueue"));
const OwnerContent = lazy(() => import("./pages/admin/OwnerContent"));
const OwnerIntelligence = lazy(() => import("./pages/admin/OwnerIntelligence"));
const OwnerSettings = lazy(() => import("./pages/admin/OwnerSettings"));
const OwnerMaintenance = lazy(() => import("./pages/admin/OwnerMaintenance"));
const OwnerAnalytics = lazy(() => import("./pages/admin/OwnerAnalytics"));
const OwnerHealthMetrics = lazy(() => import("./pages/admin/OwnerHealthMetrics"));
const OwnerAudit = lazy(() => import("./pages/admin/OwnerAudit"));
const OwnerExports = lazy(() => import("./pages/admin/OwnerExports"));
const Community = lazy(() => import("./pages/Community"));
const Profile = lazy(() => import("./pages/Profile"));
const Courses = lazy(() => import("./pages/Courses"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const MyPrograms = lazy(() => import("./pages/MyPrograms"));
const Notifications = lazy(() => import("./pages/Notifications"));
const NotFound = lazy(() => import("./pages/NotFound"));
const YouthPathway = lazy(() => import("./pages/YouthPathway"));
const AcademyPathway = lazy(() => import("./pages/AcademyPathway"));
const LongevityDashboard = lazy(() => import("./pages/LongevityDashboard"));
const WeeklyCalendar = lazy(() => import("./pages/WeeklyCalendar"));
const Certifications = lazy(() => import("./pages/Certifications"));
const CertificationExam = lazy(() => import("./pages/CertificationExam"));
const VideoExam = lazy(() => import("./pages/VideoExam"));
const VerifyCertification = lazy(() => import("./pages/VerifyCertification"));
const CertificationLeaderboard = lazy(() => import("./pages/CertificationLeaderboard"));
const PrivacySettings = lazy(() => import("./pages/PrivacySettings"));
const CertificationAnalytics = lazy(() => import("./pages/admin/CertificationAnalytics"));
const AdminCoaches = lazy(() => import("./pages/admin/AdminCoaches"));
const AdminExams = lazy(() => import("./pages/admin/AdminExams"));
const AdminCertifications = lazy(() => import("./pages/admin/AdminCertifications"));
const AdminPayouts = lazy(() => import("./pages/admin/AdminPayouts"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCanceled = lazy(() => import("./pages/PaymentCanceled"));
const LongevitySystem = lazy(() => import("./pages/products/LongevitySystem"));
const TransferSystem = lazy(() => import("./pages/products/TransferSystem"));
const VelocitySystem = lazy(() => import("./pages/products/VelocitySystem"));
const VelocityAccelerator = lazy(() => import("./pages/products/VelocityAccelerator"));
const TeamLicenses = lazy(() => import("./pages/products/TeamLicenses"));
const VeloCheck = lazy(() => import("./pages/products/VeloCheck"));
const Bundles = lazy(() => import("./pages/products/Bundles"));
const RecruitmentAudit = lazy(() => import("./pages/products/RecruitmentAudit"));
const CertifiedCoach = lazy(() => import("./pages/products/CertifiedCoach"));
const TransferIntensive = lazy(() => import("./pages/products/TransferIntensive"));
const VaultVerifiedCoach = lazy(() => import("./pages/products/VaultVerifiedCoach"));
const ShowcasePrep = lazy(() => import("./pages/products/ShowcasePrep"));
const VideoAnalysis = lazy(() => import("./pages/products/VideoAnalysis"));
const OrgStarterPack = lazy(() => import("./pages/products/OrgStarterPack"));
const OrgLicensing = lazy(() => import("./pages/products/OrgLicensing"));
const RemoteTraining = lazy(() => import("./pages/products/RemoteTraining"));
const FoundersAccess = lazy(() => import("./pages/products/FoundersAccess"));
const AthleteAssessment = lazy(() => import("./pages/products/AthleteAssessment"));
const PartnerClaim = lazy(() => import("./pages/PartnerClaim"));
const WallOfWins = lazy(() => import("./pages/WallOfWins"));
const Products = lazy(() => import("./pages/Products"));
const FindCoach = lazy(() => import("./pages/FindCoach"));
const SharedProfile = lazy(() => import("./pages/SharedProfile"));
const VerifyCourseCertificate = lazy(() => import("./pages/VerifyCourseCertificate"));
const CertificateLeaderboard = lazy(() => import("./pages/CertificateLeaderboard"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const AthleteWaiver = lazy(() => import("./pages/AthleteWaiver"));
const CookieSettings = lazy(() => import("./pages/CookieSettings"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const DeviceMetrics = lazy(() => import("./pages/DeviceMetrics"));
const DeviceIngestionPage = lazy(() => import("./pages/DeviceIngestion"));
const SharedMetricsView = lazy(() => import("./pages/SharedMetricsView"));
const Trial = lazy(() => import("./pages/Trial"));
const VelocityBaseline = lazy(() => import("./pages/VelocityBaseline"));
const TrialExpired = lazy(() => import("./pages/TrialExpired"));
const WhitePaper = lazy(() => import("./pages/WhitePaper"));
const BaselineAudit = lazy(() => import("./pages/BaselineAudit"));
const PerformanceBlueprint = lazy(() => import("./pages/PerformanceBlueprint"));
const CoachRegister = lazy(() => import("./pages/CoachRegister"));
const CoachOnboarding = lazy(() => import("./pages/CoachOnboarding"));
const LessonPackages = lazy(() => import("./pages/LessonPackages"));
const RemoteLessons = lazy(() => import("./pages/RemoteLessons"));
const GroupSessions = lazy(() => import("./pages/GroupSessions"));
const FreeVelocityGuide = lazy(() => import("./pages/FreeVelocityGuide"));
const FreeEvaluation = lazy(() => import("./pages/FreeEvaluation"));
const AthleteOnboarding = lazy(() => import("./pages/AthleteOnboarding"));
const RemoteTrainingHub = lazy(() => import("./pages/RemoteTrainingHub"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const CoachMarketplaceProfile = lazy(() => import("./pages/CoachMarketplaceProfile"));
const Claim22MAccess = lazy(() => import("./pages/Claim22MAccess"));
const ShortRedirect = lazy(() => import("./pages/ShortRedirect"));
const CoachManagement = lazy(() => import("./pages/CoachManagement"));
const OwnerCommandCenter = lazy(() => import("./pages/OwnerCommandCenter"));
const ProgressReport = lazy(() => import("./pages/ProgressReport"));
const BookSession = lazy(() => import("./pages/BookSession"));
const SoftballDevelopment = lazy(() => import("./pages/SoftballDevelopment"));
const SoftballLessonBooking = lazy(() => import("./pages/softball/SoftballLessonBooking"));
const SoftballCoaches = lazy(() => import("./pages/softball/SoftballCoaches"));
const SoftballLessonNotes = lazy(() => import("./pages/softball/SoftballLessonNotes"));
const SoftballCourses = lazy(() => import("./pages/softball/SoftballCourses"));
const SoftballProfile = lazy(() => import("./pages/softball/SoftballProfile"));
const SoftballPitching = lazy(() => import("./pages/softball/SoftballPitching"));
const SoftballHitting = lazy(() => import("./pages/softball/SoftballHitting"));
const SoftballFielding = lazy(() => import("./pages/softball/SoftballFielding"));
const SoftballAnalytics = lazy(() => import("./pages/softball/SoftballAnalytics"));
const SoftballPositionTracks = lazy(() => import("./pages/softball/SoftballPositionTracks"));
const RecruitingHub = lazy(() => import("./pages/recruiting/RecruitingHub"));
const RecruitingProfilePage = lazy(() => import("./pages/recruiting/RecruitingProfile"));
const RecruitingShowcases = lazy(() => import("./pages/recruiting/RecruitingShowcases"));
const RecruitingContacts = lazy(() => import("./pages/recruiting/RecruitingContacts"));
const RecruitingChecklist = lazy(() => import("./pages/recruiting/RecruitingChecklist"));
const RecruitingAssistantPage = lazy(() => import("./pages/recruiting/RecruitingAssistantPage"));
const ParentDashboardLayout = lazy(() => import("./components/parent/ParentDashboardLayout"));
const ParentAthletes = lazy(() => import("./pages/parent/ParentAthletes"));
const ParentProgress = lazy(() => import("./pages/parent/ParentProgress"));
const ParentLessons = lazy(() => import("./pages/parent/ParentLessons"));
const ParentRecruiting = lazy(() => import("./pages/parent/ParentRecruiting"));
const ParentWellness = lazy(() => import("./pages/parent/ParentWellness"));
const ParentTraining = lazy(() => import("./pages/parent/ParentTraining"));
const ParentMessages = lazy(() => import("./pages/parent/ParentMessages"));
const ParentDownloads = lazy(() => import("./pages/parent/ParentDownloads"));
const ParentProspect = lazy(() => import("./pages/parent/ParentProspect"));
const ParentAnalytics = lazy(() => import("./pages/parent/ParentAnalytics"));
const AthleteDownloads = lazy(() => import("./pages/AthleteDownloads"));
const WorkloadDashboard = lazy(() => import("./pages/workload/WorkloadDashboard"));
const PitchLog = lazy(() => import("./pages/workload/PitchLog"));
const ArmCare = lazy(() => import("./pages/workload/ArmCare"));
const InjuryLog = lazy(() => import("./pages/workload/InjuryLog"));
const DailyWorkloadLog = lazy(() => import("./pages/workload/DailyWorkloadLog"));
const TournamentMode = lazy(() => import("./pages/workload/TournamentMode"));
const TeamHub = lazy(() => import("./pages/team/TeamHub"));
const TeamRoster = lazy(() => import("./pages/team/TeamRoster"));
const TeamSchedule = lazy(() => import("./pages/team/TeamSchedule"));
const TeamAnnouncements = lazy(() => import("./pages/team/TeamAnnouncements"));
const TeamAnalytics = lazy(() => import("./pages/team/TeamAnalytics"));
const MentalPerformance = lazy(() => import("./pages/MentalPerformance"));
const NutritionCoach = lazy(() => import("./pages/NutritionCoach"));
const ProspectGrader = lazy(() => import("./pages/ProspectGrader"));
const GameIntelligence = lazy(() => import("./pages/GameIntelligence"));
const Pricing = lazy(() => import("./pages/Pricing"));
const ParentHub = lazy(() => import("./pages/parent/ParentHub"));
const ParentEducation = lazy(() => import("./pages/parent/ParentEducation"));
const StateOfGame = lazy(() => import("./pages/StateOfGame"));
const RecoverySystem = lazy(() => import("./pages/RecoverySystem"));
const StrengthConditioning = lazy(() => import("./pages/StrengthConditioning"));
const PracticePlanBuilder = lazy(() => import("./pages/team/PracticePlanBuilder"));
const DPFlexBuilder = lazy(() => import("./pages/softball/DPFlexBuilder"));

const CookieConsent = lazy(() => import("@/components/CookieConsent").then(m => ({ default: m.CookieConsent })));
const EddieAIChat = lazy(() => import("@/components/EddieAIChat").then(m => ({ default: m.EddieAIChat })));

const CoursesRedirect = () => {
  const { courseId } = useParams<{ courseId: string }>();
  return <Navigate to={`/course/${courseId}`} replace />;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AndroidBackButtonHandler = () => {
  useAndroidBackButton();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SubscriptionProvider>
      <SportProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AndroidBackButtonHandler />
          <FoundersPricingBanner />
          <SessionExpiryHandler />
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/account" element={<Account />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/checkin" element={<Checkin />} />
            <Route path="/dashboard" element={<TrialProtectedRoute><Dashboard /></TrialProtectedRoute>} />
            <Route path="/downloads" element={<TrialProtectedRoute><AthleteDownloads /></TrialProtectedRoute>} />
            <Route path="/vault" element={<TrialProtectedRoute><VaultDashboard /></TrialProtectedRoute>} />
            <Route path="/coach" element={<RoleGuard requiresRole={["coach", "owner"]}><CoachDashboardLayout /></RoleGuard>}>
              <Route index element={<CoachAthletes />} />
              <Route path="kpis" element={<CoachKPIs />} />
              <Route path="lessons" element={<CoachLessons />} />
              <Route path="assignments" element={<CoachAssignments />} />
              <Route path="create" element={<CoachCreate />} />
              <Route path="schedule" element={<CoachSchedule />} />
              <Route path="profile" element={<CoachProfilePage />} />
              <Route path="downloads" element={<CoachDownloads />} />
            </Route>
            <Route path="/coach-dashboard" element={<RoleGuard requiresRole={["coach", "owner"]}><CoachDashboard /></RoleGuard>} />
            <Route path="/owner" element={<RoleGuard requires="view_revenue_dashboard"><OwnerCommandCenter /></RoleGuard>} />
            <Route path="/admin" element={<RoleGuard requires="view_platform_settings"><OwnerDashboardLayout /></RoleGuard>}>
              <Route index element={<OwnerOverview />} />
              <Route path="revenue" element={<RoleGuard requires="view_revenue_dashboard"><OwnerRevenue /></RoleGuard>} />
              <Route path="users" element={<RoleGuard requires="view_all_users"><OwnerUsers /></RoleGuard>} />
              <Route path="content/queue" element={<RoleGuard requires="approve_content"><OwnerContentQueue /></RoleGuard>} />
              <Route path="content" element={<RoleGuard requires="approve_content"><OwnerContent /></RoleGuard>} />
              <Route path="intelligence" element={<RoleGuard requires="view_intelligence_rules"><OwnerIntelligence /></RoleGuard>} />
              <Route path="settings" element={<RoleGuard requires="view_platform_settings"><OwnerSettings /></RoleGuard>} />
              <Route path="analytics" element={<RoleGuard requires="view_platform_analytics"><OwnerAnalytics /></RoleGuard>} />
              <Route path="health" element={<RoleGuard requires="view_platform_analytics"><OwnerHealthMetrics /></RoleGuard>} />
              <Route path="maintenance" element={<RoleGuard requires="view_platform_settings"><OwnerMaintenance /></RoleGuard>} />
              <Route path="audit" element={<RoleGuard requires="view_audit_log"><OwnerAudit /></RoleGuard>} />
              <Route path="certification-analytics" element={<RoleGuard requires="view_platform_analytics"><CertificationAnalytics /></RoleGuard>} />
              <Route path="coaches" element={<RoleGuard requires="view_all_users"><AdminCoaches /></RoleGuard>} />
              <Route path="exams" element={<RoleGuard requires="view_platform_settings"><AdminExams /></RoleGuard>} />
              <Route path="certifications" element={<RoleGuard requires="view_platform_settings"><AdminCertifications /></RoleGuard>} />
              <Route path="payouts" element={<RoleGuard requires="process_payouts"><AdminPayouts /></RoleGuard>} />
              <Route path="coach-management" element={<RoleGuard requires="view_all_users"><CoachManagement /></RoleGuard>} />
              <Route path="exports" element={<RoleGuard requires="view_revenue_dashboard"><OwnerExports /></RoleGuard>} />
            </Route>
            <Route path="/community" element={<TrialProtectedRoute><Community /></TrialProtectedRoute>} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:courseId" element={<CoursesRedirect />} />
            <Route path="/course/:courseId" element={<TrialProtectedRoute><CourseDetail /></TrialProtectedRoute>} />
            <Route path="/my-programs" element={<TrialProtectedRoute><MyPrograms /></TrialProtectedRoute>} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/pathway/youth" element={<YouthPathway />} />
            <Route path="/pathway/academy" element={<AcademyPathway />} />
            <Route path="/longevity" element={<TrialProtectedRoute><LongevityDashboard /></TrialProtectedRoute>} />
            <Route path="/calendar" element={<TrialProtectedRoute><WeeklyCalendar /></TrialProtectedRoute>} />
            <Route path="/certifications" element={<Certifications />} />
            <Route path="/certifications/exam/:certType" element={<CertificationExam />} />
            <Route path="/certifications/video-exam/:certType" element={<VideoExam />} />
            <Route path="/certifications/leaderboard" element={<CertificationLeaderboard />} />
            <Route path="/verify" element={<VerifyCertification />} />
            <Route path="/privacy-settings" element={<PrivacySettings />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-canceled" element={<PaymentCanceled />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/longevity" element={<LongevitySystem />} />
            <Route path="/products/transfer" element={<TransferSystem />} />
            <Route path="/products/velocity-system" element={<VelocitySystem />} />
            <Route path="/products/velocity-accelerator" element={<VelocityAccelerator />} />
            <Route path="/products/teams" element={<TeamLicenses />} />
            <Route path="/products/velo-check" element={<VeloCheck />} />
            <Route path="/products/bundles" element={<Bundles />} />
            <Route path="/products/recruitment" element={<RecruitmentAudit />} />
            <Route path="/products/certified-coach" element={<CertifiedCoach />} />
            <Route path="/products/transfer-intensive" element={<TransferIntensive />} />
            <Route path="/products/vault-verified" element={<VaultVerifiedCoach />} />
            <Route path="/products/showcase-prep" element={<ShowcasePrep />} />
            <Route path="/products/video-analysis" element={<VideoAnalysis />} />
            <Route path="/products/org-starter-pack" element={<OrgStarterPack />} />
            <Route path="/products/org-licensing" element={<OrgLicensing />} />
            <Route path="/products/remote-training" element={<RemoteTraining />} />
            <Route path="/products/founders-access" element={<FoundersAccess />} />
            <Route path="/products/athlete-assessment" element={<AthleteAssessment />} />
            <Route path="/partner-claim" element={<PartnerClaim />} />
            <Route path="/wall-of-wins" element={<WallOfWins />} />
            <Route path="/find-coach" element={<FindCoach />} />
            <Route path="/shared/:token" element={<SharedProfile />} />
            <Route path="/verify-course-certificate" element={<VerifyCourseCertificate />} />
            <Route path="/certificate-leaderboard" element={<CertificateLeaderboard />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/refunds" element={<RefundPolicy />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/athlete-waiver" element={<AthleteWaiver />} />
            <Route path="/cookie-settings" element={<CookieSettings />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/device-metrics" element={<TrialProtectedRoute allowTrialAccess><DeviceMetrics /></TrialProtectedRoute>} />
            <Route path="/data-ingestion" element={<TrialProtectedRoute><DeviceIngestionPage /></TrialProtectedRoute>} />
            <Route path="/shared-metrics/:token" element={<SharedMetricsView />} />
            <Route path="/trial" element={<Trial />} />
            <Route path="/velocity-baseline" element={<TrialProtectedRoute allowTrialAccess><VelocityBaseline /></TrialProtectedRoute>} />
            <Route path="/trial-expired" element={<TrialExpired />} />
            <Route path="/white-paper" element={<WhitePaper />} />
            <Route path="/baseline-audit" element={<BaselineAudit />} />
            <Route path="/performance-blueprint" element={<PerformanceBlueprint />} />
            <Route path="/coach-register" element={<CoachRegister />} />
            <Route path="/coach-onboarding" element={<CoachOnboarding />} />
            <Route path="/lesson-packages" element={<LessonPackages />} />
            <Route path="/remote-lessons" element={<RemoteLessons />} />
            <Route path="/group-sessions" element={<GroupSessions />} />
            <Route path="/free-velocity-guide" element={<FreeVelocityGuide />} />
            <Route path="/athlete-onboarding" element={<AthleteOnboarding />} />
            <Route path="/evaluate" element={<FreeEvaluation />} />
            <Route path="/training-hub" element={<RemoteTrainingHub />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/coach/:coachId" element={<CoachMarketplaceProfile />} />
            <Route path="/progress-report/:token" element={<ProgressReport />} />
            <Route path="/book-session" element={<BookSession />} />
            <Route path="/claim-22m" element={<Claim22MAccess />} />
            <Route path="/softball" element={<TrialProtectedRoute><SoftballDevelopment /></TrialProtectedRoute>} />
            <Route path="/softball/lessons/booking" element={<SoftballLessonBooking />} />
            <Route path="/softball/lessons/coaches" element={<SoftballCoaches />} />
            <Route path="/softball/lessons/notes" element={<SoftballLessonNotes />} />
            <Route path="/softball/courses" element={<SoftballCourses />} />
            <Route path="/softball/profile" element={<SoftballProfile />} />
            <Route path="/softball/pitching" element={<SoftballPitching />} />
            <Route path="/softball/hitting" element={<SoftballHitting />} />
            <Route path="/softball/fielding" element={<SoftballFielding />} />
            <Route path="/softball/analytics" element={<SoftballAnalytics />} />
            <Route path="/softball/position-tracks" element={<SoftballPositionTracks />} />
            <Route path="/recruiting" element={<TrialProtectedRoute><RecruitingHub /></TrialProtectedRoute>} />
            <Route path="/recruiting/profile" element={<TrialProtectedRoute><RecruitingProfilePage /></TrialProtectedRoute>} />
            <Route path="/recruiting/showcases" element={<TrialProtectedRoute><RecruitingShowcases /></TrialProtectedRoute>} />
            <Route path="/recruiting/contacts" element={<TrialProtectedRoute><RecruitingContacts /></TrialProtectedRoute>} />
            <Route path="/recruiting/checklist" element={<TrialProtectedRoute><RecruitingChecklist /></TrialProtectedRoute>} />
            <Route path="/recruiting/assistant" element={<TrialProtectedRoute><RecruitingAssistantPage /></TrialProtectedRoute>} />
            <Route path="/parent" element={<RoleGuard requiresRole={["parent", "athlete", "owner"]}><ParentDashboardLayout /></RoleGuard>}>
              <Route index element={<ParentHub />} />
              <Route path="progress" element={<ParentProgress />} />
              <Route path="lessons" element={<ParentLessons />} />
              <Route path="training" element={<ParentTraining />} />
              <Route path="wellness" element={<ParentWellness />} />
              <Route path="recruiting" element={<ParentRecruiting />} />
              <Route path="messages" element={<ParentMessages />} />
              <Route path="downloads" element={<ParentDownloads />} />
              <Route path="prospect" element={<ParentProspect />} />
              <Route path="analytics" element={<ParentAnalytics />} />
              <Route path="education" element={<ParentEducation />} />
            </Route>
            <Route path="/workload" element={<TrialProtectedRoute><WorkloadDashboard /></TrialProtectedRoute>} />
            <Route path="/workload/pitch-log" element={<TrialProtectedRoute><PitchLog /></TrialProtectedRoute>} />
            <Route path="/workload/arm-care" element={<TrialProtectedRoute><ArmCare /></TrialProtectedRoute>} />
            <Route path="/workload/injuries" element={<TrialProtectedRoute><InjuryLog /></TrialProtectedRoute>} />
            <Route path="/workload/daily-log" element={<TrialProtectedRoute><DailyWorkloadLog /></TrialProtectedRoute>} />
            <Route path="/workload/tournament" element={<TrialProtectedRoute><TournamentMode /></TrialProtectedRoute>} />
            <Route path="/team" element={<TrialProtectedRoute><TeamHub /></TrialProtectedRoute>} />
            <Route path="/team/roster" element={<TrialProtectedRoute><TeamRoster /></TrialProtectedRoute>} />
            <Route path="/team/schedule" element={<TrialProtectedRoute><TeamSchedule /></TrialProtectedRoute>} />
            <Route path="/team/announcements" element={<TrialProtectedRoute><TeamAnnouncements /></TrialProtectedRoute>} />
            <Route path="/team/analytics" element={<TrialProtectedRoute><TeamAnalytics /></TrialProtectedRoute>} />
            <Route path="/team/practice-plans" element={<RoleGuard requiresRole={["coach", "owner"]}><PracticePlanBuilder /></RoleGuard>} />
            <Route path="/mental-performance" element={<TrialProtectedRoute><MentalPerformance /></TrialProtectedRoute>} />
            <Route path="/nutrition-coach" element={<TrialProtectedRoute><NutritionCoach /></TrialProtectedRoute>} />
            <Route path="/prospect-grader" element={<TrialProtectedRoute><ProspectGrader /></TrialProtectedRoute>} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/game-intelligence" element={<TrialProtectedRoute><GameIntelligence /></TrialProtectedRoute>} />
            <Route path="/recovery-system" element={<TrialProtectedRoute><RecoverySystem /></TrialProtectedRoute>} />
            <Route path="/state-of-game" element={<TrialProtectedRoute><StateOfGame /></TrialProtectedRoute>} />
            <Route path="/strength-conditioning" element={<TrialProtectedRoute><StrengthConditioning /></TrialProtectedRoute>} />
            <Route path="/softball/dp-flex" element={<RoleGuard requiresRole={["coach", "owner"]}><DPFlexBuilder /></RoleGuard>} />
            <Route path="/app" element={<ShortRedirect />} />
            <Route path="/training" element={<ShortRedirect />} />
            <Route path="/start" element={<ShortRedirect />} />
            <Route path="/22m" element={<ShortRedirect />} />
            <Route path="/coaching" element={<ShortRedirect />} />
            <Route path="/join" element={<ShortRedirect />} />
            <Route path="/programs" element={<ShortRedirect />} />
            <Route path="/velocity" element={<ShortRedirect />} />
            <Route path="/founders" element={<ShortRedirect />} />
            <Route path="/guide" element={<ShortRedirect />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          <Suspense fallback={null}>
            <CookieConsent />
            <EddieAIChat />
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
      </SportProvider>
    </SubscriptionProvider>
  </QueryClientProvider>
);

export default App;
