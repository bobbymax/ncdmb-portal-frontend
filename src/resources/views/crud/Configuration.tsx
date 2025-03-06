import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import TextInput from "../components/forms/TextInput";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { ActionMeta } from "react-select";
import { useStateContext } from "app/Context/ContentContext";
import CustomDataTable, {
  ColumnData,
} from "../components/tables/CustomDataTable";
import Button from "../components/forms/Button";
import { RESOURCE_MAPPINGS } from "resources/resourceIdentifier";
import { processExcelFile } from "app/Support/FileProcessor";
import Select from "../components/forms/Select";
import { repo } from "bootstrap/repositories";
import { toast } from "react-toastify";
// import { RESOURCE_MAPPINGS } from "resources/resourceIdentifier";

const Configuration = () => {
  const documentRepo = useMemo(() => repo("document"), []);
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<ColumnData[]>([]);
  const [selectedResource, setSelectedResource] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const resources: DataOptionsProps[] = [
    { value: "staff", label: "Staff" },
    { value: "budget_heads", label: "Budget Heads" },
    { value: "sub_budget_heads", label: "Sub Budget Heads" },
    { value: "expenditures", label: "Expenditures" },
    { value: "funds", label: "Funds" },
  ];
  const [resource, setResource] = useState<DataOptionsProps | null>(null);
  const { isLoading } = useStateContext();
  const handleString = (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
    const value = newValue as DataOptionsProps;
    setResource(value);
  };

  const handleFileSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const body = {
      resource: selectedResource,
      data,
    };

    try {
      setUploading(true);

      const response = await documentRepo.store(
        `configuration/imports/${resource}`,
        body
      );

      // console.log(response);

      if (response) {
        setUploading(false);
        setFile(null);
        setData([]);
        toast.success("Data uploaded successfully!!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Handle File Selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  // Process the Excel File
  const handleProcessFile = async () => {
    if (!file) {
      alert("Please select an Excel file.");
      return;
    }

    setLoading(true);

    try {
      const cleanedData = await processExcelFile(file);
      setData(cleanedData.rows); // Store cleaned data for preview
      setColumns(cleanedData.columns);
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Error processing file.");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (file) {
      handleProcessFile();
    }
  }, [file]);

  // console.log(data);

  return (
    <>
      <div
        className="custom-card"
        style={{ borderRadius: 4, overflow: "hidden", paddingTop: 30 }}
      >
        <form onSubmit={handleFileSubmit}>
          <div className="row">
            <div className="col-md-5">
              <TextInput
                label="Upload Excel File"
                name="file"
                onChange={handleFileChange}
                type="file"
                size="sm"
              />
            </div>
            <div className="col-md-5">
              <Select
                label="Resource"
                options={resources}
                value={selectedResource}
                onChange={(e) => setSelectedResource(e.target.value)}
                valueKey="value"
                labelKey="label"
                defaultValue=""
                defaultCheckDisabled
                size="sm"
              />
            </div>
            <div className="col-md-2 mt-3">
              <Button
                label="Import"
                icon="ri-import-line"
                type="submit"
                variant="dark"
                fullWidth
                isDisabled={!file || selectedResource === ""}
              />
            </div>
          </div>
        </form>
      </div>
      <div className="data__display__area mt-3">
        <CustomDataTable
          pageName="Excel Data"
          collection={data}
          columns={columns}
          manage={() => {}}
          buttons={[]}
          tag={""}
        />
      </div>
    </>
  );
};

export default Configuration;
