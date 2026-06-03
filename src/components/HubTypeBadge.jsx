import HubCategoryChip from "./hub/HubCategoryChip";

/** @deprecated Use HubCategoryChip with icon from hubUi helpers */
const HubTypeBadge = ({ label, icon = "event", className = "" }) => (
  <HubCategoryChip icon={icon} label={label} className={className} />
);

export default HubTypeBadge;
