import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";


import { TooltipProvider } from "@/components/ui/tooltip";
import CalendarPage from "./pages/CalendarPage";
import VideoReviews from "./pages/VideoReviews";
import PracticeLessons from "./pages/PracticeLessons";
import OnlineLessons from "./pages/OnlineLessons";
import VenueDetail from "./pages/VenueDetail";

import Messages from "./pages/Messages";
import MessageDetail from "./pages/MessageDetail";
import MyPage from "./pages/MyPage";
import CoachDashboard from "./pages/CoachDashboard";
import EarningsHistory from "./pages/EarningsHistory";
import CoachingHistory from "./pages/CoachingHistory";
import ReviewHistory from "./pages/ReviewHistory";
import ReviewDetail from "./pages/ReviewDetail";
import BankSettings from "./pages/BankSettings";
import ScheduleSettings from "./pages/ScheduleSettings";
import ProfileEdit from "./pages/ProfileEdit";
import PasswordChange from "./pages/PasswordChange";
import VenueSettings from "./pages/VenueSettings";
import CourseSettings from "./pages/CourseSettings";
import LessonDetail from "./pages/LessonDetail";
import ReviewRequestDetail from "./pages/ReviewRequestDetail";
import OnlineLesson from "./pages/OnlineLesson";
import Notifications from "./pages/Notifications";
import NotificationDetail from "./pages/NotificationDetail";
import LanguageSettings from "./pages/LanguageSettings";
import Welcome from "./pages/Welcome";
import Signup from "./pages/Signup";
import SignupOtp from "./pages/SignupOtp";
import SignupSocial from "./pages/SignupSocial";
import SignupPassword from "./pages/SignupPassword";
import SignupComplete from "./pages/SignupComplete";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ForgotPasswordOtp from "./pages/ForgotPasswordOtp";
import ForgotPasswordReset from "./pages/ForgotPasswordReset";
import ForgotPasswordComplete from "./pages/ForgotPasswordComplete";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      
      
      <BrowserRouter>
        <Routes>
          {/* Tab pages */}
          <Route path="/" element={<CoachDashboard />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/practice-lessons" element={<PracticeLessons />} />
          <Route path="/online-lessons" element={<OnlineLessons />} />
          <Route path="/video-reviews" element={<VideoReviews />} />
          <Route path="/venue-detail" element={<VenueDetail />} />
          
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:id" element={<MessageDetail />} />
          <Route path="/mypage" element={<MyPage />} />

          {/* Coach sub-pages */}
          <Route path="/dashboard" element={<CoachDashboard />} />
          <Route path="/earnings" element={<EarningsHistory />} />
          <Route path="/coaching-history" element={<CoachingHistory />} />
          <Route path="/reviews" element={<ReviewHistory />} />
          <Route path="/reviews/:id" element={<ReviewDetail />} />
          <Route path="/bank-settings" element={<BankSettings />} />
          <Route path="/schedule-settings" element={<ScheduleSettings />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/password-change" element={<PasswordChange />} />
          <Route path="/venue-settings" element={<VenueSettings />} />
          <Route path="/course-settings" element={<CourseSettings />} />

          {/* Detail pages */}
          <Route path="/lesson/:id" element={<LessonDetail />} />
          <Route path="/review-request/:id" element={<ReviewRequestDetail />} />
          <Route path="/online-lesson" element={<OnlineLesson />} />

          {/* Notifications */}
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/notifications/:id" element={<NotificationDetail />} />
          <Route path="/language" element={<LanguageSettings />} />

          {/* Auth */}
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signup/otp" element={<SignupOtp />} />
          <Route path="/signup/social" element={<SignupSocial />} />
          <Route path="/signup/password" element={<SignupPassword />} />
          <Route path="/signup/complete" element={<SignupComplete />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/forgot-password/otp" element={<ForgotPasswordOtp />} />
          <Route path="/forgot-password/reset" element={<ForgotPasswordReset />} />
          <Route path="/forgot-password/complete" element={<ForgotPasswordComplete />} />
          <Route path="/terms" element={<Terms />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
