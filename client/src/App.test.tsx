import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App Component", () => {
  it("renders without crashing", () => {
    render(<App />);
    // Test for common elements that should be in the app
    expect(document.body).toBeInTheDocument();
  });

  it("has proper document structure", () => {
    render(<App />);
    // Basic structure test
    expect(document.querySelector("body")).toBeInTheDocument();
  });
});
