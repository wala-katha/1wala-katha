import dateFormat from "@/lib/utils/dateFormat";
import { humanize, slugify } from "@/lib/utils/textConverter";
import Fuse from "fuse.js";
import React, { useEffect, useRef, useState } from "react";
import { BiCalendarEdit, BiCategoryAlt } from "react-icons/bi";
import { IoSearchOutline, IoCloseCircleOutline, IoCloseOutline } from "react-icons/io5";

export type SearchItem = {
  slug: string;
  data: any;
  content: any;
};

interface Props {
  searchList: SearchItem[];
}

interface SearchResult {
  item: SearchItem;
  refIndex: number;
}

export default function SearchBar({ searchList }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputVal, setInputVal] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(
    null,
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.currentTarget.value);
  };

  // ❌ සර්ච් එක ක්ලියර් කිරීමේ ක්‍රියාවලිය
  const handleClear = () => {
    setInputVal("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // 🚪 සර්ච් පේජ් එකෙන් සම්පූර්ණයෙන්ම පිටතට යාම (Close/Exit Search)
  const handleExitSearch = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  const fuse = new Fuse(searchList, {
    keys: ["data.title", "data.categories", "data.tags"],
    includeMatches: true,
    minMatchCharLength: 2,
    threshold: 0.5,
  });

  useEffect(() => {
    const searchUrl = new URLSearchParams(window.location.search);
    const searchStr = searchUrl.get("q");
    if (searchStr) setInputVal(searchStr);

    setTimeout(function () {
      if (inputRef.current) {
        inputRef.current.selectionStart = inputRef.current.selectionEnd =
          searchStr?.length || 0;
      }
    }, 50);
  }, []);

  useEffect(() => {
    let inputResult = inputVal.length > 2 ? fuse.search(inputVal) : [];
    setSearchResults(inputResult);

    if (inputVal.length > 0) {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("q", inputVal);
      const newRelativePathQuery =
        window.location.pathname + "?" + searchParams.toString();
      history.pushState(null, "", newRelativePathQuery);
    } else {
      history.pushState(null, "", window.location.pathname);
    }
  }, [inputVal]);

  return (
    <div className="min-h-[50vh] px-2 select-none relative">
      
      {/* 🎯 👑 PREMIUM EXIT/CLOSE SEARCH BUTTON (සර්ච් එකෙන් සම්පූර්ණයෙන්ම පිටතට යාමට) */}
      <div className="max-w-2xl mx-auto flex justify-end mb-3">
        <button
          onClick={handleExitSearch}
          type="button"
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.02] text-white/50 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/[0.05] transition-all duration-300 text-sm font-semibold outline-none group"
          title="Close Search Page"
          aria-label="Close Search Page and go back"
        >
          <span>Exit Search</span>
          <IoCloseOutline className="h-5 w-5 transform group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* 👑 PREMIUM CAPSULE SEARCH BOX WITH DYNAMIC CLOSE BUTTON */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="relative flex items-center group">
          {/* 🔍 PREMIUM ENHANCED GLOWING SEARCH ICON (කළු පසුබිමට කැපී පෙනෙන ලස්සන නිල්-කොළ ග්ලෝ එකක් දුන්නා) */}
          <div className="absolute left-4 text-[#01AD9F] drop-shadow-[0_0_8px_rgba(1,173,159,0.5)] group-focus-within:scale-110 transition-all duration-300 pointer-events-none flex items-center justify-center">
            <IoSearchOutline className="h-6 w-6 stroke-[2.5]" />
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

          {/* ❌ ඩයිනමික් ක්ලෝස් / ක්ලියර් බටන් එක (ටයිප් කළ විට පමණක් ලස්සනට මතුවේ) */}
          {inputVal.length > 0 && (
            <button
              onClick={handleClear}
              type="button"
              className="absolute right-4 text-white/40 hover:text-red-400 transition-colors duration-200 outline-none focus:text-red-400"
              title="Clear search"
              aria-label="Clear search space"
            >
              <IoCloseCircleOutline className="h-6 w-6 animate-fade-in" />
            </button>
          )}
        </div>
      </div>

      {/* SEARCH COUNTER */}
      {inputVal.length > 1 && (
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
                <a
                  href={`/${item.slug}`}
                  className="rounded-xl block overflow-hidden relative aspect-video w-full bg-white/5"
                >
                  <img
                    className="group-hover/card:scale-[1.03] transition duration-500 w-full h-full object-cover"
                    src={item.data.image}
                    alt={item.data.title}
                    loading="eager"
                    fetchpriority="high"
                    decoding="async"
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
                    {item.data.categories.map((category: string, i: number) => (
                      <a
                        key={i}
                        href={`/categories/${slugify(category)}`}
                        className="hover:text-[#01AD9F] transition duration-200"
                      >
                        {humanize(category)}
                        {i !== item.data.categories.length - 1 && ","}
                      </a>
                    ))}
                  </div>
                </li>
              </ul>

              {/* POST TITLE */}
              <h3 className="mb-2 text-lg sm:text-xl font-bold tracking-tight">
                <a
                  href={`/${item.slug}`}
                  className="block text-[#F8F8FF] hover:text-[#01AD9F] transition duration-300 line-clamp-2 leading-snug"
                >
                  {item.data.title}
                </a>
              </h3>
            </div>

            {/* POST CONTENT EXCERPT (🎯 SEO FIX: HTML tags මුලින්ම ඉවත් කර ප්ලේන් ටෙක්ස්ට් ලෙස සකසා ඇත) */}
            <p className="text-white/60 text-sm line-clamp-2 mt-2 leading-relaxed">
              {item.content ? item.content.replace(/<[^>]*>/g, '') : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
