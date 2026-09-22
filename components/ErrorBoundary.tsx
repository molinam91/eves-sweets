"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

/**
 * Last-resort safety net: any uncaught render error (e.g. unexpected data
 * shape from the shared backend) shows a recoverable message instead of a
 * blank/crashed page.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Eve's Sweets crashed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-3.5 px-5 text-center">
          <p className="text-sm text-foreground-soft">
            Something went wrong loading this page. Please try again.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full bg-brand-pink px-5 py-2.5 text-sm font-semibold text-white"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
