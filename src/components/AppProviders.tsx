"use client";

import { I18nProvider } from "@/lib/i18n";
import { UIProvider } from "@/lib/ui";
import { ContactFloat } from "@/components/ContactFloat";
import { PickMatch } from "@/components/PickMatch";
import { Toast, WeChatModal } from "@/components/WeChatModal";
import { WeChatBrowserGuide } from "@/components/WeChatBrowserGuide";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <UIProvider>
        {children}
        <ContactFloat />
        <PickMatch />
        <WeChatModal />
        <Toast />
        <WeChatBrowserGuide />
      </UIProvider>
    </I18nProvider>
  );
}
