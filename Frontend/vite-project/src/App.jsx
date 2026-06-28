import { Routes, Route, Navigate, useLocation } from "react-router";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import HomePage from "./pages/HomePage";
import Admin from "./pages/Admin";
import AdminPanel from "./components/AdminPanel";
import AdminDelete from "./components/AdminDelete";
import AdminVideo from "./components/AdminVideo";
import AdminUpload from "./components/AdminUpload";
import AdminUpdate from "./components/AdminUpdate";
import AdminUpdateProblem from "./components/AdminUpdateProblem";
import ProblemPage from "./pages/ProblemPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { checkAuth } from "./authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

function App() {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  // 🔹 Public routes that don't need authentication
  const publicRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  useEffect(() => {
    // 🔹 Only check auth on protected routes
    if (!isPublicRoute) {
      dispatch(checkAuth());
    }
  }, [dispatch, isPublicRoute]);

  // 🔹 Show loading only on protected routes (public ones load instantly)
  if (loading && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex flex-col items-center justify-center">
        {/* your loading spinner... (keep your existing code) */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              YourApp
            </h1>
          </div>
        </div>
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-base-300 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-base-content">Loading your experience</p>
            <p className="text-base-content/60 text-sm">Please wait while we prepare everything for you</p>
          </div>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
        <div className="absolute bottom-8 text-center">
          <p className="text-base-content/40 text-sm">Made with ❤️ using React & DaisyUI</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* 🔹 Public routes (no auth required) */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 🔹 Auth routes */}
        <Route path="/" element={isAuthenticated ? <HomePage /> : <Navigate to="/signup" />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <SignIn />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <SignUp />} />

        {/* 🔹 Admin routes (protected) */}
        <Route path="/admin" element={isAuthenticated && user?.role === "admin" ? <Admin /> : <Navigate to="/" />} />
        <Route path="/admin/create" element={isAuthenticated && user?.role === "admin" ? <AdminPanel /> : <Navigate to="/" />} />
        <Route path="/admin/delete" element={isAuthenticated && user?.role === "admin" ? <AdminDelete /> : <Navigate to="/" />} />
        <Route path="/admin/video" element={isAuthenticated && user?.role === "admin" ? <AdminVideo /> : <Navigate to="/" />} />
        <Route path="/admin/update" element={isAuthenticated && user?.role === "admin" ? <AdminUpdate /> : <Navigate to="/" />} />
        <Route path="/admin/update/:problemId" element={isAuthenticated && user?.role === "admin" ? <AdminUpdateProblem /> : <Navigate to="/" />} />
        <Route path="/admin/upload/:problemId" element={isAuthenticated && user?.role === "admin" ? <AdminUpload /> : <Navigate to="/" />} />

        {/* 🔹 Public problem page */}
        <Route path="/problem/:problemId" element={<ProblemPage />} />
      </Routes>
    </>
  );
}

export default App;