import {
  BaseRepository,
  BaseResponse,
} from "@/app/Repositories/BaseRepository";
import { PageProps } from "@/bootstrap";
import { useParams } from "react-router-dom";
import TemplateBuilderView from "../crud/templates/builders/TemplateBuilderView";
import { InternalMemoHeader } from "resources/templates/headers";
import useDocumentGenerator from "app/Hooks/useDocumentGenerator";
import { useCallback, useEffect, useState } from "react";
import useGeneratorResource from "app/Hooks/useGeneratorResource";
import { useAuth } from "app/Context/AuthContext";
import useBuilder, {
  ContentAreaProps,
  OptionsContentAreaProps,
} from "app/Hooks/useBuilder";
import { BlockDataType } from "@/app/Repositories/Block/data";
import { toTitleCase } from "bootstrap/repositories";
import { BlockDataTypeMap } from "resources/views/crud/templates/blocks";
import useProcessFlowTypes from "app/Hooks/useProcessFlowTypes";
import { ProcessTabsOption } from "../crud/ContentBuilder";
import DocumentProcessFlow from "../components/tabs/DocumentProcessFlow";
import TextInput from "../components/forms/TextInput";
import Button from "../components/forms/Button";
import Dropzone from "../components/forms/Dropzone";
import useDirectories from "app/Hooks/useDirectories";
import { repo } from "bootstrap/repositories";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { formatOptions } from "app/Support/Helpers";
import { ActionMeta } from "react-select";
import { DocumentResponseData } from "@/app/Repositories/Document/data";
import { FundResponseData } from "@/app/Repositories/Fund/data";
import moment from "moment";
import useWorkflowTransformer from "app/Hooks/useWorkflowTransformer";
import WorkflowPreview from "../components/pages/WorkflowPreview";

