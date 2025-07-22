import { ProjectResponseData } from "@/app/Repositories/Project/data";
import Button from "../forms/Button";
import moment from "moment";
import projectIcon from "../../../assets/images/projects.png";

const projectStatuses = {
  pending: "#e67e22",
  registered: "#2980b9",
  approved: "#27ae60",
  denied: "#c0392b",
  kiv: "#8e44ad",
  discussed: "#2c3e50",
};

const ProjectCard = ({
  data,
  handleAction,
}: {
  data: ProjectResponseData;
  handleAction: (projectId: number, action: "manage" | "memo" | "tb") => void;
}) => {
  const {
    id,
    title,
    proposed_start_date,
    proposed_end_date,
    description,
    status,
  } = data;

  return (
    <article className="project_card_item">
      <header className="flex align between mb-4">
        <div className="title__section__project flex start gap-md align">
          <img src={projectIcon} alt="Icon for Projects" />
          <h3>{title}</h3>
        </div>
        <div
          className="status__div"
          style={{
            backgroundColor: projectStatuses[status],
            padding: "2px 9px",
            borderRadius: 2,
            color: "white",
          }}
        >
          <small
            style={{
              fontSize: 8,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              display: "block",
            }}
          >
            {status}
          </small>
        </div>
      </header>

      <div className="mid__section__article flex align between gap-md">
        <div className="event__item flex column start gap-sm">
          <small>Start Date:</small>
          <span>{moment(proposed_start_date).format("ll")}</span>
        </div>
        <div className="event__item flex column start gap-sm">
          <small>End Date:</small>
          <span>{moment(proposed_end_date).format("ll")}</span>
        </div>
        <div className="event__item flex column start gap-sm">
          <small>Progress</small>
          <p>Progress bar here!!</p>
        </div>
      </div>

      <div
        className="bottom__mid__section mb-4"
        style={{
          padding: "16px 0",
          fontSize: 12,
          textAlign: "justify",
        }}
      >
        <p>{description}</p>
      </div>

      <div className="footer__article flex align gap-md">
        <Button
          label="Manage"
          variant="dark"
          size="xs"
          handleClick={() => handleAction(id, "manage")}
          icon="ri-settings-3-line"
        />
        <Button
          label="Perpare Memo"
          variant="info"
          size="xs"
          handleClick={() => handleAction(id, "memo")}
          icon="ri-article-line"
        />
        <Button
          label="Generate TB Memo"
          variant="danger"
          size="xs"
          handleClick={() => handleAction(id, "tb")}
          icon="ri-ai-generate"
        />
      </div>
    </article>
  );
};

export default ProjectCard;
