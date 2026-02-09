import { Geist, Geist_Mono, Prompt } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const prompt = Prompt({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["thai"],
  variable: "--font-prompt",
  display: 'swap',
});

export const metadata = {
  title: "Ducksy Web",
  description: "Terms and Policies for Ducksy",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          async
          crossOrigin="anonymous"
          src="https://tweakcn.com/embed.js"
        />
        <meta name="google-site-verification" content="5NQ1ODlHJdJXx7wgI5frj1OgBFnxpg43u94QC3ZnudQ" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${prompt.variable} font-sans antialiased bg-neutral-950 text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
