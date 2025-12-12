export type AppItem = {
  id: string;
  name: string;
  icon?: string;
  mode: "domain" | "ipport";
  domain?: string;
  ip?: string;
  port?: number;
  description?: string;
  tags?: string[];
  createdAt: number;
};
