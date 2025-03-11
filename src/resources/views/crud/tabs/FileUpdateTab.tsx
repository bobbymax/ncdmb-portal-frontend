import { DocumentResponseData } from "app/Repositories/Document/data";
import DocumentRepository from "app/Repositories/Document/DocumentRepository";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import avatar from "../../../assets/images/avatars/profile_picture.webp";
import Textarea from "resources/views/components/forms/Textarea";
import CardButton from "resources/views/components/forms/CardButton";
import { useStateContext } from "app/Context/ContentContext";
import { useNavigate } from "react-router-dom";
import { DocumentUpdateResponseData } from "app/Repositories/DocumentUpdate/data";
import moment from "moment";
import { useAuth } from "app/Context/AuthContext";
import { DocketDataType } from "app/Hooks/useWorkflowEngine";

const FileUpdateTab: React.FC<
  DocketDataType<DocumentResponseData, DocumentRepository>
> = ({ document, updateRaw, currentDraft, Repo }) => {
  const [responses, setResponses] = useState<{ [key: number]: string }>({});
  const { isLoading, setIsLoading } = useStateContext();
  const [disableThread, setDisableThread] = useState<boolean>(false);
  const navigate = useNavigate();
  const { staff } = useAuth();

  const responseDisabled = useCallback(() => {
    if (!currentDraft || !staff || !document) {
      setDisableThread(true);
      return;
    }

    const documentOwnerId = document.user_id;
    const operatorsIds = Array.isArray(document.updates)
      ? document.updates?.map((update) => update.user_id)
      : [];

    const threadsUserIds =
      document.updates?.flatMap((update) =>
        Array.isArray(update.threads)
          ? update.threads.map((thread) => thread.user_id)
          : []
      ) ?? [];

    let isDisabled = true; // Default to disabled

    if (currentDraft.type === "attention") {
      // If it's "attention" type, allow document owner to respond
      isDisabled = !(staff.id === documentOwnerId);
    } else if (currentDraft.type === "response") {
      // If it's "response" type, disable for document owner, allow for operators or thread users
      isDisabled =
        staff.id === documentOwnerId ||
        !(operatorsIds.includes(staff.id) || threadsUserIds.includes(staff.id));
    }

    setDisableThread(isDisabled);
  }, [currentDraft, staff, document]);

  // Handle textarea change for a specific update item
  const handleResponseChange = (idx: number, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [idx]: value, // Update only the response for the given idx
    }));
  };

  const handleResponse = useCallback(
    async (
      data: DocumentUpdateResponseData,
      draftId: number,
      updateId: number,
      message: string
    ) => {
      setIsLoading(true);
      try {
        const response = await Repo.update("documentUpdates", updateId, {
          message,
          document_draft_id: draftId,
          document_action_id: data.document_action_id,
        });

        if (response.code === 200) {
          setIsLoading(false);
          navigate("/desk/folders");
        }
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    },
    [Repo]
  );

  useEffect(() => {
    responseDisabled();
  }, []);

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="updates__section">
          {Array.isArray(document.updates) && document.updates ? (
            document.updates.map((data, idx) => (
              <div className="document__update__item" key={idx}>
                {/* Top Header */}
                <div className="custom__badge">
                  <div className="avatar">
                    <img src={avatar} alt="Avatar" />
                  </div>
                  <div className="custom__badge__profile">
                    <h4>{data.user?.name}</h4>
                    <small>
                      <span className="blob danger">
                        <i className="ri-shield-user-line" />
                        <span>{data.user?.role}</span>
                      </span>{" "}
                      |{" "}
                      <span className="blob success">
                        <i className="ri-building-line" />
                        <span>{data.user?.department}</span>
                      </span>
                    </small>
                  </div>
                </div>
                <div className="update__content__box">
                  <div className="user_comment document__owner">
                    <p>{data.comment}</p>
                    <div className="meta__data">
                      <small>{moment(data.created_at).format("ll")}</small>
                    </div>
                  </div>
                  <div className="threads__container">
                    {Array.isArray(data.threads) &&
                      data.threads.length > 0 &&
                      data.threads.map((thread, jx) => (
                        <div className="thread__item response_tag" key={jx}>
                          <p>{thread.response}</p>
                          <div className="meta__data flex align gap-md">
                            <small>{thread.staff}</small>
                            <small>
                              {moment(thread.responded_at).format("ll")}
                            </small>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="response__box mt-3">
                  <Textarea
                    placeholder={`${
                      disableThread ||
                      currentDraft?.id !== data.document_draft_id
                        ? "Waiting for Response!!!"
                        : "Enter Response"
                    }`}
                    value={responses[idx] || ""}
                    onChange={(e) => handleResponseChange(idx, e.target.value)}
                    rows={1}
                    name={`thread-${idx}`}
                    isDisabled={
                      disableThread ||
                      currentDraft?.id !== data.document_draft_id
                    }
                  />
                  <div className="bttn__section flex end">
                    <CardButton
                      icon="ri-chat-1-line"
                      label="Respond"
                      handleClick={() =>
                        handleResponse(
                          data,
                          data.document_draft_id,
                          data.id,
                          responses[idx]
                        )
                      }
                      isDisabled={!responses[idx]}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="document__update__item"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpdateTab;
