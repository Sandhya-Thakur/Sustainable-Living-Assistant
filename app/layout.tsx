import type { Metadata } from "next";
import localFont from "next/font/local";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Sustainable Living Assistant",
  description: "Your personal guide to a more sustainable lifestyle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-green-300`}
        >
          <header className="p-4 ml-4 flex justify-end bg-green-900/20">
            <SignedOut>
              <SignInButton>
                <button className="px-4 py-2 bg-green-500 text-black rounded hover:bg-green-400 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "border-2 border-green-500",
                    userButtonPopoverCard: "bg-black border border-green-500",
                    userButtonPopoverActionButton: "text-green-300 hover:text-green-100",
                  },
                }}
              />
            </SignedIn>
          </header>
          <main className="p-4">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}