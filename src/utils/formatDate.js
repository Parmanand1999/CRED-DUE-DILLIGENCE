import { format, parseISO } from "date-fns";
export const formatDate = (isoString, formatString = "dd-MM-yyyy") => {
  try {
    return format(parseISO(isoString ?? isoString), formatString);
  } catch (error) {
    console.error("Error formatting date:", error);
    return ""; // Fallback for invalid dates
  }
};
