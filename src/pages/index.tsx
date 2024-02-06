import { Track } from "@spotify/web-api-ts-sdk";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Redirect } from "~/components/Redirect";
import { getTodaysRecommendation } from "~/hooks/useRecommendations";
import { useSdk } from "~/hooks/useSdk";

const Track = ({ track, audio }: { track: Track; audio: HTMLAudioElement }) => {
  const playPreview = async () => {
    if (!track.preview_url) return;

    audio.src = track.preview_url;
    audio.load();
    await audio.play();
  };

  return (
    <div className="flex items-center overflow-hidden rounded-md bg-gray-800">
      <Link href={track.external_urls.spotify}>
        <picture>
          <img
            className="h-24 min-h-24 w-24 min-w-24"
            src={track.album.images[0]?.url}
            alt={track.name + " cover"}
          />
        </picture>
      </Link>
      <div className="flex w-full items-center justify-between p-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{track.name}</h2>
          <p className="text-white/80">
            {track.artists.map((a) => a.name).join(", ")}
          </p>
        </div>
        <div>
          <button
            onClick={playPreview}
            className="rounded-md bg-green-600 px-4 py-2 font-semibold text-white"
          >
            Play
          </button>
        </div>
      </div>
    </div>
  );
};

const ActualComponent = () => {
  const [audio] = useState(new Audio());
  const { user, sdk } = useSdk();
  const { data, isLoading, error } = useQuery({
    // no automatic refetching
    refetchOnMount: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchIntervalInBackground: false,
    queryKey: ["todays-recommendation"],
    queryFn: () => {
      if (user) return getTodaysRecommendation(user, sdk);
      return null;
    },
  });

  if (isLoading) return <div>Loading...</div>;

  if (error)
    return (
      <div>
        <h1>Error</h1>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );

  return (
    <div className="min-h-screen bg-black p-8">
      <h1 className="text-2xl font-semibold text-white">
        Today&apos;s recommendations
      </h1>

      <div className="grid gap-4 pt-8">
        {data?.payload.map((track) => {
          return <Track key={track.id} track={track} audio={audio} />;
        })}
      </div>
    </div>
  );
};

export default function Home() {
  const { sdk, loggedIn, loading: sdkLoading, user } = useSdk();

  if (!sdk && !loggedIn && !sdkLoading) {
    const params = new URLSearchParams({
      source: document.location.origin + document.location.pathname,
    });

    return <Redirect href={`/api/auth/login?${params.toString()}`} />;
  }

  if (user) return <ActualComponent />;

  return <div>Loading...</div>;
}
