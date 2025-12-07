"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
    return (
        <Toaster
            position="bottom-right"
            expand={false}
            richColors
            closeButton
            theme="dark"
            toastOptions={{
                style: {
                    background: "rgba(0, 0, 0, 0.8)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#fff",
                    fontSize: "14px",
                },
                className: "toast-custom",
            }}
        />
    );
}
