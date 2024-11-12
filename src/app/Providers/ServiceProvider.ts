import { BaseRepository } from "app/Repositories/BaseRepository";

export interface IRepositoriesArray<T extends BaseRepository> {
  name: T;
  instance: new (url: string) => T;
}

export class ServiceProvider {
  private static repositories: IRepositoriesArray<BaseRepository>[] = [];

  private services: Record<string, any> = {
    //
  };

  private events: Record<string, any> = {};

  static register() {
    return {};
  }

  static provide = <T extends BaseRepository>(
    Repository: BaseRepository
  ): T | undefined => {
    return this.repositories.find((repo) => repo.name === Repository) as
      | T
      | undefined;
  };

  static repos = (): IRepositoriesArray<BaseRepository>[] => {
    return this.repositories;
  };

  getService = (service: string): any => {
    return this.services[service];
  };

  getEvent = (event: string): any => {
    return this.events[event];
  };

  // static provide(
  //   type: "repository" | "services" | "events" = "repository",
  //   name: string | BaseRepository
  // ) {
  //   let instance;

  //   switch (type) {
  //     case "services":
  //       instance = this.prototype.getService(name);
  //       break;

  //     case "events":
  //       instance = this.prototype.getEvent(name);
  //       break;

  //     default:
  //       instance = this.prototype.getRepositories(name);
  //       break;
  //   }

  //   return instance;
  // }
}
