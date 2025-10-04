import { useCallback, useEffect, useState, useMemo } from "react";
import useRepo from "./useRepo";
import { repo } from "bootstrap/repositories";
import {
  AllowanceResponseData,
  ComponentEnumValues,
} from "app/Repositories/Allowance/data";
import { CityResponseData } from "app/Repositories/City/data";
import { formatCurrency, getDistanceInKm } from "app/Support/Helpers";
import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { RemunerationResponseData } from "app/Repositories/Remuneration/data";
import { ExpenseResponseData } from "app/Repositories/Expense/data";
import moment from "moment";
import { ENV } from "../../config/env";

export type DependencyProps = {
  allowances: AllowanceResponseData[];
  cities: CityResponseData[];
};

// Enhanced caching for claim calculations
const CALCULATOR_CACHE = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = ENV.CACHE_TTL; // 5 minutes default

export type DistanceMatrixProps = {
  rows: {
    elements: {
      distance: {
        text: string;
        value: number;
      };
      duration: {
        text: string;
        value: number;
      };
    }[];
  }[];
  status: string;
};

export type PlacementType =
  | "takeoff"
  | "returned"
  | "airport-hotel"
  | "hotel-airport"
  | "departure"
  | "arrival"
  | "accomodation"
  | "allowance";

interface AllowanceWithMeta extends AllowanceResponseData {
  placement: PlacementType;
  meta: {
    start_date: string;
    end_date: string;
    num_of_days: number;
  };
}

