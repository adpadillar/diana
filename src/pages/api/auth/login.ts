// /api/auth/login

import { env } from "~/env";

export const runtime = "edge"

export const generateRandomString = (len: number) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

const handler = () => {
  const scope = "streaming \
                 user-read-email \
                 user-read-private"

  const state = generateRandomString(16);
  const redirect_uri = env.VERCEL_URL
    ? `${env.VERCEL_URL}/api/auth/callback/`
    : `http://localhost:${env.PORT}/api/auth/callback/`

  const auth_query_params = new URLSearchParams({
    response_type: "code",
    client_id: env.SPOTIFY_CLIENT_ID,
    scope,
    redirect_uri, 
    state,
  })

  return Response.redirect('https://accounts.spotify.com/authorize/?' + auth_query_params.toString())

}

export default handler;

