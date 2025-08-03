import './App.css';
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import Home from './components/Home';
import EditorPage from './components/EditorPage';
import { Toaster } from 'react-hot-toast';

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token"); // or whatever you use
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <div>
        <Toaster position='top-center' />
      </div>

      <Routes>
        <Route path='/' element={<Home />} />
        <Route
          path='/editor/:roomId'
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
