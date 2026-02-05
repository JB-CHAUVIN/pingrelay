"use client";

import { usePathname, useRouter } from "next/navigation";
import { i18n, type Locale, localeNames, localeFlags } from "@/i18n/config";

export default function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: Locale) => {
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, "");

    // Add new locale
    const newPath = `/${newLocale}${pathWithoutLocale}`;

    // Set cookie for persistence
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;

    router.push(newPath);
  };

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm gap-2">
        <span>{localeFlags[currentLocale]}</span>
        <span className="hidden md:inline">{localeNames[currentLocale]}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-2"
      >
        {i18n.locales.map((locale) => (
          <li key={locale}>
            <button
              onClick={() => switchLocale(locale)}
              className={`flex items-center gap-3 ${
                locale === currentLocale ? "active" : ""
              }`}
            >
              <span className="text-xl">{localeFlags[locale]}</span>
              <span>{localeNames[locale]}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
