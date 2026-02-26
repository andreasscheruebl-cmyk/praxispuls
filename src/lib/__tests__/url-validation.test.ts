import { describe, it, expect } from "vitest";
import { isSafeUrl } from "../url-validation";

describe("isSafeUrl", () => {
  describe("valid public URLs", () => {
    it("allows https URLs", () => {
      expect(isSafeUrl("https://example.com")).toBe(true);
    });

    it("allows http URLs", () => {
      expect(isSafeUrl("http://example.com")).toBe(true);
    });

    it("allows URLs with paths", () => {
      expect(isSafeUrl("https://example.com/logo.png")).toBe(true);
    });

    it("allows public IP addresses", () => {
      expect(isSafeUrl("http://8.8.8.8")).toBe(true);
    });
  });

  describe("invalid URLs", () => {
    it("rejects malformed URLs", () => {
      expect(isSafeUrl("not-a-url")).toBe(false);
    });

    it("rejects empty string", () => {
      expect(isSafeUrl("")).toBe(false);
    });
  });

  describe("blocked protocols", () => {
    it("rejects ftp://", () => {
      expect(isSafeUrl("ftp://example.com")).toBe(false);
    });

    it("rejects file://", () => {
      expect(isSafeUrl("file:///etc/passwd")).toBe(false);
    });
  });

  describe("localhost and loopback", () => {
    it("rejects localhost", () => {
      expect(isSafeUrl("http://localhost")).toBe(false);
    });

    it("rejects 127.0.0.1", () => {
      expect(isSafeUrl("http://127.0.0.1")).toBe(false);
    });

    it("rejects ::1", () => {
      expect(isSafeUrl("http://[::1]")).toBe(false);
    });

    it("rejects 0.0.0.0", () => {
      expect(isSafeUrl("http://0.0.0.0")).toBe(false);
    });
  });

  describe("private IP ranges", () => {
    it("rejects 10.x.x.x (10.0.0.0/8)", () => {
      expect(isSafeUrl("http://10.0.0.1")).toBe(false);
      expect(isSafeUrl("http://10.255.255.255")).toBe(false);
    });

    it("rejects 172.16-31.x.x (172.16.0.0/12)", () => {
      expect(isSafeUrl("http://172.16.0.1")).toBe(false);
      expect(isSafeUrl("http://172.31.255.255")).toBe(false);
    });

    it("allows 172.15.x.x (outside range)", () => {
      expect(isSafeUrl("http://172.15.0.1")).toBe(true);
    });

    it("allows 172.32.x.x (outside range)", () => {
      expect(isSafeUrl("http://172.32.0.1")).toBe(true);
    });

    it("rejects 192.168.x.x (192.168.0.0/16)", () => {
      expect(isSafeUrl("http://192.168.0.1")).toBe(false);
      expect(isSafeUrl("http://192.168.1.100")).toBe(false);
    });

    it("rejects 169.254.x.x (link-local)", () => {
      expect(isSafeUrl("http://169.254.169.254")).toBe(false);
    });

    it("rejects 0.x.x.x", () => {
      expect(isSafeUrl("http://0.1.2.3")).toBe(false);
    });
  });
});
