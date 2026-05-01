import { BrowserRouter } from "react-router-dom";

import { QueryProvider } from "@/app/providers/query-provider";
import { AppThemeProvider } from "@/app/providers/theme-provider";
import { AppRouter } from "@/app/router";

export default function App() {
  return (
    <QueryProvider>
      <AppThemeProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AppThemeProvider>
    </QueryProvider>
  );
}
