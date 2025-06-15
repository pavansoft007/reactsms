import axios from "axios";
import { AcademicYear } from "../context/AcademicYearContext";

export const fetchAcademicYears = async (): Promise<AcademicYear[]> => {
  const res = await axios.get("/api/schoolyear");
  return res.data;
};
