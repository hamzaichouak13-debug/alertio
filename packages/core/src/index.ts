// @alertio/core — public API
export * from "./types";
export * from "./matchingEngine";
export * from "./romeTree";
export * from "./jobNormalizer";
export * from "./deduplicator";
export * from "./scheduler";
// jobFetcher: exported separately (contains Node.js fetch — keep out of browser bundles)
export type { FetchConfig, FetchResult, FranceTravailOffer } from "./jobFetcher";
export { fetchJobs } from "./jobFetcher";
export * from "./filters";
