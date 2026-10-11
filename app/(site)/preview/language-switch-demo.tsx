"use client";

import { useState } from "react";
import { LanguageSwitch } from "@/components/diner/language-switch";
import type { Locale } from "@/lib/i18n";

// On the diner menu this sets a cookie and re-renders; here it only shows the control's states.
export function LanguageSwitchDemo({ initial }: { initial: Locale }) {
  const [value, setValue] = useState(initial);
  return <LanguageSwitch value={value} onChange={setValue} />;
}
