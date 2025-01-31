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
    ];

    return (
        <section className="features-section">
            <div className="container">
                {/* Section Title */}
                <div className="text-center mb-5">
                    <h3 className="feature-title">Features</h3>
                    <span className="line"></span>
                </div>

                {/* Features Grid */}
                <div className="features-container">
                    {features.map((feature, index) => (
                        <div className="feature-box" key={index}>
                            {/* Icon with Gradient Background */}
                            <div className="feature-icon">
                                <i className={feature.icon}></i>
                            </div>

                            {/* Title */}
                            <h5 className="feature-title">{feature.title}</h5>

                            {/* Description */}
                            <p className="feature-description">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
