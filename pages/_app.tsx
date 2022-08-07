import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Box, ChakraProvider, HStack, Link as ChakraLink, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { logPageView } from "../util/gtag";
import Link from "next/link";

const STUFF_PLUS_ROUTE = "/";
const STREAM_FINDER_ROUTE = "/streamFinder";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: URL) => {
      logPageView(url);
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  return (
    <ChakraProvider>
      <Box backgroundColor="teal.500" padding={2}>
        <HStack spacing={5}>
          <NavItemWithMaybeLink text="Stuff+" href={STUFF_PLUS_ROUTE} />
          <NavItemWithMaybeLink text="Stream Finder" href={STREAM_FINDER_ROUTE} />
        </HStack>
      </Box>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

interface NavItemWithMaybeLinkProps {
  href: string;
  text: string;
}
const NavItemWithMaybeLink = ({ href, text }: NavItemWithMaybeLinkProps) => {
  const router = useRouter();
  const isActive = href === router.asPath;

  const content = (
    <Text as={isActive ? "u" : undefined} fontWeight={600} size="lg" color="white">
      {text}
    </Text>
  );

  if (isActive) {
    return content;
  } else {
    return (
      <Link href={href} passHref>
        <ChakraLink color="white">{content}</ChakraLink>
      </Link>
    );
  }
};

export default MyApp;
