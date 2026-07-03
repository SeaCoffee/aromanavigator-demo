import "@testing-library/jest-dom/vitest";
import React from "react";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

afterEach(() => cleanup());
