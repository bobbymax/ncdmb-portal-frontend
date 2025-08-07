import React, { FC } from "react";
import { TabConfigContentProps } from "../../ContentBuilder";
import { TemplateProcessProps } from "@/app/Repositories/Template/data";
import ProcessTabArrayBase from "resources/views/components/forms/ProcessTabArrayBase";

const ApproversComponent: FC<
  TabConfigContentProps<"approvers", TemplateProcessProps[]>
> = (props) => {
  return (
    <ProcessTabArrayBase
      {...props}
      buttonLabel="Signatories"
      emptyMessage="No Approvers have been added!!"
    />
  );
};

export default ApproversComponent;
