import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../authSlice";

// Schema validation for signup form
const signupSchema = z.object({
  firstName: z.string().min(3, "Name must contain at least 3 characters"),
  emailId: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must contain at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number")
});

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isValid } 
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onChange"
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <X className="h-5 w-5 text-red-700" />
              </div>
              <div>
                <p className="text-red-900 font-semibold">Error!</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message (if you want to show success before redirect) */}
        {isAuthenticated && (
          <div className="mb-6 p-4 bg-green-50 border border-green-300 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-green-900 font-semibold">Sign up successful!</p>
                <p className="text-green-700 text-sm mt-1">Welcome to our community!</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-700">
              Join our community and get started
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* First Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  {...register('firstName')}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 outline-none text-gray-900 placeholder-gray-500 ${
                    errors.firstName ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.firstName ? (
                  <div className="absolute right-3 top-3.5">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                ) : (
                  !errors.firstName && (
                    <div className="absolute right-3 top-3.5">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  )
                )}
              </div>
              {errors.firstName && (
                <p className="mt-2 text-sm text-red-700 flex items-center gap-1 font-medium">
                  <X className="h-4 w-4" />
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  {...register('emailId')}
                  type="email"
                  placeholder="john@example.com"
                  className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 outline-none text-gray-900 placeholder-gray-500 ${
                    errors.emailId ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.emailId ? (
                  <div className="absolute right-3 top-3.5">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                ) : (
                  !errors.emailId && (
                    <div className="absolute right-3 top-3.5">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  )
                )}
              </div>
              {errors.emailId && (
                <p className="mt-2 text-sm text-red-700 flex items-center gap-1 font-medium">
                  <X className="h-4 w-4" />
                  {errors.emailId.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 outline-none text-gray-900 placeholder-gray-500 ${
                    errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password ? (
                <p className="mt-2 text-sm text-red-700 flex items-center gap-1 font-medium">
                  <X className="h-4 w-4" />
                  {errors.password.message}
                </p>
              ) : (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-semibold text-gray-800 mb-2">Password must contain:</p>
                  <ul className="grid grid-cols-2 gap-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-700">
                      <div className="h-2.5 w-2.5 rounded-full bg-green-600"></div>
                      At least 8 characters
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <div className="h-2.5 w-2.5 rounded-full bg-green-600"></div>
                      One uppercase letter
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <div className="h-2.5 w-2.5 rounded-full bg-green-600"></div>
                      One lowercase letter
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <div className="h-2.5 w-2.5 rounded-full bg-green-600"></div>
                      One number
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isValid}
              className={`w-full py-3.5 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                loading || !isValid
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300"
                  : "bg-gradient-to-r from-blue-700 to-indigo-700 text-white hover:from-blue-800 hover:to-indigo-800 shadow-lg hover:shadow-xl active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-600 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Social Sign Up */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-medium text-gray-800"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-medium text-gray-800"
              >
                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>

            {/* Terms and Login */}
            <div className="text-center pt-6 border-t border-gray-300">
              <p className="text-sm text-gray-700 mb-4">
                By signing up, you agree to our{" "}
                <a href="#" className="text-blue-700 hover:text-blue-900 font-semibold underline underline-offset-2">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-700 hover:text-blue-900 font-semibold underline underline-offset-2">
                  Privacy Policy
                </a>
              </p>
              <p className="text-sm text-gray-700">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-700 hover:text-blue-900 font-semibold underline underline-offset-2">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;