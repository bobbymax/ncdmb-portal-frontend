/* eslint-disable react-hooks/exhaustive-deps */
import { useStateContext } from "app/Context/ContentContext";
import { ModalValueProps, useModal } from "app/Context/ModalContext";
import { AllowanceResponseData } from "app/Repositories/Allowance/data";
import { CityResponseData } from "app/Repositories/City/data";
import { TripResponseData } from "app/Repositories/Trip/data";
import { TripCategoryResponseData } from "app/Repositories/TripCategory/data";
import { formatOptions } from "app/Support/Helpers";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ActionMeta } from "react-select";
import Button from "resources/views/components/forms/Button";
import MultiSelect, {
  DataOptionsProps,
} from "resources/views/components/forms/MultiSelect";
import Select from "resources/views/components/forms/Select";
import Textarea from "resources/views/components/forms/Textarea";
import TextInput from "resources/views/components/forms/TextInput";

const Trip: React.FC<ModalValueProps> = ({
  title,
  data,
  isUpdating,
  dependencies,
  onSubmit,
}) => {
  const { getModalState, updateModalState } = useModal();
  const { isLoading } = useStateContext();
  const identifier = "trip";
  const state: TripResponseData = getModalState(identifier);

  const [airports, setAirports] = useState<CityResponseData[]>([]);
  const [allowances, setAllowances] = useState<AllowanceResponseData[]>([]);
  const [categories, setCategories] = useState<TripCategoryResponseData[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{
    departure_city: DataOptionsProps | null;
    destination_city: DataOptionsProps | null;
  }>({
    departure_city: null,
    destination_city: null,
  });
  const [cities, setCities] = useState<CityResponseData[]>([]);
  const [tripType, setTripType] = useState<"flight" | "road">("flight");

  const handleTripGeneratorForm = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(state, "generate");
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    updateModalState(identifier, { [name]: value });
  };

  const handleSelectionChange = useCallback(
    (key: "departure_city" | "destination_city") =>
      (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        const updatedValue = newValue as DataOptionsProps;
        setSelectedOptions((prev) => ({ ...prev, [key]: updatedValue }));
        updateModalState(identifier, { [`${key}_id`]: updatedValue?.value });
      },
    [updateModalState]
  );

  // console.log(tripType);

  useEffect(() => {
    if (state.destination_city_id > 0) {
      const city = cities.find((city) => city.id === state.destination_city_id);
      const category = allowances.find(
        (allowance) => allowance.id === city?.allowance_id
      );

      if (category) {
        updateModalState(identifier, { per_diem_category_id: category.id });
      }
    }
  }, [state.destination_city_id]);

  useEffect(() => {
    if (state.trip_category_id > 0) {
      const catId =
        typeof state.trip_category_id === "string"
          ? parseInt(state.trip_category_id)
          : state.trip_category_id;

      const category = categories.find((cat) => cat.id === catId);

      setTripType(category?.type ?? "flight");
      updateModalState(identifier, { category });
    }
  }, [state.trip_category_id]);

  useEffect(() => {
    if (dependencies) {
      const [allowances = [], cities = [], tripCategories = []] = dependencies;
      const alls = allowances as AllowanceResponseData[];
      const areas = cities as CityResponseData[];
      const categories = tripCategories as TripCategoryResponseData[];

      setAirports(areas.filter((area) => area.has_airport === 1));
      setAllowances(alls.filter((allowance) => allowance.is_active === 1));
      setCities(areas);
      setCategories(categories);
    }
  }, [dependencies]);

  const renderMultiSelect = (
    label: string,
    options: DataOptionsProps[],
    value: DataOptionsProps | null,
    onChange: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void,
    placeholder: string,
    isDisabled: boolean = false,
    grid: number = 6
  ) => (
    <div className={`col-md-${grid} mb-3`}>
      <MultiSelect
        label={label}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isSearchable
        isDisabled={isLoading || isDisabled}
      />
    </div>
  );

  return (
    <>
      <form onSubmit={handleTripGeneratorForm}>
        <div className="row">
          {renderMultiSelect(
            "Origin",
            formatOptions(cities, "id", "name"),
            selectedOptions.departure_city,
            handleSelectionChange("departure_city"),
            "State"
          )}
          {renderMultiSelect(
            "Destination",
            formatOptions(
              cities.filter(
                (city) => city.id !== selectedOptions.departure_city?.value
              ),
              "id",
              "name"
            ),
            selectedOptions.destination_city,
            handleSelectionChange("destination_city"),
            "State",
            selectedOptions.departure_city === null
          )}
          <div className="col-md-4">
            <Select
              label="Trip Category"
              name="trip_category_id"
              value={state.trip_category_id}
              onChange={handleInputChange}
              defaultValue={0}
              valueKey="id"
              labelKey="name"
              defaultCheckDisabled
              options={categories}
            />
          </div>
          {tripType === "flight" ? (
            <div className="col-md-4 mb-3">
              <Select
                label="Airport"
                name="airport_id"
                value={state.airport_id}
                onChange={handleInputChange}
                defaultValue={0}
                valueKey="id"
                labelKey="name"
                defaultCheckDisabled
                options={airports}
              />
            </div>
          ) : (
            <div className="col-md-4 mb-3">
              <TextInput
                label="Distance"
                name="distance"
                value={state.distance}
                onChange={handleInputChange}
                placeholder="Enter Distance"
              />
            </div>
          )}
          <div className="col-md-4 mb-3">
            <Select
              label="Category"
              name="per_diem_category_id"
              value={state.per_diem_category_id}
              onChange={handleInputChange}
              defaultValue={0}
              valueKey="id"
              labelKey="name"
              defaultCheckDisabled
              options={allowances}
              isDisabled
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInput
              label="Departure"
              name="departure_date"
              value={state.departure_date}
              onChange={handleInputChange}
              type="date"
            />
          </div>
          <div className="col-md-4 mb-3">
            <TextInput
              label="Return"
              name="return_date"
              value={state.return_date}
              onChange={handleInputChange}
              type="date"
            />
          </div>
          <div className="col-md-4 mb-3">
            <Select
              label="Route"
              name="route"
              value={state.route}
              onChange={handleInputChange}
              defaultValue=""
              valueKey="value"
              labelKey="label"
              defaultCheckDisabled
              options={[
                { label: "One Way", value: "one-way" },
                { label: "Return", value: "return" },
              ]}
              size="sm"
            />
          </div>
          <div className="col-md-12">
            <Button
              label="Add &amp; Generate Trip Expenses"
              icon={`${
                tripType === "flight"
                  ? "ri-flight-takeoff-line"
                  : "ri-bus-2-line"
              }`}
              type="submit"
              variant="success"
            />
          </div>
        </div>
      </form>
    </>
  );
};

export default Trip;
