import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Save, X, Camera } from 'lucide-react';
import { fetchMe } from '../store/slices/authSlice';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ bio: '', skillsOffered: '', skillsWanted: '', location: '' });
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [originalAvatar, setOriginalAvatar] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get('/users/profile').then(({ data }) => {
      setForm({
        bio: data.bio || '',
        skillsOffered: (data.skillsOffered || []).join(', '),
        skillsWanted: (data.skillsWanted || []).join(', '),
        location: data.location || '',
      });
      setAvailability(data.availability || []);
      if (data.avatar) {
        setAvatarPreview(data.avatar);
        setOriginalAvatar(data.avatar);
      }
    }).finally(() => setFetching(false));
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('File 5MB se chhoti honi chahiye');
    if (!file.type.startsWith('image/')) return toast.error('Sirf image files allowed hain');
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const { data } = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Profile picture update ho gayi!');
      setAvatarFile(null);
      setAvatarPreview(data.avatarUrl);
      setOriginalAvatar(data.avatarUrl);
      dispatch(fetchMe()); // ✅ Navbar turant update ho jaega
    } catch {
      toast.error('Upload failed');
    }
    setAvatarUploading(false);
  };

  const toggleDay = (day) => {
    const exists = availability.find((a) => a.day === day);
    setAvailability(
      exists
        ? availability.filter((a) => a.day !== day)
        : [...availability, { day, startTime: '09:00', endTime: '17:00' }]
    );
  };

  const updateSlotTime = (day, field, value) => {
    setAvailability(availability.map((a) => (a.day === day ? { ...a, [field]: value } : a)));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (avatarFile) await handleAvatarUpload();
      await api.put('/users/profile', {
        ...form,
        skillsOffered: form.skillsOffered.split(',').map((s) => s.trim()).filter(Boolean),
        skillsWanted: form.skillsWanted.split(',').map((s) => s.trim()).filter(Boolean),
        availability,
      });
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    }
    setLoading(false);
  };

  if (fetching) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <form onSubmit={handleSave} className="space-y-6">

        {/* ── Avatar Upload ── */}
        <div className="card flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-brand text-white flex items-center justify-center font-bold text-3xl overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase() || '?'
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-all"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <div className="flex-1">
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500 mb-3">{user?.email}</p>
            {avatarFile ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAvatarUpload}
                  disabled={avatarUploading}
                  className="text-xs px-3 py-1.5 bg-brand text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-60"
                >
                  {avatarUploading ? 'Uploading...' : 'Upload Picture'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarPreview(originalAvatar); // ✅ purana avatar wapas
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200"
              >
                Change Picture
              </button>
            )}
          </div>
        </div>

        {/* ── Basic Info ── */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Info</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="input-field" rows={3}
              placeholder="Tell others about yourself..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="input-field"
              placeholder="City, Country"
            />
          </div>
        </div>

        {/* ── Skills ── */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Skills</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Skills I Offer <span className="text-gray-400">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={form.skillsOffered}
              onChange={(e) => setForm({ ...form, skillsOffered: e.target.value })}
              className="input-field"
              placeholder="JavaScript, Piano, Cooking..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Skills I Want <span className="text-gray-400">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={form.skillsWanted}
              onChange={(e) => setForm({ ...form, skillsWanted: e.target.value })}
              className="input-field"
              placeholder="Guitar, French, Drawing..."
            />
          </div>
        </div>

        {/* ── Availability ── */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Weekly Availability</h2>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => {
              const selected = availability.some((a) => a.day === day);
              return (
                <button
                  key={day} type="button" onClick={() => toggleDay(day)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selected ? 'bg-brand text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          {availability.map((slot) => (
            <div key={slot.day} className="flex items-center gap-3 bg-brand-light rounded-xl px-4 py-3">
              <span className="text-sm font-semibold text-brand w-10">{slot.day}</span>
              <input
                type="time" value={slot.startTime}
                onChange={(e) => updateSlotTime(slot.day, 'startTime', e.target.value)}
                className="border border-brand/30 rounded-lg px-2 py-1 text-sm bg-white"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="time" value={slot.endTime}
                onChange={(e) => updateSlotTime(slot.day, 'endTime', e.target.value)}
                className="border border-brand/30 rounded-lg px-2 py-1 text-sm bg-white"
              />
              <button type="button" onClick={() => toggleDay(slot.day)} className="ml-auto text-gray-400 hover:text-red-500">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit" disabled={loading}
          className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
        >
          {loading
            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
            : <><Save size={18} /> Save Profile</>
          }
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;