import {
  BaseRepository,
  BaseResponse,
} from "@/app/Repositories/BaseRepository";
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

// Inner component that can use the context
const DocumentGeneratorContent: React.FC<{
  Repository: BaseRepository;
  DocumentGeneratorComponent: React.ComponentType<any>;
  category: any;
  editedContents: any;
}> = ({ Repository, DocumentGeneratorComponent, category, editedContents }) => {
  const { state } = useTemplateBoard();

  // console.log(state.configState);

  return (
    <div className="document__generator__container">
      <div className="row">
        {/* Generation Panel */}
        <div className="col-md-12 mb-4">
          <GenerationPanel
            Repository={Repository}
            DocumentGeneratorComponent={null}
            generatedData={{}}
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

  const { category, editedContents } = useDocumentGenerator(params);

  return (
    <TemplateBoardErrorBoundary>
      <TemplateBoardProvider>
        <DocumentGeneratorContent
          Repository={Repository}
          DocumentGeneratorComponent={DocumentGeneratorComponent}
          category={category}
          editedContents={editedContents}
        />
      </TemplateBoardProvider>
    </TemplateBoardErrorBoundary>
  );
};

export default DocumentGenerator;
