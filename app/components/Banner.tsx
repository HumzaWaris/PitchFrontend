export default function Banner() {
    return (
        <section
            className="banner"
            style={{
                background: "linear-gradient(135deg, #00b09b, #96c93d)",
                color: "white",
                padding: "80px 0",
            }}
            id="home"
        >
            <div className="container">
                <div className="row align-items-center">
                    {/* Left Section: Text */}
                    <div className="col-md-8 col-sm-12">
                        <div className="banner-text">
                            <h1
                                style={{
                                    fontSize: "3.5rem",
                                    fontWeight: "bold",
                                    marginBottom: "20px",
                                }}
                            >
                                Be more engaged with your campus.
                            </h1>
                            <h6
                                style={{
                                    fontSize: "1.5rem",
                                    fontWeight: "600",
                                    marginBottom: "20px",
                                }}
                            >
                                <b>Currently @ Purdue</b>
                            </h6>
                            <p
                                style={{
                                    fontSize: "1.2rem",
                                    lineHeight: "1.8",
                                    marginBottom: "30px",
                                }}
                            >
                                Discover events, find subleasing options, and get advice within
                                your college community. Follow your favorite clubs, get notified
                                about new events, and explore subleasing opportunities that fit
                                your budget and location, all in one convenient place.
                            </p>
                            <h6
                                style={{
                                    fontSize: "1.2rem",
                                    marginBottom: "15px",
                                }}
                            >
                                Want Huddle Social @ your college? Join the waitlist!
                            </h6>
                            <div
                                className="waitlist-form"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: "20px",
                                }}
                            >
                                <input
                                    type="email"
                                    placeholder="example@getwaitlist.com"
                                    className="form-control"
                                    style={{
                                        flex: "1",
                                        border: "1px solid #ccc",
                                        borderRadius: "5px",
                                        padding: "10px",
                                        marginRight: "10px",
                                        maxWidth: "70%",
                                    }}
                                />
                                <button
                                    className="btn btn-primary"
                                    style={{
                                        backgroundColor: "#007BFF",
                                        border: "none",
                                        padding: "10px 20px",
                                        borderRadius: "5px",
                                        fontWeight: "600",
                                    }}
                                >
                                    Sign Up
                                </button>
                            </div>
                            <p
                                style={{
                                    fontSize: "0.9rem",
                                    color: "rgba(255, 255, 255, 0.7)",
                                    marginBottom: "20px",
                                }}
                            >
                                Waitlist hosted by getwaitlist.com
                            </p>
                            <ul style={{ listStyle: "none", padding: 0 }}>
                                <li>
                                    <a
                                        href="https://apps.apple.com/us/app/imboard/id6449878483"
                                        style={{ textDecoration: "none" }}
                                    >
                                        <img
                                            src="/images/appstore.png"
                                            alt="App Store"
                                            className="wow fadeInUp"
                                            style={{ maxWidth: "180px" }}
                                        />
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Section: Image */}
                    <div className="col-md-4 col-sm-12 text-center">
                        <img
                            src="/images/Website Huddle Image.png"
                            alt="Huddle App Preview"
                            className="img-fluid wow fadeInUp"
                            style={{
                                maxWidth: "100%",
                                borderRadius: "15px",
                                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                            }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