const DocumentGenerator = ({
  Repository,
  view,
  DocumentGeneratorComponent,
}: PageProps<BaseRepository>) => {
  const { staff } = useAuth();
  const params = useParams();
  const {
    configState,
    setConfigState,
    editedContents,
    updateEditedContents,
    updateEditedContentsOrder,
    removeEditedContent,
    category,
    template,
  } = useDocumentGenerator(params);

  const { blocks } = useBuilder(template);

  // Transform configState to WorkflowResponseData and ProgressTrackerResponseData
  const {
    workflow,
    trackers,
    isValid: isWorkflowValid,
    errors: workflowErrors,
  } = useWorkflowTransformer({
    configState,
    category,
  });

  // i need the editedContents, also the configState, resource,
  // category, document state, uploads
  // Design workflow path from configState

  const handleAddToSheet = useCallback(
    (block: any, type: string) => {
      const newContent: ContentAreaProps = {
        id: crypto.randomUUID(),
        activeId: null,
        type: type as BlockDataType,
        isBeingEdited: false,
        isCollapsed: false,
        block_id: block.id,
        name: block.title,
        content: {} as OptionsContentAreaProps,
        order: editedContents.length + 1,
      };

      updateEditedContentsOrder([newContent, ...editedContents]);
    },
    [editedContents, updateEditedContentsOrder]
  );

  // Helper to group blocks by input_type
  const groupBlocksByType = (blocks: any[]) => {
    return blocks.reduce((acc, block) => {
      const type = block.input_type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(block);
      return acc;
    }, {} as Record<string, any[]>);
  };

  const toggleDropdown = (type: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleBlocksAreaDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("Drag start detected");
    setIsDraggingBlocks(true);

    const blocksArea = e.currentTarget.closest(
      ".blocks__content__area"
    ) as HTMLElement;
    const parent = blocksArea?.parentElement;

    if (!blocksArea || !parent) {
      console.log("Missing elements:", {
        blocksArea: !!blocksArea,
        parent: !!parent,
      });
      return;
    }

    const rect = blocksArea.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    console.log("Initial positions:", {
      currentPos: blocksAreaPosition,
      offsetX,
      offsetY,
      parentRect: { width: parentRect.width, height: parentRect.height },
    });

    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        const newX = e.clientX - parentRect.left - offsetX;
        const newY = e.clientY - parentRect.top - offsetY;

        // Constrain to parent bounds with minimum offset
        const maxX = Math.max(0, parentRect.width - 100);
        const maxY = Math.max(0, parentRect.height - 300);

        const constrainedX = Math.max(8, Math.min(newX, maxX));
        const constrainedY = Math.max(8, Math.min(newY, maxY));

        // console.log("New position:", {
        //   newX,
        //   newY,
        //   constrainedX,
        //   constrainedY,
        // });

        setBlocksAreaPosition({
          x: constrainedX,
          y: constrainedY,
        });
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      console.log("Drag end, final position:", blocksAreaPosition);
      setIsDraggingBlocks(false);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: false });
    document.addEventListener("mouseup", handleMouseUp, { passive: false });
  };

  const { collection, state, setState, resource, setResource } =
    useGeneratorResource(Repository, category?.service || "");

  const { collection: funds } = useDirectories(repo("fund"), "funds");

  const { processTypeOptions } = useProcessFlowTypes();
  const [activeTab, setActiveTab] = useState<ProcessTabsOption>(
    () =>
      processTypeOptions.find((option) => option.default) ||
      processTypeOptions[0]
  );

  const [parentDocument, setParentDocument] = useState<string>("");
  const [uploads, setUploads] = useState<File[]>([]);
  const [fund, setFund] = useState<DataOptionsProps | null>(null);
  const [fundObject, setFundObject] = useState<FundResponseData | null>(null);
  const [documentObject, setDocumentObject] =
    useState<DocumentResponseData | null>(null);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {}
  );
  const [blocksAreaPosition, setBlocksAreaPosition] = useState({ x: 8, y: 8 });
  const [isDraggingBlocks, setIsDraggingBlocks] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  // Helper function to convert File to data URL
  const convertFileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error(`Failed to read file: ${file.name}`));
      };
      reader.readAsDataURL(file);
    });
  };

  const generateDocument = useCallback(async () => {
    console.log("Generate Document clicked");

    // Prevent multiple clicks
    if (isGenerating) {
      console.log("Already generating document...");
      return;
    }

    setIsGenerating(true);
    setLoadingProgress(0);
    setLoadingStep("");

    try {
      // Step 1: Creating workflow for this document
      setLoadingStep("Creating workflow for this document");
      setLoadingProgress(20);
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Step 2: Encrypting uploaded files
      setLoadingStep("Encrypting uploaded files");
      setLoadingProgress(40);

      let uploadDataUrls: string[] = [];
      if (uploads.length > 0) {
        try {
          uploadDataUrls = await Promise.all(
            uploads.map((file) => convertFileToDataURL(file))
          );
          console.log("Files converted to data URLs:", uploadDataUrls.length);
        } catch (error) {
          console.error("Error converting files to data URLs:", error);
          setLoadingStep("Error converting files to data URLs");
          return;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 600));

      // Step 3: Gathering necessary data input for processing
      setLoadingStep("Gathering necessary data input for processing");
      setLoadingProgress(60);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 4: Getting ready to send this data to our servers
      setLoadingStep("Getting ready to send this data to our servers");
      setLoadingProgress(80);
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Check for required dependencies
      if (!Repository) {
        console.error("Repository is not available");
        return;
      }

      if (!category?.service) {
        console.error("Category service is not available");
        return;
      }

      if (!state) {
        console.error("State is not available");
        return;
      }

      if (!resource) {
        console.error("Resource is not available");
        return;
      }

      if (!staff?.id) {
        console.error("Staff ID is not available");
        return;
      }

      console.log("All dependencies available, generating document...");

      const documentServerObject = {
        document: state,
        resource_id: resource.id,
        configState,
        uploads: uploadDataUrls, // Use the converted data URLs instead of File objects
        contents: editedContents,
        fund_id: fund?.value || 0,
        document_reference_id: documentObject?.id,
        service: category?.service,
        user_id: staff?.id,
        department_id: staff?.department_id,
        workflow: workflow, // Include the transformed workflow
        trackers: trackers, // Include the trackers
        isWorkflowValid: isWorkflowValid, // Include validation status
      };

      console.log("Document Server Object:", documentServerObject);

      // TODO: Add actual API call here
      // const response = await Repository.create("documents", documentServerObject);
      // const response = await Repository.store(
      //   "generate/documents",
      //   documentServerObject
      // );

      // Simulate API call for now
      setLoadingStep("Processing document on our servers");
      setLoadingProgress(90);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setLoadingStep("Document generated successfully!");
      setLoadingProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("Document generated successfully!");
    } catch (error) {
      console.error("Error generating document:", error);
      setLoadingStep("Error occurred while generating document");
    } finally {
      setIsGenerating(false);
      setLoadingStep("");
      setLoadingProgress(0);
    }
  }, [
    Repository,
    category?.service,
    state,
    resource,
    staff?.id,
    staff?.department_id,
    configState,
    uploads,
    editedContents,
    fund?.value,
    documentObject?.id,
    workflow,
    trackers,
    isWorkflowValid,
    isGenerating,
  ]);

  const handleContentChange = <T extends BlockDataType>(
    data: BlockDataTypeMap[T],
    identifier: keyof OptionsContentAreaProps,
    blockId: string | number
  ) => {
    console.log("handleContentChange called with:", {
      data,
      identifier,
      blockId,
    });

    // Find the content in editedContents (not contents from server)
    const content = editedContents.find((block) => block.id === blockId);

    if (!content) {
      console.error("Content not found for blockId:", blockId);
      return;
    }

    const updatedContent: ContentAreaProps = {
      ...content,
      content: {
        ...content.content,
        ...(data as Record<string, any>),
      } as OptionsContentAreaProps,
    };

    console.log("Updated content:", updatedContent);
    updateEditedContents(updatedContent);
  };

  const fetchParentDocument = useCallback(async () => {
    if (!parentDocument || !Repository) return;

    const encodedRef = encodeURIComponent(parentDocument);

    const response = await Repository.show("documents/ref", encodedRef);
    if (response.code === 200) {
      setDocumentObject(response.data as DocumentResponseData);
      setState((prev) => ({
        ...prev,
        document_reference_id: (response.data as DocumentResponseData).id,
      }));
    }
  }, [Repository, parentDocument]);

  const handleFundChange = (
    newValue: unknown,
    actionMeta: ActionMeta<unknown>
  ) => {
    const updatedValue = newValue as DataOptionsProps;
    setFund(updatedValue);
    // setState((prev) => ({
    //   ...prev,
    //   fund_id: updatedValue.value,
    // }));
    setFundObject(
      funds.find((f) => f.id === updatedValue.value) as FundResponseData
    );
  };

  useEffect(() => {
    if (staff && resource && category) {
      setState((prev) => ({
        ...prev,
        documentable_id: resource.id,
        user_id: staff.id,
        department_id: staff.department_id,
        document_category_id: category.id,
        document_type_id: category.document_type_id,
        workflow_id: category.workflow_id,
      }));
    }
  }, [staff, resource, category]);

  //  configState, resource, category, state, uploads,
  // contents: editedContents, fund, documentAttached

  return (
    <div className="document__generator__container">
      {/* Loading Overlay */}
      {isGenerating && (
        <div className="document__generator__loading__overlay">
          <div className="loading__content">
            <div className="loading__spinner">
              <i className="ri-loader-4-line"></i>
            </div>
            <div className="loading__step">
              <h3>Generating Document</h3>
              <p>{loadingStep}</p>
            </div>
            <div className="loading__progress">
              <div className="progress__bar">
                <div
                  className="progress__fill"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <span className="progress__text">{loadingProgress}%</span>
            </div>
          </div>
        </div>
      )}
      <div className="row">
        <div className="col-md-12 mb-5">
          <div className="flex align between gap-md">
            <h4
              style={{
                letterSpacing: 1.5,
                textTransform: "uppercase",
                fontWeight: 700,
                color: "green",
              }}
            >
              {category?.name} Generator
            </h4>
            <div className="flex align gap-md">
              <Button
                label={isGenerating ? "Generating..." : "Generate Document"}
                handleClick={() => generateDocument()}
                icon={isGenerating ? "ri-loader-4-line" : "ri-links-line"}
                size="md"
                variant="dark"
                isDisabled={!isWorkflowValid || isGenerating}
              />
              <Button
                label="Go Back"
                handleClick={() => {}}
                icon="ri-arrow-left-long-line"
                size="md"
                variant="danger"
              />
            </div>
          </div>
        </div>
        <div className="col-md-8 mb-3">
          <div className="template__page paper__container mb-4">
            <div
              className={`blocks__content__area ${
                isDraggingBlocks ? "dragging" : ""
              }`}
              style={{
                top: `${blocksAreaPosition.y}px`,
                left: `${blocksAreaPosition.x}px`,
              }}
              onMouseDown={handleBlocksAreaDragStart}
            >
              <div
                className="blocks__header"
                onMouseDown={handleBlocksAreaDragStart}
              >
                <div
                  className="blocks__drag__handle"
                  onMouseDown={handleBlocksAreaDragStart}
                >
                  <i className="ri-draggable"></i>
                </div>
              </div>
              {Object.entries(groupBlocksByType(blocks)).map(
                ([type, groupBlocks]) => {
                  const blocksArr = groupBlocks as any[];

                  if (blocksArr.length === 1) {
                    return (
                      <div key={type} className="blocks__group">
                        <div className="blocks__group__items">
                          <div
                            className="blocks__item"
                            onClick={() =>
                              handleAddToSheet(
                                blocksArr[0],
                                blocksArr[0].data_type
                              )
                            }
                          >
                            <i className={blocksArr[0].icon} />
                            <div className="blocks__item__title">
                              {blocksArr[0].title}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={type} className="blocks__group">
                      <div className="blocks__group__items">
                        <div className="blocks__dropdown">
                          <div
                            className="blocks__dropdown__trigger"
                            onClick={() => toggleDropdown(type)}
                          >
                            <i className={blocksArr[0].icon} />
                            <div className="blocks__item__title">
                              {toTitleCase(type.replace(/Block$/, ""))}
                            </div>
                            <i
                              className={
                                openDropdowns[type]
                                  ? "ri-arrow-up-s-line"
                                  : "ri-arrow-down-s-line"
                              }
                            />
                          </div>
                          {openDropdowns[type] && (
                            <div className="blocks__dropdown__content">
                              {blocksArr.map((block: any) => (
                                <div
                                  key={block.id}
                                  className="blocks__dropdown__item"
                                  onClick={() => {
                                    handleAddToSheet(block, block.data_type);
                                    toggleDropdown(type);
                                  }}
                                >
                                  <i className={block.icon} />
                                  <div className="blocks__dropdown__item__title">
                                    {block.title}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
            <div className="paper__header">
              <InternalMemoHeader
                to={configState.to?.state ?? null}
                from={configState.from?.state ?? null}
                through={configState.through?.state ?? null}
                ref={null}
                date={moment().format()}
                title={state.title}
              />
            </div>
            <div className="paper__body">
              <TemplateBuilderView
                resource={resource}
                contents={editedContents}
                modify={handleContentChange}
                editor
                onReorder={(reorderedContents) => {
                  updateEditedContentsOrder(reorderedContents);
                }}
                onRemove={(blockId) => {
                  removeEditedContent(blockId);
                }}
                configState={configState}
              />
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          {/* Process Flow Container */}
          <div className="process__flow__container mb-5">
            <DocumentProcessFlow
              processTypeOptions={processTypeOptions}
              activeTab={activeTab}
              configState={configState}
              setConfigState={setConfigState}
              setActiveTab={setActiveTab}
              isDisplay
            />
          </div>
          {/* End Process Flow Container */}
          {/* Workflow Preview */}
          <div className="workflow__preview__section mb-5">
            <WorkflowPreview
              workflow={workflow}
              trackers={trackers}
              isValid={isWorkflowValid}
              errors={workflowErrors}
            />
          </div>
          <div className="subject__block mb-4">
            <TextInput
              label="Document Title"
              name="title"
              value={state.title}
              onChange={(e) =>
                setState((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter Document Title"
            />
          </div>
          <DocumentGeneratorComponent
            repo={Repository}
            collection={collection}
            service={category?.service || ""}
            state={state}
            setState={setState}
            plug={(data) => {
              // console.log(data);
              setResource(data);
            }}
            category={category}
            template={template}
          />
        </div>
        <div className="col-md-12 mb-3">
          <div
            className="bottom__div"
            style={{
              backgroundColor: "white",
              padding: 32,
              borderRadius: 3,
              border: "1px solid lightgrey",
            }}
          >
            {/* Other Form Elements */}
            <div className="row mb-4">
              {/* Fund Section */}
              <div className="col-md-4 fund__section">
                <div className="fund__container">
                  <MultiSelect
                    label="Budget Heads"
                    options={formatOptions(funds, "id", "name", true)}
                    value={fund}
                    onChange={handleFundChange}
                    placeholder="Budget Head"
                    isSearchable
                    isDisabled={false}
                  />
                </div>
                <div className="fund__display__card">
                  {fundObject ? (
                    <div className="fund__card">
                      <div className="fund__card__header">
                        <i className="ri-money-dollar-circle-line"></i>
                        <span className="fund__card__title">
                          Selected Budget Head
                        </span>
                      </div>
                      <div className="fund__card__content">
                        <div className="fund__card__name">
                          <strong>Name:</strong> {fundObject.name || "N/A"}
                        </div>
                        <div className="fund__card__budget_code">
                          <strong>Budget Code:</strong>{" "}
                          {fundObject.budget_code || "N/A"}
                        </div>
                        <div className="fund__card__sub_budget_head">
                          <strong>Sub Budget Head:</strong>{" "}
                          {fundObject.sub_budget_head || "N/A"}
                        </div>
                        <div className="fund__card__type">
                          <strong>Type:</strong>
                          <span
                            className={`type__badge type__${fundObject.type}`}
                          >
                            {fundObject.type}
                          </span>
                        </div>
                        <div className="fund__card__amounts">
                          <div className="fund__card__amount fund__card__amount--approved">
                            <strong>Approved Amount:</strong>
                            <span className="amount__value">
                              ₦
                              {Number(
                                fundObject.total_approved_amount
                              )?.toLocaleString() || "0"}
                            </span>
                          </div>
                          <div className="fund__card__amount fund__card__amount--committed">
                            <strong>Committed Amount:</strong>
                            <span className="amount__value">
                              ₦
                              {fundObject.total_commited_amount?.toLocaleString() ||
                                "0"}
                            </span>
                          </div>
                        </div>
                        <div className="fund__card__year">
                          <strong>Budget Year:</strong>{" "}
                          {fundObject.budget_year || "N/A"}
                        </div>
                        <div className="fund__card__status">
                          <strong>Status:</strong>
                          <span
                            className={`status__badge ${
                              fundObject.is_exhausted
                                ? "status__exhausted"
                                : "status__available"
                            }`}
                          >
                            {fundObject.is_exhausted
                              ? "Exhausted"
                              : "Available"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="fund__card__empty">
                      <i className="ri-money-dollar-circle-line"></i>
                      <p>No budget head selected</p>
                      <span>
                        Select a budget head to allocate funds for this document
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {/* End Fund Section */}
              {/* Parent Document Section */}
              <div className="col-md-4 parent__document__section">
                <div className="mb-5">
                  <TextInput
                    label="Attach Parent Document"
                    name="parent_document"
                    value={parentDocument}
                    onChange={(e) => setParentDocument(e.target.value)}
                    placeholder="Enter Reference Number"
                  />
                  <Button
                    label="Attach"
                    handleClick={() => fetchParentDocument()}
                    icon="ri-attachment-line"
                    size="sm"
                    variant="dark"
                    isDisabled={!parentDocument}
                  />
                </div>
                <div className="reference__document__container">
                  {documentObject ? (
                    <div className="reference__document__card">
                      <div className="reference__document__header">
                        <i className="ri-file-text-line"></i>
                        <span className="reference__document__title">
                          Parent Document
                        </span>
                      </div>
                      <div className="reference__document__content">
                        <div className="reference__document__ref">
                          <strong>Ref:</strong> {documentObject.ref}
                        </div>
                        <div className="reference__document__title_text">
                          <strong>Title:</strong> {documentObject.title}
                        </div>
                        <div className="reference__document__description">
                          <strong>Description:</strong>{" "}
                          {documentObject.description || "No description"}
                        </div>
                        <div className="reference__document__status">
                          <strong>Status:</strong>
                          <span
                            className={`status__badge status__${documentObject.status?.toLowerCase()}`}
                          >
                            {documentObject.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="reference__document__empty">
                      <i className="ri-file-text-line"></i>
                      <p>No parent document attached</p>
                      <span>
                        Attach a parent document to link this document
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {/* End Parent Document Section */}
              {/* Uploads Section */}
              <div className="col-md-4 uploads__container__section">
                <div className="uploads__container flex column gap-md">
                  <Dropzone
                    label="Upload Supporting Documents"
                    files={uploads}
                    setFiles={setUploads}
                  />
                  <div className="uploaded__files__container">
                    {uploads.length > 0 ? (
                      uploads.map((upload, index) => {
                        const isPdf = upload.name
                          .toLowerCase()
                          .endsWith(".pdf");
                        return (
                          <div
                            key={upload.name}
                            className={`uploaded__file__item ${
                              isPdf
                                ? "uploaded__file__pdf"
                                : "uploaded__file__image"
                            }`}
                          >
                            <i
                              className={
                                isPdf
                                  ? "ri-file-pdf-2-line"
                                  : "ri-file-image-line"
                              }
                            ></i>
                            <span className="uploaded__file__name">
                              {upload.name}
                            </span>
                            <button
                              className="uploaded__file__remove"
                              onClick={() => {
                                const newUploads = uploads.filter(
                                  (_, i) => i !== index
                                );
                                setUploads(newUploads);
                              }}
                              title="Remove file"
                            >
                              <i className="ri-close-line"></i>
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="uploaded__files__empty">
                        <i className="ri-folder-open-line"></i>
                        <p>No files uploaded</p>
                        <span>
                          Upload supporting documents to attach to this document
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* End Uploads Section */}
            </div>
            {/* End Other Form Elements */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentGenerator;
