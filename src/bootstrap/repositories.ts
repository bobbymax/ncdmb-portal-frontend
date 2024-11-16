import { BaseRepository } from "app/Repositories/BaseRepository";
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
];

export default repositories;
