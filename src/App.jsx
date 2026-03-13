import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import CommunityGateway from "./pages/CommunityGateway";
import Community from "./pages/Community";
import About from "./pages/About";
import Businesses from "./pages/Businesses";
import HelpersSignup from "./pages/HelpersSignup";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/community" element={<CommunityGateway />} />
        <Route path="/community/:streetId" element={<Community />} />
        <Route path="/about" element={<About />} />
        <Route path="/businesses" element={<Businesses />} />
        <Route path="/helpers-signup" element={<HelpersSignup />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
