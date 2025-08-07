import { FC } from "react";
import { TabConfigContentProps } from "../../ContentBuilder";
import { TemplateProcessProps } from "app/Repositories/Template/data";
import ProcessTabBase from "resources/views/components/forms/ProcessTabBase";

const ToStaffTabComponent: FC<
  TabConfigContentProps<"to", TemplateProcessProps>
> = (props) => {
  return <ProcessTabBase {...props} />;
};

export default ToStaffTabComponent;
