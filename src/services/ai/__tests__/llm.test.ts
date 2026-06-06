import { describe, it, expect } from "vitest";
import { parseJsonResponse } from "../llm";

describe("parseJsonResponse", () => {
  it("parses valid JSON directly", () => {
    const result = parseJsonResponse('{"key": "value"}');
    expect(result).toEqual({ key: "value" });
  });

  it("parses JSON with nested objects", () => {
    const input = '{"outer": {"inner": [1, 2, 3]}}';
    const result = parseJsonResponse(input);
    expect(result).toEqual({ outer: { inner: [1, 2, 3] } });
  });

  it("extracts JSON from markdown code blocks", () => {
    const input = '```json\n{"key": "value"}\n```';
    const result = parseJsonResponse(input);
    expect(result).toEqual({ key: "value" });
  });

  it("extracts JSON from code blocks without language tag", () => {
    const input = '```\n{"key": "value"}\n```';
    const result = parseJsonResponse(input);
    expect(result).toEqual({ key: "value" });
  });

  it("finds JSON object in mixed text", () => {
    const input = 'Here is the result: {"key": "value"} and more text';
    const result = parseJsonResponse(input);
    expect(result).toEqual({ key: "value" });
  });

  it("handles JSON with arrays", () => {
    const input = '{"items": [1, 2, 3], "count": 3}';
    const result = parseJsonResponse(input);
    expect(result).toEqual({ items: [1, 2, 3], count: 3 });
  });

  it("throws on completely invalid input", () => {
    expect(() => parseJsonResponse("not json at all")).toThrow();
  });

  it("throws on empty string", () => {
    expect(() => parseJsonResponse("")).toThrow();
  });

  it("handles JSON with special characters in strings", () => {
    const input = '{"message": "Hello, \\"world\\"!"}';
    const result = parseJsonResponse(input);
    expect(result).toEqual({ message: 'Hello, "world"!' });
  });
});
