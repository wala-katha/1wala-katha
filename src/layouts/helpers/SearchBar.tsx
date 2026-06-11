import dateFormat from "@/lib/utils/dateFormat";
import { humanize, slugify } from "@/lib/utils/textConverter";
import Fuse from "fuse.js";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BiCalendarEdit, BiCategoryAlt } from "react-icons/bi";
import {
  IoSearchOutline,
  IoCloseCircleOutline,
  IoCloseOutline,
} from "react-icons/io5";

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
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // ✅ FIX 1: Stable Fuse Instance — array length එක dependency එක ලෙස යෙදීමෙන් SSR සහ Hydration සුරක්ෂිත වේ
  const fuse = useMemo(
    () =>
      new Fuse(searchList, {
        keys: ["data.title", "data.categories", "data.tags", "content"],
        includeMatches: true,
        minMatchCharLength: 2,
        threshold: 0.4, // සෙවුම් නිරවද්‍යතාවය තවදුරටත් වැඩි දියුණු කළා
      }),
    [searchList.length]
  );

  // ✅ FIX 2: Stable Change Handlers (useCallback)
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setInputVal("");
    setSearchResults([]);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  // ✅ FIX 3: Component එක Mount වෙද්දී URL එකේ "q" පරාමිතියක් තිබේ නම් පමණක් කියවීම (No Loop)
  useEffect(() => {
    const searchStr = new URLSearchParams(window.location.search).get("q") ?? "";
    if (searchStr) {
      setInputVal(searchStr);
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart =
            inputRef.current.selectionEnd = searchStr.length;
        }
      });
    }
    
    // Astro View Transitions වලදී ආපහු පේජ් එකට එද්දී Auto Focus ලබා දීම
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  // ✅ FIX 4: Root Cause Solved — history.replaceState සම්පූර්ණයෙන් ඉවත් කර State එක පමණක් හැසිරවීම
  useEffect(() => {
    if (inputVal.trim().length > 2) {
      const results = fuse.search(inputVal.trim());
      setSearchResults(results as SearchResult[]);
    } else {
      setSearchResults([]);
    }
  }, [inputVal, fuse]);

  return (
    <div className="min-h-[50vh] px-1 select-none relative z-10">

      {/* EXIT BUTTON */}
      <div className="max-w-2xl mx-auto flex justify-end mb-4">
        <a
          href="/"
          rel="home"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-800 bg-[#0a0b0d]/60 hover:bg-neutral-800/80 text-neutral-400 hover:text-red-400 transition-all duration-300 text-sm font-semibold tracking-wide shadow-md"
          title="Exit search and go home"
          aria-label="Exit search and go home"
        >
          <span>Exit</span>
          <IoCloseOutline className="h-5 w-5" />
        </a>
      </div>

      {/* SEARCH INPUT BOX */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="relative flex items-center group">

          {/* Left Icon with Aqua Drop Shadow Glow */}
          <span 
            className="absolute left-4 z-10 text-[#01AD9F] pointer-events-none transition-transform duration-300 group-focus-within:scale-110"
            style={{ filter: "drop-shadow(0 0 8px rgba(1,173,159,0.4))" }}
          >
            <IoSearchOutline className="h-6 w-6" />
          </span>

          {/* Controlled Dark Premium Input */}
          <input
            ref={inputRef}
            type="text"
            name="q"
            value={inputVal}
            onChange={handleChange}
            placeholder="කතාවේ නම, ප්‍රවර්ගය හෝ ලේඛකයා ටයිප් කරන්න..."
            autoComplete="off"
            spellCheck={false}
            aria-label="Search posts"
            aria-autocomplete="list"
            aria-controls="search-results-list"
            aria-expanded={searchResults.length > 0}
            className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-neutral-800 bg-[#0d0e12]/90 text-[#F8F8FF] text-[17px] font-medium outline-none transition-all duration-200 focus:border-[#01AD9F] focus:bg-[#111318] focus:shadow-[0_0_25px_rgba(1,173,159,0.12)]"
          />

          {/* Clear Button */}
          {inputVal.length > 0 && (
            <button
              onClick={handleClear}
              type="button"
              className="absolute right-4 z-10 text-neutral-500 hover:text-red-400 focus:text-red-400 transition-colors duration-200"
              title="Clear search"
              aria-label="Clear search"
            >
              <IoCloseCircleOutline className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      {/* RESULT COUNT */}
      {inputVal.trim().length > 2 && (
        <div
          role="status"
          aria-live="polite"
          className="my-8 text-center text-sm sm:text-base text-neutral-400 font-medium tracking-wide"
        >
          ප්‍රතිඵල <span className="text-[#01AD9F] font-bold">{searchResults.length}</span> ක් හමු විය: <span className="text-[#F8F8FF] font-semibold">'{inputVal}'</span>
        </div>
      )}

      {/* RESULTS GRID */}
      <div
        id="search-results-list"
        role="list"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8"
      >
        {searchResults.map(({ item }) => (
          <article
            key={item.slug}
            role="listitem"
            className="group/card flex flex-col justify-between border border-neutral-800/60 bg-[#0a0b0d]/80 p-4 rounded-2xl hover:border-[#01AD9F]/30 hover:shadow-lg hover:shadow-[#01AD9F]/5 transition-all duration-300"
          >
            <div>
              {item.data.image && (
                <a
                  href={`/${item.slug}`}
                  className="rounded-xl block overflow-hidden relative aspect-video w-full bg-neutral-900"
                >
                  <img
                    className="group-hover/card:scale-[1.03] w-full h-full object-cover transition-transform duration-500"
                    src={item.data.image}
                    alt={item.data.title}
                    loading="lazy"
                    width={445}
                    height={230}
                    decoding="async"
                  />
                </a>
              )}

              {/* METADATA LIST */}
              <ul className="mt-4 mb-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-400">
                <li className="flex items-center font-medium">
                  <BiCalendarEdit className="mr-1.5 h-4 w-4 text-[#01AD9F]" />
                  <time dateTime={item.data.date}>
                    {dateFormat(item.data.date)}
                  </time>
                </li>
                {item.data.categories && item.data.categories.length > 0 && (
                  <li className="flex items-center font-medium">
                    <BiCategoryAlt className="mr-1.5 h-4 w-4 text-[#01AD9F]" />
                    <div className="flex flex-wrap gap-1">
                      {item.data.categories.map((category: string, i: number) => (
                        <a
                          key={i}
                          href={`/categories/${slugify(category)}`}
                          className="hover:text-[#01AD9F] transition-colors duration-200"
                        >
                          {humanize(category)}
                          {i !== item.data.categories.length - 1 && ","}
                        </a>
                      ))}
                    </div>
                  </li>
                )}
              </ul>

              {/* POST TITLE */}
              <h3 className="mb-2 text-base sm:text-lg font-bold tracking-tight">
                <a
                  href={`/${item.slug}`}
                  className="block text-[#F8F8FF] hover:text-[#01AD9F] line-clamp-2 leading-snug transition-colors duration-200"
                >
                  {item.data.title}
                </a>
              </h3>
            </div>

            {/* CONTENT SNIPPET */}
            <p className="text-neutral-400 text-xs sm:text-sm line-clamp-2 mt-1 leading-relaxed">
              {item.content}
            </p>
          </article>
        ))}
      </div>

      {/* EMPTY STATE */}
      {inputVal.trim().length > 2 && searchResults.length === 0 && (
        <div className="text-center py-16 text-neutral-500 text-base rounded-2xl border border-neutral-900 bg-[#07080a]">
          <p className="text-neutral-400 font-semibold">⚠️ කිසිදු ප්‍රතිඵලයක් හමු නොවීය.</p>
          <p className="text-sm mt-1 text-neutral-500">වෙනත් වචනයක් සමඟ නැවත උත්සාහ කරන්න.</p>
        </div>
      )}
    </div>
  );
}
