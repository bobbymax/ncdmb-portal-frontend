import { useNavigate } from "react-router-dom";
import CustomDataTable from "../components/tables/CustomDataTable";
import { useResourceActions } from "app/Hooks/useResourceActions";
import { Raw } from "app/Support/DataTable";
import { BaseRepository } from "app/Repositories/BaseRepository";
import { PageProps } from "bootstrap";

const IndexPage = ({
  Repository,
  view,
  Component,
}: PageProps<BaseRepository>) => {
  const navigate = useNavigate();
  const { collection, columns, buttons } = useResourceActions(
    Repository,
    view,
    {}
  );

  // console.log(collection);

  const onManage = (raw: Raw, label: string) => {
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
    <div className="col-md-12 mb-5">
      <CustomDataTable
        tag={view?.tag ?? ""}
        pageName={view.title}
        collection={collection}
        columns={columns}
        buttons={buttons}
        manage={onManage}
        addData={() => navigate(`${view.frontend_path}/create`)}
      />
    </div>
  );
};

export default IndexPage;
