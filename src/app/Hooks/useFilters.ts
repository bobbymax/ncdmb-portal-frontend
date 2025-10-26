import { useEffect, useState, useMemo, useCallback } from "react";
import { DocumentResponseData } from "app/Repositories/Document/data";
import {
  extractModelName,
  toServiceName,
  toTitleCase,
} from "bootstrap/repositories";
import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { useStateContext } from "app/Context/ContentContext";
import { useDebounce } from "./useDebounce";

const useFilters = (iterables: DocumentResponseData[]) => {
  const [collection, setCollection] = useState<DocumentResponseData[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");

  // Debounce search value to prevent filtering on every keystroke
  const debouncedSearchValue = useDebounce(searchValue, 300);

  const [amountFilter, setAmountFilter] = useState<[number, number]>([0, 0]);
  const [currentAmount, setCurrentAmount] = useState<number>(0);

  const [dateFilter, setDateFilter] = useState<[Date, Date]>([
    new Date(),
    new Date(),
  ]);
  const [currentDate, setCurrentDate] = useState<number>(0);

  const [categories, setCategories] = useState<DataOptionsProps[]>([]);
  const [actions, setActions] = useState<DataOptionsProps[]>([]);
  const [action, setAction] = useState<DataOptionsProps | null>(null);
  const [category, setCategory] = useState<string>("default");

  const [owners, setOwners] = useState<DataOptionsProps[]>([]);
  const [documentOwner, setDocumentOwner] = useState<DataOptionsProps | null>(
    null
  );

  const [departments, setDepartments] = useState<DataOptionsProps[]>([]);
  const [department, setDepartment] = useState<DataOptionsProps | null>(null);

  const { isLoading } = useStateContext();

  const handleDocumentOwnersChange = (newValue: unknown) => {
    setDocumentOwner(newValue as DataOptionsProps);
  };

  const handleDeptsChange = (newValue: unknown) => {
    setDepartment(newValue as DataOptionsProps);
  };

  const handleActionsChange = (newValue: unknown) => {
    setAction(newValue as DataOptionsProps);
  };

  const resetFilters = () => {
    setCategory("default");
    setDocumentOwner({ value: 0, label: "All Staff" });
    setDepartment({ value: 0, label: "All Departments" });
    setAction({ value: 0, label: "All Actions" });
    setCurrentAmount(amountFilter[1]);
    setCurrentDate(dateFilter[0].getTime());
    setSearchValue("");
  };

  // Initial extraction of filter values
  useEffect(() => {
    const typeMap = new Map<string, DataOptionsProps>();
    const ownerMap = new Map<string | number, DataOptionsProps>();
    const departmentMap = new Map<string | number, DataOptionsProps>();
    const actionMap = new Map<string | number, DataOptionsProps>();

    const validDates: Date[] = [];
    const amounts: number[] = [];

    iterables.forEach((doc) => {
      const modelName = extractModelName(doc.documentable_type);
      const key = toServiceName(modelName);

      if (!typeMap.has(key)) {
        typeMap.set(key, {
          value: key,
          label: toTitleCase(modelName),
        });
      }

      const ownerId = doc.owner?.id;
      const ownerName = doc.owner?.name;
      if (ownerId && ownerName && !ownerMap.has(ownerId)) {
        ownerMap.set(ownerId, {
          value: ownerId,
          label: ownerName,
        });
      }

      const deptId = doc.department_id;
      const deptName = doc.dept;
      if (deptId && deptName && !departmentMap.has(deptId)) {
        departmentMap.set(deptId, {
          value: deptId,
          label: deptName,
        });
      }

      const actionId = doc.action?.id;
      const actionName = toTitleCase(doc.action?.draft_status ?? "");
      if (actionId && actionName && !actionMap.has(actionId)) {
        actionMap.set(actionId, {
          value: actionId,
          label: actionName,
        });
      }

      amounts.push(doc.approved_amount ?? 0);

      const created = new Date(doc.created_at ?? "");
      if (!isNaN(created.getTime())) {
        validDates.push(created);
      }
    });

    const amountRange: [number, number] =
      amounts.length > 0
        ? [Math.min(...amounts), Math.max(...amounts)]
        : [0, 0];

    const dateRange: [Date, Date] =
      validDates.length > 0
        ? [
            new Date(Math.min(...validDates.map((d) => d.getTime()))),
            new Date(Math.max(...validDates.map((d) => d.getTime()))),
          ]
        : [new Date(), new Date()];

    setCategories(Array.from(typeMap.values()));
    setOwners([
      { value: 0, label: "All Staff" },
      ...Array.from(ownerMap.values()),
    ]);
    setDepartments([
      { value: 0, label: "All Departments" },
      ...Array.from(departmentMap.values()),
    ]);
    setActions([
      { value: 0, label: "All Actions" },
      ...Array.from(actionMap.values()),
    ]);

    setAmountFilter(amountRange);
    setDateFilter(dateRange);
    setCurrentAmount(amountRange[1]);
    setCurrentDate(dateRange[0].getTime());

    setDocumentOwner({ value: 0, label: "All Staff" });
    setDepartment({ value: 0, label: "All Departments" });
    setAction({ value: 0, label: "All Actions" });
  }, [iterables]);

  // Optimized filtering with useMemo - runs only when dependencies change
  // Combines all filters in a single pass instead of 7 separate filter operations
  const filteredCollection = useMemo(() => {
    const searchLower = debouncedSearchValue.trim().toLowerCase();

    return iterables.filter((doc) => {
      // CATEGORY filter
      if (category && category !== "default") {
        if (
          toServiceName(extractModelName(doc.documentable_type)) !== category
        ) {
          return false;
        }
      }

      // OWNER filter
      if (documentOwner && documentOwner.value !== 0) {
        if (doc.owner?.id !== documentOwner.value) {
          return false;
        }
      }

      // DEPARTMENT filter
      if (department && department.value !== 0) {
        if (doc.department_id !== department.value) {
          return false;
        }
      }

      // ACTION filter
      if (action && action.value !== 0) {
        if (doc.action?.id !== action.value) {
          return false;
        }
      }

      // AMOUNT RANGE filter
      const amount = doc.approved_amount ?? 0;
      if (amount > currentAmount) {
        return false;
      }

      // DATE filter
      const created = new Date(doc.created_at ?? "");
      if (!isNaN(created.getTime()) && created.getTime() < currentDate) {
        return false;
      }

      // SEARCH filter
      if (searchLower !== "") {
        const matchesTitle = doc.title?.toLowerCase().includes(searchLower);
        const matchesOwner = doc.owner?.name
          ?.toLowerCase()
          .includes(searchLower);
        if (!matchesTitle && !matchesOwner) {
          return false;
        }
      }

      return true;
    });
  }, [
    iterables,
    category,
    documentOwner,
    department,
    action,
    currentAmount,
    currentDate,
    debouncedSearchValue,
  ]);

  // Update collection when filtered results change
  useEffect(() => {
    setCollection(filteredCollection);
  }, [filteredCollection]);

  return {
    category,
    setCategory,
    categories,
    amountFilter,
    dateFilter,
    searchValue,
    setSearchValue,
    collection,
    currentAmount,
    setCurrentAmount,
    currentDate,
    setCurrentDate,
    owners,
    documentOwner,
    handleDocumentOwnersChange,
    handleDeptsChange,
    handleActionsChange,
    actions,
    action,
    departments,
    department,
    isLoading,
    resetFilters,
  };
};

export default useFilters;
