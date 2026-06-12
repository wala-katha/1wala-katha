import dateFormat from "@/lib/utils/dateFormat";
import { humanize, slugify } from "@/lib/utils/textConverter";
import Fuse from "fuse.js";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BiCalendarEdit as CalendarIcon, BiCategoryAlt as CategoryIcon } from "react-icons/bi";
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

  // 1. දත්ත ලැයිස්තුව ආරක්ෂිතව තබා ගැනීම
  const safeSearchList = useMemo(() => {
    if (!Array.isArray(searchList)) return [];
    return searchList.filter(item => item && item.slug && item.data);
  }, [searchList]);

  // 2. ✅ FIXED: Dependency එකක් ලෙස safeSearchList.length පමණක් යෙදීමෙන් Infinite Loops සම්පූර්ණයෙන් වළකී
  const fuse = useMemo(
    () =>
      new Fuse(safeSearchList, {
        keys: ["data.title", "data.categories", "data.tags", "content"],
        includeMatches: true,
        minMatchCharLength: 2,
        threshold: 0.4,
      }),
    [safeSearchList.length]
  );

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

  // URL එකෙන් පරාමිතිය කියවීම
  useEffect(() => {
    const searchStr = new URLSearchParams(window.location.search).get("q") ?? "";
    if (searchStr) {
      setInputVal(searchStr);
    }
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  // 3. ✅ FIXED: [fuse] එක dependency එකෙන් ඉවත් කර Infinite Re-renders 100%ක් නැති කළා
  useEffect(() => {
    const trimmed = inputVal.trim();
    if (trimmed.length > 2) {
      const results = fuse.search(trimmed);
      setSearchResults(results as SearchResult[]);
    } else {
      setSearchResults([]);
    }
  }, [inputVal]); // 👈 fuse එක මෙතනින් ඉවත් කළා!

  return (
    <div className="w-full select-none relative z-50">

      {/* 🛡️ STATIC CONTAINER: සර්ච් බොක්ස් එක සහ Exit බටන් එක කිසිම රෙන්ඩර් එකකින් හැංගෙන්නේ නැත */}
      <div className="w-full block">
        {/* EXIT BUTTON */}
        <div className="max-w-2xl mx-auto flex justify-end mb-4">
          <a
            href="/"
            rel="home"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-800 bg-[#0a0b0d]/60 hover:bg-neutral-800/80 text-neutral-400 hover:text-red-400 transition-all duration-300 text-sm font-semibold tracking-wide shadow-md"
            title="Exit search and go home"
          >
            <span>Exit</span>
            <IoCloseOutline className="h-5 w-5" />
          </a>
        </div>

        {/* SEARCH INPUT BOX */}
        <div className="max-w-2xl mx-auto mb-8 relative">
          <div className="relative flex items-center group w-full">
            <span 
              className="absolute left-4 z-20 text-[#01AD9F] pointer-events-none transition-transform duration-300 group-focus-within:scale-110"
              style={{ filter: "drop-shadow(0 0 8px rgba(1,173,159,0.4))" }}
            >
              <IoSearchOutline className="h-6 w-6" />
            </span>

            <input
              ref={inputRef}
              id="search-bar"
              type="text" 
              name="q"
              value={inputVal}
              onChange={handleChange}
              placeholder="කතාවේ නම, ප්‍රවර්ගය හෝ ලේඛකයා ටයිප් කරන්න..."
              autoComplete="off"
              spellCheck={false}
              aria-label="Search posts"
              className="search-input w-full pl-12 pr-12 py-3.5 rounded-xl border border-neutral-800 bg-[#0d0e12]/90 text-[#F8F8FF] text-[17px] font-medium outline-none transition-all duration-200 focus:border-[#01AD9F] focus:bg-[#111318]"
              style={{ boxSizing: "border-box" }}
            />

            {inputVal.length > 0 && (
              <button
                onClick={handleClear}
                type="button"
                className="absolute right-4 z-20 text-neutral-500 hover:text-red-400 transition-colors duration-200"
                title="Clear search"
              >
                <IoCloseCircleOutline className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RESULT COUNT */}
      {inputVal.trim().length > 2 && (
        <div
          role="status"
          className="my-6 text-center text-sm sm:text-base text-neutral-400 font-medium tracking-wide block"
        >
          ප්‍රතිඵල <span className="text-[#01AD9F] font-bold">{searchResults.length}</span> ක් හමු විය: <span className="text-[#F8F8FF] font-semibold">'{inputVal}'</span>
        </div>
      )}

      {/* DYNAMIC RESULTS CONTAINER */}
      <div
        id="search-results-list"
        role="list"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8 clear-both"
      >
        {searchResults.map(({ item }) => {
          if (!item?.slug) return null;
          const title = item?.data?.title ?? "Untitled Post";
          const image = item?.data?.image;
          const date = item?.data?.date;
          const categories = item?.data?.categories;

          return (
            <article
              key={item.slug}
              role="listitem"
              className="search-result-item group/card flex flex-col justify-between border border-neutral-800/60 bg-[#0a0b0d]/80 p-4 rounded-2xl hover:border-[#01AD9F]/30 hover:shadow-lg transition-all duration-300"
            >
              <div>
                {image && (
                  <a href={`/${item.slug}`} className="rounded-xl block overflow-hidden relative aspect-video w-full bg-neutral-900">
                    <img
                      className="group-hover/card:scale-[1.03] w-full h-full object-cover transition-transform duration-500"
                      src={image}
                      alt={title}
                      loading="lazy"
                      width={445}
                      height={230}
                    />
                  </a>
                )}

                {/* METADATA */}
                <ul className="mt-4 mb-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-400">
                  {date && (
                    <li className="flex items-center font-medium">
                      <CalendarIcon className="mr-1.5 h-4 w-4 text-[#01AD9F]" />
                      <time dateTime={date}>{dateFormat(date)}</time>
                    </li>
                  )}
                  {Array.isArray(categories) && categories.length > 0 && (
                    <li className="flex items-center font-medium">
                      <CategoryIcon className="mr-1.5 h-4 w-4 text-[#01AD9F]" />
                      <div className="flex flex-wrap gap-1">
                        {categories.map((category: string, i: number) => {
                          if (!category) return null;
                          return (
                            <a
                              key={i}
                              href={`/categories/${slugify(category)}`}
                              className="hover:text-[#01AD9F] transition-colors duration-200"
                            >
                              {humanize(category)}
                              {i !== categories.length - 1 && ","}
                            </a>
                          );
                        })}
                      </div>
                    </li>
                  )}
                </ul>

                {/* TITLE */}
                <h3 className="mb-2 text-base sm:text-lg font-bold">
                  <a href={`/${item.slug}`} className="block text-[#F8F8FF] hover:text-[#01AD9F] line-clamp-2 transition-colors duration-200">
                    {title}
                  </a>
                </h3>
              </div>

              {/* SNIPPET */}
              <p className="text-neutral-400 text-xs sm:text-sm line-clamp-2 mt-1">
                {item.content ?? ""}
              </p>
            </article>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {inputVal.trim().length > 2 && searchResults.length === 0 && (
        <div className="text-center py-16 text-neutral-500 text-base rounded-2xl border border-neutral-900 bg-[#07080a] block">
          <p className="text-neutral-400 font-semibold">⚠️ කිසිදු ප්‍රතිඵලයක් හමු නොවීය.</p>
        </div>
      )}
    </div>
  );
}
