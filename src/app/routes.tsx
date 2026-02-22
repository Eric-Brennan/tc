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

export const router = createBrowserRouter([
  {
    path: "/",
    Component: ClientHome,
  },
  {
    path: "/t",
    Component: TherapistHome,
  },
  {
    path: "/profile",
    Component: ClientProfile,
  },
  {
    path: "/find-therapists",
    Component: FindTherapists,
  },
  {
    path: "/t/profile",
    Component: TherapistProfile,
  },
  {
    path: "/calendar",
    async lazy() {
      const { default: Calendar } = await import("./pages/Calendar");
      return { Component: Calendar };
    },
  },
  {
    path: "/t/calendar",
    async lazy() {
      const { default: Calendar } = await import("./pages/Calendar");
      return { Component: Calendar };
    },
  },
  {
    path: "/therapist/:id",
    Component: TherapistDetail,
  },
  {
    path: "/messages",
    Component: Messages,
  },
  {
    path: "/messages/:userId",
    Component: Messages,
  },
  {
    path: "/t/messages",
    Component: Messages,
  },
  {
    path: "/t/messages/:userId",
    Component: Messages,
  },
  {
    path: "/video-session/:sessionId",
    Component: VideoSession,
  },
  {
    path: "/t/video-session/:sessionId",
    Component: VideoSession,
  },
  {
    path: "/journal",
    Component: Journal,
  },
  {
    path: "/t/journals",
    Component: Journals,
  },
  {
    path: "/t/assessments",
    Component: TherapistAssessments,
  },
  {
    path: "/t/assessments/:clientId",
    Component: TherapistClientAssessments,
  },
  {
    path: "/t/clients",
    Component: Backpack,
  },
  {
    path: "/t/clients/:clientId",
    Component: BackpackClientDetail,
  },
  {
    path: "/assessments",
    Component: ClientAssessments,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);