import React, { FC } from "react";
import { TabConfigContentProps } from "../../ContentBuilder";
import { TemplateProcessProps } from "app/Repositories/Template/data";
import ProcessTabBase from "resources/views/components/forms/ProcessTabBase";

const FromStaffTabComponent: FC<
  TabConfigContentProps<"from", TemplateProcessProps>
> = (props) => {
  return <ProcessTabBase {...props} />;
};

export default FromStaffTabComponent;
