import React, { useEffect } from "react";

interface YoutubeProps {
  id: string;
  title: string;
  uploadDate?: string; // SEO සඳහා dynamic අප්ලෝඩ් දිනයක් දීමට
  [key: string]: any;
}

const Youtube = ({
  id,
  title,
  uploadDate = "2026-06-08T00:00:00+05:30", // ඩිෆෝල්ට් අද දිනය (ISO Format)
  ...rest
}: YoutubeProps) => {
  
  useEffect(() => {
    // සයිට් එකේ Speed එක උපරිම කිරීමට Lazy Load වෙබ් කම්පෝනන්ට් එකක් ලෙස ඉම්පෝර්ට් කිරීම
    import("@justinribeiro/lite-youtube");
  }, []);

  // YouTube thumbnail සහ embed URL එක ස්මාර්ට් විදිහට සකස් කිරීම
  const thumbnailUrl = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${id}`;

  return (
    <div 
      className="youtube-wrapper my-6 overflow-hidden rounded-2xl border border-neutral-800/80 bg-[#0a0b0d] p-1 transition-all duration-300 hover:border-[#01AD9F]/30 hover:shadow-lg hover:shadow-[#01AD9F]/5"
      itemScope 
      itemType="https://schema.org/VideoObject"
    >
      {/* 📊 Google Video SEO සඳහා අවශ්‍ය සැඟවුණු මෙටා ඩේටා (Dynamic) */}
      <meta itemProp="name" content={title} />
      <meta itemProp="description" content={`${title} - Watch High Quality Video on Wal Katha`} />
      <meta itemProp="thumbnailUrl" content={thumbnailUrl} />
      <meta itemProp="embedUrl" content={embedUrl} />
      <meta itemProp="uploadDate" content={uploadDate} />

      {/* 🎬 ASPECT-VIDEO FOR 100% STABLE RENDERING (NO LAYOUT SHIFT) */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
        {/* @ts-ignore */}
        <lite-youtube 
          className="absolute top-0 left-0 w-full h-full border-0" 
          videoid={id} 
          videotitle={title} 
          {...rest} 
        />
      </div>
    </div>
  );
};

export default Youtube;
