import { useRouter } from "next/router";
import { useEffect } from "react";

export const Redirect = ({ href }: { href: string }) => {
  const router = useRouter();

  useEffect(() => {
    console.log("calling redirect to:", href);
    void router.push(href);
  }, [router, href]);

  return <></>;
};
