import React from 'react';
import '../styles/homepage.css'
import { useAuth } from "./AuthContext.jsx";

function HomePage() {
  const { user, setUser, loading } = useAuth();

  return (
    <div className='content'>
      <h1>Welcome </h1>
      <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s</p>
      {(user ? (
        <a className='btn btn-outline' href='/dashboard'> Dashboard</a>
      ) : (
        <>
          <a href='/signup' className='btn btn-outline'> Sign-Up </a>
          <a href='/login' className='btn btn-outline'> Log-In </a>
        </>
      )
      )}
    </div>
  );
}

export default HomePage;
