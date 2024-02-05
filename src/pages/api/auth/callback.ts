// /api/auth/callback

import { env } from "~/env";

export const runtime = "edge";

const handler = async (req: Request) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code) return new Response("Missing code", { status: 400 });
  if (!state) return new Response("Missing state", { status: 400 });

  const callback_uri = env.VERCEL_URL
    ? `https://diana.axelpadilla.me/api/auth/callback/`
    : `http://localhost:${env.PORT}/api/auth/callback/`;

  const params = new URLSearchParams({
    code: code,
    redirect_uri: callback_uri,
    grant_type: "authorization_code",
  });

  const res = await fetch(
    "https://accounts.spotify.com/api/token?" + params.toString(),
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            env.SPOTIFY_CLIENT_ID + ":" + env.SPOTIFY_CLIENT_SECRET,
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    },
  );

  const json = (await res.json()) as unknown as Record<string, string | number>;

  const redirect_url = env.VERCEL_URL
    ? `${env.VERCEL_URL}/?`
    : `http://localhost:${env.PORT}/?`;

  // TODO: Push to a client route where we can create the sdk but then redirect to where we were
  return Response.redirect(
    redirect_url +
      new URLSearchParams({
        token: JSON.stringify({ ...json, scope: undefined }),
      }).toString(),
  );
};

export default handler;
