import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Aurora from '../UI/Aurora'; // Adjust path if needed
import SpotlightCard from '../UI/SpotlightCard';
import ShinyText from '../UI/ShinyText'; // Adjust path if needed

const Edit = ({ post }) => {
  const navigate = useNavigate();
  const [content, setContent] = useState(post.content);
  const [message, setMessage] = useState('');

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        navigate('/login');
      } else {
        alert('Logout failed');
      }
    } catch {
      alert('Network error during logout');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/auth/updatePost/${post._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Post updated successfully!');
        setTimeout(() => {
          navigate('/profile');
        }, 1000);
      } else {
        setMessage(data.error || 'Failed to update post');
      }
    } catch (err) {
      setMessage('Server error');
      console.error(err);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center bg-gray-900">
      <Aurora
        colorStops={['#3A29FF', '#FF94B4', '#FF3232']}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
      />

      

      <SpotlightCard
        className="w-full max-w-md mx-auto p-8 z-10 shadow-xl hover:shadow-2xl transition-shadow duration-300"
        spotlightColor="rgba(0, 229, 255, 0.2)"
      >
        <div className='text-center m-4 pb-4 text-4xl font-bold'>        <ShinyText text="Update Your Post" disabled={false} speed={3} className='custom-class' />
</div>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="content"
              className="block text-gray-400 mb-2"
            >
              Edit your post
            </label>
            <textarea
              id="content"
              name="content"
              className="w-full resize-none p-4 rounded bg-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 hide-scrollbar"
              rows="4"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className=" w-full rounded-md bg-gradient-to-br from-yellow-400 to-yellow-600 px-6 py-3 text-lg text-black ring-2 ring-yellow-500/50 ring-offset-2 ring-offset-zinc-950 transition-all hover:scale-[1.02] hover:ring-transparent active:scale-[0.98] active:ring-yellow-600/70 font-semibold"
          >
            Update Post
          </button>
          {message && (
            <p className="mt-4 text-sm text-green-400 text-center">
              {message}
            </p>
          )}
        </form>
      </SpotlightCard>
    </div>
  );
};

export default Edit;
