import { describe, expect, it } from "vitest";

import { clearRouteMetrics, getRouteMetrics, startRouteTiming } from "@/utils/performance";

describe("Expenses performance instrumentation", () => {
  it("captures route timing metric entries", async () => {
    clearRouteMetrics();
    const finish = startRouteTiming("/expenses");
    await new Promise((resolve) => setTimeout(resolve, 1));
    const duration = finish();

    expect(duration).toBeGreaterThanOrEqual(0);
    expect(getRouteMetrics()[0]?.route).toBe("/expenses");
  });
});
