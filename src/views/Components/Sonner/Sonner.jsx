import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
        <main>{children}</main>
        <Toaster
          theme="light"
          className="toaster-custom"
          toastOptions={{
            classNames: {
              success: "bg-green-900 border-green-50 text-green-500",
              error: "bg-red-900 border-red-50 text-red-500",
              warning: "bg-yellow-900 border-yellow-50 text-yellow-500",
              info: "bg-blue-900 border-blue-50 text-blue-500",
            },
            style: {
              background: "white",
              border: "1px solid #e2e8f0",
              color: "#1e293b",
              borderRadius: "0.5rem",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            },
            success: {
              style: {
                borderLeft: "4px solid #22c55e",
                backgroundColor: "green-50",
              },
              icon: "✓",
            },
            error: {
              style: {
                borderLeft: "4px solid #ef4444",
                backgroundColor: "#fef2f2",
              },
              icon: "✗",
            },
            warning: {
              style: {
                borderLeft: "4px solid #eab308",
                backgroundColor: "#fefce8",
              },
              icon: "⚠",
            },
            info: {
              style: {
                borderLeft: "4px solid #3b82f6",
                backgroundColor: "#eff6ff",
              },
              icon: "ℹ",
            },
            actionButton: {
              style: {
                backgroundColor: "#22c55e",
                color: "white",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
