import "./App.css";

function App() {
  return (
    <div className="app">
      <nav className="navbar">
      <h2>CareerBridge</h2>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#internships">Internships</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-buttons">
          <button>Login</button>
          <button className="primary-btn">Register</button>
        </div>
      </nav>

      <section className="hero" id="home">
        <h1>Find Your Dream Internship</h1>
        <p>
          Connect with companies and discover internship
          opportunities that match your career goals.
        </p>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search internships..."
          />
          <button className="primary-btn">Search</button>
        </div>
      </section>

      <section className="internships" id="internships">
        <h2>Latest Internship Opportunities</h2>

        <div className="internship-grid">
          <div className="internship-card">
            <h3>Software Engineering Intern</h3>
            <p>Tech Solutions Pvt Ltd</p>
            <p>Location: Colombo</p>
            <p>Duration: 6 Months</p>
            <button className="primary-btn">View Details</button>
          </div>

          <div className="internship-card">
            <h3>Electrical Engineering Intern</h3>
            <p>Power Engineering Ltd</p>
            <p>Location: Kandy</p>
            <p>Duration: 6 Months</p>
            <button className="primary-btn">View Details</button>
          </div>

          <div className="internship-card">
            <h3>Business Analyst Intern</h3>
            <p>Business Tech Lanka</p>
            <p>Location: Gampaha</p>
            <p>Duration: 3 Months</p>
            <button className="primary-btn">View Details</button>
          </div>
        </div>
      </section>

      <section className="about" id="about">
        <h2>About InternConnect</h2>
        <p>
          InternConnect helps students discover internships
          and enables companies to connect with talented
          future professionals.
        </p>
      </section>

      <footer>
      <p>© 2026 CareerBridge. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;