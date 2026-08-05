import { describe, expect, it } from "vitest";
import manifest from "../public/manifest.json";

describe("extension branding", () => {
  it("declares the complete icon set for the extension and toolbar action", () => {
    expect(manifest.version).toBe("0.6.1");
    expect(manifest.icons).toEqual({
      "16": "icons/icon-16.png",
      "32": "icons/icon-32.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    });
    expect(manifest.action.default_icon).toEqual(manifest.icons);
  });
});
