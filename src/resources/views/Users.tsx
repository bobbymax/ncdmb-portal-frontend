import { Raw } from "../../app/Support/DataTable";
import CustomDataTable, {
  ButtonsProp,
  ColumnData,
} from "./components/tables/CustomDataTable";

const Users = () => {
  const columns: ColumnData[] = [
    { label: "Name", accessor: "name", type: "text" },
    { label: "Age", accessor: "age", type: "text" },
    { label: "State", accessor: "state", type: "text" },
    { label: "Staff ID", accessor: "staff_id", type: "text" },
  ];

  const collections = [
    { name: "Bobby Ekaro", age: 36, state: "Rivers", staff_id: "18290" },
    { name: "Olawale Oshikoya", age: 44, state: "Osun", staff_id: "22304" },
    { name: "Jerry Atabong", age: 49, state: "Bayelsa", staff_id: "11041" },
    { name: "Oluwafemi Ajayi", age: 39, state: "Ogun", staff_id: "11064" },
  ];

  const bttns: ButtonsProp[] = [
    {
      label: "manage",
      icon: "ri-pencil-fill",
      variant: "dark",
      conditions: [],
      operator: "and",
      display: "manage",
    },
    {
      label: "destroy",
      icon: "ri-delete-bin-fill",
      variant: "danger",
      conditions: [],
      operator: "and",
      display: "destroy",
    },
  ];

  const onManage = (raw: Raw, label: string) => {
    console.log(raw, label);
  };

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <CustomDataTable
            collection={collections}
            columns={columns}
            buttons={bttns}
            manage={onManage}
          />
        </div>
      </div>
    </>
  );
};

export default Users;
