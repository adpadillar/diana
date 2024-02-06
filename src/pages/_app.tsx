import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { SdkContextProvider } from "~/hooks/useSdk";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <SdkContextProvider>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </SdkContextProvider>
  );
};

export default api.withTRPC(MyApp);
