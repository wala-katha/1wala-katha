import dateFormat from "@/lib/utils/dateFormat";
import { humanize, slugify } from "@/lib/utils/textConverter";
import Fuse from "fuse.js";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { BiCalendarEdit, BiCategoryAlt } from "react-icons/bi";
import { IoSearchOutline, IoCloseCircleOutline, IoCloseOutline } from "react-svg-icons"; // (හෝ උඹේ icons)
import { IoCloseOutline as CloseIcon, IoSearchOutline as SearchIcon, IoCloseCircleOutline as ClearIcon } from "react-icons/io5";

export type SearchItem = {
  slug: string;
  data: any;
  content: any;
};

interface Props {
  searchList: SearchItem[];
}

export default function SearchBar({ searchList }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputVal, setInputVal] = useState("");

  // 👑 FIX 2: useMemo භාවිතයෙන් Fuse එක පෝස්ට් ලිස්ට් එක වෙනස් වුවහොත් පමණක් අලුතෙන් සෑදීම (Memory Safe)
  const fuse = useMemo(() => {
    return new Fuse(searchList, {
      keys: ["data.title", "data.categories", "data.tags"],
      includeMatches: true,
      minMatchCharLength: 2,
      threshold: 0.5,
    });
  }, [searchList]);

  // 🧠 SMART CRAWLING SEARCH LOGIC: අකුරු 2කට වඩා වැඩි නම් පමණක් ක්ෂණිකව සර්ච් කිරීම
  const searchResults = useMemo(() => {
    return inputVal.length > 2 ? fuse.search(inputVal) : [];
  }, [inputVal, fuse]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.currentTarget.value);
  };

  const handleClear = () => {
    setInputVal("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
    // URL එක ක්ලියර් කිරීම (Astro Safe)
    const url = new URL(window.location.href);
    url.searchParams.delete("q");
    window.history.replaceState({}, "", url.toString());
  };

  // පළමු වතාවේ URL එකේ ?q= එකක් තිබේ නම් එය Input එකට ගැනීම
  useEffect(() => {
    const searchUrl = new URLSearchParams(window.location.search);
    const searchStr = searchUrl.get("q");
    if (searchStr) {
      setInputVal(searchStr);
    }
  }, []);

  // 👑 FIX 1: Astro Router එක කඩා නොවැටෙන පරිදි URL එක සේෆ් විදිහට අප්ඩේට් කිරීම (Debounce Option)
  useEffect(() => {
    const handleUrlUpdate = setTimeout(() => {
      const url = new URL(window.location.href);
      if (inputVal.length > 0) {
        url.searchParams.set("q", inputVal);
      } else {
        url.searchParams.delete("q");
      }
      // Astro View Transitions unmount trigger නොවීම සඳහා {} ස්ටේට් එකක් පාස් කිරීම
      window.history.replaceState({ astro: true }, "", url.toString());
    }, 300); // මිලිසෙකන්ඩ් 300ක ප්‍රමදයක් දීමෙන් ටයිප් කරද්දී සිදුවන collapse වීම වළකී

    return () => clearTimeout(handleUrlUpdate);
  }, [inputVal]);

  return (
    <div className="min-h-[50vh] px-2 select-none relative">
      
      {/* EXIT CLOSE BUTTON */}
      <div className="max-w-2xl mx-auto flex justify-end mb-4">
        <a
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.08] text-white/60 hover:text-red-400 transition-all duration-300 text-sm font-semibold tracking-wide shadow-sm"
          title="Exit search and go home"
        >
          <span>Exit</span>
          <CloseIcon className="h-5 w-5" />
        </a>
      </div>

      {/* CAPSULE SEARCH BOX */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="relative flex items-center group">
          <div className="absolute left-4 text-[#01AD9F] filter drop-shadow-[0_0_8px_rgba(1,173,159,0.5)] transition-transform duration-300 pointer-events-none group-focus-within:scale-110">
            <SearchIcon className="h-6 w-6" />
          </div>

          <input
            className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-white/10 bg-white/5 text-[#F8F8FF] placeholder-white/40 outline-none transition duration-300 focus:border-[#01AD9F] focus:bg-white/[0.07] focus:shadow-[0_0_20px_rgba(1,173,159,0.15)] text-base sm:text-lg font-medium"
            placeholder="Type here to search posts..."
            type="text"
            name="search"
            value={inputVal}
            onChange={handleChange}
            autoComplete="off"
            autoFocus
            ref={inputRef}
          />

          {inputVal.length > 0 && (
            <button
              onClick={handleClear}
              type="button"
              className="absolute right-4 text-white/40 hover:text-red-400 transition-colors duration-200 outline-none focus:text-red-400"
              title="Clear search"
            >
              <ClearIcon className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      {/* SEARCH COUNTER */}
      {inputVal.length > 2 && (
        <div className="my-8 text-center text-sm sm:text-base text-white/60 font-medium tracking-wide">
          Found <span className="text-[#01AD9F] font-bold">{searchResults?.length || 0}</span>
          {searchResults?.length === 1 ? " result" : " results"} for <span className="text-[#F8F8FF] font-semibold">'{inputVal}'</span>
        </div>
      )}

      {/* RESULTS GRID */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-10">
        {searchResults?.map(({ item }) => (
          <div key={item.slug} className="group/card flex flex-col justify-between border border-white/[0.04] bg-white/[0.01] p-4 rounded-2xl hover:border-white/10 transition duration-300">
            <div>
              {item.data.image && (
                <a href={`/${item.slug}`} className="rounded-xl block overflow-hidden relative aspect-video w-full bg-white/5">
                  <img
                    className="group-hover/card:scale-[1.03] transition duration-500 w-full h-full object-cover"
                    src={item.data.image}
                    alt={item.data.title}
                    loading="lazy"
                    width={445}
                    height={230}
                  />
                </a>
              )}

              {/* POST METADATA */}
              <ul className="mt-5 mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-white/50">
                <li className="flex items-center font-medium">
                  <BiCalendarEdit className="mr-1.5 h-4 w-4 text-[#01AD9F]" />
                  <span>{dateFormat(item.data.date)}</span>
                </li>
                <li className="flex items-center font-medium">
                  <BiCategoryAlt className="mr-1.5 h-4 w-4 text-[#01AD9F]" />
                  <div className="flex flex-wrap gap-1">
                    {item.data.categories?.map((category: string, i: number) => (
                      <a key={i} href={`/categories/${slugify(category)}`} className="hover:text-[#01AD9F] transition duration-200">
                        {humanize(category)}
                        {i !== item.data.categories.length - 1 && ","}
                      </a>
                    ))}
                  </div>
                </li>
              </ul>

              {/* POST TITLE */}
              <h3 className="mb-2 text-lg sm:text-xl font-bold tracking-tight">
                <a href={`/${item.slug}`} className="block text-[#F8F8FF] hover:text-[#01AD9F] transition duration-300 line-clamp-2 leading-snug">
                  {item.data.title}
                </a>
              </h3>
            </div>

            {/* POST CONTENT EXCERPT */}
            <p className="text-white/60 text-sm line-clamp-2 mt-2 leading-relaxed">
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
