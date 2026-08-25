import appVersion from "../../VERSION.json";

type AppRelease = {
  version: string;
  releaseDate: string;
};

export const APP_RELEASE: AppRelease = appVersion;
export const APP_VERSION = APP_RELEASE.version;
export const APP_RELEASE_DATE = APP_RELEASE.releaseDate;
