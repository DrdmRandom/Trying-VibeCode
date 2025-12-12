import { AppItem } from "../lib/types";
import { AppTile } from "./app-tile";

export const AppGrid = ({ apps }: { apps: AppItem[] }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
      {apps.map((app) => (
        <AppTile key={app.id} app={app} />
      ))}
    </div>
  );
};
