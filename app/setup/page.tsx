"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

export default function SetupPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runSetup = async () => {
    try {
      setIsRunning(true);
      setResult(null);

      const response = await fetch("/api/setup-order", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        toast.success("Setup completed successfully!");
      } else {
        toast.error(`Setup failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error running setup:", error);
      toast.error("Setup failed");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Database Setup - Display Order Column</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            This will add a display_order column to your posts table and set
            initial values based on creation date (newest first). This enables
            drag and drop reordering of posts.
          </p>

          <Button onClick={runSetup} disabled={isRunning} className="w-full">
            {isRunning ? "Running Setup..." : "Run Setup"}
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">
                Setup Result:
              </h3>
              <p className="text-green-700 mb-2">{result.message}</p>
              {result.sampleData && (
                <div>
                  <p className="text-green-700 font-medium mb-2">
                    Sample Data:
                  </p>
                  <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                    {JSON.stringify(result.sampleData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
