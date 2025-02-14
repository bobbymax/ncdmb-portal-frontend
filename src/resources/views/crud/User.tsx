import { FormPageComponentProps } from "bootstrap";
import { UserResponseData } from "app/Repositories/User/data";
import TextInput from "../components/forms/TextInput";
import { useCallback, useEffect, useState } from "react";
import MultiSelect, { DataOptionsProps } from "../components/forms/MultiSelect";
import { RoleResponseData } from "app/Repositories/Role/data";
import { DepartmentResponseData } from "app/Repositories/Department/data";
import { GradeLevelResponseData } from "app/Repositories/GradeLevel/data";
import { GroupResponseData } from "app/Repositories/Group/data";
import { formatOptions } from "app/Support/Helpers";
import { LocationResponseData } from "app/Repositories/Location/data";
import { ActionMeta } from "react-select";
import Select from "../components/forms/Select";
import { AuthPageResponseData } from "app/Repositories/Page/data";

interface DependencyProps {
  pages: AuthPageResponseData[];
  roles: RoleResponseData[];
  departments: DepartmentResponseData[];
  gradeLevels: GradeLevelResponseData[];
  groups: GroupResponseData[];
  locations: LocationResponseData[];
}

const User: React.FC<FormPageComponentProps<UserResponseData>> = ({
  state,
  setState,
  handleChange,
  dependencies,
  mode,
  loading,
  error,
}) => {
  const [roles, setRoles] = useState<DataOptionsProps[]>([]);
  const [departments, setDepartments] = useState<DataOptionsProps[]>([]);
  const [gradeLevels, setgradeLevels] = useState<DataOptionsProps[]>([]);
  const [locations, setLocations] = useState<DataOptionsProps[]>([]);
  const [groups, setGroups] = useState<DataOptionsProps[]>([]);
  const [pages, setPages] = useState<DataOptionsProps[]>([]);

  const [selectedOption, setSelectedOption] = useState<{
    role: DataOptionsProps | null;
    department: DataOptionsProps | null;
    grade_level: DataOptionsProps | null;
    location: DataOptionsProps | null;
    default_page: DataOptionsProps | null;
    groups: DataOptionsProps[];
  }>({
    role: null,
    department: null,
    grade_level: null,
    location: null,
    default_page: null,
    groups: [],
  });

  const genderOptions: DataOptionsProps[] = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ];

  const staffStatuses: DataOptionsProps[] = [
    { value: "available", label: "Available" },
    { value: "official-assignment", label: "Official Assignment" },
    { value: "training", label: "Training" },
    { value: "leave", label: "On Leave" },
    { value: "study", label: "Study Leave" },
    { value: "secondment", label: "On Secondment" },
    { value: "other", label: "Other" },
  ];

  const staffTypes: DataOptionsProps[] = [
    { value: "permanent", label: "Permanent" },
    { value: "contract", label: "Contract" },
    { value: "adhoc", label: "Adhoc" },
    { value: "secondment", label: "Secondment" },
    { value: "support", label: "Support" },
    { value: "admin", label: "Admin" },
  ];

  const handleSelectionChange =
    (
      key: "role" | "department" | "grade_level" | "location" | "default_page"
    ) =>
    (newValue: unknown) => {
      const updatedValue = newValue as DataOptionsProps;

      setSelectedOption((prev) => ({
        ...prev,
        [key]: updatedValue,
      }));

      if (setState) {
        setState((prev) => ({
          ...prev,
          [`${key}_id`]: updatedValue.value,
        }));
      }
    };

  const handleMultiSelectChange = useCallback(
    (key: "groups") => (newValue: unknown) => {
      const updatedValue = newValue as DataOptionsProps[];

      setSelectedOption((prev) => ({
        ...prev,
        [key]: updatedValue,
      }));

      if (setState) {
        setState((prev) => ({
          ...prev,
          groups: [...updatedValue, ...state.groups],
        }));
      }
    },
    [setState]
  );

  useEffect(() => {
    if (dependencies) {
      const {
        roles = [],
        groups = [],
        departments = [],
        gradeLevels = [],
        locations = [],
        pages = [],
      } = dependencies as DependencyProps;

      setRoles(formatOptions(roles, "id", "name"));
      setGroups(formatOptions(groups, "id", "name"));
      setDepartments(formatOptions(departments, "id", "abv"));
      setgradeLevels(formatOptions(gradeLevels, "id", "key"));
      setLocations(formatOptions(locations, "id", "name"));
      setPages(
        formatOptions(
          pages.filter((page) => page.type === "app"),
          "id",
          "name"
        )
      );
    }
  }, [dependencies]);

  useEffect(() => {
    if (
      mode === "update" &&
      gradeLevels.length > 0 &&
      departments.length > 0 &&
      roles.length > 0 &&
      locations.length > 0 &&
      pages.length > 0 &&
      state.default_page_id > 0
    ) {
      //
      setSelectedOption((prev) => ({
        ...prev,
        grade_level:
          gradeLevels.find((grade) => grade.value === state.grade_level_id) ??
          null,
        department:
          departments.find(
            (department) => department.value === state.department_id
          ) ?? null,
        role: roles.find((role) => role.value === state.role_id) ?? null,
        location:
          locations.find((location) => location.value === state.location_id) ??
          null,
        default_page:
          pages.find((page) => page.value === state.default_page_id) ?? null,
        groups: state.groups,
      }));
    }
  }, [
    mode,
    gradeLevels,
    departments,
    roles,
    locations,
    pages,
    state.default_page_id,
  ]);

  const renderMultiSelect = (
    label: string,
    options: DataOptionsProps[],
    value: DataOptionsProps | DataOptionsProps[] | null,
    onChange: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void,
    placeholder: string,
    grid: number = 3,
    isMulti: boolean = false
  ) => (
    <div className={`col-md-${grid} mb-3`}>
      <MultiSelect
        label={label}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isSearchable
        isDisabled={loading}
        isMulti={isMulti}
      />
    </div>
  );

  return (
    <>
      <div className="col-md-7 mb-3">
        <TextInput
          label="Surname"
          name="surname"
          value={state.surname}
          onChange={handleChange}
          placeholder="Enter Surname"
        />
      </div>
      <div className="col-md-5 mb-3">
        <TextInput
          label="Firstname"
          name="firstname"
          value={state.firstname}
          onChange={handleChange}
          placeholder="Enter Firstname"
        />
      </div>
      <div className="col-md-4 mb-3">
        <TextInput
          label="Middlename"
          name="middlename"
          value={state.middlename}
          onChange={handleChange}
          placeholder="Enter Middlename"
        />
      </div>
      <div className="col-md-5 mb-3">
        <TextInput
          label="Email Address"
          name="email"
          value={state.email}
          onChange={handleChange}
          placeholder="Enter Email Address"
        />
      </div>
      <div className="col-md-3 mb-3">
        <TextInput
          label="Staff ID"
          name="staff_no"
          value={state.staff_no}
          onChange={handleChange}
          placeholder="Enter Staff ID"
        />
      </div>
      {renderMultiSelect(
        "Grade Levels",
        gradeLevels,
        selectedOption.grade_level,
        handleSelectionChange("grade_level"),
        "Grade Level"
      )}
      {renderMultiSelect(
        "Departments",
        departments,
        selectedOption.department,
        handleSelectionChange("department"),
        "Department"
      )}
      {renderMultiSelect(
        "Roles",
        roles,
        selectedOption.role,
        handleSelectionChange("role"),
        "Role"
      )}
      {renderMultiSelect(
        "Board Locations",
        locations,
        selectedOption.location,
        handleSelectionChange("location"),
        "Location"
      )}
      <div className="col-md-4 mb-3">
        <Select
          label="Gender"
          name="gender"
          value={state.gender}
          onChange={handleChange}
          options={genderOptions}
          valueKey="value"
          labelKey="label"
          defaultValue=""
          defaultCheckDisabled
          isDisabled={loading}
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Staff Type"
          name="type"
          value={state.type}
          onChange={handleChange}
          options={staffTypes}
          valueKey="value"
          labelKey="label"
          defaultValue=""
          defaultCheckDisabled
          isDisabled={loading}
        />
      </div>
      <div className="col-md-4 mb-3">
        <Select
          label="Status"
          name="status"
          value={state.status}
          onChange={handleChange}
          options={staffStatuses}
          valueKey="value"
          labelKey="label"
          defaultValue=""
          defaultCheckDisabled
          isDisabled={loading}
        />
      </div>
      {renderMultiSelect(
        "Default Page",
        pages,
        selectedOption.default_page,
        handleSelectionChange("default_page"),
        "Page",
        4
      )}
      <div className="col-md-5 mb-3">
        <TextInput
          label="Job Title"
          name="job_title"
          value={state.job_title}
          onChange={handleChange}
          placeholder="Enter job title"
          isDisabled={loading}
        />
      </div>
      <div className="col-md-3 mb-3">
        <TextInput
          label="Date Joined Ncdmb"
          type="date"
          name="date_joined"
          value={state.date_joined}
          onChange={handleChange}
          isDisabled={loading}
        />
      </div>
      {renderMultiSelect(
        "Groups",
        groups,
        selectedOption.groups,
        handleMultiSelectChange("groups"),
        "Groups",
        12,
        true
      )}
    </>
  );
};

export default User;
