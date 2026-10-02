import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAppSelector } from "@/hooks/redux-hooks";

export default function ServerStatus() {
  const serverAvailable = useAppSelector(
    (state) => state.app.isBackendAvailable
  );

  if (serverAvailable) {
    return null;
  }

  return (
    <Alert variant="destructive" className="rounded-none border-x-0 border-t-0">
      <AlertCircle className="h-4 w-4" />

      <AlertDescription>
        Server unavailable. Please try again later.
      </AlertDescription>
    </Alert>
  );
}