import { beforeEach, describe, expect, it, vi } from "vitest";

const invokeMock = vi.hoisted(() => vi.fn());
const getVersionMock = vi.hoisted(() => vi.fn());
const checkMock = vi.hoisted(() => vi.fn());

vi.mock("@tauri-apps/api/core", () => ({ invoke: invokeMock }));
vi.mock("@tauri-apps/api/app", () => ({ getVersion: getVersionMock }));
vi.mock("@tauri-apps/plugin-updater", () => ({ check: checkMock }));

import { checkForUpdate } from "./updater";

describe("checkForUpdate", () => {
  beforeEach(() => {
    invokeMock.mockReset();
    getVersionMock.mockReset();
    checkMock.mockReset();
    getVersionMock.mockResolvedValue("3.20.2");
    checkMock.mockResolvedValue(undefined);
  });

  it("skips the native updater in Portable mode", async () => {
    invokeMock.mockResolvedValue(true);

    await expect(checkForUpdate()).resolves.toEqual({ status: "up-to-date" });
    expect(invokeMock).toHaveBeenCalledWith("is_portable_mode");
    expect(checkMock).not.toHaveBeenCalled();
  });

  it("keeps the native updater for ordinary installations", async () => {
    invokeMock.mockResolvedValue(false);

    await expect(checkForUpdate()).resolves.toEqual({ status: "up-to-date" });
    expect(checkMock).toHaveBeenCalled();
  });
});
