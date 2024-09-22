export class ServiceProvider {
  private repositories: Record<string, any> = {
    //
  };

  private services: Record<string, any> = {
    //
  };

  private events: Record<string, any> = {};

  static register() {
    return {};
  }

  getRepository = (repo: string): any => {
    return this.repositories[repo];
  };

  getService = (service: string): any => {
    return this.services[service];
  };

  getEvent = (event: string): any => {
    return this.events[event];
  };

  static provide(
    type: "repository" | "services" | "events" = "repository",
    name: string
  ) {
    let instance;

    switch (type) {
      case "services":
        instance = this.prototype.getService(name);
        break;

      case "events":
        instance = this.prototype.getEvent(name);
        break;

      default:
        instance = this.prototype.getRepository(name);
        break;
    }

    return instance;
  }
}
