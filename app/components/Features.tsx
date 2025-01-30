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
        <section
            className="features-section"
            style={{
                padding: "60px 0",
                backgroundColor: "#fff",
                textAlign: "center",
            }}
        >
            <div className="container">
                {/* Section Title */}
                <div className="text-center mb-5">
                    <h3 style={{ fontWeight: "700", fontSize: "2rem" }}>Features</h3>
                    <span
                        style={{
                            display: "block",
                            width: "80px",
                            height: "4px",
                            backgroundColor: "#00b09b",
                            margin: "15px auto",
                            borderRadius: "2px",
                        }}
                    ></span>
                </div>

                {/* Features Grid */}
                <div className="row">
                    {features.map((feature, index) => (
                        <div className="col-lg-3 col-md-6 col-sm-12 mb-4" key={index}>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    textAlign: "center",
                                    padding: "20px",
                                }}
                            >
                                {/* Icon */}
                                <div
                                    style={{
                                        backgroundColor: "rgba(0, 176, 155, 0.1)",
                                        borderRadius: "50%",
                                        width: "120px",
                                        height: "120px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: "20px",
                                    }}
                                >
                                    <i
                                        className={feature.icon}
                                        style={{ fontSize: "2.5rem", color: "#00b09b" }}
                                    ></i>
                                </div>

                                {/* Title */}
                                <h5 style={{ fontWeight: "600", fontSize: "1.2rem" }}>
                                    {feature.title}
                                </h5>

                                {/* Description */}
                                <p style={{ fontSize: "1rem", color: "#666" }}>
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
