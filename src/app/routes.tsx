import { createBrowserRouter } from "react-router";
import ClientHome from "./pages/ClientHome";
import TherapistHome from "./pages/TherapistHome";
import TherapistDetail from "./pages/TherapistDetail";
import Messages from "./pages/Messages";
import VideoSession from "./pages/VideoSession";
import NotFound from "./pages/NotFound";
import ClientProfile from "./pages/ClientProfile";
import TherapistProfile from "./pages/TherapistProfile";
import Journal from "./pages/Journal";
import Journals from "./pages/Journals";
import { ClientAssessments } from "./pages/ClientAssessments";
import { TherapistAssessments } from "./pages/TherapistAssessments";
import { TherapistClientAssessments } from "./pages/TherapistClientAssessments";
import FindTherapists from "./pages/FindTherapists";
import Backpack from "./pages/Backpack";
import BackpackClientDetail from "./pages/BackpackClientDetail";
import TherapistJournal from "./pages/TherapistJournal";
import Supervision from "./pages/Supervision";
import RootLayout from "./components/RootLayout";
import LoginLayout from "./components/LoginLayout";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import PublicHome from "./components/PublicHome";
import { Navigate } from "react-router";

export const router = createBrowserRouter([
  // Public routes — outside AuthGuard
  {
    path: "/",
    Component: LoginLayout,
    children: [
      {
        index: true,
        Component: PublicHome,
      },
    ],
  },
  {
    path: "/login",
    Component: LoginLayout,
    children: [
      {
        index: true,
        Component: Login,
      },
    ],
  },
  // Protected client routes — /c/...
  {
    path: "/c",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: ClientHome,
      },
      {
        path: "profile",
        Component: ClientProfile,
      },
      {
        path: "find-therapists",
        Component: FindTherapists,
      },
      {
        path: "calendar",
        Component: Calendar,
      },
      {
        path: "therapist/:id",
        Component: TherapistDetail,
      },
      {
        path: "messages",
        Component: Messages,
      },
      {
        path: "messages/:userId",
        Component: Messages,
      },
      {
        path: "video-session/:sessionId",
        Component: VideoSession,
      },
      {
        path: "journal",
        Component: Journal,
      },
      {
        path: "assessments",
        Component: ClientAssessments,
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
  // Protected therapist routes — /t/...
  {
    path: "/t",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: TherapistHome,
      },
      {
        path: "profile",
        Component: TherapistProfile,
      },
      {
        path: "calendar",
        Component: Calendar,
      },
      {
        path: "therapist/:id",
        Component: TherapistDetail,
      },
      {
        path: "messages",
        Component: Messages,
      },
      {
        path: "messages/:userId",
        Component: Messages,
      },
      {
        path: "video-session/:sessionId",
        Component: VideoSession,
      },
      {
        path: "journal",
        Component: TherapistJournal,
      },
      {
        path: "journals",
        Component: Journals,
      },
      {
        path: "assessments",
        Component: TherapistAssessments,
      },
      {
        path: "assessments/:clientId",
        Component: TherapistClientAssessments,
      },
      {
        path: "clients",
        Component: Backpack,
      },
      {
        path: "clients/:clientId",
        Component: BackpackClientDetail,
      },
      {
        path: "supervision",
        Component: Supervision,
      },
      {
        path: "settings",
        Component: Settings,
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
  // Catch-all: redirect any unmatched routes (including old /home) to /
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);