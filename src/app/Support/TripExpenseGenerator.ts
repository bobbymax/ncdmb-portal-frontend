import { AllowanceResponseData } from "app/Repositories/Allowance/data";
import { RemunerationResponseData } from "app/Repositories/Remuneration/data";
import { TripResponseData } from "app/Repositories/Trip/data";
import { TripCategoryResponseData } from "app/Repositories/TripCategory/data";
import moment from "moment";
import { formatCurrency, generateUniqueString } from "./Helpers";
import { ExpenseResponseData } from "app/Repositories/Expense/data";

interface AddExpenseForAllowance {
  expenses: ExpenseResponseData[];
  allowance: AllowanceResponseData;
  startDate?: string;
  description: string;
  numOfDays?: number;
  endDate?: string;
  type: "flight-takeoff" | "flight-land" | "road" | "per-diem" | "wallet";
}

const ALLOWANCE_TYPES = {
  AIRPORT_SHUTTLE: "airport-shuttle-from-town",
  INTRACITY: "intracity",
  OUT_OF_POCKET: "out-of-pocket-allowance",
  OTHER_LOCATIONS: "yenagoa-to-other-locations",
  YENAGOA_AIRPORT: "yenagoa-to-bayelsa-airport",
};

export class TripExpenseGenerator {
  private trip: TripResponseData;
  private remunerations: RemunerationResponseData[];
  private category: TripCategoryResponseData | null;
  private gradeLevelId: number;
  private allowances: AllowanceResponseData[];
  private distance_covered: number;

  constructor(
    tripState: TripResponseData,
    remunerations: RemunerationResponseData[],
    gradeLevelId: number
  ) {
    this.trip = tripState;
    this.remunerations = remunerations;
    this.category = tripState.category ?? null;
    this.allowances = tripState.category?.allowances ?? [];
    this.gradeLevelId = gradeLevelId;
    this.distance_covered = tripState.distance;

    this.validateTripData();
  }

  private validateTripData(): void {
    if (!this.trip.departure_date || !this.trip.return_date) {
      throw new Error("Departure and return dates are required.");
    }

    if (!this.category) {
      throw new Error("Trip category is required.");
    }
  }

  public init(): ExpenseResponseData[] {
    const expenses: ExpenseResponseData[] = [];
    const startDate = this.getAdjustedDate(this.trip.departure_date, "before");
    const endDate = this.getAdjustedDate(this.trip.return_date);

    if (this.category?.type === "flight") {
      // Working now
      this.addFlightExpenses(expenses, startDate, endDate);
    } else {
      this.addIntercityExpenses(expenses, startDate, endDate);
    }

    this.addIntracityExpenses(expenses);
    this.addAccommodationExpenses(expenses, startDate, this.trip.return_date);

    return expenses;
  }

  private addFlightExpenses(
    expenses: ExpenseResponseData[],
    startDate: string,
    endDate: string
  ): void {
    const airportId: number = Number(this.trip.airport_id);

    const sameAllowance = this.getAllowanceByStates(
      this.trip.departure_city_id,
      airportId
    ); // same allowance

    let allowance =
      this.trip.departure_city_id !== airportId ||
      sameAllowance?.label === ALLOWANCE_TYPES.YENAGOA_AIRPORT
        ? this.getAllowanceByStates(this.trip.departure_city_id, airportId)
        : this.getAllowance(ALLOWANCE_TYPES.AIRPORT_SHUTTLE);

    if (allowance) {
      this.addExpenseForAllowance({
        expenses,
        allowance,
        startDate,
        description: allowance.name,
        type: "flight-takeoff",
      });
      this.addExpenseForAllowance({
        expenses,
        allowance,
        startDate: endDate,
        description: `${allowance.name} (Return)`,
        type: "flight-land",
      });
      if (this.trip.route === "return") {
        allowance = this.getAllowance(ALLOWANCE_TYPES.AIRPORT_SHUTTLE);
        if (allowance) {
          this.addExpenseForAllowance({
            expenses,
            allowance,
            startDate,
            description: allowance.name,
            type: "flight-takeoff",
          });
          this.addExpenseForAllowance({
            expenses,
            allowance,
            startDate: endDate,
            description: `${allowance.name} (Return)`,
            type: "flight-land",
          });
        }
      }
    }
  }

