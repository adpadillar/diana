import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { SdkContextProvider } from "~/hooks/useSdk";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <SdkContextProvider>
      <Component {...pageProps} />
    </SdkContextProvider>
  );
};

export default api.withTRPC(MyApp);
