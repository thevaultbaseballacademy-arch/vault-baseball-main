import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error?.message || "Unknown error" };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          background: "#0d0d0d",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          fontFamily: "sans-serif",
          color: "#ffffff",
          textAlign: "center"
        }}>
          <div style={{
            fontSize: 48,
            fontWeight: 900,
            letterSpacing: 4,
            color: "#E8C84A",
            marginBottom: 12
          }}>VAULT OS</div>
          <div style={{ fontSize: 18, color: "#aaaaaa", marginBottom: 32 }}>
            Baseball & Softball Development
          </div>
          <div style={{
            background: "#1a1a1a",
            border: "1px solid #333",
            padding: "24px 32px",
            borderRadius: 8,
            maxWidth: 400,
            marginBottom: 32
          }}>
            <div style={{ color: "#E8C84A", fontSize: 16, marginBottom: 8 }}>
              Loading issue detected
            </div>
            <div style={{ color: "#888", fontSize: 13 }}>
              {this.state.error}
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#E8C84A",
              color: "#0d0d0d",
              border: "none",
              padding: "14px 32px",
              fontSize: 16,
              fontWeight: 700,
              borderRadius: 4,
              cursor: "pointer",
              letterSpacing: 2
            }}
          >
            TAP TO RELOAD
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