  private addIntercityExpenses(
    expenses: ExpenseResponseData[],
    startDate: string,
    endDate: string
  ): void {
    const allowance = this.getAllowanceByStates(
      this.trip.departure_city_id,
      this.trip.destination_city_id
    );

    if (allowance) {
      this.addExpenseForAllowance({
        expenses,
        allowance,
        startDate,
        description: allowance.name,
        type: "road",
      });
      if (this.trip.route === "return") {
        const description = `${allowance.name} (Return)`;
        this.addExpenseForAllowance({
          expenses,
          allowance,
          startDate: endDate,
          description,
          type: "road",
        });
      }
    }
  }

  private addIntracityExpenses(expenses: ExpenseResponseData[]): void {
    const allowance = this.getAllowance(ALLOWANCE_TYPES.INTRACITY);

    if (allowance) {
      const days = this.calculateNumOfDays(
        this.trip.departure_date,
        this.trip.return_date
      );

      const num = days + 1;
      this.addExpenseForAllowance({
        expenses,
        allowance,
        startDate: this.trip.departure_date,
        description: `Intracity Shuttle for ${num} days`,
        numOfDays: num,
        endDate: this.trip.return_date,
        type: "road",
      });
    }
  }

  private addAccommodationExpenses(
    expenses: ExpenseResponseData[],
    startDate: string,
    endDate: string
  ): void {
    if (this.category?.accommodation_type === "non-residence") {
      const allowance = this.getAllowance(this.trip.per_diem_category_id);

      if (allowance) {
        const remuneration = this.getRemuneration(allowance.id);
        const numOfDays = this.calculateNumOfDays(startDate, endDate) + 1;
        const description = `Per Diem for ${numOfDays} nights at ${
          remuneration ? formatCurrency(remuneration.amount) : ""
        } per night!`;
        this.addExpenseForAllowance({
          expenses,
          allowance,
          startDate,
          description,
          numOfDays,
          endDate,
          type: "per-diem",
        });
      }
    } else {
      const allowance = this.getAllowance(ALLOWANCE_TYPES.OUT_OF_POCKET);

      if (allowance) {
        const remuneration = this.getRemuneration(allowance.id);
        const numOfDays = this.calculateNumOfDays(startDate, endDate);
        const description = `Out of Pocket Allowance for ${numOfDays} nights at NGN${
          remuneration ? remuneration.amount : ""
        } per day`;
        this.addExpenseForAllowance({
          expenses,
          allowance,
          startDate,
          description,
          numOfDays,
          endDate,
          type: "wallet",
        });
      }
    }
  }

  private addExpenseForAllowance({
    expenses,
    allowance,
    startDate,
    description,
    numOfDays = 1,
    endDate = startDate,
    type = "flight-takeoff",
  }: AddExpenseForAllowance): void {
    const remuneration = this.getRemuneration(allowance.id);

    if (remuneration) {
      expenses.push({
        id: 0,
        identifier: generateUniqueString(12),
        parent_id: allowance.parent_id,
        allowance_id: allowance.id,
        remuneration_id: remuneration.id,
        start_date: startDate ?? "",
        end_date: endDate ?? "",
        no_of_days: numOfDays,
        total_distance_covered: this.distance_covered,
        unit_price: Number(remuneration.amount),
        total_amount_spent: this.calculateTotalAmount(
          numOfDays,
          remuneration.amount
        ),
        description,
      });
    }
  }

  private getAllowance(
    identifier: number | string
  ): AllowanceResponseData | undefined {
    return typeof identifier === "string"
      ? this.allowances.find((allowance) => allowance.label === identifier)
      : this.allowances.find(
          (allowance) => Number(allowance.id) === identifier
        );
  }

  private getAllowanceByStates(
    departureCityId: number,
    destinationCityId: number
  ): AllowanceResponseData | undefined {
    return this.allowances.find(
      (allowance) =>
        allowance.departure_city_id === departureCityId &&
        allowance.destination_city_id === destinationCityId
    );
  }

  private getRemuneration(
    allowanceId: number
  ): RemunerationResponseData | undefined {
    return this.remunerations.find(
      (remuneration) =>
        Number(remuneration.allowance_id) === Number(allowanceId) &&
        Number(remuneration.grade_level_id) === this.gradeLevelId
    );
  }

  private calculateNumOfDays(departure: string, returnDate: string): number {
    const departureDate = moment(departure);
    const destinationDate = moment(returnDate);
    return destinationDate.diff(departureDate, "days");
  }

  private getAdjustedDate(
    date: string,
    adjustment: "before" | "after" = "after"
  ): string {
    return moment(date)
      .add(adjustment === "before" ? -1 : 1, "days")
      .format("YYYY-MM-DD");
  }

  private calculateTotalAmount(
    numOfDays: number,
    unitPrice: string | number
  ): number {
    return numOfDays * Number(unitPrice);
  }
}
