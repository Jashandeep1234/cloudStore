import { useNavigate, useRouteError } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";

interface RouteError {
  status?: number;
  statusText?: string;
  message?: string;
}

export const ErrorPage = () => {
  const navigate = useNavigate();
  const error = useRouteError() as RouteError | undefined;

  const status = error?.status || 404;
  const is404 = status === 404;
  const is500 = status >= 500;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-6 rounded-full bg-destructive/10">
            <AlertTriangle className="w-16 h-16 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground">{status}</h1>
          <h2 className="text-2xl font-semibold text-foreground">
            {is404
              ? "Page Not Found"
              : is500
                ? "Server Error"
                : "Something went wrong"}
          </h2>
          <p className="text-muted-foreground">
            {is404
              ? "The page you're looking for doesn't exist or has been moved."
              : is500
                ? "Our server encountered an error. Please try again later."
                : error?.message || "An unexpected error occurred."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate("/drive")} className="gap-2">
            <Home className="w-4 h-4" />
            Go to My Drive
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
};
