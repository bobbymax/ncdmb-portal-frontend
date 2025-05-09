import { EditableComponentProps } from "app/Context/FileProcessorProvider";
import { BaseResponse } from "app/Repositories/BaseRepository";
import { DocumentResponseData } from "app/Repositories/Document/data";
import React from "react";
import ClaimEditableComponent from "resources/views/crud/templates/editables/ClaimEditableComponent";

export const editableComponentRegistry: Record<
  string,
  React.ComponentType<EditableComponentProps<any>>
> = {
  claim: ClaimEditableComponent,
};
