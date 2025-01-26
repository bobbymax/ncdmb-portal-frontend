import { BaseRepository } from "app/Repositories/BaseRepository";
import DepartmentRepository from "app/Repositories/Department/DepartmentRepository";
import PageRepository from "app/Repositories/Page/PageRepository";
import RoleRepository from "app/Repositories/Role/RoleRepository";
import UserRepository from "app/Repositories/User/UserRepository";
/* PLOP_INJECT_REPOSITORY_IMPORT */
import MailingListRepository from "app/Repositories/MailingList/MailingListRepository";
import FolderRepository from "app/Repositories/Folder/FolderRepository";
import VerificationRepository from "app/Repositories/Verification/VerificationRepository";
import DocumentDraftRepository from "app/Repositories/DocumentDraft/DocumentDraftRepository";
import ProgressTrackerRepository from "app/Repositories/ProgressTracker/ProgressTrackerRepository";
import StageCategoryRepository from "app/Repositories/StageCategory/StageCategoryRepository";
import DocumentRepository from "app/Repositories/Document/DocumentRepository";
import ExpenseRepository from "app/Repositories/Expense/ExpenseRepository";
import TripCategoryRepository from "app/Repositories/TripCategory/TripCategoryRepository";
import RemunerationRepository from "app/Repositories/Remuneration/RemunerationRepository";
import AllowanceRepository from "app/Repositories/Allowance/AllowanceRepository";
import CityRepository from "app/Repositories/City/CityRepository";
import TripRepository from "app/Repositories/Trip/TripRepository";
import ClaimRepository from "app/Repositories/Claim/ClaimRepository";
import DocumentActionRepository from "app/Repositories/DocumentAction/DocumentActionRepository";
import DocumentCategoryRepository from "app/Repositories/DocumentCategory/DocumentCategoryRepository";
import DocumentTypeRepository from "app/Repositories/DocumentType/DocumentTypeRepository";
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
new MailingListRepository(),
new FolderRepository(),
new VerificationRepository(),
new DocumentDraftRepository(),
new ProgressTrackerRepository(),
new StageCategoryRepository(),
new DocumentRepository(),
new ExpenseRepository(),
new TripCategoryRepository(),
new RemunerationRepository(),
new AllowanceRepository(),
new CityRepository(),
new TripRepository(),
new ClaimRepository(),
new DocumentActionRepository(),
new DocumentCategoryRepository(),
  new DocumentTypeRepository(),
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
