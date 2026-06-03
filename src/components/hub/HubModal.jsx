import React from "react";

const HubModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden />
        <div className="relative bg-white border border-slate-200 shadow-card rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-xl font-semibold text-slate-900">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default HubModal;
