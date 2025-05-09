import { BaseResponse } from "../BaseRepository";

export interface TransactionResponseData extends BaseResponse {
    created_at?: string
    updated_at?: string
}