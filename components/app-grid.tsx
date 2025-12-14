import { AppItem } from "../lib/types";
import { AppTile } from "./app-tile";

type AppGridProps = {
  apps: AppItem[];
  onEdit: (item: AppItem) => void;
  onDelete: (id: string) => void;
};

export const AppGrid = ({ apps, onEdit, onDelete }: AppGridProps) => {
  return (
    <div className="mx-auto w-full max-w-6xl px-6">
      <div className="mt-6 grid justify-start gap-6 [grid-template-columns:repeat(auto-fit,260px)]">
        {apps.map((app) => (
          <AppTile key={app.id} app={app} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
};
