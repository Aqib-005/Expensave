import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage.jsx'
import Navbar from './components/Navbar.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import Dashboard from './components/Dashboard.jsx'
import { AuthProvider } from './components/AuthContext.jsx'
import ResetPassword from './components/ResetPassword.jsx'
import ForgotPassword from './components/ForgotPassword.jsx'
import Transactions from './components/Transactions.jsx'
import Settings from './components/Settings.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <AuthProvider>
      <Router >
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/Expensave" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

