import VideosLibrary from "./VideosLibrary";
import { SEED_VIDEOS } from "./video-data";
import { pageMetadata } from "@/app/lib/metadata";

export const metadata = pageMetadata({
  title: "Videos",
  description:
    "Torah and holiday teachings — watch video lessons and classes.",
  locale: "en_US",
});

export default function VideosPage() {
  return <VideosLibrary initialVideos={SEED_VIDEOS} />;
}