const useClaimCalculator = () => {
  // Memoize the repo call to prevent useRepo from re-fetching on every render
  const claimRepo = useMemo(() => repo("claim"), []);
  const { dependencies } = useRepo(claimRepo);
  const [allowances, setAllowances] = useState<AllowanceResponseData[]>([]);
  const [cities, setCities] = useState<CityResponseData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getNumOfDays = (startDate: string, endDate: string) => {
    const start = moment(startDate);
    const end = moment(endDate);

    return end.diff(start, "days") + 1;
  };

  const filterAllowancesByComponent = (
    allowances: AllowanceResponseData[],
    mode: "road" | "flight",
    isResident: boolean
  ): AllowanceResponseData[] => {
    const residentKey = isResident ? "resident" : "non-resident";

    const validComponents: ComponentEnumValues[] = [
      `${mode}-${residentKey}`,
      `${mode}-both`,
      `both-${residentKey}`,
      "both-both",
    ] as ComponentEnumValues[];

    return allowances.filter((a) => validComponents.includes(a.component));
  };

  const formDescription = (
    rem: RemunerationResponseData,
    allowance: AllowanceWithMeta,
    takeoff: string,
    destination: string,
    mode: "road" | "flight",
    airport: string = ""
  ): string => {
    const { placement, meta, label, name } = allowance;
    const { num_of_days } = meta;

    if (mode === "flight") {
      switch (placement) {
        case "takeoff":
          return label !== "airport-shuttle"
            ? name
            : `Shuttle from ${takeoff} to ${airport}`;
        case "returned":
          return label !== "airport-shuttle"
            ? name
            : `Shuttle from ${airport} to ${takeoff}`;
        case "accomodation":
          return `Per Diem for ${num_of_days} nights at ${formatCurrency(
            rem.amount
          )} per night`;
        case "departure":
          return `Flight Fare from ${takeoff} to ${destination} via ${airport} Airport`;
        case "arrival":
          return `Flight Fare from ${destination} to ${takeoff} via ${destination} Airport`;
        case "airport-hotel":
          return `Shuttle from ${destination} Airport to Hotel`;
        case "hotel-airport":
          return `Shuttle from Hotel to ${destination} Airport`;
        default:
          return name;
      }
    } else {
      switch (placement) {
        case "takeoff":
          return label !== "inter-state-shuttle"
            ? name
            : `Transit from ${takeoff} to ${destination}`;
        case "returned":
          return `Transit from ${destination} to ${takeoff}`;
        default:
          return name;
      }
    }
  };

  const constructExpenses = (
    accessibleAllowances: AllowanceWithMeta[],
    remunerations: RemunerationResponseData[],
    distance: number,
    grade_level_id: number,
    takeoff: string,
    destination: string,
    modeOfTransportation: "flight" | "road",
    airport: string = ""
  ) => {
    const expenses: ExpenseResponseData[] = [];

    accessibleAllowances.forEach((allowance) => {
      const remuneration: RemunerationResponseData | undefined =
        remunerations.find(
          (rem) =>
            rem.allowance_id === allowance.id &&
            rem.grade_level_id === grade_level_id
        );

      if (remuneration) {
        const numOfDays = allowance.meta?.num_of_days as number;

        expenses.push({
          id: expenses.length + 1,
          identifier: crypto.randomUUID(),
          parent_id: allowance.parent_id,
          allowance_id: allowance.id,
          remuneration_id: remuneration.id,
          start_date: allowance.meta?.start_date as string,
          end_date: allowance.meta?.end_date as string,
          no_of_days: numOfDays,
          total_distance_covered:
            modeOfTransportation === "road" ? distance : 0,
          unit_price: remuneration.amount,
          total_amount_spent:
            allowance.payment_basis === "km" && modeOfTransportation === "road"
              ? distance * remuneration.amount
              : remuneration.amount * numOfDays,
          cleared_amount: 0,
          audited_amount: 0,
          total_amount_paid: 0,
          variation: 0,
          variation_type: "exact",
          description: formDescription(
            remuneration,
            allowance,
            takeoff,
            destination,
            modeOfTransportation,
            airport
          ),
        });
      }
    });

    return expenses;
  };

  /**
   * Returns the number of weekdays (Mon–Fri) between two dates, inclusive.
   * If no weekdays are found, and the date range includes a weekend (Sat/Sun),
   * the function returns the number of weekend days instead (max 2).
   *
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   * @returns Number of weekdays, or weekend days (max 2), with minimum value of 1
   */
  const countWeekdays = (startDate: string, endDate: string): number => {
    let weekdayCount = 0;
    let weekendCount = 0;

    const current = moment(startDate);
    const end = moment(endDate);

    while (current.isSameOrBefore(end, "day")) {
      const day = current.day(); // 0 = Sunday, 6 = Saturday
      if (day >= 1 && day <= 5) {
        weekdayCount++;
      } else if (day === 0 || day === 6) {
        weekendCount++;
      }
      current.add(1, "day");
    }

    if (weekdayCount > 1) {
      return weekdayCount;
    }

    if (weekdayCount === 1 && weekendCount > 1) {
      return 1;
    }

    if (weekdayCount === 0 && weekendCount > 0) {
      return weekendCount;
    }

    return 1;
  };

  const calculate = useCallback(
    (
      rems: RemunerationResponseData[],
      grade_level_id: number,
      startDate: string,
      endDate: string,
      takeoff: DataOptionsProps | null,
      destination: DataOptionsProps | null,
      modeOfTransportation: "road" | "flight",
      isResident: boolean,
      distance: number,
      route: "one-way" | "return",
      airport: DataOptionsProps | null
    ): ExpenseResponseData[] => {
      // Create cache key from calculation parameters
      const cacheKey = JSON.stringify({
        rems: rems.map((r) => ({ id: r.id, amount: r.amount })),
        grade_level_id,
        startDate,
        endDate,
        takeoff: takeoff?.value,
        destination: destination?.value,
        modeOfTransportation,
        isResident,
        distance,
        route,
        airport: airport?.value,
      });

      // Check cache first
      const cached = CALCULATOR_CACHE.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
      }
      const computableAllowances: AllowanceWithMeta[] = [];

      const eventStartDate = moment(startDate);
      const eventEndDate = moment(endDate);
      const travelDate = eventStartDate.subtract(1, "days");
      const returnDate = eventEndDate.add(1, "days");

      if (
        rems.length < 1 ||
        grade_level_id < 1 ||
        cities.length < 1 ||
        allowances.length < 1 ||
        !takeoff ||
        !destination
      ) {
        // TODO: Add error handling
        return [];
      }

      let shuttle: AllowanceResponseData;

      // Staff Remunerations (using grade_level: endpoint)
      const remunerations: RemunerationResponseData[] = rems ?? [];

      // Allowances based on Mode of Transportation
      // and Resident Status
      const dueAllowances: AllowanceResponseData[] =
        filterAllowancesByComponent(
          allowances,
          modeOfTransportation,
          isResident
        );

      // Shuttle Section
      if (modeOfTransportation === "flight" && airport) {
        const stateShuttle = dueAllowances.find(
          (allowance) =>
            allowance.departure_city_id === takeoff?.value &&
            allowance.destination_city_id === airport?.value
        );

        const systemShuttle = dueAllowances.find(
          (allowance) => allowance.label === "airport-shuttle"
        );

        const flightFare = dueAllowances.find(
          (allowance) => allowance.label === "flight-fare"
        );

        shuttle = (stateShuttle ?? systemShuttle) as AllowanceResponseData;

        if (shuttle) {
          computableAllowances.push({
            ...shuttle,
            placement: "takeoff",
            meta: {
              start_date: travelDate.format("YYYY-MM-DD"),
              end_date: travelDate.format("YYYY-MM-DD"),
              num_of_days: 1,
            },
          });

          if (route === "return") {
            computableAllowances.push({
              ...shuttle,
              placement: "returned",
              meta: {
                start_date: returnDate.format("YYYY-MM-DD"),
                end_date: returnDate.format("YYYY-MM-DD"),
                num_of_days: 1,
              },
            });
          }
        }

        if (systemShuttle) {
          computableAllowances.push({
            ...systemShuttle,
            placement: "airport-hotel",
            meta: {
              start_date: travelDate.format("YYYY-MM-DD"),
              end_date: travelDate.format("YYYY-MM-DD"),
              num_of_days: 1,
            },
          });

          if (route === "return") {
            computableAllowances.push({
              ...systemShuttle,
              placement: "hotel-airport",
              meta: {
                start_date: returnDate.format("YYYY-MM-DD"),
                end_date: returnDate.format("YYYY-MM-DD"),
                num_of_days: 1,
              },
            });
          }
        }

        if (flightFare) {
          computableAllowances.push({
            ...flightFare,
            placement: "departure",
            meta: {
              start_date: travelDate.format("YYYY-MM-DD"),
              end_date: travelDate.format("YYYY-MM-DD"),
              num_of_days: 1,
            },
          });

          if (route === "return") {
            computableAllowances.push({
              ...flightFare,
              placement: "arrival",
              meta: {
                start_date: returnDate.format("YYYY-MM-DD"),
                end_date: returnDate.format("YYYY-MM-DD"),
                num_of_days: 1,
              },
            });
          }
        }
      } else {
        const roadShuttle = dueAllowances.find(
          (allowance) =>
            allowance.departure_city_id === takeoff?.value &&
            allowance.destination_city_id === destination?.value
        );

        const interStateShuttle = dueAllowances.find(
          (allowance) => allowance.label === "inter-state-shuttle"
        );

        shuttle = (roadShuttle ?? interStateShuttle) as AllowanceResponseData;

        if (shuttle) {
          computableAllowances.push({
            ...shuttle,
            placement: "takeoff",
            meta: {
              start_date: travelDate.format("YYYY-MM-DD"),
              end_date: travelDate.format("YYYY-MM-DD"),
              num_of_days: 1,
            },
          });

          if (route === "return") {
            computableAllowances.push({
              ...shuttle,
              placement: "returned",
              meta: {
                start_date: returnDate.format("YYYY-MM-DD"),
                end_date: returnDate.format("YYYY-MM-DD"),
                num_of_days: 1,
              },
            });
          }
        }
      }

      // Accommodation Section
      if (isResident) {
        const outOfPocket = dueAllowances.find(
          (allowance) => allowance.label === "out-of-pocket-allowance"
        );

        computableAllowances.push({
          ...(outOfPocket as AllowanceResponseData),
          placement: "allowance",
          meta: {
            start_date: eventStartDate.format("YYYY-MM-DD"),
            end_date: returnDate.format("YYYY-MM-DD"),
            num_of_days: returnDate.diff(eventStartDate, "days"),
          },
        });
      } else {
        const destinationCity =
          cities.find((city) => city.id === destination?.value) ?? null;
        if (destinationCity) {
          const accomodationAllowance = dueAllowances.find(
            (allowance) => allowance.id === destinationCity.allowance_id
          );

          computableAllowances.push({
            ...(accomodationAllowance as AllowanceResponseData),
            placement: "accomodation",
            meta: {
              start_date: travelDate.format("YYYY-MM-DD"),
              end_date: returnDate.format("YYYY-MM-DD"),
              num_of_days: returnDate.diff(travelDate, "days") + 1,
            },
          });
        }
      }

      // Intracity
      const intracityShuttle = dueAllowances.find(
        (allowance) => allowance.label === "intracity"
      );

      if (intracityShuttle) {
        computableAllowances.push({
          ...intracityShuttle,
          placement: "allowance",
          meta: {
            start_date: eventStartDate.format("YYYY-MM-DD"),
            end_date: eventEndDate.format("YYYY-MM-DD"),
            num_of_days: countWeekdays(
              eventStartDate.format("YYYY-MM-DD"),
              eventEndDate.format("YYYY-MM-DD")
            ),
          },
        });
      }

      // Build Expenses Here
      const constructedExpenses: ExpenseResponseData[] = constructExpenses(
        computableAllowances,
        remunerations,
        distance,
        grade_level_id,
        takeoff.label,
        destination?.label,
        modeOfTransportation,
        airport ? airport.label : ""
      );

      // Cache the result
      CALCULATOR_CACHE.set(cacheKey, {
        data: constructedExpenses,
        timestamp: Date.now(),
      });

      return constructedExpenses;
    },
    [cities, allowances]
  );

  const getDistance = async (
    takeoff: string,
    destination: string
  ): Promise<number | undefined> => {
    const params = {
      origin: takeoff,
      destination: destination,
    };

    console.log("🔍 Distance API Request:", { takeoff, destination, params });

    const response = await claimRepo.collection("distance", params);

    if (response) {
      const data = response.data as unknown as DistanceMatrixProps;
      const distance = data.rows[0].elements[0].distance.value;

      return distance / 1000;
    }

    return;
  };

  useEffect(() => {
    const { allowances = [], cities = [] } = dependencies as DependencyProps;

    setAllowances(allowances);
    setCities(cities);
  }, [dependencies]);

  // Cache management functions
  const clearCache = useCallback(() => {
    CALCULATOR_CACHE.clear();
  }, []);

  const getCacheStats = useCallback(() => {
    return {
      size: CALCULATOR_CACHE.size,
      entries: Array.from(CALCULATOR_CACHE.entries()).map(([key, value]) => ({
        key: key.substring(0, 50) + "...",
        age: Date.now() - value.timestamp,
        expired: Date.now() - value.timestamp >= CACHE_TTL,
      })),
    };
  }, []);

  return {
    calculate,
    loading,
    setLoading,
    getDistance,
    cities,
    allowances,
    countWeekdays,
    getNumOfDays,
    formDescription,
    // Enhanced cache management
    clearCache,
    getCacheStats,
  };
};

export default useClaimCalculator;
