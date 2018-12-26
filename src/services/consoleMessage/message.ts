export type ConsoleLevel = "d" | "l" | "w" | "e";

export interface ConsoleMessage {
  timestamp: number;
  level: ConsoleLevel;
  lines: string | string[];
}
