import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "./pagination";

describe("Pagination", () => {
  it("renders the visible range and total", () => {
    render(<Pagination page={2} pageSize={10} total={37} onPageChange={() => {}} />);
    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("37")).toBeInTheDocument();
  });

  it("disables Previous on the first page and Next on the last page", () => {
    const { rerender } = render(
      <Pagination page={1} pageSize={10} total={20} onPageChange={() => {}} />,
    );
    expect(screen.getByRole("button", { name: /previous page/i })).toBeDisabled();

    rerender(<Pagination page={2} pageSize={10} total={20} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: /next page/i })).toBeDisabled();
  });

  it("invokes onPageChange when a numbered page is clicked", async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} pageSize={10} total={50} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Page 3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
