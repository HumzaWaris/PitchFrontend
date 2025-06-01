import Navbar from "./components/Navbar";
import Banner from "./components/Banner";
import Features from "./components/Features";
import Team from "./components/Team";
import DownloadApp from "./components/DownloadApp";
import Footer from "./components/Footer";
export default function Home() {
    return (
        <>
            <Navbar />
            <Banner />
            <Features />
            <Team />
            <DownloadApp />
            <Footer />
        </>
    );
}
