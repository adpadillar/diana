import {
  type AccessToken,
  SpotifyApi,
  type UserProfile,
} from "@spotify/web-api-ts-sdk";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import {
  useEffect,
  useState,
  createContext,
  type ReactNode,
  useContext,
} from "react";
import { db } from "~/utils/firebase/firebase";

const SdkContext = createContext<ReturnType<typeof useSdkInternal>>({
  loggedIn: false,
  sdk: null,
  loading: true,
  user: null,
});

export const SdkContextProvider = (props: { children: ReactNode }) => {
  const ctx = useSdkInternal();

  return (
    <SdkContext.Provider value={ctx}>{props.children}</SdkContext.Provider>
  );
};

export const useSdk = () => {
  const ctx = useContext(SdkContext);

  return ctx;
};

const useSdkInternal = ():
  | {
      loggedIn: true;
      user: UserProfile;
      sdk: SpotifyApi;
      loading: boolean;
    }
  | {
      loggedIn: false;
      user: null;
      sdk: null;
      loading: boolean;
    } => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sdk, setSdk] = useState<SpotifyApi | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    // When the page loads, look for the token in the params
    const url = new URL(document.location.href);
    const token = url.searchParams.get("token");

    // If token is not present, user is not logged in
    if (!token) {
      setLoggedIn(false);
      setSdk(null);
      setLoading(false);
      setUser(null);
      return;
    }

    const jsonToken = JSON.parse(token) as unknown;

    // If the token IS present, use it to create the sdk
    const newSdk = SpotifyApi.withAccessToken(
      "f8968eaa5300419f82038abec5209fc3",
      jsonToken as AccessToken,
    );

    // Create the user object in firebase (if it does not exist)
    newSdk.currentUser
      .profile()
      .then(async (user) => {
        setUser(user);
        const userDocRef = doc(db, "users", user.id);
        // TODO: Maybe filter this at some point
        await setDoc(userDocRef, user);
      })
      .catch((err) => console.warn(err));

    // clean up the url after we are done
    void router.push(
      document.location.origin + document.location.pathname,
      undefined,
      { shallow: true },
    );

    setSdk(newSdk);
    setLoggedIn(true);
    setLoading(false);
  }, []);

  // @ts-expect-error this code is (hopefully) correct
  return {
    loggedIn,
    sdk,
    loading,
    user,
  };
};
