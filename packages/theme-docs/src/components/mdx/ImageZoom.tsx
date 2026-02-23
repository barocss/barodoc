import * as React from "react";
import mediumZoom from "medium-zoom";
import type { Zoom } from "medium-zoom";

interface ImageZoomProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  zoomSrc?: string;
}

export function ImageZoom({ zoomSrc, ...props }: ImageZoomProps) {
  const imgRef = React.useRef<HTMLImageElement>(null);
  const zoomRef = React.useRef<Zoom | null>(null);

  React.useEffect(() => {
    if (!imgRef.current) return;

    zoomRef.current = mediumZoom(imgRef.current, {
      margin: 24,
      background: "var(--bd-bg)",
      scrollOffset: 0,
    });

    return () => {
      zoomRef.current?.detach();
    };
  }, []);

  return (
    <img
      ref={imgRef}
      data-zoom-src={zoomSrc}
      className="bd-image-zoom"
      {...props}
    />
  );
}
