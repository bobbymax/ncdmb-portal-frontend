import { usePaperBoard } from "app/Context/PaperBoardContext";
import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import React, { useEffect, useState, Suspense, lazy, useCallback } from "react";
import { ProgressTrackerResponseData } from "@/app/Repositories/ProgressTracker/data";
import { GroupResponseData } from "@/app/Repositories/Group/data";
import { DocumentDraftResponseData } from "@/app/Repositories/DocumentDraft/data";
import Button from "../forms/Button";
import PaymentRepository from "app/Repositories/Payment/PaymentRepository";
import Alert from "app/Support/Alert";
import { DocumentResponseData } from "@/app/Repositories/Document/data";
import { toast } from "react-toastify";
import { useStateContext } from "app/Context/ContentContext";
import { useNavigate } from "react-router-dom";
import { DocumentActionResponseData } from "@/app/Repositories/DocumentAction/data";
import { BaseResponse } from "@/app/Repositories/BaseRepository";
import { ProcessCardResponseData } from "@/app/Repositories/ProcessCard/data";
import { useResourceContext } from "app/Context/ResourceContext";

export interface ProcessGeneratorCardProps {
  processCard: ProcessCardResponseData;
  currentProcess: ProgressTrackerResponseData;
  existingDocument: DocumentResponseData | null;
  resource: BaseResponse | null;
  userCanHandle: boolean;
  currentDraft: DocumentDraftResponseData | null;
  userHasPermission: boolean;
  allowedActions: DocumentActionResponseData[];
  resolve: (
    actionId: number,
    documentId: number,
    data: unknown,
    mode: "store" | "update" | "destroy"
  ) => void;
}

interface ProcessGeneratorTabProps {
  category: DocumentCategoryResponseData | null;
}

// Dynamic component loader for ProcessCards
const loadProcessCardComponent = (componentName: string) => {
  return lazy(() =>
    import(`../ProcessCards/${componentName}`).catch((error) => {
      console.error(
        `Failed to load ProcessCard component: ${componentName}`,
        error
      );
      // Return a fallback component
      return {
        default: () => (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "200px",
              background:
                "linear-gradient(135deg, #fef2f2 0%, #fee2e2 50%, #fecaca 100%)",
              border: "1px solid #fca5a5",
              borderRadius: "12px",
              padding: "24px",
              margin: "16px 0",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                color: "#dc2626",
                marginBottom: "16px",
                animation: "pulse 2s infinite",
                filter: "drop-shadow(0 2px 4px rgba(220, 38, 38, 0.3))",
              }}
            >
              <i className="ri-error-warning-line"></i>
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#b91c1c",
                textAlign: "center",
                lineHeight: "1.5",
                textShadow: "0 1px 2px rgba(185, 28, 28, 0.2)",
              }}
            >
              Component Not Found
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#991b1b",
                textAlign: "center",
                marginTop: "8px",
                opacity: "0.7",
              }}
            >
              ProcessCard component &quot;{componentName}&quot; not found
            </div>
          </div>
        ),
      };
    })
  );
};

