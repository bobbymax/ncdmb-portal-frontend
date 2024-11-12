import { BaseRepository } from "app/Repositories/BaseRepository";
import ModuleRepository from "app/Repositories/ModuleRepository";
import RoleRepository from "app/Repositories/RoleRepository";
import ServiceRepository from "app/Repositories/ServiceRepository";
import UserRepository from "app/Repositories/UserRepository";
import { lazy } from "react";

export interface RepoProp<T extends BaseRepository> {
  name: new (url: string) => T;
  instance: T;
}

export const lazyLoad = (componentPath: string) => {
  return lazy(() => import(`../resources/views/${componentPath}`));
};

const repositories: RepoProp<BaseRepository>[] = [
  { name: UserRepository, instance: new UserRepository("users") },
  { name: RoleRepository, instance: new RoleRepository("roles") },
  { name: ModuleRepository, instance: new ModuleRepository("modules") },
  { name: ServiceRepository, instance: new ServiceRepository("services") },
];

export default repositories;
