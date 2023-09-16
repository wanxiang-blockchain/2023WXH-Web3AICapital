"use client";

require("../polyfill");

import { useState, useEffect } from "react";
import { ThirdwebProvider } from "@thirdweb-dev/react";

import styles from "./home.module.scss";

import LoadingIcon from "../icons/three-dots.svg";

import { getCSSVar, useMobileScreen } from "../utils";

import dynamic from "next/dynamic";
import { Path, SlotID } from "../constant";
import { ErrorBoundary } from "./error";

import { getLang } from "../locales";

import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { SideBar } from "./sidebar";
import { useAppConfig } from "../store/config";
import { AuthPage } from "./auth";
import { getClientConfig } from "../config/client";
import LandingPage from "./landing/landing";

// This is the chainId your dApp will work on.
const activeChain = "goerli";

export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"] + " no-dark"}>
      {!props.noLogo && (
        <img src="/logo.jpeg" width={48} className={styles["loading-icon"]} />
      )}
      <LoadingIcon />
    </div>
  );
}

const Settings = dynamic(async () => (await import("./settings")).Settings, {
  loading: () => <Loading noLogo />,
});

const Chat = dynamic(async () => (await import("./chat")).Chat, {
  loading: () => <Loading noLogo />,
});

const NewChat = dynamic(async () => (await import("./new-chat")).NewChat, {
  loading: () => <Loading noLogo />,
});

const MaskPage = dynamic(async () => (await import("./mask")).MaskPage, {
  loading: () => <Loading noLogo />,
});

const Profile = dynamic(async () => (await import("./profile")).Profile, {
  loading: () => <Loading noLogo />,
});

export function useSwitchTheme() {
  const config = useAppConfig();

  useEffect(() => {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");

    if (config.theme === "dark") {
      document.body.classList.add("dark");
    } else if (config.theme === "light") {
      document.body.classList.add("light");
    }

    const metaDescriptionDark = document.querySelector(
      'meta[name="theme-color"][media*="dark"]',
    );
    const metaDescriptionLight = document.querySelector(
      'meta[name="theme-color"][media*="light"]',
    );

    if (config.theme === "auto") {
      metaDescriptionDark?.setAttribute("content", "#151515");
      metaDescriptionLight?.setAttribute("content", "#fafafa");
    } else {
      const themeColor = getCSSVar("--theme-color");
      metaDescriptionDark?.setAttribute("content", themeColor);
      metaDescriptionLight?.setAttribute("content", themeColor);
    }
  }, [config.theme]);
}

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

const loadAsyncGoogleFont = () => {
  const linkEl = document.createElement("link");
  const proxyFontUrl = "/google-fonts";
  const remoteFontUrl = "https://fonts.googleapis.com";
  const googleFontUrl =
    getClientConfig()?.buildMode === "export" ? remoteFontUrl : proxyFontUrl;
  linkEl.rel = "stylesheet";
  linkEl.href =
    googleFontUrl +
    "/css2?family=Noto+Sans+SC:wght@300;400;700;900&display=swap";
  document.head.appendChild(linkEl);
};

function Screen() {
  const config = useAppConfig();
  const location = useLocation();
  const isLanding = location.pathname === Path.Landing;
  const isHome = location.pathname === Path.Home;
  const isAuth = location.pathname === Path.Auth;
  const isMobileScreen = useMobileScreen();

  useEffect(() => {
    loadAsyncGoogleFont();
  }, []);

  return isLanding ? (
    <LandingPage />
  ) : (
    <ThirdwebProvider
      activeChain={activeChain}
      clientId={"ec6d15172173e407ff8621d541c1063f"}
      dAppMeta={{
        name: "Soul Avatars",
        description: "AI Companion with NFTs",
        logoUrl: "https://portal.thirdweb.com/assets/languages/react.png",
        url: "https://example.com",
        isDarkMode: true,
      }}
    >
      <div
        className={
          styles.container +
          ` ${
            config.tightBorder && !isMobileScreen
              ? styles["tight-container"]
              : styles.container
          } ${getLang() === "ar" ? styles["rtl-screen"] : ""}`
        }
      >
        {isAuth ? (
          <>
            <AuthPage />
          </>
        ) : (
          <>
            <SideBar className={isHome ? styles["sidebar-show"] : ""} />

            <div className={styles["window-content"]} id={SlotID.AppBody}>
              <Routes>
                <Route path={Path.Home} element={<Chat />} />
                <Route path={Path.NewChat} element={<NewChat />} />
                <Route path={Path.Masks} element={<MaskPage />} />
                <Route path={Path.Chat} element={<Chat />} />
                <Route path={Path.Settings} element={<Settings />} />
                <Route path={Path.Profile} element={<Profile />} />
              </Routes>
            </div>
          </>
        )}
      </div>
    </ThirdwebProvider>
  );
}

export function Home() {
  useSwitchTheme();

  useEffect(() => {
    console.log("[Config] got config from build time", getClientConfig());
  }, []);

  if (!useHasHydrated()) {
    return <Loading />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Screen />
      </Router>
    </ErrorBoundary>
  );
}