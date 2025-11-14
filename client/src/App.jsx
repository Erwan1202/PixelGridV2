import React from 'react';
import './App.css';
import { useAuth } from '../context/AuthContext';
import { AuthForm } from './components/AuthForm';
import Grid from './components/Grid'; // Importer Grid

function App() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <h1>PixelGrid</h1>
      {user ? (
        <div>
          <p>Welcome, {user.username}!</p>
          <button onClick={logout}>Logout</button>
          <Grid />
        </div>
      ) : (
        <AuthForm />
      )}
    </div>
  );
}

export default App;