import { useNavigate } from "react-router-dom";
import CustomDataTable from "../components/tables/CustomDataTable";
import { useResourceActions } from "app/Hooks/useResourceActions";
import { Raw } from "app/Support/DataTable";
import { BaseRepository } from "app/Repositories/BaseRepository";
import { PageProps } from "bootstrap";

const IndexPage = ({
  Repository,
  view,
  RepositoryInstance,
  Component,
}: PageProps<BaseRepository>) => {
  const navigate = useNavigate();
  const { collection, columns, buttons } = useResourceActions(Repository, {
    url: view.server_url,
  });

  const onManage = (raw: Raw, label: string) => {
    // console.log(raw, label);

    switch (label) {
      case "destroy":
        break;

      case "payments":
        navigate(`${view.frontend_path}/${raw.id}/payments`);
        break;

      default:
        navigate(`${view.frontend_path}/${raw.id}/manage`);
        break;
    }
  };

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <CustomDataTable
            tag={view?.tag ?? ""}
            pageName={view.component}
            collection={collection}
            columns={columns}
            buttons={buttons}
            manage={onManage}
            addData={() => navigate(`${view.frontend_path}/create`)}
          />
        </div>
      </div>
    </>
  );
};

export default IndexPage;
