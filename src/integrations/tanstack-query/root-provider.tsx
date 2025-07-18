import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const queryClient = new QueryClient()

export function getContext() {
    return {
        queryClient: queryClient
    }
}

export function Provider({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
}