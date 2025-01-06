import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { BaseResponse } from "../BaseRepository";
import { UploadResponseData } from "../Document/data";

export interface StageCategoryResponseData extends BaseResponse {
  name: string;
  label: string;
  icon_path: string;
  icon_path_blob: File | null;
  actions: DataOptionsProps[];
  upload: UploadResponseData | null;
  description: string;
  created_at?: string;
  updated_at?: string;
}