const ProcessGeneratorTab: React.FC<ProcessGeneratorTabProps> = ({
  category,
}) => {
  const { state, actions } = usePaperBoard();
  const paymentRepo = new PaymentRepository();
  const { config } = useStateContext();
  const { getResource } = useResourceContext();
  const navigate = useNavigate();

  const [currentProcess, setCurrentProcess] =
    useState<ProgressTrackerResponseData | null>(null);

  const [ProcessCardComponent, setProcessCardComponent] =
    useState<React.LazyExoticComponent<React.ComponentType<any>> | null>(null);

  const resolve = useCallback(
    async (
      actionId: number,
      documentId: number,
      data: unknown,
      mode: "store" | "update" | "destroy"
    ) => {
      if (!currentProcess) return;

      const processCard = currentProcess.process_card;

      if (!processCard) return;

      const body = {
        service: processCard.service,
        method: "documentProcessor",
        mode,
        data,
        document_id: documentId,
        document_draft_id:
          state.existingDocument?.drafts?.find(
            (draft) => draft.progress_tracker_id === currentProcess.id
          )?.id || 0,
        document_action_id: actionId,
        progress_tracker_id: currentProcess.id,
      };

      try {
        const response = await paymentRepo.store("document/processor", body);

        if (response.code === 200 || response.code === 201) {
          toast.success(response.message);
          navigate(`/desk/folders`);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.error("Error: ", error);
      }
    },
    [currentProcess]
  );

  // Check if user has permission based on their groups
  const can = (groups?: GroupResponseData[]): boolean => {
    if (!groups || !currentProcess?.group_id) return false;

    return groups.some((group) => group.id === currentProcess.group_id);
  };

  // Find the draft for the current process
  const processDraft = (
    drafts?: DocumentDraftResponseData[]
  ): DocumentDraftResponseData | null => {
    if (!drafts || !currentProcess) return null;

    const draft = drafts.find(
      (draft) =>
        draft.progress_tracker_id === currentProcess.id &&
        draft.current_workflow_stage_id === currentProcess.workflow_stage_id &&
        draft.group_id === currentProcess.group_id
    );

    return draft || null;
  };

  const canHandle = (
    currentDraft: DocumentDraftResponseData | null
  ): boolean => {
    // First check if user has group permission
    if (!can(state.loggedInUser?.groups)) {
      return false;
    }

    // If no draft exists, cannot handle
    if (!currentDraft) {
      return false;
    }

    // If operator is not assigned (null), user can handle
    if (!currentDraft.operator_id) {
      return true;
    }

    // If operator is assigned to someone else, user cannot handle
    if (currentDraft.operator_id !== state.loggedInUser?.id) {
      return false;
    }

    // If operator is assigned to this user, they can handle
    return true;
  };

  // Get unique user IDs from trackers
  const getTrackerUserIds = (): number[] => {
    if (!state.trackers || state.trackers.length === 0) return [];

    return Array.from(
      new Set([
        ...state.trackers
          .map((tracker) => tracker.user_id)
          .filter((id) => id && id > 0),
        state.existingDocument?.user_id ?? 0,
        state.existingDocument?.created_by ?? 0,
      ])
    );
  };

  const userHasPermission = can(state.loggedInUser?.groups);
  const currentDraft = processDraft(state.existingDocument?.drafts);
  const userCanHandle = canHandle(currentDraft);
  const allowedActions = currentProcess?.actions;

  const handleProcess = () => {
    const recipients = getTrackerUserIds();
    const body = {
      pointer_identifier: state.existingDocument?.pointer,
      document_draft_id: currentDraft?.id,
      progress_tracker_id: currentProcess?.id,
      document_id: state.existingDocument?.id,
      priority: "high",
      action: "handle",
      recipients,
    };

    Alert.flash(
      "Handle Process",
      "info",
      "Are you sure you want to handle this process?"
    ).then(async (res) => {
      if (res.isConfirmed) {
        const response = await paymentRepo.store(
          "process/handle/request",
          body
        );

        if (response.code === 200 || response.code === 201) {
          const documentId = state.existingDocument?.id;
          if (documentId) {
            const updatedDocument = await paymentRepo.show(
              "documents",
              documentId
            );

            if (updatedDocument.data) {
              // Update the existing document in context
              actions.setExistingDocument(
                updatedDocument.data as DocumentResponseData
              );

              toast.success(response.message);
            }
          }
        } else {
          toast.error(response.message);
        }
      }
    });
  };

  // Update current process when document changes
  useEffect(() => {
    if (
      state.existingDocument &&
      state.existingDocument?.processes &&
      state.existingDocument?.processes.length > 0 &&
      state.existingDocument?.progress_tracker_id > 0
    ) {
      const process = state.existingDocument?.processes.find(
        (process) => process.id === state.existingDocument?.progress_tracker_id
      );

      if (process) {
        setCurrentProcess(process);
      }
    } else {
      setCurrentProcess(null);
      setProcessCardComponent(null);
    }
  }, [state.existingDocument]);

  // Dynamically load ProcessCard component when currentProcess changes
  useEffect(() => {
    if (currentProcess?.process_card?.component) {
      const componentName = currentProcess.process_card.component;
      //   console.log("Loading ProcessCard component:", componentName);

      const Component = loadProcessCardComponent(componentName);
      setProcessCardComponent(Component);
    } else {
      setProcessCardComponent(null);
    }
  }, [currentProcess]);

  return (
    <div className="process-generator-tab">
      {!userHasPermission ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "200px",
            background:
              "linear-gradient(135deg, #fef2f2 0%, #fee2e2 50%, #fecaca 100%)",
            border: "1px solid #fca5a5",
            borderRadius: "12px",
            padding: "24px",
            margin: "16px 0",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              color: "#ef4444",
              marginBottom: "16px",
              animation: "pulse 2s infinite",
              filter: "drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3))",
            }}
          >
            <i className="ri-shield-cross-line"></i>
          </div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#dc2626",
              textAlign: "center",
              lineHeight: "1.5",
              textShadow: "0 1px 2px rgba(220, 38, 38, 0.2)",
            }}
          >
            Access Denied
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#b91c1c",
              textAlign: "center",
              marginTop: "8px",
              opacity: "0.7",
            }}
          >
            You do not have permission to handle this process
          </div>
        </div>
      ) : userCanHandle && (currentDraft?.operator_id ?? 0) < 1 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "200px",
            background:
              "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)",
            border: "1px solid #7dd3fc",
            borderRadius: "12px",
            padding: "24px",
            margin: "16px 0",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              color: "#0284c7",
              marginBottom: "16px",
              animation: "pulse 2s infinite",
              filter: "drop-shadow(0 2px 4px rgba(2, 132, 199, 0.3))",
            }}
          >
            <i className="ri-hand-coin-line"></i>
          </div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#0369a1",
              textAlign: "center",
              lineHeight: "1.5",
              textShadow: "0 1px 2px rgba(3, 105, 161, 0.2)",
              marginBottom: "8px",
            }}
          >
            Ready to Handle
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#075985",
              textAlign: "center",
              marginBottom: "24px",
              opacity: "0.7",
            }}
          >
            Do you want to handle this process?
          </div>
          <Button
            type="button"
            variant="dark"
            handleClick={() => {
              handleProcess();
            }}
            label="Handle Process"
            icon="ri-arrow-right-line"
          />
        </div>
      ) : userCanHandle &&
        (currentDraft?.operator_id ?? 0) === state.loggedInUser?.id ? (
        <div className="process-card-container">
          {currentProcess?.process_card ? (
            <div className="process-card-wrapper">
              {/* Dynamic ProcessCard Component */}
              {ProcessCardComponent ? (
                <Suspense
                  fallback={
                    <div className="text-center py-4">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">
                          Loading ProcessCard...
                        </span>
                      </div>
                      <p className="mt-2 text-muted">
                        Loading {currentProcess.process_card.component}...
                      </p>
                    </div>
                  }
                >
                  <ProcessCardComponent
                    processCard={currentProcess.process_card}
                    currentProcess={currentProcess}
                    existingDocument={state.existingDocument}
                    resource={state.existingDocument?.documentable}
                    userCanHandle={userCanHandle}
                    currentDraft={currentDraft}
                    userHasPermission={userHasPermission}
                    allowedActions={allowedActions}
                    resolve={resolve}
                  />
                </Suspense>
              ) : (
                <div className="alert alert-info">
                  <i className="ri-information-line"></i> No component specified
                  for this ProcessCard.
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "200px",
                background:
                  "linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #fef08a 100%)",
                border: "1px solid #fde047",
                borderRadius: "12px",
                padding: "24px",
                margin: "16px 0",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div
                style={{
                  fontSize: "48px",
                  color: "#ca8a04",
                  marginBottom: "16px",
                  animation: "pulse 2s infinite",
                  filter: "drop-shadow(0 2px 4px rgba(202, 138, 4, 0.3))",
                }}
              >
                <i className="ri-information-line"></i>
              </div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#a16207",
                  textAlign: "center",
                  lineHeight: "1.5",
                  textShadow: "0 1px 2px rgba(161, 98, 7, 0.2)",
                }}
              >
                No ProcessCard Available
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#854d0e",
                  textAlign: "center",
                  marginTop: "8px",
                  opacity: "0.7",
                }}
              >
                No ProcessCard attached to the current stage
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "200px",
            background:
              "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)",
            border: "1px solid #94a3b8",
            borderRadius: "12px",
            padding: "24px",
            margin: "16px 0",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              color: "#64748b",
              marginBottom: "16px",
              animation: "pulse 2s infinite",
              filter: "drop-shadow(0 2px 4px rgba(100, 116, 139, 0.3))",
            }}
          >
            <i className="ri-user-settings-line"></i>
          </div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#475569",
              textAlign: "center",
              lineHeight: "1.5",
              textShadow: "0 1px 2px rgba(71, 85, 105, 0.2)",
            }}
          >
            Process In Use
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#334155",
              textAlign: "center",
              marginTop: "8px",
              opacity: "0.7",
            }}
          >
            Someone else is handling this already
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessGeneratorTab;
