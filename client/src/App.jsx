import React from 'react';    
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './components/Index';      // Registration page
import Login from './components/Login';
import Profile from './components/Profile';
import Edit from './components/Edit';
import Upload from './components/ProfileUpload';
import ClickSpark from './UI/ClickSpark';
import Loader from './UI/Loader'; // Importing the Loader component
import './App.css'

function App() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <ClickSpark
        sparkColor="#ffffff"
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<ProfileWrapper />} />
            <Route path="/edit/:id" element={<EditWrapper />} />
            <Route path="/upload" element={<Upload />} />
          </Routes>
        </Router>
      </ClickSpark>
    </div>
  );
}

// Wrapper to fetch user data before rendering Profile
const ProfileWrapper = () => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/auth/profile', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div><Loader/></div>;
  if (!user) return <div>Please login first.</div>;

  return <Profile user={user} />;
};

// Wrapper to fetch post data before rendering Edit
import { useParams } from 'react-router-dom';
const EditWrapper = () => {
  const { id } = useParams();
  const [post, setPost] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`/api/auth/edit/${id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setPost(data.post);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading post...</div>;
  if (!post) return <div>Post not found or you do not have permission.</div>;

  return <Edit post={post} />;
};

export default App;
