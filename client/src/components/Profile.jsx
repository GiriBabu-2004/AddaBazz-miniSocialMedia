import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import GradientText from "../UI/GradientText";
import Aurora from "../UI/Aurora";
import SpotlightCard from "../UI/SpotlightCard";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import LogoutButton from "../UI/LogoutButton";
import { FiMessageCircle } from "react-icons/fi";
import { FiSend} from 'react-icons/fi';
import { FiThumbsUp, FiThumbsDown, FiEdit2, FiTrash2, FiUserPlus, FiUserMinus } from 'react-icons/fi';
import { FiX, FiArrowLeft } from "react-icons/fi";
import {  AnimatePresence } from "framer-motion";
import ShinyText from "../UI/ShinyText";
import SplitText from "../UI/SplitText"; 
import RotatingText from "../UI/RotatingText";
import { FaInstagram, FaGithub, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import "./Profile.css"; // Assuming you have some styles for the profile

import { io } from "socket.io-client";

dayjs.extend(relativeTime);
const socket = io("http://localhost:3000");

const areIdsEqual = (id1, id2) => {
  if (!id1 || !id2) return false;
  return id1.toString() === id2.toString();
};
const handleAnimationComplete = () => {
  console.log("All letters have animated!");
};

const Profile = ({ user: initialUser }) => {
  const navigate = useNavigate();

  const [content, setContent] = useState("");
  const [user, setUser] = useState(initialUser);
  const [posts, setPosts] = useState([]);
  const [followLoading, setFollowLoading] = useState({});

  const [chatOpen, setChatOpen] = useState(false);
  const [mutuals, setMutuals] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/auth/posts", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch(() => alert("Failed to fetch posts"));

    fetch("/api/auth/profile", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => alert("Failed to fetch user profile"));

    fetch("/api/auth/mutual-followers", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMutuals(data.mutualFollowers);
      });

    socket.on("newPost", (newPost) => {
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    });

    return () => {
      socket.off("newPost");
    };
  }, []);

  useEffect(() => {
    if (!user?._id) return;
    socket.emit("join_room", user._id);

    const handleReceiveMessage = (data) => {
      if (areIdsEqual(data.sender, user._id)) return;

      if (selectedUser && areIdsEqual(data.sender, selectedUser._id)) {
        setMessages((prev) => [...prev, data]);
      } else {
        if (!chatOpen || !selectedUser || !areIdsEqual(data.sender, selectedUser._id)) {
          setUnreadCount((c) => c + 1);
        }
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [user, selectedUser, chatOpen]);

  useEffect(() => {
    if (user?._id && selectedUser?._id) {
      fetch(`/api/messages/${user._id}/${selectedUser._id}`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setMessages(data.messages);
          else setMessages([]);
        })
        .catch(() => setMessages([]));
    }
  }, [selectedUser, user]);

  useEffect(() => {
    if (chatOpen) setUnreadCount(0);
  }, [chatOpen]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedUser) return;

    const msg = {
      sender: user._id,
      receiver: selectedUser._id,
      content: message,
      timestamp: new Date(),
    };

    socket.emit("send_message", msg);
    setMessages((prev) => [...prev, msg]);
    setMessage("");
  };

  const handleContentChange = (e) => setContent(e.target.value);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) navigate("/login");
      else alert("Logout failed");
    } catch {
      alert("Network error during logout");
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (res.ok) setContent("");
      else alert(data.error || "Failed to create post");
    } catch {
      alert("Network error");
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      const res = await fetch(`/api/auth/likes/${postId}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            areIdsEqual(post._id, postId)
              ? {
                  ...post,
                  likes: post.likes.some((id) => areIdsEqual(id, user._id))
                    ? post.likes.filter((id) => !areIdsEqual(id, user._id))
                    : [...post.likes, user._id],
                }
              : post
          )
        );
      } else {
        alert(data.error || "Failed to toggle like");
      }
    } catch {
      alert("Network error");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`/api/auth/delete/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setPosts((prevPosts) =>
          prevPosts.filter((post) => !areIdsEqual(post._id, postId))
        );
      } else {
        alert(data.error || "Failed to delete post");
      }
    } catch {
      alert("Network error");
    }
  };

  const handleFollowToggle = async (targetUserId, isFollowing) => {
    setFollowLoading((prev) => ({ ...prev, [targetUserId]: true }));
    try {
      const url = isFollowing
        ? `/api/auth/unfollow/${targetUserId}`
        : `/api/auth/follow/${targetUserId}`;

      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setUser((prevUser) => {
          let updatedFollowing;
          if (isFollowing) {
            updatedFollowing = prevUser.following.filter(
              (u) => !areIdsEqual(u._id, targetUserId)
            );
          } else {
            updatedFollowing = [...(prevUser.following || []), { _id: targetUserId }];
          }
          return { ...prevUser, following: updatedFollowing };
        });
      } else {
        alert(data.error || "Failed to update follow status");
      }
    } catch {
      alert("Network error");
    } finally {
      setFollowLoading((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  return (
  <div className=" text-white h-screen flex relative overflow-hidden ">
      <div className="absolute inset-0 -z-10">
    <Aurora
      colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
      blend={0.5}
      amplitude={1.0}
      speed={0.5}
    />
  </div>


    {/* Left Sidebar */}
      <SpotlightCard spotlightColor="rgba(64, 255, 170, 0.3)" className="w-94 m-4" >
  <GradientText
    colors={['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa']}
    animationSpeed={3}
    showBorder={false}
    className="mb-8 text-center text-5xl font-extrabold"
  >
    <span className="p-2">𝘼𝙙𝙙𝙖𝘽𝙖𝙯𝙯 </span>
  </GradientText>
 <SplitText
  text={`Welcome, ${user.name}`}
  className="text-2xl font-bold mb-2 mt-8 p-2 text-center"
  delay={100}              // Delay between each character
  duration={0.6}           // Animation duration
  ease="power3.out"        // Easing (used by GSAP)
  splitType="chars"        // Split by characters
  from={{ opacity: 0, y: 40 }}   // Starting animation state
  to={{ opacity: 1, y: 0 }}      // Final animation state
  threshold={0.1}          // IntersectionObserver threshold
  rootMargin="-100px"      // Margin for triggering the animation
  textAlign="center"       // Align text center
  onLetterAnimationComplete={handleAnimationComplete}
/>
<ShinyText text="AddaBazz is a social media platform where you can share your thoughts, see posts from others, follow people you like, and chat with them privately. It’s a space to connect, express, and engage — just like your favorite social spot online!" disabled={false} speed={3} className='custom-class' />
<div className="flex mt-8"><span className="text-4xl font-bold pr-4">AddaBazz</span>
<RotatingText
  texts={['Post', 'Follow', 'Chat', 'Repeat']}
  mainClassName="px-2 sm:px-2 md:px-3 bg-cyan-300 text-black font-bold text-2xl overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
  staggerFrom={"last"}
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  exit={{ y: "-120%" }}
  staggerDuration={0.025}
  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
  transition={{ type: "spring", damping: 30, stiffness: 400 }}
  rotationInterval={2000}
/></div>
{/* Social Icons Container */}
  <div className="flex justify-center mt-32 space-x-8">
    <a
      href="https://instagram.com/__amisujay__"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram"
      className="text-3xl text-pink-500 hover:text-pink-600 transition-colors"
    >
      <FaInstagram />
    </a>

    <a
      href="https://github.com/GiriBabu-2004"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub"
      className="text-3xl text-gray-400 hover:text-gray-700 transition-colors"
    >
      <FaGithub />
    </a>

    <a
      href="https://www.linkedin.com/in/sujay-kumar-giri-29195a2b5/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="LinkedIn"
      className="text-3xl text-blue-700 hover:text-blue-800 transition-colors"
    >
      <FaLinkedin />
    </a>

    <a
      href="https://twitter.com/_giri_sujay02"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Twitter"
      className="text-3xl text-gray-400 hover:text-gray-500 transition-colors"
    >
      <FaXTwitter />
    </a>
  </div>

</SpotlightCard>


    {/* Center Section */}
    
    <main className="flex-1 flex flex-col overflow-hidden p-4 space-y-6 bg-gray-900 max-w-4xl mx-auto rounded-lg m-4">

  {/* Top - Header */}
  <section className="bg-gray-900 p-6 rounded-lg flex items-center space-x-6 mx-auto">
  {/* Profile Picture Left */}
  <motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.5 }}
  className="p-[3px] rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500"
>
  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-900">
    <img
      src={`http://localhost:3000/images/uploads/${user.profilePic}`}
      alt="Profile"
      className="w-full h-full object-cover"
    />
  </div>
</motion.div>

  {/* Right side content */}
  <div className="flex flex-col flex-1">
    {/* Username and update button */}
    <div className="flex items-center space-x-4 mb-2">
      <h2 className="text-2xl font-semibold">{user.username}</h2>
        <motion.button
      onClick={() => navigate("/upload")}
      whileHover={{ scale: 1.00 }}
      whileTap={{ scale: 0.90 }}
      className="flex items-center gap-2 text-blue-500 border border-blue-500 px-4 py-2 rounded-md hover:bg-blue-50 transition-all text-sm"
    >
      <FontAwesomeIcon icon={faPen} />
      Update
    </motion.button>
    </div>

    {/* Followers, Following, Posts row */}
    <div className="flex space-x-8 text-sm text-gray-300">
      <div className="text-center">
        <p className="font-bold">{user.followers?.length || 0}</p>
        <p>Followers</p>
      </div>
      <div className="text-center">
        <p className="font-bold">{user.following?.length || 0}</p>
        <p>Following</p>
      </div>
      <div className="text-center">
        <p className="font-bold">{user.posts.length}</p>
        <p>Posts</p>
      </div>
    </div>
  </div>
</section>


  {/* Middle - Post Input */}
   <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-gray-800 p-4 rounded-xl w-full max-w-2xl mx-auto shadow-md"
    >
      <form
        onSubmit={handlePostSubmit}
        className="flex flex-col gap-2 relative"
        aria-label="Post form"
      >
        <label
          htmlFor="content"
          className="text-gray-300 font-semibold text-sm"
        >
          What’s happening?
        </label>

        <div className="relative">
          <textarea
            id="content"
            name="content"
            value={content}
            onChange={handleContentChange}
            placeholder="Share your thoughts..."
            className="w-full h-[60px] p-3 pr-12 rounded-md bg-gray-700 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 text-sm hide-scrollbar overflow-auto"
            required
            aria-required="true"
          />

          {/* Positioned Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute bottom-4 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition"
            aria-label="Post"
          >
            <FiSend className="text-2xl" />
          </motion.button>
        </div>
      </form>
    </motion.section>


  {/* Bottom - Posts List */}
  <section className="flex-1 overflow-y-auto p-6 bg-gray-800 rounded-lg space-y-4 hide-scrollbar">
      {posts.length === 0 && (
        <p className="text-center text-gray-400">No posts to display</p>
      )}

      {posts.map((post) => {
        const postUserId = post.user?._id;
        const youFollowThem = user.following?.some((f) =>
          areIdsEqual(f._id, postUserId)
        );
        const isOwnPost = areIdsEqual(postUserId, user._id);

        const userLiked = post.likes.some((id) => areIdsEqual(id, user._id));

        return (
          <div
            key={post._id}
            className="bg-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-blue-300 text-sm mb-1">@{post.user?.username || "unknown"}</p>
            <p className="mb-2">{post.content}</p>
            <p className="text-gray-400 text-xs mb-3">
              {dayjs(post.createdAt || post.date).fromNow()}
            </p>

            <div className="flex justify-between items-center">
              {/* Like / Unlike button */}
              <button
                onClick={() => handleToggleLike(post._id)}
                className="flex items-center gap-1 text-pink-500 focus:outline-none hover:text-pink-400"
                aria-label={userLiked ? "Unlike post" : "Like post"}
                title={userLiked ? "Unlike" : "Like"}
              >
                {userLiked ? <FiThumbsDown size={18} /> : <FiThumbsUp size={18} />}
                <span>{post.likes.length}</span>
              </button>

              {/* Follow/Unfollow button */}
              {!isOwnPost && postUserId && (
                <button
                  onClick={() => handleFollowToggle(postUserId, youFollowThem)}
                  disabled={followLoading[postUserId]}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${
                    youFollowThem
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  } ${
                    followLoading[postUserId] ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  aria-label={youFollowThem ? "Unfollow user" : "Follow user"}
                  title={youFollowThem ? "Unfollow" : "Follow"}
                >
                  {youFollowThem ? <FiUserMinus size={16} /> : <FiUserPlus size={16} />}
                  <span>{youFollowThem ? "Unfollow" : "Follow"}</span>
                </button>
              )}

              {/* Edit / Delete buttons */}
              {isOwnPost && (
                <div className="flex items-center gap-3">
                  <a
                    href={`/edit/${post._id}`}
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-400"
                    aria-label="Edit post"
                    title="Edit"
                  >
                    <FiEdit2 size={18} />
                    Edit
                  </a>
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-500 focus:outline-none"
                    aria-label="Delete post"
                    title="Delete"
                  >
                    <FiTrash2 size={18} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </section>
</main>


    {/* Right Sidebar */}
    <SpotlightCard
  className="w-72 bg-gray-800 flex flex-col justify-between p-4 relative m-4 rounded-2xl"
  spotlightColor="rgba(64, 255, 170, 0.3)" // optional color tweak
>
      {/* Top - Logout */}
      <div className="flex justify-end">
        <LogoutButton handleLogout={handleLogout} />

      </div>

      {/* Bottom - Chat Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-10 right-10 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 z-50"
        aria-label="Toggle chat"
      >
           <motion.div
    animate={unreadCount > 0 ? { scale: [1, 1.2, 1], color: ["#ffffff", "#00e5ff", "#ffffff"] } : { scale: 1, color: "#ffffff" }}
    transition={unreadCount > 0 ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {}}
    style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}
  >
    <FiMessageCircle />
  </motion.div>
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-red-600 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
            aria-live="polite"
          >
            {unreadCount}
          </span>
        )}
      </button>
    </SpotlightCard>

    {/* Chat Modal */}
     <AnimatePresence>
      {chatOpen && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-20 right-6 bg-gray-800 border border-gray-600 text-white w-90 rounded shadow-lg z-50 flex flex-col "
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-panel-title"
        >
          {/* Chat Header */}
          <div className="flex justify-between items-center p-3 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              {selectedUser && (
                <motion.button
                  onClick={() => setSelectedUser(null)}
                  className="text-blue-400 hover:text-blue-600 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Back to users"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiArrowLeft size={20} />
                </motion.button>
              )}
              <span
                id="chat-panel-title"
                className="font-bold text-lg select-none"
              >
                Chat
              </span>
            </div>
            <motion.button
              onClick={() => setChatOpen(false)}
              className="text-red-400 hover:text-red-600 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-label="Close chat"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiX size={20} />
            </motion.button>
          </div>

          {/* Chat Body */}
          {!selectedUser ? (
            <div className="p-3 max-h-60 overflow-y-auto hide-scrollbar">
              {mutuals.length === 0 && (
                <p className="text-gray-400 select-none">No mutual followers</p>
              )}
              {mutuals.map((u) => (
                <motion.div
                  key={u._id}
                  className="p-2 hover:bg-gray-700 cursor-pointer rounded select-none"
                  onClick={() => {
                    setSelectedUser(u);
                    setMessages([]); // Clear messages while loading
                  }}
                  whileHover={{ scale: 1.03, backgroundColor: "#2d3748" }}
                  whileTap={{ scale: 0.95 }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSelectedUser(u);
                      setMessages([]);
                    }
                  }}
                >
                  @{u.username}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col h-80">
              <div
                className="flex-1 p-2 overflow-y-auto hide-scrollbar space-y-2"
                ref={messagesEndRef}
              >
                {messages.length === 0 && (
                  <p className="text-gray-400 text-center select-none">
                    Start chatting with @{selectedUser.username}!
                  </p>
                )}
                {messages.map((msg, i) => {
                  const senderId =
                    typeof msg.sender === "object" ? msg.sender._id : msg.sender;
                  const isOwnMessage = areIdsEqual(senderId, user._id);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: isOwnMessage ? 50 : -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className={`mb-2 p-2 rounded-xl max-w-[70%] w-fit break-words ${
                        isOwnMessage
                          ? "bg-blue-600 text-right ml-auto"
                          : "bg-gray-700 text-left"
                      }`}
                    >
                      <div>{msg.content}</div>
                      <div className="text-xs text-gray-300 mt-1 text-right select-none">
                        {msg.timestamp ? dayjs(msg.timestamp).format("HH:mm") : ""}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex border-t border-gray-700">
                <input
                  type="text"
                  className="flex-1 p-2 bg-gray-900 text-white outline-none placeholder-gray-500 focus:ring-1 focus:ring-green-500 rounded-l"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  aria-label="Type your message"
                />
                <motion.button
                  onClick={handleSendMessage}
                  className="p-2 bg-green-500 hover:bg-green-600 rounded-r flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Send message"
                  disabled={message.trim().length === 0}
                  style={{ opacity: message.trim().length === 0 ? 0.5 : 1 }}
                >
                  <FiSend size={20} />
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

};

export default Profile;
