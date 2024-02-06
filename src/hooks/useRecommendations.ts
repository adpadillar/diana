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

// generate random number between two integers
function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const getDateId = (date = new Date()) => {
  const yyyy = date.toLocaleString("default", { year: "numeric" });
  const mm = date.toLocaleString("default", { month: "2-digit" });
  const dd = date.toLocaleString("default", { day: "2-digit" });

  return `${yyyy}-${mm}-${dd}`;
};

export const createTodaysRecommendation = async (sdk: SpotifyApi) => {
  // Step 1: Get top k artists long term
  // -> This'll hopefully cover all of the main artists the user knows
  const { items: topArtists } = await sdk.currentUser.topItems(
    "artists",
    "long_term",
    50,
  );

  // Step 2: Pick a slightly different 5 artist set each day
  // -> TODO: Make this better
  const bottom_idx = getRandomInt(0, topArtists.length - 6);
  const seed_artists = topArtists.slice(bottom_idx, bottom_idx + 5);

  console.log(seed_artists);

  // Step 3: Get track recommendations
  const { tracks } = await sdk.recommendations.get({
    market: "MX",
    limit: 100,
    seed_artists: seed_artists.map((a) => a.id),
  });

  // Step 4: Filter recommendations depending on artists the user knows
  const topTenArtistsIds = topArtists.slice(0, 10).map((a) => a.id);
  const allOtherArtistsIds = topArtists
    .map((a) => a.id)
    .slice(10, topArtists.length);

  // -> Completely filter out tracks by top 10 artists
  const filtered_tracks = tracks.filter((t) => {
    for (const a of t.artists) {
      if (topTenArtistsIds.includes(a.id)) {
        return false;
      }
    }
    return true;
  });

  // -> Downrank songs by other top k artists
  const adjusted_tracks = filtered_tracks.map((t) => {
    let popularityPenalty = 0;
    for (const a of t.artists) {
      if (allOtherArtistsIds.includes(a.id)) {
        popularityPenalty += 10;
      }
    }

    // we add the popularity instead of subtracting because
    // we consider less popular songs better
    return { ...t, popularity: t.popularity + popularityPenalty };
  });

  // Step 6. Remove all recommended songs that the user has saved
  const topFiftyRecommendations = adjusted_tracks
    .sort((t1, t2) => t1.popularity - t2.popularity)
    .slice(0, 50);

  // -> This hopefully helps us find new music instead of recommending saved tracks
  const savedStatus = await sdk.currentUser.tracks.hasSavedTracks(
    topFiftyRecommendations.map((t) => t.id),
  );

  // -> Only recover top 10 recommendations, serve that to the user
  const unknown_tracks = topFiftyRecommendations
    .filter((_, idx) => !savedStatus[idx])
    .slice(0, 10);

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
