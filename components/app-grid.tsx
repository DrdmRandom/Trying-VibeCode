import { AppItem } from "../lib/types";
import { AppTile } from "./app-tile";

export const AppGrid = ({ apps }: { apps: AppItem[] }) => {
  return (
    <div className="mx-auto w-full max-w-6xl px-6">
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {apps.map((app) => (
          <AppTile key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
};
