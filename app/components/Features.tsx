import Link from "next/link";

export default function Features() {
    const features = [
        {
            icon: "bi bi-house",
            title: "Housing",
            description:
                "Discover subleasing opportunities near your campus. Find short-term rentals that fit your budget and schedule, all in one place.",
        },
        {
            icon: "bi bi-calendar4-week",
            title: "Events",
            description:
                "Find events happening around campus. Follow your favorite clubs and get notified when new events are posted.",
            link: "/events",
        },
        {
            icon: "bi bi-robot",
            title: "Coral AI Chatbot",
            description:
                "Need advice or have general queries about classes, study spots, etc? Chat with the Coral AI bot powered by student's opinions.",
        },
        {
            icon: "bi bi-person",
            title: "Verified Community",
            description:
                "Join a verified community of college students with our app. Enjoy a trusted network for all your campus needs.",
        },
        {
            icon: "bi bi-file-earmark-text",
            title: "Schedule Rater",
            description:
                "Upload a PDF of your schedule and get a rating based on difficulty, time gaps, and efficiency to optimize your college experience.",
            link: "/schedule-rater",
        }
    ];

    return (
        <section id="features" className="bg-white py-20">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="text-center mb-16">
                    <h3 className="text-4xl font-bold text-gray-800">Features</h3>
                    <div className="mt-4 w-20 h-1 mx-auto bg-green-500 rounded"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 justify-items-center">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`text-center flex flex-col items-center space-y-4 ${index === 3 ? "md:col-span-3" : ""}`}
                        >
                            {feature.link ? (
                                <Link href={feature.link} passHref>
                                    <div className="cursor-pointer bg-gradient-to-br from-green-300 to-green-500 text-white p-8 rounded-full flex items-center justify-center w-24 h-24 shadow-lg transition-transform transform hover:scale-110">
                                        <i className={`${feature.icon} text-4xl`}></i>
                                    </div>
                                </Link>
                            ) : (
                                <div className="bg-gradient-to-br from-green-300 to-green-500 text-white p-8 rounded-full flex items-center justify-center w-24 h-24 shadow-lg">
                                    <i className={`${feature.icon} text-4xl`}></i>
                                </div>
                            )}

                            <h5 className="text-xl font-semibold text-gray-800">
                                {feature.title}
                            </h5>

                            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
