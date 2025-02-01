export default function Navbar() {
    return (
        <nav className="bg-gradient-to-r from-green-400 via-green-450 to-blue-400 text-white">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <a href="#" className="flex items-center">
                    <img src="/images/logo.png" alt="Huddle Logo" className="h-10" />
                    <span className="ml-2 text-lg font-bold"></span>
                </a>

                {/* Hamburger Menu for Mobile */}
                <button
                    className="block lg:hidden text-white focus:outline-none"
                    type="button"
                >
                    <span className="fas fa-bars"></span>
                </button>

                {/* Navbar Links */}
                <div className="hidden lg:flex items-center space-x-4">
                    <a
                        href="#home"
                        className="text-sm font-medium hover:text-purple-700 transition duration-200"
                    >
                        Home
                    </a>
                    <a
                        href="#features"
                        className="text-sm font-medium hover:text-purple-700 transition duration-200"
                    >
                        Features
                    </a>
                    <a
                        href="#team"
                        className="text-sm font-medium hover:text-purple-700 transition duration-200"
                    >
                        Team
                    </a>
                </div>

                {/* Dropdown for Small Screens */}
                <div className="lg:hidden">
                    <button
                        className="px-4 py-2 bg-green-500 text-white rounded-md text-sm focus:outline-none"
                    >
                        Menu
                    </button>
                </div>
            </div>
        </nav>
    );
}
