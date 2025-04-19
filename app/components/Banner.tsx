export function Button({ children, onClick }: { children: string; onClick?: () => void }) {
    return (
        <button
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition duration-200"
            onClick={onClick}
        >
            {children}
        </button>
    );
}

export default function Banner() {
    return (
        <section
            id="home"
            className="relative bg-gradient-to-r from-green-400 via-green-450 to-blue-400 text-white min-h-screen flex items-center overflow-hidden"
        >
            <svg
                className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1000 500"
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(255, 255, 255, 0.12)" />
                        <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
                    </linearGradient>
                </defs>

                <g>
                    <circle cx="100" cy="100" r="20" fill="url(#circleGradient)" className="animate-floating" />
                    <circle cx="280" cy="230" r="14" fill="url(#circleGradient)" className="animate-pulse delay-500" />
                    <circle
                        cx="460"
                        cy="90"
                        r="18"
                        fill="url(#circleGradient)"
                        className="animate-floating delay-200"
                    />
                    <circle cx="640" cy="280" r="22" fill="url(#circleGradient)" className="animate-pulse-slow" />
                    <circle
                        cx="820"
                        cy="150"
                        r="12"
                        fill="url(#circleGradient)"
                        className="animate-floating delay-1000"
                    />
                </g>

                <g stroke="url(#circleGradient)" strokeWidth="1.5" fill="none">
                    <circle cx="180" cy="400" r="30" className="animate-scaleBlur" />
                    <circle cx="380" cy="350" r="20" className="animate-scaleBlur delay-300" />
                    <circle cx="720" cy="100" r="25" className="animate-scaleBlur delay-700" />
                </g>
            </svg>

            <div className="relative z-10 container mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Left Section: Text */}
                    <div className="text-center lg:text-left">
                        <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                            Be more engaged with your campus.
                        </h1>
                        <h6 className="mt-4 text-lg font-semibold">
                            <b>Currently @ Purdue and IU</b>
                        </h6>
                        <p className="mt-4 text-sm lg:text-base leading-relaxed">
                            Discover events, find subleasing options, and get advice within your college community.
                            Follow your favorite clubs, get notified about new events, and explore subleasing
                            opportunities that fit your budget and location, all in one convenient place.
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
                            <Button>Sign Up</Button>
                        </div>
                        <p className="mt-2 text-xs text-gray-200">
                            Waitlist hosted by <b>getwaitlist.com</b>
                        </p>
                        <div className="mt-6">
                            <a
                                href="https://apps.apple.com/us/app/imboard/id6449878483"
                                className="inline-block rounded-xl overflow-hidden shadow-md transition-transform hover:scale-105"
                            >
                                <img src="/images/appstore.png" alt="App Store" className="h-12 rounded-xl" />
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
