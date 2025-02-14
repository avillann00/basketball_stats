import ProtectedRoute from './components/ProtectedRoute'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './components/AuthContext'
import NotFound from "./pages/NotFound"
import Login from "./pages/Login"
import Register from "./pages/Register"

function App() {
  return (
    <AuthProvider> 
      <BrowserRouter>
        <Routes>
          <Route path='*' element={<NotFound />} />
          <Route
            path='/login'
            element={
              <ProtectedRoute>
                <Login />
              </ProtectedRoute>
            }
          />
          <Route
            path='/register'
            element={
              <ProtectedRoute>
                <Register />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
