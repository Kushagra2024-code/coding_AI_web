import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import CodingWorkspace from './pages/CodingWorkspace'
import DesignWorkspace from './pages/DesignWorkspace'
import QuestionManagement from './pages/QuestionManagement'
import { useAuthStore } from './store/authStore'
import './App.css'

function App() {
  const { token } = useAuthStore()

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={!token ? <Landing /> : <Navigate to="/dashboard" replace />} 
        />
        
        <Route 
          path="/dashboard" 
          element={token ? <Dashboard /> : <Navigate to="/" replace />} 
        />
        
        <Route 
          path="/coding" 
          element={token ? <CodingWorkspace /> : <Navigate to="/" replace />} 
        />
        
        <Route 
          path="/design" 
          element={token ? <DesignWorkspace /> : <Navigate to="/" replace />} 
        />
        
        <Route 
          path="/admin/questions" 
          element={token ? <QuestionManagement /> : <Navigate to="/" replace />} 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
