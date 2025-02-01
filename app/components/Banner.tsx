export function Button({ children, onClick }: { children: string; onClick?: () => void }) {
    return (
        <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition duration-200" onClick={onClick}>
            {children}
        </button>
    );
}

export default function Banner() {
    return (
        <section
            id="home"
            className="bg-gradient-to-r from-green-400 via-green-450 to-blue-400 text-white min-h-screen flex items-center"
        >
            <div className="container mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Left Section: Text */}
                    <div className="text-center lg:text-left">
                        <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                            Be more engaged with your campus.
                        </h1>
                        <h6 className="mt-4 text-lg font-semibold">
                            <b>Currently @ Purdue</b>
                        </h6>
                        <p className="mt-4 text-sm lg:text-base leading-relaxed">
                            Discover events, find subleasing options, and get advice within
                            your college community. Follow your favorite clubs, get notified
                            about new events, and explore subleasing opportunities that fit
                            your budget and location, all in one convenient place.
                        </p>
                        <h6 className="mt-6 text-lg font-medium">
                            Want Huddle Social @ your college? Join the waitlist!
                        </h6>
                        <div className="mt-4 flex justify-center lg:justify-start space-x-2">
                            <input
                                type="email"
                                placeholder="example@getwaitlist.com"
                                className="w-full lg:w-auto px-4 py-2 rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <Button>Sign Up</Button> {/* Now Button is reusable */}
                        </div>
                        <p className="mt-2 text-xs text-gray-200">
                            Waitlist hosted by <b>getwaitlist.com</b>
                        </p>
                        <div className="mt-6">
                            <a
                                href="https://apps.apple.com/us/app/imboard/id6449878483"
                                className="inline-block"
                            >
                                <img
                                    src="/images/appstore.png"
                                    alt="App Store"
                                    className="h-12"
                                />
                            </a>
                        </div>
                    </div>

                    {/* Right Section: Image */}
                    <div className="text-center">
                        <img
                            src="/images/Website Huddle Image.png"
                            alt="Huddle App Preview"
                            className="mx-auto max-w-[90%] lg:max-w-full"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
