import { BaseResponse } from "../BaseRepository";

export interface JournalResponseData extends BaseResponse {
    created_at?: string
    updated_at?: string
}