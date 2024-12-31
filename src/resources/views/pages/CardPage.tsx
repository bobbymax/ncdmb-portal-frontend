import { useResourceActions } from "app/Hooks/useResourceActions";
import { BaseRepository } from "app/Repositories/BaseRepository";
import { Raw } from "app/Support/DataTable";
import { PageProps } from "bootstrap";
import { useNavigate } from "react-router-dom";
import Button from "../components/forms/Button";

const CardPage = ({
  Repository,
  view,
  CardPageComponent,
}: PageProps<BaseRepository>) => {
  const navigate = useNavigate();
  const { collection } = useResourceActions(Repository, view, {});

  const url = view.pointer
    ? `${view.frontend_path}/${view.pointer}`
    : `${view.frontend_path}/create`;

  const onManage = (raw: Raw, label: string, url?: string) => {
    switch (label) {
      case "destroy":
        break;

      case "print":
        console.log("printing...");
        break;

      case "track":
        console.log("tracking...");
        break;

      case "payments":
        navigate(`${view.frontend_path}/${raw.id}/payments`);
        break;

      default:
        const path = url ? url : `${view.frontend_path}/${raw.id}/manage`;
        navigate(path);
        break;
    }
  };

  return (
    <div className="card-page-component">
      <div className="card-page-header flex align between mb-5">
        <h1>{view.title}</h1>
        {view.tag && (
          <Button
            label={view.tag}
            icon="ri-function-add-line"
            handleClick={() => navigate(url)}
            variant="success"
          />
        )}
      </div>
      <CardPageComponent
        collection={collection}
        Repository={Repository}
        onManageRawData={onManage}
        View={view}
      />
    </div>
  );
};

export default CardPage;
