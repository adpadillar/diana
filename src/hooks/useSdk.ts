import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";


export const useSdk = (): {
  loggedIn: true,
  sdk: SpotifyApi
  loading: boolean
} | {
  loggedIn: false,
  sdk: null,
  loading: boolean,
} => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sdk, setSdk] = useState<SpotifyApi | null>(null)
  const router = useRouter()

  useEffect(() => {
    // When the page loads, look for the token in the params
    const url = new URL(document.location.href);
    const token = url.searchParams.get("token");

    // If token is not present, user is not logged in
    if (!token) {
      setLoggedIn(false)
      setSdk(null)
      setLoading(false)
      return;
    }

    const jsonToken = JSON.parse(token)

    // If the token IS present, use it to create the sdk
    const newSdk = SpotifyApi.withAccessToken(
      "f8968eaa5300419f82038abec5209fc3",
      jsonToken,
    )

    // clean up the url after we are done
    router.push(
      document.location.origin + document.location.pathname,
      undefined,
      { shallow: true }
    )

    setSdk(newSdk);
    setLoggedIn(true);
    setLoading(false);
  }, [])

  // @ts-ignore because we are (maybe) sure that this is correct
  return {
    loggedIn,
    sdk,
    loading,
  }
};
