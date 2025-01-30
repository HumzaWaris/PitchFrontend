import Head from "next/head";
import Navbar from "./components/Navbar";
import Banner from "./components/Banner";
import Features from "./components/Features";
import Team from "./components/Team";
import DownloadApp from "./components/DownloadApp";

export default function Home() {
    return (
        <>
            <Head>
                <title>Huddle Social - Engage more with your campus</title>
                <meta
                    name="description"
                    content="Discover events, find subleasing options, and get advice within your college community."
                />
                <link rel="icon" href="/images/logo.png" />
            </Head>
            <Navbar />
            <Banner />
            <Features />

            <Team />
            <DownloadApp />
        </>
    );
}
