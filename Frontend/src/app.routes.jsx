import { createBrowserRouter } from "react-router";
import React, { lazy, Suspense } from "react";
import Loader from "./components/Loader";

// Lazy loading components for faster initial page load
const Login = lazy(() => import("./features/auth/pages/Login"));
const Register = lazy(() => import("./features/auth/pages/Register"));
const ForgotPassword = lazy(() => import("./features/auth/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./features/auth/pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./features/auth/pages/VerifyEmail"));
const Protected = lazy(() => import("./features/auth/components/Protected"));
const ResumeAnalysis = lazy(() => import("./features/interview/pages/ResumeAnalysis"));
const Interview = lazy(() => import("./features/interview/pages/Interview"));
const ResumeOptimizer = lazy(() => import("./features/interview/pages/ResumeOptimizer"));
const Settings = lazy(() => import("./features/interview/pages/Settings"));
const Notes = lazy(() => import("./features/interview/pages/Notes"));
const ProgressTracker = lazy(() => import("./features/interview/pages/ProgressTracker"));
const Dashboard = lazy(() => import("./features/interview/pages/Dashboard"));

const Loadable = (Component) => (props) => (
    <Suspense fallback={<Loader message="Preparing your prep space..." />}>
        <Component {...props} />
    </Suspense>
);

export const router = createBrowserRouter([
    {
        path: "/login",
        element: React.createElement(Loadable(Login))
    },
    {
        path: "/register",
        element: React.createElement(Loadable(Register))
    },
    {
        path: "/forgot-password",
        element: React.createElement(Loadable(ForgotPassword))
    },
    {
        path: "/reset-password/:token",
        element: React.createElement(Loadable(ResetPassword))
    },
    {
        path: "/verify-email/:token",
        element: React.createElement(Loadable(VerifyEmail))
    },
    {
        path: "/",
        element: <Suspense fallback={<Loader />}><Protected>{React.createElement(Loadable(ResumeAnalysis))}</Protected></Suspense>
    },
    {
        path: "/resume-optimizer",
        element: <Suspense fallback={<Loader />}><Protected>{React.createElement(Loadable(ResumeOptimizer))}</Protected></Suspense>
    },
    {
        path: "/resume-builder",
        element: <Suspense fallback={<Loader />}><Protected>{React.createElement(Loadable(ResumeOptimizer))}</Protected></Suspense>
    },
    {
        path: "/settings",
        element: <Suspense fallback={<Loader />}><Protected>{React.createElement(Loadable(Settings))}</Protected></Suspense>
    },
    {
        path: "/notes",
        element: <Suspense fallback={<Loader />}><Protected>{React.createElement(Loadable(Notes))}</Protected></Suspense>
    },
    {
        path: "/progress-tracker",
        element: <Suspense fallback={<Loader />}><Protected>{React.createElement(Loadable(ProgressTracker))}</Protected></Suspense>
    },
    {
        path: "/dashboard",
        element: <Suspense fallback={<Loader />}><Protected>{React.createElement(Loadable(Dashboard))}</Protected></Suspense>
    },
    {
        path:"/interview/:interviewId",
        element: <Suspense fallback={<Loader />}><Protected>{React.createElement(Loadable(Interview))}</Protected></Suspense>
    }
])
