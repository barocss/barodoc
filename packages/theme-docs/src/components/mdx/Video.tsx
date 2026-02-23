import * as React from "react";
import { cn } from "../../lib/utils.js";

interface VideoProps {
  url: string;
  title?: string;
  caption?: string;
  className?: string;
}

function parseVideoUrl(url: string): { provider: string; embedUrl: string } | null {
  // YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return {
      provider: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0`,
    };
  }

  // Vimeo: vimeo.com/ID, player.vimeo.com/video/ID
  const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
  if (vimeoMatch) {
    return {
      provider: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?dnt=1`,
    };
  }

  // Loom: loom.com/share/ID, loom.com/embed/ID
  const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([a-f0-9]+)/);
  if (loomMatch) {
    return {
      provider: "loom",
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
    };
  }

  return null;
}

export function Video({ url, title, caption, className }: VideoProps) {
  const parsed = parseVideoUrl(url);

  if (!parsed) {
    return (
      <div className={cn("bd-video", className)} style={{ paddingTop: 0, padding: "2rem" }}>
        <p style={{ color: "var(--bd-text-muted)", margin: 0, textAlign: "center" }}>
          Unsupported video URL: {url}
        </p>
      </div>
    );
  }

  return (
    <figure className={className}>
      <div className="bd-video">
        <iframe
          src={parsed.embedUrl}
          title={title || `${parsed.provider} video`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      {caption && <figcaption className="bd-video-caption">{caption}</figcaption>}
    </figure>
  );
}
