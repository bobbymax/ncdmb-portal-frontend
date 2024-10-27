interface ConfigProperties {
  api: string;
  appName: string;
}

export class ConfigProvider {
  private static config: ConfigProperties = {
    api: process.env.REACT_API_ENDPOINT ?? "https://api-manager.test/api/",
    appName: "API Manager",
  };

  static get = (key: keyof ConfigProperties): string => {
    return this.config[key] || "";
  };
}
