import { Redirect } from "~/components/Redirect";
import { useSdk } from "~/hooks/useSdk";

const HelloTestPage = () => {
  const { loggedIn, loading, sdk } = useSdk();

  if (!sdk && !loggedIn && !loading) {
    const params = new URLSearchParams({
      source: document.location.origin + document.location.pathname,
    });

    return <Redirect href={`/api/auth/login?${params.toString()}`} />;
  }

  return (
    <h1>This is a hello test page: {loggedIn ? "Logged in" : "Logged out"}</h1>
  );
};

export default HelloTestPage;
