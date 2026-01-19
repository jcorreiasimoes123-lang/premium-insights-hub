import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Index from "./Index";

describe("Index page", () => {
  it("does not render the giant test banner", () => {
    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    );

    expect(screen.queryByText(/modo de testes/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/banner gigante de testes/i)).not.toBeInTheDocument();
  });
});
