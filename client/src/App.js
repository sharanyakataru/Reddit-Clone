// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import './stylesheets/App.css';
import Banner from './components/Banner';
import Navbar from './components/Navbar';
import HomePage from './components/Homepage.js';
import PostCreatePage from './components/PostCreatePage.js';
import CommunityCreatePage from './components/CommunityCreatePage.js';
import './stylesheets/banner.css'; 
import './stylesheets/navbar.css'; 
import './stylesheets/homepage.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CommunityPage from './components/CommunityPage.js';
import CommentCreatePage from './components/CommentCreatePage.js';
import PostPage from './components/PostPage.js';
import Search from "./components/Search";
import WelcomePage from './components/WelcomePage.js';
import RegisterPage from './components/RegisterPage.js';
import LoginPage from './components/LoginPage';
import UserProfilePage from './components/UserProfilePage.js';

import './stylesheets/search.css';
import { useState } from 'react';

function App() {
  const [reloadNavbar, setReloadNavbar] = useState(false);
  return (
    <Router>
      <Banner />
      <div className="app-container">
        {(
          <>
            <Navbar reload={reloadNavbar} setReload={setReloadNavbar}/>  
            <section className="main-content">
              <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/profile" element={<UserProfilePage setReloadNavbar={setReloadNavbar}/>} />
              <Route path="/edit-post/:id" element={<PostCreatePage />} />
              <Route path="/edit-community/:id" element={<CommunityCreatePage />} />
              <Route path="/edit-comment/:commentID" element={<CommentCreatePage />} />
              <Route path="/create-post" element={<PostCreatePage />} />
              <Route path="/create-community" element={<CommunityCreatePage />} />
              <Route path="/search" element={<Search />} />
              <Route path="/:communityID/posts/:postID" element={<PostPage  />} />
              <Route path="/:communityID/posts/:postID/comment/new" element={<CommentCreatePage  />} />
              <Route path="/:communityID/posts/:postID/comment/:commentID/reply" element={<CommentCreatePage/>} />
              <Route path="/:communityID" element={<CommunityPage setReloadNavbar={setReloadNavbar}/>} />
              <Route path="/admin/user/:id" element={<UserProfilePage setReloadNavbar={setReloadNavbar}/>} />
              </Routes>
            </section>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
