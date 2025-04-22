export default function DownloadApp() {
    return (
        <section className="bg-gradient-to-r from-green-400 to-green-600 py-12">
            <div className="container mx-auto flex flex-col items-center justify-center text-center space-y-6">
                <h3 className="text-white text-2xl font-semibold">Download Our App</h3>
                <a href="https://apps.apple.com/us/app/imboard/id6449878483">
                    <img src="/images/appstore.png" alt="App Store" className="w-48 md:w-56 hover:scale-105 transition-transform rounded-2xl" />
                </a>
            </div>
        </section>
    );
}
