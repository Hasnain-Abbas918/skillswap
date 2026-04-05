import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, KeyRound } from 'lucide-react';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword)
      return toast.error('Passwords match nahi kar rahe');

    if (form.newPassword.length < 6)
      return toast.error('Password kam az kam 6 characters ka hona chahiye');

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: form.email,
        otp: form.otp,
        newPassword: form.newPassword,
      });
      toast.success('Password reset ho gaya! Ab login karo.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset nahi hua — OTP check karo');
    }
    setLoading(false);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">S</div>
            <span className="font-bold text-xl text-gray-900">SkillSwap</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Naya Password Set Karo</h1>
          <p className="text-gray-500 text-sm mt-1">Email se mila OTP daalo</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* OTP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">OTP Code</label>
              <input
                type="text"
                value={form.otp}
                onChange={set('otp')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 tracking-widest font-mono"
                placeholder="6-digit OTP"
                maxLength={6}
                required
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Naya Password</label>
              <input
                type="password"
                value={form.newPassword}
                onChange={set('newPassword')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500"
                placeholder="Kam az kam 6 characters"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password Confirm Karo</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500"
                placeholder="Dobara daalo"
                required
              />
            </div>

            {/* Password match indicator */}
            {form.confirmPassword && (
              <p className={`text-xs ${form.newPassword === form.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                {form.newPassword === form.confirmPassword ? '✓ Passwords match kar rahe hain' : '✗ Passwords match nahi kar rahe'}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><KeyRound size={15} /> Password Reset Karo</>
              )}
            </button>
          </form>

          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-indigo-600 mt-5 transition"
          >
            <ArrowLeft size={14} /> Login par wapas jao
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
