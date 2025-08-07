import React, { FC } from "react";
import { TabConfigContentProps } from "../../ContentBuilder";
import { TemplateProcessProps } from "app/Repositories/Template/data";
import ProcessTabBase from "resources/views/components/forms/ProcessTabBase";

const ThroughStaffComponent: FC<
  TabConfigContentProps<"through", TemplateProcessProps>
> = (props) => {
  return <ProcessTabBase {...props} />;
};

export default ThroughStaffComponent;
