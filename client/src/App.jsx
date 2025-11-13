import './App.css';
import { useAuth } from '../context/AuthContext.jsx';
import { AuthForm } from './components/AuthForm';

// Main application component
function App() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Render the main application
  return (
    <div className="App">
      <h1>Welcome to jurassic park</h1>
      {user ? (
        <div>
          <p>Welcome, {user.username}!</p>
          <button onClick={logout}>Logout</button>
          {/* Le composant Grid (bientot inshallah) */}
        </div>
      ) : (
        <AuthForm />
      )}
    </div>
  );
}

export default App;