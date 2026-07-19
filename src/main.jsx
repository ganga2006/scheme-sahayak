import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

/** Safety net: render a friendly message instead of a blank page on any UI error. */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.error("UI error:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center", fontFamily: "Inter, sans-serif" }}>
          <h2>⚠️ Something went wrong</h2>
          <p>Please refresh the page and try again.</p>
          <button onClick={() => window.location.reload()} style={{ padding: "10px 24px", cursor: "pointer" }}>
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
