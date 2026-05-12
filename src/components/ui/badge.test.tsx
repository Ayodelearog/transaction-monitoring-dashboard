import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders content with default neutral tone", () => {
    render(<Badge>Pending</Badge>);
    const badge = screen.getByText("Pending");
    expect(badge).toHaveClass("bg-muted");
  });

  it("applies the requested tone classes", () => {
    render(<Badge tone="danger">Flagged</Badge>);
    expect(screen.getByText("Flagged")).toHaveClass("text-danger");
  });

  it("renders an indicator dot when requested", () => {
    const { container } = render(
      <Badge tone="success" dot>
        Completed
      </Badge>,
    );
    const dot = container.querySelector("span > span");
    expect(dot).not.toBeNull();
  });
});
