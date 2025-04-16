import { useNavigate } from "react-router-dom";
import CustomDataTable from "../components/tables/CustomDataTable";
import { useResourceActions } from "app/Hooks/useResourceActions";
import { Raw } from "app/Support/DataTable";
import { BaseRepository } from "app/Repositories/BaseRepository";
import { PageProps } from "bootstrap";
import { useModal } from "app/Context/ModalContext";
import FundModal from "../crud/modals/FundModal";
import { SubBudgetHeadResponseData } from "app/Repositories/SubBudgetHead/data";
import { repo } from "bootstrap/repositories";
import { useMemo } from "react";
import { toast } from "react-toastify";
import Alert from "app/Support/Alert";
import Cookies from "js-cookie";

const IndexPage = ({
  Repository,
  view,
  Component,
}: PageProps<BaseRepository>) => {
  const navigate = useNavigate();
  const fundRepo = useMemo(() => repo("fund"), []);
  const { openModal, closeModal } = useModal();
  const { collection, columns, buttons } = useResourceActions(
    Repository,
    view,
    {}
  );

  const onSubmit = (
    response: string | object,
    mode: "store" | "update" | "destroy" | "generate"
  ) => {
    toast.success("Funds Added to Budget Head");
    closeModal();
  };

  const handleModal = (raw: SubBudgetHeadResponseData) => {
    if (!raw.has_fund) {
      openModal(
        FundModal,
        "fund",
        {
          title: "Create Fund",
          isUpdating: false,
          onSubmit,
          data: raw,
        },
        fundRepo.getState()
      );
    } else {
      Alert.error(
        "Not Allowed!!",
        "This Budget Head has already been funded!!"
      );
    }
  };

  const onManage = (raw: Raw, label: string) => {
    switch (label) {
      case "destroy":
        break;

      case "block":
        handleModal(raw as SubBudgetHeadResponseData);
        break;

      case "payments":
        navigate(`${view.frontend_path}/${raw.id}/payments`);
        break;

      case "builder":
        navigate(`${view.frontend_path}/${raw.id}/builder`);
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
