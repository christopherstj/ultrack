import { ErrorDetail } from "./error";

export interface SuccessMessage {
  success: boolean;
  msg?: string;
  errorList?: ErrorDetail[];
}
