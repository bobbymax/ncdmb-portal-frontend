import { BaseRepository } from "@/app/Repositories/BaseRepository";
import { PageProps } from "@/bootstrap";
import { useParams } from "react-router-dom";
import useDocumentGenerator from "app/Hooks/useDocumentGenerator";
import { TemplateBoardProvider } from "app/Context/TemplateBoardProvider";
import { useTemplateBoard } from "app/Context/TemplateBoardContext";
import TemplateBoardErrorBoundary from "app/Context/TemplateBoardErrorBoundary";
import TemplateBuilder from "./TemplateBuilder";
import DocumentConfigurator from "./DocumentConfigurator";
import GenerationPanel from "./GenerationPanel";
import DocumentGeneratorWrapper from "./DocumentGeneratorWrapper";
import DocumentSections from "./DocumentSections";
import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import { useAuth } from "app/Context/AuthContext";
import { useEffect } from "react";
import useDocumentLoader from "app/Hooks/useDocumentLoader";

// Inner component that can use the context
const DocumentGeneratorContent: React.FC<{
  Repository: BaseRepository;
  DocumentGeneratorComponent: React.ComponentType<any>;
  category: DocumentCategoryResponseData | null;
  editedContents: any;
  mode: "store" | "update";
  documentReference?: string;
}> = ({ Repository, DocumentGeneratorComponent, mode, documentReference }) => {
  const { state, actions } = useTemplateBoard();
  const { staff } = useAuth();

  // Load document data for update mode
  const { documentData, loading, error } = useDocumentLoader(
    Repository,
    mode === "update" ? documentReference : undefined
  );

  // Initialize from document data when in update mode
  useEffect(() => {
    if (mode === "update" && documentData && !loading && !error) {
      actions.initializeFromDocument(documentData);
    }
  }, [mode, documentData, loading, error, actions]);

  // TODO: Add document owner and department owner to the state
  // Apply Code Here!
  useEffect(() => {
    if (staff) {
      // Check if configState.from.state.staff exists and is different from current staff
      const configStaff = state.configState.from?.state?.staff;

      if (configStaff && configStaff.value !== staff.id) {
        // Use the staff from configState if it exists and is different
        actions.setDocumentOwner(configStaff);
      } else {
        // Use the current staff
        actions.setDocumentOwner({
          value: staff.id,
          label: staff.name,
        });
      }

      // Only set department_owner if it's not already set (allow user overrides)
      if (staff.department && !state.department_owner) {
        actions.setDepartmentOwner(staff.department);
      }
    } else {
      // Clear both if no staff
      actions.setDocumentOwner(null);
      actions.setDepartmentOwner(null);
    }
  }, [
    staff,
    actions,
    state.configState.from?.state?.staff,
    state.department_owner,
  ]);

  // Show loading state for update mode
  if (mode === "update" && loading) {
    return (
      <div className="document__generator__container">
        <div className="text-center p-5">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-3">Loading document for editing...</p>
        </div>
      </div>
    );
  }

  // Show error state for update mode
  if (mode === "update" && error) {
    return (
      <div className="document__generator__container">
        <div className="alert alert-danger text-center p-4">
          <div className="mb-3">
            <i
              className="ri-error-warning-line"
              style={{ fontSize: "3rem" }}
            ></i>
          </div>
          <h5>Error Loading Document</h5>
          <p>{error}</p>
          <button
            className="btn btn-outline-primary"
            onClick={() => window.history.back()}
          >
            <i className="ri-arrow-left-line me-1"></i>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="document__generator__container">
      <div className="row">
        {/* Generation Panel */}
        <div className="col-md-12 mb-4">
          <GenerationPanel
            Repository={Repository}
            DocumentGeneratorComponent={null}
            generatedData={{}}
            mode={mode}
            documentReference={documentReference}
          />
        </div>

        {/* Main Content Area */}
        <div className="col-md-8 mb-4">
          <TemplateBuilder Repository={Repository} resource={state.resource} />

          {/* Fund and Parent Document Sections */}
          <div className="mt-4">
            <DocumentSections Repository={Repository} />
          </div>
        </div>

        {/* Sidebar - Configuration & Settings */}
        <div className="col-md-4 mb-4">
          {/* Document Generator Component - Integrated with Context */}
          <div className="mt-4">
            <DocumentGeneratorWrapper
              Repository={Repository}
              DocumentGeneratorComponent={DocumentGeneratorComponent}
            />
          </div>
          <DocumentConfigurator Repository={Repository} />
        </div>
      </div>
    </div>
  );
};

const DocumentGenerator = ({
  Repository,
  view,
  DocumentGeneratorComponent,
}: PageProps<BaseRepository>) => {
  const params = useParams();

  // Determine mode based on URL parameters
  const isUpdateMode = !!params.documentReference;
  const documentReference = params.documentReference;
  const categoryId = params.categoryId;

  const { category, editedContents } = useDocumentGenerator(params);

  return (
    <TemplateBoardErrorBoundary>
      <TemplateBoardProvider>
        <DocumentGeneratorContent
          Repository={Repository}
          DocumentGeneratorComponent={DocumentGeneratorComponent}
          category={category}
          editedContents={editedContents}
          mode={isUpdateMode ? "update" : "store"}
          documentReference={documentReference}
        />
      </TemplateBoardProvider>
    </TemplateBoardErrorBoundary>
  );
};

export default DocumentGenerator;
