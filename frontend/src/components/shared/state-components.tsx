import { AlertCircle } from "lucide-react";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">{icon}</div>
      <h3 className="font-display mb-1 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-slate-500">{description}</p>
      {action ? (
        <button onClick={action.onClick} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          {action.label}
        </button>
      ) : null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this content. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="font-display mb-1 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-slate-500">{message}</p>
      {onRetry ? (
        <button onClick={onRetry} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
          Try again
        </button>
      ) : null}
    </div>
  );
}
