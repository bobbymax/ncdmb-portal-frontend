import React, { FC } from "react";
import { TabConfigContentProps } from "../../ContentBuilder";
import { TemplateProcessProps } from "app/Repositories/Template/data";
import ProcessTabArrayBase from "resources/views/components/forms/ProcessTabArrayBase";

const CCStaffComponent: FC<
  TabConfigContentProps<"cc", TemplateProcessProps[]>
> = (props) => {
  return (
    <ProcessTabArrayBase
      {...props}
      buttonLabel="CC"
      emptyMessage="No Recipients have been added!!"
    />
  );
};

export default CCStaffComponent;
