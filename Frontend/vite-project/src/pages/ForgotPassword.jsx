import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { useState } from "react";
import { Mail, ArrowLeft, Send, CheckCircle } from "lucide-react";
import { Link } from "react-router";
import axios from 'axios';

// Schema validation for forgot password
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isValid } 
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange"
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage('');
    setIsSuccess(false);

    try {
      const response = await axios.post('http://localhost:3000/user/forgot-password', {
        email: data.email
      });
      setMessage(response.data.message);
      setIsSuccess(true);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

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
                  <Mail className="h-8 w-8" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-base-content mb-2">
                Forgot Password
              </h1>
              <p className="text-base-content/70">
                Enter your email address and we'll send you a password reset link
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </span>
                </label>
                <div className="relative">
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className={`input input-bordered w-full pl-10 ${errors.email ? 'input-error' : 'input-primary'}`}
                    disabled={loading || isSuccess}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-base-content/50" />
                  {errors.email && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.email.message}
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-control mt-8">
                <button
                  type="submit"
                  disabled={loading || !isValid || isSuccess}
                  className={`btn btn-primary ${loading ? 'loading' : ''}`}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                  {!loading && !isSuccess && <Send className="ml-2 h-4 w-4" />}
                </button>
              </div>
            </form>

            {/* Info text after success */}
            {isSuccess && (
              <div className="text-center mt-4 p-4 bg-success/10 rounded-lg border border-success/20">
                <p className="text-sm text-success">
                  ✅ Check your email for the reset link. 
                  <br />
                  The link expires in 1 hour.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;