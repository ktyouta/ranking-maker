import { resetLogin } from "@/stores/access-token-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render } from "@testing-library/react";
import { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test } from "vitest";
import { LoginUserProvider } from "../login-user-provider";
import { ThemeProvider } from "../theme-provider";

describe("LoginUserProvider", () => {

    let queryClient: QueryClient;

    function renderProvider(children: ReactNode) {
        return render(
            <MemoryRouter>
                <ThemeProvider>
                    <QueryClientProvider client={queryClient}>
                        <LoginUserProvider
                            loginUser={{ id: "1", name: "user", birthday: null, theme: "lavender" }}
                        >
                            {children}
                        </LoginUserProvider>
                    </QueryClientProvider>
                </ThemeProvider>
            </MemoryRouter>
        );
    }

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });
    });

    test("should clear all query cache when login is reset", () => {

        queryClient.setQueryData(["myRanking", "list"], { rankings: ["previous-user-data"] });
        queryClient.setQueryData(["trash", "list"], { rankings: ["previous-user-data"] });
        renderProvider(<div />);

        act(() => {
            resetLogin();
        });

        expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    });

    test("should not clear query cache before login is reset", () => {

        queryClient.setQueryData(["myRanking", "list"], { rankings: ["current-user-data"] });
        renderProvider(<div />);

        expect(queryClient.getQueryData(["myRanking", "list"])).toEqual({ rankings: ["current-user-data"] });
    });
});
