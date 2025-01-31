export default function Banner() {
    return (
        <section className="banner" id="home">
            <div className="container">
                <div className="row align-items-center">
                    {/* Left Section: Text */}
                    <div className="col-md-6 col-sm-12">
                        <div className="banner-text">
                            <h1 className="banner-title">
                                Be more engaged with your campus.
                            </h1>
                            <h6 className="banner-subtitle">
                                <b>Currently @ Purdue</b>
                            </h6>
                            <p className="banner-description">
                                Discover events, find subleasing options, and get advice within
                                your college community. Follow your favorite clubs, get notified
                                about new events, and explore subleasing opportunities that fit
                                your budget and location, all in one convenient place.
                            </p>
                            <h6 className="banner-waitlist-text">
                                Want Huddle Social @ your college? Join the waitlist!
                            </h6>
                            <div className="waitlist-form">
                                <input
                                    type="email"
                                    placeholder="example@getwaitlist.com"
                                    className="form-control"
                                />
                                <button className="btn-signup">Sign Up</button>
                            </div>
                            <p className="waitlist-host">
                                Waitlist hosted by <b>getwaitlist.com</b>
                            </p>
                            <ul className="appstore-link">
                                <li>
                                    <a href="https://apps.apple.com/us/app/imboard/id6449878483">
                                        <img
                                            src="/images/appstore.png"
                                            alt="App Store"
                                            className="appstore-img"
                                        />
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Section: Image */}
                    <div className="col-md-6 col-sm-12 text-center">
                        <img
                            src="/images/Website Huddle Image.png"
                            alt="Huddle App Preview"
                            className="banner-image"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
