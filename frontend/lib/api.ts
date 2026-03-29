const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ScanFinding {
  type: string;
  endpoint: string;
  method: string;
  severity: string;
  description: string;
}

export interface RedReport {
  target: string;
  findings: ScanFinding[];
}

export interface SystemStatus {
  status: "idle" | "scanning" | "scan_done" | "patching" | "secured" | "error";
  stats: {
    vulnerabilities: number;
    high_severity: number;
    endpoints: number;
  };
}

export interface LogEntry {
  time: string;
  step: "attack" | "blue" | "report" | "user" | "apply" | "retest" | "secured" | "demo";
  message: string;
}

export const startScan = async () => {
  const res = await fetch(`${BASE_URL}/api/scan`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to start scan");
  return res.json();
};

export const startPatch = async () => {
  const res = await fetch(`${BASE_URL}/api/patch`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to start patch");
  return res.json();
};

export const getStatus = async (): Promise<SystemStatus> => {
  const res = await fetch(`${BASE_URL}/api/status`);
  if (!res.ok) throw new Error("Failed to get status");
  return res.json();
};

export const getRedReport = async (): Promise<RedReport> => {
  const res = await fetch(`${BASE_URL}/api/report/red`);
  if (!res.ok) throw new Error("Failed to get red report");
  return res.json();
};

export const getLogsStream = () => {
  return new EventSource(`${BASE_URL}/api/logs/stream`);
};
