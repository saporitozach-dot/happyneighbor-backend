import React from "react";
import HubModal from "./HubModal";
import BrandIcon from "../brand/BrandIcon";

const HubSuccessModal = ({ isOpen, onClose, title, message, detail, actionLabel, onAction }) => (
  <HubModal isOpen={isOpen} onClose={onClose} title={title || "Done"}>
    <div className="text-center space-y-4">
      <div className="hub-icon-mark w-14 h-14 mx-auto">
        <BrandIcon name="planner" size={28} className="text-indigo-600" />
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
      {detail && (
        <div className="hub-callout text-left text-sm text-slate-700">{detail}</div>
      )}
      <div className="flex flex-col gap-2">
        {onAction && actionLabel && (
          <button type="button" onClick={onAction} className="btn-party w-full">
            {actionLabel}
          </button>
        )}
        <button type="button" onClick={onClose} className="btn-party-outline w-full">
          Close
        </button>
      </div>
    </div>
  </HubModal>
);

export default HubSuccessModal;
