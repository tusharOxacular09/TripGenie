import { HttpError } from "../../shared/http-error";
import { BudgetType } from "../../types/api";

const BUDGET_TYPES: BudgetType[] = ["low", "medium", "high"];

export const tripValidators = {
  validateCreateTripInput: (pickupPoint: string, destination: string, days: number, budgetType: BudgetType): void => {
    if (!pickupPoint.trim()) {
      throw new HttpError("Pickup point is required", 400);
    }
    if (!destination.trim()) {
      throw new HttpError("Destination is required", 400);
    }
    if (!Number.isInteger(days) || days < 1) {
      throw new HttpError("Days must be an integer greater than 0", 400);
    }
    if (!BUDGET_TYPES.includes(budgetType)) {
      throw new HttpError("Invalid budget type", 400);
    }
  },
  validateActivityInput: (day: number, activity: string): void => {
    if (!Number.isInteger(day) || day < 1) {
      throw new HttpError("Day must be an integer greater than 0", 400);
    }
    if (!activity.trim()) {
      throw new HttpError("Activity is required", 400);
    }
  },
  validateRegenerateInput: (day: number): void => {
    if (!Number.isInteger(day) || day < 1) {
      throw new HttpError("Day must be an integer greater than 0", 400);
    }
  },
};
