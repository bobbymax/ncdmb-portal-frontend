interface ConfigProperties {
  api: string | undefined;
  appName: string;
}

export class ConfigProvider {
  private static config: ConfigProperties = {
    api: process.env.REACT_API_ENDPOINT,
    appName: "Code Base",
  };

  static get = (key: keyof ConfigProperties): string => {
    return this.config[key] || "";
  };
}
