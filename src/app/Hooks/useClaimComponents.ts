/* eslint-disable react-hooks/exhaustive-deps */
import { useAuth } from "app/Context/AuthContext";
import { AllowanceResponseData } from "app/Repositories/Allowance/data";
import { CityResponseData } from "app/Repositories/City/data";
import ClaimRepository from "app/Repositories/Claim/ClaimRepository";
import { ExpenseResponseData } from "app/Repositories/Expense/data";
import ExpenseRepository from "app/Repositories/Expense/ExpenseRepository";
import { RemunerationResponseData } from "app/Repositories/Remuneration/data";
import { TripResponseData } from "app/Repositories/Trip/data";
import TripRepository from "app/Repositories/Trip/TripRepository";
import { TripCategoryResponseData } from "app/Repositories/TripCategory/data";
import { getEarliestAndLatestDates } from "app/Support/Helpers";
import { TripExpenseGenerator } from "app/Support/TripExpenseGenerator";
import exp from "constants";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";

export const useClaimComponents = () => {
  const { authState } = useAuth();

  const claimRepo = useMemo(() => new ClaimRepository(), []);
  const tripRepo = useMemo(() => new TripRepository(), []);
  const expenseRepo = useMemo(() => new ExpenseRepository(), []);

  const [allowances, setAllowances] = useState<AllowanceResponseData[]>([]);
  const [cities, setCities] = useState<CityResponseData[]>([]);
  const [remunerations, setRemunerations] = useState<
    RemunerationResponseData[]
  >([]);
  const [gradeLevelId, setGradeLevelId] = useState<number>(0);
  const [expenses, setExpenses] = useState<ExpenseResponseData[]>([]);
  const [tripCategories, setTripCategories] = useState<
    TripCategoryResponseData[]
  >([]);
  const [totalMoneySpent, setTotalMoneySpent] = useState<number>(0);
  const [earliestDate, setEarliestDate] = useState("");
  const [latestDate, setLatestDate] = useState("");

  const getDuration = (startDate: string, endDate: string) => {
    const start = moment(startDate);
    const end = moment(endDate);

    return `${start.format("ll")} - ${end.format("ll")}`;
  };

  const getNumOfDays = (startDate: string, endDate: string) => {
    const start = moment(startDate);
    const end = moment(endDate);

    return end.diff(start, "days") + 1;
  };

  const generateTrip = (tripState: TripResponseData) => {
    const analysis = new TripExpenseGenerator(
      tripState,
      remunerations,
      Number(gradeLevelId)
    );

    setExpenses([...analysis.init(), ...expenses]);
  };

  const updateExpenses = (
    response: ExpenseResponseData,
    mode: "store" | "update" | "destroy"
  ) => {
    switch (mode) {
      case "update":
        setExpenses(
          expenses.map((exp) => {
            if (exp.identifier === response.identifier) {
              return response;
            }

            return exp;
          })
        );
        break;

      case "destroy":
        setExpenses(
          expenses.filter((exp) => exp.identifier !== response.identifier)
        );
        break;

      default:
        setExpenses((prev) => [response, ...prev]);
        break;
    }
  };

  useEffect(() => {
    if (authState) {
      const { staff } = authState;
      const getDependencies = async () => {
        try {
          const response = await claimRepo.dependencies();

          if (response) {
            const { allowances = [], cities = [] } = response;
            setAllowances(allowances);
            setCities(cities);
          }
        } catch (error) {
          console.error(error);
        }
      };
      getDependencies();
      setRemunerations(staff?.remunerations ?? []);
      setGradeLevelId(staff?.grade_level_id ?? 0);
    }
  }, [authState]);

  useEffect(() => {
    const { earliest } = getEarliestAndLatestDates(
      expenses.map((expense) => expense.start_date)
    );
    setEarliestDate(earliest);
    const { latest } = getEarliestAndLatestDates(
      expenses.map((expense) => expense.end_date)
    );
    setLatestDate(latest);

    if (expenses.length > 0) {
      const total = expenses
        .map((expense) => Number(expense.total_amount_spent))
        .reduce((sum, curr) => sum + curr, 0);

      setTotalMoneySpent(total);
    } else {
      setTotalMoneySpent(0);
    }
  }, [expenses, getEarliestAndLatestDates]);

  return {
    getDuration,
    generateTrip,
    updateExpenses,
    getNumOfDays,
    earliestDate,
    latestDate,
    totalMoneySpent,
    allowances,
    cities,
    gradeLevelId,
    remunerations,
    expenses,
    tripRepo,
    expenseRepo,
  };
};
