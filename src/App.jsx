import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Homepage from './pages/Homepage'
import Survey from './pages/Survey'
import Results from './pages/Results'
import HowItWorks from './pages/HowItWorks'
import Testimonials from './pages/Testimonials'
import Admin from './pages/Admin'
import About from './pages/About'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import FAQ from './pages/FAQ'
import Login from './pages/Login'
import Profile from './pages/Profile'
import ResidentSubmission from './pages/ResidentSubmission'
import SubmissionSuccess from './pages/SubmissionSuccess'
import StreetPortal from './pages/StreetPortal'
import Community from './pages/Community'
import CommunityGateway from './pages/CommunityGateway'
import Compare from './pages/Compare'
import Businesses from './pages/Businesses'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/results" element={<Results />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } 
        />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/submit" element={<ResidentSubmission />} />
        <Route path="/submit-neighborhood" element={<ResidentSubmission />} />
        <Route path="/submission-success" element={<SubmissionSuccess />} />
        <Route path="/street/:id" element={<StreetPortal />} />
        <Route path="/community" element={<CommunityGateway />} />
        <Route path="/community/:streetId" element={<Community />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/compare/:ids" element={<Compare />} />
        <Route path="/businesses" element={<Businesses />} />
      </Routes>
    </Router>
  )
}

export default App

