import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import axiosClient from "../utils/axiosClient";

// Schema validation for reset password
const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // Get token from URL
  const token = searchParams.get('token');

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isValid } 
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange"
  });

  useEffect(() => {
    if (!token) {
      setMessage('❌ Invalid or missing reset token.');
    }
  }, [token]);

  const onSubmit = async (data) => {
    if (!token) {
      setMessage('❌ Invalid reset link.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
  const response = await axiosClient.post("/user/reset-password", {
  token,
  newPassword: data.password,
});
      setMessage('✅ ' + response.data.message);
      setIsSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.message || 'Something went wrong.'));
    } finally {
      setLoading(false);
    }
  };

  // If no token, show error state
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex items-center justify-center p-4">
        <div className="card bg-base-100 shadow-2xl border border-base-300 max-w-md w-full">
          <div className="card-body p-8 text-center">
            <div className="text-error text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-2">Invalid Reset Link</h2>
            <p className="text-base-content/70 mb-6">
              The password reset link is invalid or has expired.
            </p>
            <Link to="/login" className="btn btn-primary">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card bg-base-100 shadow-2xl border border-base-300">
          <div className="card-body p-8">
            {/* Back button */}
            <Link to="/login" className="btn btn-ghost btn-sm w-fit gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="avatar placeholder mb-4">
                <div className="bg-gradient-to-r from-primary to-secondary text-primary-content rounded-full w-16 h-16 flex items-center justify-center">
                  <Lock className="h-8 w-8" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-base-content mb-2">
                Create New Password
              </h1>
              <p className="text-base-content/70">
                Enter your new password below
              </p>
            </div>

            {/* Message Toast */}
            {message && (
              <div className={`alert ${isSuccess ? 'alert-success' : 'alert-error'} shadow-lg mb-6`}>
                <div>
                  {isSuccess ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span>{message}</span>
                </div>
              </div>
            )}

            {!isSuccess ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Password Field */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      New Password
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password (min 6 characters)"
                      className={`input input-bordered w-full pl-10 pr-10 ${errors.password ? 'input-error' : 'input-primary'}`}
                      disabled={loading}
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-base-content/50" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    {errors.password && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {errors.password.message}
                        </span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirm Password
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      className={`input input-bordered w-full pl-10 pr-10 ${errors.confirmPassword ? 'input-error' : 'input-primary'}`}
                      disabled={loading}
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-base-content/50" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    {errors.confirmPassword && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {errors.confirmPassword.message}
                        </span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="form-control mt-8">
                  <button
                    type="submit"
                    disabled={loading || !isValid}
                    className={`btn btn-primary ${loading ? 'loading' : ''}`}
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20">
                <p className="text-success font-semibold">Password updated successfully!</p>
                <p className="text-sm text-base-content/70 mt-2">Redirecting to login...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;