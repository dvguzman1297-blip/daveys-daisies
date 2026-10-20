import type { Metadata, Viewport } from "next";
import { Caveat, Fraunces, Nunito } from "next/font/google";
import { MotionProvider } from "@/components/MotionProvider";
import { SvgDefs } from "@/components/SvgDefs";
import "./globals.css";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Davey's Daisies — Send Virtual Flowers & Letters",
    template: "%s · Davey's Daisies",
  },
  description:
    "Arrange a digital bouquet, write a heartfelt letter, and share it with someone you love.",
};

export const viewport: Viewport = {
  themeColor: "#fbf7ee",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${fraunces.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <SvgDefs />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
