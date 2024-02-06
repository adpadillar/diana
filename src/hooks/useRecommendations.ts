import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "~/utils/firebase/firebase";
import {
  type SpotifyApi,
  type Track,
  type UserProfile,
} from "@spotify/web-api-ts-sdk";

type Recommendation = {
  timestamp: number;
  id: string; // date as a string
  payload: Track[];
};

export const getDateId = (date = new Date()) => {
  const yyyy = date.toLocaleString("default", { year: "numeric" });
  const mm = date.toLocaleString("default", { month: "2-digit" });
  const dd = date.toLocaleString("default", { day: "2-digit" });

  return `${yyyy}-${mm}-${dd}`;
};

export const createTodaysRecommendation = async (sdk: SpotifyApi) => {
  const { items: topArtists } = await sdk.currentUser.topItems(
    "artists",
    "short_term",
    5,
  );

  console.log(topArtists);

  const seed_artists = topArtists.map((a) => a.id);

  const { tracks } = await sdk.recommendations.get({
    market: "MX",
    limit: 50,
    seed_artists,
  });

  const adjusted_tracks = tracks.filter((t) => {
    const authors = t.artists;

    for (const a of authors) {
      if (seed_artists.includes(a.id)) {
        return false;
      }
    }

    return true;
  });

  const unknown_tracks = adjusted_tracks
    .sort((t1, t2) => t1.popularity - t2.popularity)
    .slice(0, 5);

  unknown_tracks.forEach((t) => {
    console.log(t.name + ",", t.artists[0]?.name, t.external_urls.spotify);
  });

  const newRecommendation: Recommendation = {
    timestamp: new Date().getTime(),
    id: getDateId(),
    payload: unknown_tracks,
  };

  return newRecommendation;
};

export const getTodaysRecommendation = async (
  user: UserProfile,
  sdk: SpotifyApi,
) => {
  const docRef = doc(db, "users", user.id, "recommendations", getDateId());
  // const docRes = await getDoc(docRef);

  // Create the recommendation!
  const newRecommendation = await createTodaysRecommendation(sdk);

  // Temporarely always generate a new recommendation
  //if (docRes.exists()) {
  //  return { ...docRes.data(), id: docRes.id } as Recommendation;
  //}

  // store new recommendation in db;
  await setDoc(docRef, newRecommendation);

  // return new recommendation
  return newRecommendation;
};

export const getUserRecommendations = async (user: UserProfile) => {
  const recommendations: Recommendation[] = [];
  const recommendationsCollection = collection(
    db,
    "users",
    user.id,
    "recommendations",
  );

  const querySnapshot = await getDocs(recommendationsCollection);
  querySnapshot.forEach((doc) => {
    const data = { ...doc.data(), id: doc.id } as Recommendation;
    recommendations.push(data);
  });

  return recommendations;
};
