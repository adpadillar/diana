import { type SimplifiedPlaylist, type SpotifyApi } from "@spotify/web-api-ts-sdk";
import { useState } from "react";
import { Redirect } from "~/components/Redirect";
import { useSdk } from "~/hooks/useSdk";

const Playlist = (props: {playlist: SimplifiedPlaylist, sdk: SpotifyApi}) => {
  const {sdk, playlist} = props

  const getPlaylistSongs = async () => {
    const res = await sdk.playlists.getPlaylistItems(playlist.id, "MX")   

    console.log(res.items);
  }

  return (
    <div className="bg-gray-700 p-4 rounded-md text-white flex flex-col space-y-2">
      <h2>{playlist.name}</h2>
      <p>{playlist.description || "No description"}</p>
      <button 
        onClick={getPlaylistSongs}
        className="px-3 py-2 bg-green-500 text-white font-semibold rounded-md"
      >
        Log the songs in this playlist
      </button>
    </div>
  )
}

export default function Home() {
  const {sdk, loggedIn, loading} = useSdk(); 
  const [playlists, setPlaylists] = useState<SimplifiedPlaylist[]>([])

  const getPlaylists = async () => {
    if (!sdk) return; 
    const res = await sdk.currentUser.playlists.playlists()

    setPlaylists(res.items);
  }

  // make sure sdk is defined 
  if (sdk && !loading) {
    return (
      <div className="bg-black p-8 min-h-screen flex flex-col space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-semibold text-white">Yay! You are logged in now</h1>
          <p className="text-white text-xl">Click this button to do something cool...</p>
          <div>
            <button
              className="px-3 py-2 bg-green-500 text-white font-semibold rounded-md"
              onClick={getPlaylists}
            >
              Click me
            </button>
          </div>
        </div>
        <div className="flex flex-col space-y-4">
          <h1 className="text-2xl font-semibold text-white">Your playlists:</h1>
          <div className="grid-cols-3 grid gap-4">
            {playlists.map(p => <Playlist playlist={p} key={p.id} sdk={sdk} />)}
          </div>
        </div>
      </div>
    );
  }
  

  // redirect to login if user is not logged in
  if (!loggedIn && !loading) {
    return <Redirect href="/api/auth/login" />
  }

  // return null in impossible state
  return null
}
