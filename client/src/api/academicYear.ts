import { AcademicYear } from "../context/AcademicYearContext";
import api from "./config";

export const fetchAcademicYears = async (): Promise<AcademicYear[]> => {
  try {
    const response = await api.get("/api/schoolyear");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch academic years:", error);
    throw error;
  }
};
