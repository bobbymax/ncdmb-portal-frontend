import React from "react";
import { SidebarProps } from "../sidebars/AnalysisSidebar";
import { ClaimResponseData } from "app/Repositories/Claim/data";

const ClaimUploadsWidget: React.FC<SidebarProps<ClaimResponseData>> = ({
  tracker,
  actions,
  docType,
  uploadCount,
  document,
  widget,
}) => {
  return <div>ClaimUploadsWidget</div>;
};

export default ClaimUploadsWidget;
