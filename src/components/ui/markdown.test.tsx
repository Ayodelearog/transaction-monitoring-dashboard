import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Markdown } from "./markdown";

describe("Markdown", () => {
  it("renders `##` lines as headings", () => {
    render(<Markdown content={"## Summary\nbody text"} />);
    const heading = screen.getByRole("heading", { level: 4 });
    expect(heading).toHaveTextContent("Summary");
  });

  it("groups consecutive `-` lines into a list", () => {
    const { container } = render(
      <Markdown content={"- first signal\n- second signal"} />,
    );
    expect(container.querySelectorAll("li")).toHaveLength(2);
  });

  it("renders inline bold segments", () => {
    render(<Markdown content={"recommend **ESCALATE TO SAR** now"} />);
    expect(screen.getByText("ESCALATE TO SAR").tagName).toBe("STRONG");
  });

  it("ignores blank lines", () => {
    const { container } = render(<Markdown content={"one\n\n\ntwo"} />);
    expect(container.querySelectorAll("p")).toHaveLength(2);
  });
});
