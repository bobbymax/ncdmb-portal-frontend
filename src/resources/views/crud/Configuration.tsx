import React, { FormEvent, useEffect, useState } from "react";
import TextInput from "../components/forms/TextInput";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { ActionMeta } from "react-select";
import { useStateContext } from "app/Context/ContentContext";
import CustomDataTable, {
  ColumnData,
} from "../components/tables/CustomDataTable";
import Button from "../components/forms/Button";
import { processExcelFile } from "app/Support/FileProcessor";
import Select from "../components/forms/Select";
import { toast } from "react-toastify";
import { CardPageComponentProps } from "bootstrap";
import { ImportResponseData } from "app/Repositories/Import/data";
import ImportRepository from "app/Repositories/Import/ImportRepository";

const Configuration: React.FC<
  CardPageComponentProps<ImportResponseData, ImportRepository>
> = ({ Repository, collection }) => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<ColumnData[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resource, setResource] = useState<DataOptionsProps | null>(null);
  const { isLoading } = useStateContext();
  const handleString = (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
    const value = newValue as DataOptionsProps;
    setResource(value);
  };

  const handleFileSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const body = {
      data,
    };

    try {
      setUploading(true);

      const response = await Repository.store(
        `configuration/imports/${resource?.value}`,
        body
      );

      if (response) {
        setUploading(false);
        setFile(null);
        setData([]);
        toast.success("Data uploaded successfully!!");
      }
    } catch (error) {
      // Error in configuration
    }
  };

  // Handle File Selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const reformatCollection = (collection: unknown[]) => {
    const rows = collection as string[];
    if (collection.length === 0) return [];

    const formattedCollection: DataOptionsProps[] = [];

    rows.forEach((item) => {
      formattedCollection.push({
        value: item,
        label: item
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
      });
    });
    return formattedCollection;
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

  return (
    <>
      <div className="row">
        <div className="col-md-4">
          <div
            className="custom-card file__card"
            style={{ overflow: "hidden", padding: 25 }}
          >
            <form onSubmit={handleFileSubmit}>
              <div className="row">
                <div className="col-md-12 mb-2">
                  <TextInput
                    label="Upload Excel File"
                    name="file"
                    onChange={handleFileChange}
                    type="file"
                    size="sm"
                  />
                </div>
                <div className="col-md-12 mb-2">
                  <MultiSelect
                    label="Resource"
                    options={reformatCollection(collection as unknown[])}
                    value={resource}
                    onChange={handleString}
                    placeholder="Resource"
                    isSearchable
                    isDisabled={loading}
                  />
                </div>
                <div className="col-md-12">
                  <Button
                    label="Import"
                    icon="ri-import-line"
                    type="submit"
                    variant="dark"
                    isDisabled={!file || !resource}
                    size="sm"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
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
