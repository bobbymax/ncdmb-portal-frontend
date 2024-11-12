import { ApiService } from "app/Services/ApiService";
import { AxiosResponse } from "axios";

export default class MenuProvider {
  private api: ApiService;
  private url: string = "modules";

  constructor() {
    this.api = new ApiService();
  }

  static navigation = async (): Promise<AxiosResponse> => {
    const instance = new this();
    return instance.api.get(instance.url);
  };
}
