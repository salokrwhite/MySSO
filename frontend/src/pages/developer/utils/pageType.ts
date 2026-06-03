import type { DeveloperPageType } from "../types";

export function resolveDeveloperPageType(pathname: string): DeveloperPageType {
  if (pathname === "/developer/profile") {
    return "profile";
  }
  if (pathname === "/developer/console") {
    return "console";
  }
  if (pathname === "/developer/user-access") {
    return "userAccess";
  }
  if (pathname === "/developer/audit-logs") {
    return "auditLogs";
  }
  if (pathname === "/developer/user-analytics") {
    return "analytics";
  }
  if (pathname === "/developer/docs/examples/go") {
    return "docsExamplesGo";
  }
  if (pathname === "/developer/docs/examples/csharp") {
    return "docsExamplesCsharp";
  }
  if (pathname === "/developer/docs/examples/php") {
    return "docsExamplesPHP";
  }
  if (pathname === "/developer/docs/examples/java") {
    return "docsExamplesJava";
  }
  if (pathname === "/developer/docs/examples/nodejs") {
    return "docsExamplesNodejs";
  }
  if (pathname === "/developer/docs/examples/python") {
    return "docsExamplesPython";
  }
  if (pathname === "/developer/docs/examples/ruby") {
    return "docsExamplesRuby";
  }
  if (pathname === "/developer/docs/examples/rust") {
    return "docsExamplesRust";
  }
  if (pathname === "/developer/docs/examples") {
    return "docsExamples";
  }
  if (pathname === "/developer/docs/manual" || pathname === "/developer/docs") {
    return "docsManual";
  }
  return "dashboard";
}
