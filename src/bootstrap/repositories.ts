import { BaseRepository } from "app/Repositories/BaseRepository";
import DepartmentRepository from "app/Repositories/Department/DepartmentRepository";
import PageRepository from "app/Repositories/Page/PageRepository";
import RoleRepository from "app/Repositories/Role/RoleRepository";
import UserRepository from "app/Repositories/User/UserRepository";
/* PLOP_INJECT_REPOSITORY_IMPORT */
import MilestoneRepository from "app/Repositories/Milestone/MilestoneRepository";
import ProjectRepository from "app/Repositories/Project/ProjectRepository";
import ProjectCategoryRepository from "app/Repositories/ProjectCategory/ProjectCategoryRepository";
import ThresholdRepository from "app/Repositories/Threshold/ThresholdRepository";
import TemplateRepository from "app/Repositories/Template/TemplateRepository";
import BlockRepository from "app/Repositories/Block/BlockRepository";
import JournalRepository from "app/Repositories/Journal/JournalRepository";
import ResourceEditorRepository from "app/Repositories/ResourceEditor/ResourceEditorRepository";
import JournalTypeRepository from "app/Repositories/JournalType/JournalTypeRepository";
import TransactionRepository from "app/Repositories/Transaction/TransactionRepository";
import EntityRepository from "app/Repositories/Entity/EntityRepository";
import LedgerRepository from "app/Repositories/Ledger/LedgerRepository";
import PaymentRepository from "app/Repositories/Payment/PaymentRepository";
import ChartOfAccountRepository from "app/Repositories/ChartOfAccount/ChartOfAccountRepository";
import ImportRepository from "app/Repositories/Import/ImportRepository";
import PaymentBatchRepository from "app/Repositories/PaymentBatch/PaymentBatchRepository";
import WidgetRepository from "app/Repositories/Widget/WidgetRepository";
import SignatureRepository from "app/Repositories/Signature/SignatureRepository";
import SignatoryRepository from "app/Repositories/Signatory/SignatoryRepository";
import SignatureRequestRepository from "app/Repositories/SignatureRequest/SignatureRequestRepository";
import DocumentTrailRepository from "app/Repositories/DocumentTrail/DocumentTrailRepository";
import ExpenditureRepository from "app/Repositories/Expenditure/ExpenditureRepository";
import BudgetCodeRepository from "app/Repositories/BudgetCode/BudgetCodeRepository";
import FundRepository from "app/Repositories/Fund/FundRepository";
import SubBudgetHeadRepository from "app/Repositories/SubBudgetHead/SubBudgetHeadRepository";
import BudgetHeadRepository from "app/Repositories/BudgetHead/BudgetHeadRepository";
import DocumentUpdateRepository from "app/Repositories/DocumentUpdate/DocumentUpdateRepository";
import LocationRepository from "app/Repositories/Location/LocationRepository";
import CarderRepository from "app/Repositories/Carder/CarderRepository";
import FileTemplateRepository from "app/Repositories/FileTemplate/FileTemplateRepository";
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
new MilestoneRepository(),
new ProjectRepository(),
new ProjectCategoryRepository(),
new ThresholdRepository(),
new TemplateRepository(),
new BlockRepository(),
  new JournalRepository(),
  new ResourceEditorRepository(),
  new JournalTypeRepository(),
  new TransactionRepository(),
  new EntityRepository(),
  new LedgerRepository(),
  new PaymentRepository(),
  new ChartOfAccountRepository(),
  new ImportRepository(),
  new PaymentBatchRepository(),
  new WidgetRepository(),
  new SignatureRepository(),
  new SignatoryRepository(),
  new SignatureRequestRepository(),
  new DocumentTrailRepository(),
  new ExpenditureRepository(),
  new BudgetCodeRepository(),
  new FundRepository(),
  new SubBudgetHeadRepository(),
  new BudgetHeadRepository(),
  new DocumentUpdateRepository(),
  new LocationRepository(),
  new CarderRepository(),
  new FileTemplateRepository(),
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

// 🔹 Extracts `DocumentCategory` from `App\\Models\\DocumentCategory`
export const extractModelName = (modelPath: string): string => {
  if (!modelPath || typeof modelPath !== "string") return "unknown";
  return modelPath.split("\\").pop() || modelPath;
};

export const toTitleCase = (input: string): string => {
  return (
    input
      // Replace underscores and hyphens with spaces
      .replace(/[_-]/g, " ")
      // Add space before capital letters (for camelCase and PascalCase)
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      // Capitalize each word
      .replace(
        /\w\S*/g,
        (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
  );
};

// 🔹 Converts `ClaimRepository` → `claim` and `DocumentCategoryRepository` → `document_category`
export const toSnakeCase = (str: string): string =>
  str
    .replace(/([a-z])([A-Z])/g, "$1_$2") // Add underscores between camelCase
    .replace(/Repository$/, "") // Remove "Repository" suffix
    .toLowerCase(); // Convert to lowercase

// 🔹 Converts `document_category` → `DocumentCategory` (for folder imports)
const toFolderName = (str: string): string =>
  str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

// 🔹 Converts `DocumentCategory` → `documentcategory`
export const toServiceName = (str: string): string =>
  str.replace(/_/g, "").toLowerCase();

// 🔹 Handles either `camelCase` or `snake_case`
const normalizeRepoName = (name: string): string =>
  name.toLowerCase().replace(/_/g, "");

// 🔹 Generate Repository Map (Key: snake_case repo name, Value: Repository Instance)
const repoMap: Record<string, BaseRepository> = Object.fromEntries(
  repositories.map((repo) => [toSnakeCase(repo.constructor.name), repo])
);

export const formatCamelCaseToSpaced = (text: string) => {
  return text.replace(/([A-Z][a-z]+)/g, " $1").trim();
};

// 🔹 Dynamic Repository Resolver
export const repo = (name: string): BaseRepository => {
  const normalized = normalizeRepoName(name);
  const repoInstance = Object.entries(repoMap).find(
    ([key]) => normalizeRepoName(key) === normalized
  )?.[1];

  if (!repoInstance) {
    // throw new Error(`Repository '${name}' not found.`);
    return repo("document_update");
  }
  return repoInstance;
};

// 🔹 Dynamic Response Data Resolver (Handles CamelCase Folder Names)
export const response = async (name: string): Promise<any> => {
  try {
    const folderName = toFolderName(name); // Convert `document_category` → `DocumentCategory`
    const module = await import(`app/Repositories/${folderName}/data`);
    return module.default || module;
  } catch (error) {
    console.error(`Response data for '${name}' not found.`);
    return null;
  }
};

// 🔹 Dynamic Service Name Resolver (Supports Full Model Path)
export const service = (modelPath: string): string => {
  const modelName = extractModelName(modelPath); // Extracts `DocumentCategory`
  return toServiceName(toSnakeCase(modelName)); // Converts to `documentcategory`
};

export default repositories;
