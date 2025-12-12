import { AppItem } from "../lib/types";
import { AppTile } from "./app-tile";

export const AppGrid = ({ apps }: { apps: AppItem[] }) => {
  return (
    <div className="mx-auto w-full max-w-6xl px-6">
      <div className="grid justify-start gap-4 [grid-template-columns:repeat(auto-fit,260px)]">
        {apps.map((app) => (
          <AppTile key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
};
