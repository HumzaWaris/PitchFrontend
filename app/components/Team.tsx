import React from 'react';

interface TeamMember {
    name: string;
    role: string;
    image: string;
}

interface Contributor {
    name: string;
    role: string;
}

const Team: React.FC = () => {
    const team: TeamMember[] = [
        { name: "Yash Khaitan", role: "Creator", image: "/images/user1.jpeg" },
        { name: "Ritwik Jayaraman", role: "Head of Automation", image: "/images/user8.png" },
        { name: "Vijay Vemulapalli", role: "Head of Automation", image: "/images/user9.jpg" },
        { name: "Siddharth Perabathini", role: "Head of iOS", image: "/images/user7.jpg" },
        { name: "Ojas Chaturvedi", role: "iOS + Automation Developer", image: "/images/user2.jpg" },
        { name: "Vishal Ramasubramanian", role: "iOS + Web Developer", image: "/images/user10.jpeg" },
        { name: "Monish Muralicharan", role: "Automation Developer", image: "/images/user14.png" },
        { name: "Seshanth Karthik", role: "Automation Developer", image: "/images/user11.jpeg" },
        { name: "Utsav Arora", role: "Web Developer", image: "/images/user12.jpg" },
        { name: "Saketh Bireddy", role: "Web Developer", image: "/images/user13.jpg" },
        { name: "Nithil Krishnaraj", role: "Web Developer", image: "/images/user15.png" },
    ];

    const pastContributors: Contributor[] = [
        { name: "Ibraheem Syed", role: "Web Developer" },
        { name: "Sai Chebrolu", role: "iOS Developer" },
        { name: "Avi Patel", role: "iOS Developer" },
        { name: "Pravin Mahendran", role: "iOS Developer" },
        { name: "Shiva Sai Vummaji", role: "iOS Developer" },
        { name: "William Kwon", role: "iOS Developer" },
        { name: "Shreya Godhani", role: "UI/UX Designer" },
    ];

    return (
        <section className="team section-padding" id="team" data-scroll-index='3'>
            <div className="container">
                {/* Current Team Section */}
                <div className="row">
                    <div className="col-md-12">
                        <div className="sectioner-header text-center">
                            <h3>Our Team</h3>
                            <span className="line"></span>
                        </div>
                        <div className="section-content text-center">
                            <div className="row">
                                {team.map((member, index) => (
                                    <div className="col-md-4" key={index}>
                                        <div className="team-detail">
                                            <img
                                                src={member.image}
                                                className="img-fluid rounded-circle"
                                                alt={member.name}
                                            />
                                            <h4>{member.name}</h4>
                                            <p>{member.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Past Contributors Section */}
                <div className="row mt-5">
                    <div className="col-md-12">
                        <div className="sectioner-header text-center">
                            <h3>Past Contributors</h3>
                            <span className="line"></span>
                        </div>
                        <div className="section-content text-center">
                            <div className="row">
                                {pastContributors.map((contributor, index) => (
                                    <div className="col-md-4" key={index}>
                                        <h4>{contributor.name}</h4>
                                        <p>{contributor.role}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Team;