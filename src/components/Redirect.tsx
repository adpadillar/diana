import { useRouter } from "next/router"
import { useEffect } from "react"

export const Redirect = ({href}: {href: string}) => {
  const router = useRouter()

  useEffect(() => {
    router.push(href)
  }, []);

  return <></>
}
