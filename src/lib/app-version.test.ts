import assert from "node:assert/strict";
import test from "node:test";
import versionJson from "../../VERSION.json";
import { APP_RELEASE, APP_RELEASE_DATE, APP_VERSION } from "./app-version";

test("app release metadata is sourced from VERSION.json", () => {
  assert.equal(APP_VERSION, versionJson.version);
  assert.equal(APP_RELEASE_DATE, versionJson.releaseDate);
  assert.deepEqual(APP_RELEASE, versionJson);
});
