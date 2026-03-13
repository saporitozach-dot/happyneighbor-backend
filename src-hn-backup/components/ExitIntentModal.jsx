import React, { useState, useEffect } from "react";
import EmailCaptureModal from "./EmailCaptureModal";
import { API_URL } from "../utils/apiConfig";

const ExitIntentModal = ({ onClose, hasMatches = true }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let triggered = false;
    const handleMouseLeave = (e) => {
      if (triggered) return;
      if (e.clientY <= 5) {
        triggered = true;
        const seen = sessionStorage.getItem("exitIntentSeen");
        if (!seen && hasMatches) {
          setShow(true);
          sessionStorage.setItem("exitIntentSeen", "true");
        }
      }
    };
    document.addEventListener("mouseout", handleMouseLeave);
    return () => document.removeEventListener("mouseout", handleMouseLeave);
  }, []);

  const handleEmailSubmit = async (email) => {
    try {
      await fetch(`${API_URL}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "exit_intent", metadata: { action: "email_results" } }),
      });
    } catch {}
    setShow(false);
    onClose?.();
  };

  if (!show) return null;

  return (
    <EmailCaptureModal
      title="Wait! Don't leave yet"
      subtitle="Enter your email and we'll send your personalized matches so you can review them anytime."
      submitLabel="Email my matches"
      skipLabel="No thanks"
      source="exit_intent"
      onComplete={handleEmailSubmit}
      onSkip={() => {
        setShow(false);
        onClose?.();
      }}
    />
  );
};

export default ExitIntentModal;
