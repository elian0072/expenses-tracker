export type RouteMetric = {
  route: string;
  durationMs: number;
};

export const PERFORMANCE_BUDGETS_MS = {
  loginFirstInteractive: 1200,
  warmRouteTransition: 400,
  profileLoad: 600,
  profileSaveFeedback: 700,
  adminUsersLoad: 1000,
  userMutationFeedback: 700
} as const;

const routeMetrics: RouteMetric[] = [];

export function startRouteTiming(route: string): () => number {
  if (typeof performance === "undefined") {
    return () => 0;
  }
  const start = performance.now();
  return () => {
    const durationMs = performance.now() - start;
    routeMetrics.push({ route, durationMs });
    return durationMs;
  };
}

export function getRouteMetrics(): RouteMetric[] {
  return [...routeMetrics];
}

export function clearRouteMetrics(): void {
  routeMetrics.length = 0;
}

export function isWithinBudget(metric: RouteMetric): boolean {
  if (metric.route.startsWith("/login")) {
    return metric.durationMs <= PERFORMANCE_BUDGETS_MS.loginFirstInteractive;
  }
  if (metric.route.startsWith("/users")) {
    return metric.durationMs <= PERFORMANCE_BUDGETS_MS.adminUsersLoad;
  }
  if (
    metric.route.startsWith("/expenses") ||
    metric.route.startsWith("/activity") ||
    metric.route.startsWith("/profile")
  ) {
    return metric.durationMs <= PERFORMANCE_BUDGETS_MS.warmRouteTransition;
  }
  return true;
}

export function isProfileLoadWithinBudget(durationMs: number): boolean {
  return durationMs <= PERFORMANCE_BUDGETS_MS.profileLoad;
}

export function isProfileSaveWithinBudget(durationMs: number): boolean {
  return durationMs <= PERFORMANCE_BUDGETS_MS.profileSaveFeedback;
}
