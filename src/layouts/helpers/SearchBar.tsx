import dateFormat from "@/lib/utils/dateFormat";
import { humanize, slugify } from "@/lib/utils/textConverter";
import Fuse from "fuse.js";
import React, { useEffect, useRef, useState } from "react";
import { BiCalendarEdit, BiCategoryAlt } from "react-icons/bi";

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
    <div className="min-h-[50vh] px-2 select-none">
      {/* 👑 PREMIUM DARK SEARCH INPUT: 
          කළු පසුබිමට ගැළපෙන සේ බොක්ස් එක bg-white/5 කර, ෆෝකස් වීමේදී සයිට් එකේ ප්‍රධාන Teal (#01AD9F) වර්ණයෙන් සියුම් Glow එකක් දුන්නා */}
      <div className="max-w-2xl mx-auto mb-10">
        <input
          className="w-full text-center px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-[#F8F8FF] placeholder-white/40 outline-none transition duration-300 focus:border-[#01AD9F] focus:bg-white/[0.08] focus:shadow-[0_0_15px_rgba(1,173,159,0.25)] text-base sm:text-lg font-medium"
          placeholder="Type here to search posts..."
          type="text"
          name="search"
          value={inputVal}
          onChange={handleChange}
          autoComplete="off"
          autoFocus
          ref={inputRef}
        />
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
                    loading="lazy"
                    width={445}
                    height={230}
                  />
                </a>
              )}

              {/* POST METADATA */}
              <ul className="mt-5 mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-white/50">
                <li className="flex items-center font-medium">
                  {/* 🎯 CONTRAST FIX: text-gray-600 වෙනුවට කළු පසුබිම මත පට්ටට කැපී පෙනෙන text-[#01AD9F] (Teal) පැහැය දුන්නා */}
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
