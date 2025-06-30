import {
  DocumentOwnerData,
  DocumentResponseData,
} from "app/Repositories/Document/data";
import { except, formatCurrency } from "app/Support/Helpers";
import Button from "../forms/Button";
import moment from "moment";
import { extractModelName, toTitleCase } from "bootstrap/repositories";
import { useEffect, useState } from "react";
import { AuthorisingOfficerProps } from "app/Repositories/DocumentDraft/data";
import CircularProgressBar from "./CircularProgressBar";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";

interface FileCardProps {
  loader: boolean;
  document: DocumentResponseData;
  openFolder: (document: DocumentResponseData) => void;
}

const FolderComponent = ({ loader, document, openFolder }: FileCardProps) => {
  const [officers, setOfficers] = useState<AuthorisingOfficerProps[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [currentTracker, setCurrentTracker] =
    useState<ProgressTrackerResponseData>({} as ProgressTrackerResponseData);

  // console.log(document);

  useEffect(() => {
    if (document && document.drafts && document.drafts.length > 0) {
      const approvalsMap = new Map<string | number, AuthorisingOfficerProps>();
      const drafts = document.drafts;
      const workflow = document.workflow;

      if (!workflow) return;

      const currentTracker = workflow.trackers.find(
        (tracker) => tracker.id === document.progress_tracker_id
      );

      setCurrentTracker(currentTracker as ProgressTrackerResponseData);

      drafts.forEach((draft) => {
        const { history = [] } = draft;

        const latestAmount =
          history.length > 0
            ? history.reduce((max, item) =>
                (item?.version_number ?? 0) > (max?.version_number ?? 0)
                  ? item
                  : max
              ).amount
            : document.amount; // or 0 or undefined

        setAmount(formatCurrency(Number(latestAmount)));

        history.forEach((action) => {
          const staffId = action.authorising_officer?.id;
          const staff = action.authorising_officer;

          if (staffId && staff && !approvalsMap.has(staffId)) {
            approvalsMap.set(
              staffId,
              action?.authorising_officer as AuthorisingOfficerProps
            );
          }
        });
      });

      setOfficers(Array.from(approvalsMap.values()));
    }
  }, [document]);

  return (
    <div className="resource__card">
      <div className="mb-3">
        <div
          style={{
            backgroundColor: color,
          }}
          className="doc__details folder_card__padding"
        >
          <h2>{except(document.title, 35)}</h2>
          <small className="bready">
            Published: {moment(document.created_at).format("LL")}
          </small>
          <small>{document.ref}</small>
        </div>
        <div className="details_mid__section flex align gap-md between">
          <div
            className="left__mid__section"
            style={{
              width: "65%",
            }}
          >
            <div className="file__category">
              <small
                style={{
                  backgroundColor: color,
                }}
                className="category_name"
              >
                {toTitleCase(
                  extractModelName(document.documentable_type ?? "")
                )}
              </small>
            </div>
            <small
              style={{
                padding: "0 25px",
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: 2,
                fontWeight: 600,
                color: color,
              }}
            >
              Reviewers:
            </small>
            <div className="avatar-group">
              {officers.slice(0, 4).map((officer) => {
                const namePaths = officer.name.trim().split(" ");

                const initials =
                  (namePaths[0]?.[0] ?? "") + (namePaths[1]?.[0] ?? "");

                return officer.avatar ? (
                  <img
                    src="https://placehold.co/40x40"
                    alt="User 1"
                    className="custom__avatar"
                  />
                ) : (
                  <div
                    key={officer.id}
                    className="custom__avatar placeholder-avatar"
                    title={officer.name}
                    style={{
                      backgroundColor: color,
                    }}
                  >
                    {initials.toUpperCase()}
                  </div>
                );
              })}

              {/* <span className="more-avatars">+3</span> */}
            </div>
          </div>
          <div
            className="document__progress__bar"
            style={{
              width: "35%",
            }}
          >
            <CircularProgressBar
              min={1}
              max={currentTracker.order}
              currentValue={officers.length}
              callback={(response: string) => setColor(response)}
            />
          </div>
        </div>

        <div className="footer__mid__section">
          <Button
            label="Open File"
            icon="ri-file-paper-line"
            handleClick={() => openFolder(document)}
            variant="success"
            size="xs"
            style={{
              backgroundColor: color,
            }}
            rounded
          />
        </div>
      </div>
    </div>
  );
};

export default FolderComponent;
