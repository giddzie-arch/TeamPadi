import React, { useState } from 'react';
import api from '../api/client';
import  type{ AuthResponse } from '../types/index';

interface AuthProps {
  onSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState('');
  const [industry] = useState('');
  const [teamSize, setTeamSize] = useState('1-5');
  const [methodology, setMethodology] = useState<'kanban' | 'scrum' | 'waterfall' | 'simple'>('kanban');
  

  const resetFormState = () => {
    setName('');
    setEmail('');
    setPassword('');
    setPasswordConfirmation('');
    setErrorMessage('');
    setValidationErrors({});
  };

  const handleToggleMode = () => {
    setIsLogin((prev) => !prev);
    resetFormState();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setValidationErrors({});
    setLoading(true);

    try {
      const endpoint = isLogin ? '/login' : '/register';
      const payload = isLogin
        ? { email, password }
        : {
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
            company_name: companyName,
            industry,
            team_size: teamSize,
            default_methodology: methodology,
            };

      const { data } = await api.post<AuthResponse>(endpoint, payload);

      // Store Sanctum Bearer token for subsequent authenticated requests
      localStorage.setItem('auth_token', data.token);

      // Trigger parent state transition to display the Dashboard
      onSuccess();
    } catch (err: any) {
      if (err.response?.status === 422) {
        // Laravel validation exception payload: { message: "...", errors: { field: ["error"] } }
        setErrorMessage(err.response.data.message || 'Validation error.');
        setValidationErrors(err.response.data.errors || {});
      } else if (err.response?.status === 401) {
        setErrorMessage(err.response.data.message || 'Invalid credentials.');
      } else {
        setErrorMessage('Unable to connect to the server. Please verify the API container is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin
              ? 'Access your projects and task workflows'
              : 'Sign up to start tracking your development tasks'}
          </p>
        </div>

        {/* Top-level Error Banner */}
        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {/* Name Field (Registration Only) */}
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {validationErrors.name && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.name[0]}</p>
              )}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {validationErrors.email && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.email[0]}</p>
            )}
          </div>

 {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {validationErrors.password && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.password[0]}</p>
            )}
          </div>

          {/* Registration-Only Fields */}
          {!isLogin && (
            <>
              {/* Confirm Password Field */}
              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  required
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Company / Organization Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Company / Organization Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Inc."
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {validationErrors.company_name && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.company_name[0]}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Team Size</label>
                  <select
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="1-5">1 - 5 members</option>
                    <option value="6-20">6 - 20 members</option>
                    <option value="21-50">21 - 50 members</option>
                    <option value="50+">50+ members</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Methodology</label>
                  <select
                    value={methodology}
                    onChange={(e) => setMethodology(e.target.value as any)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="kanban">Kanban</option>
                    <option value="scrum">Scrum</option>
                    <option value="waterfall">Waterfall</option>
                    <option value="simple">Simple</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Processing...</span>
                </span>
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        {/* Toggle Mode */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleToggleMode}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            {isLogin
              ? "Don't have an account yet? Register here"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;