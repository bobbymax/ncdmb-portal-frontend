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
  const { collection, pagination, loadMore, loadingMore, refresh } =
    useResourceActions(Repository, view, {});

  const url = view.pointer
    ? `${view.frontend_path}/${view.pointer}`
    : `${view.frontend_path}/create`;

  const onManage = (raw: Raw, label: string, url?: string) => {
    if (url && url !== "") {
      navigate(url);
    } else {
      switch (label) {
        default:
          navigate(`${view.frontend_path}/${raw.id}/manage`);
          break;
      }
    }
  };

  // Debug logging removed for production

  return (
    <div className="card-page-component">
      <div className="card-page-header flex align between mb-5">
        <h1>{view.title}</h1>
        {view.tag && (
          <Button
            label={view.tag}
            icon="ri-function-add-line"
            handleClick={() => navigate(`${view.frontend_path}/create`)}
            variant="success"
            size="sm"
          />
        )}
      </div>
      <CardPageComponent
        collection={collection}
        Repository={Repository}
        onManageRawData={onManage}
        View={view}
        pagination={pagination}
        loadMore={loadMore}
        loadingMore={loadingMore}
        refresh={refresh}
      />
    </div>
  );
};

export default CardPage;
