import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiUpload, FiAtSign, FiEye, FiEyeOff } from 'react-icons/fi';
import SpotlightCard from '../UI/SpotlightCard';
import Aurora from '../UI/Aurora'; // Make sure this path is correct

const ProfileUpload = () => {
  const [image, setImage] = useState(null);
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setMessage('');
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'current') setShowCurrentPassword((prev) => !prev);
    if (field === 'new') setShowNewPassword((prev) => !prev);
    if (field === 'confirm') setShowConfirmPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      setLoading(true);

      // Upload image if selected
      if (image) {
        const formData = new FormData();
        formData.append('image', image);

        const res = await fetch('/api/auth/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        const data = await res.json();

        if (!res.ok) {
          setLoading(false);
          setMessage(data.error || 'Failed to upload image');
          return;
        }
      }

      // Change username if filled
      if (newUsername.trim() !== '') {
        const res = await fetch('/api/auth/change-username', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ newUsername }),
        });

        const data = await res.json();

        if (!res.ok) {
          setLoading(false);
          setMessage(data.error || 'Failed to change username');
          return;
        }
      }

      // Change password if any password field filled
      if (currentPassword || newPassword || confirmPassword) {
        if (!currentPassword || !newPassword || !confirmPassword) {
          setLoading(false);
          setMessage('Please fill all password fields');
          return;
        }

        const res = await fetch('/api/auth/change-password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
        });

        const data = await res.json();

        if (!res.ok) {
          setLoading(false);
          setMessage(data.error || 'Failed to change password');
          return;
        }
      }

      setLoading(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (err) {
      setLoading(false);
      setMessage('Network error');
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center bg-gray-900">
      {/* Aurora Background */}
      <Aurora
        colorStops={['#3A29FF', '#FF94B4', '#FF3232']}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
      />

      {/* Spotlight Card */}
      <SpotlightCard
        className="w-full max-w-md p-8 z-10 shadow-xl hover:shadow-2xl transition-shadow duration-300"
        spotlightColor="rgba(0, 229, 255, 0.2)"
      >
        <h2 className="text-3xl font-extrabold text-white mb-8 text-center">Update Profile</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
          {/* Image upload */}
          <div>
            <label htmlFor="image" className=" text-gray-400 mb-2 flex items-center gap-2">
              <FiUpload className="text-blue-400 w-5 h-5" />
              Choose an image to upload
            </label>
            <input
              type="file"
              id="image"
              name="image"
              className="w-full p-2 rounded bg-gray-700 text-white"
              onChange={handleImageChange}
              accept="image/*"
            />
          </div>

          {/* Username change */}
          <div>
            <label htmlFor="username" className=" text-gray-400 mb-2 flex items-center gap-2">
              <FiAtSign className="text-blue-400 w-5 h-5" />
              New Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="w-full p-2 rounded bg-gray-700 text-white"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter new username"
            />
          </div>

          {/* Password change */}
          <div>
            <label className=" text-gray-400 mb-2 flex items-center gap-2">
              <FiLock className="text-blue-400 w-5 h-5" />
              Change Password
            </label>
            <div className="relative mb-2">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                name="currentPassword"
                placeholder="Current Password"
                className="w-full p-2 rounded bg-gray-700 text-white pr-10"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-500 focus:outline-none"
                aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
              >
                {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <div className="relative mb-2">
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                placeholder="New Password"
                className="w-full p-2 rounded bg-gray-700 text-white pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-500 focus:outline-none"
                aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
              >
                {showNewPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm New Password"
                className="w-full p-2 rounded bg-gray-700 text-white pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-500 focus:outline-none"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-br from-yellow-400 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold py-3 rounded transition-transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-yellow-400">{message}</p>}
      </SpotlightCard>
    </div>
  );
};

export default ProfileUpload;
