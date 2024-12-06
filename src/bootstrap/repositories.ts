import { BaseRepository } from "app/Repositories/BaseRepository";
import DepartmentRepository from "app/Repositories/Department/DepartmentRepository";
import PageRepository from "app/Repositories/Page/PageRepository";
import RoleRepository from "app/Repositories/Role/RoleRepository";
import UserRepository from "app/Repositories/User/UserRepository";
/* PLOP_INJECT_REPOSITORY_IMPORT */
import DocumentRequirementRepository from "app/Repositories/DocumentRequirement/DocumentRequirementRepository";
import WorkflowStageRepository from "app/Repositories/WorkflowStage/WorkflowStageRepository";
import GradeLevelRepository from "app/Repositories/GradeLevel/GradeLevelRepository";
import GroupRepository from "app/Repositories/Group/GroupRepository";
import WorkflowRepository from "app/Repositories/Workflow/WorkflowRepository";
import { lazy } from "react";

export const lazyLoad = (componentPath: string) => {
  return lazy(() => import(`../resources/views/${componentPath}`));
};

const repositories: Array<BaseRepository> = [
  /* PLOP_INJECT_REPOSITORY_INSTANCE */
new DocumentRequirementRepository(),
new WorkflowStageRepository(),
new GradeLevelRepository(),
new GroupRepository(),
  new WorkflowRepository(),
  new UserRepository(),
  new PageRepository(),
  new RoleRepository(),
  new DepartmentRepository(),
];

export default repositories;
