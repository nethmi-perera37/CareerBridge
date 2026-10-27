
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/internships";

const emptyForm = {
  title: "",
  company: "",
  location: "",
  type: "On-site",
  description: "",
  requirements: "",
  deadline: "",
};

function App() {
  // Internship data
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Internship details
  const [selectedInternship, setSelectedInternship] = useState(null);

  // Add and Edit form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // READ: Load internships from MongoDB
  useEffect(() => {
    async function fetchInternships() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Unable to load internships.");
        }

        const data = await response.json();
        setInternships(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchInternships();
  }, []);

  // Search by internship title, company or location
  const filteredInternships = internships.filter((internship) => {
    const keyword = searchTerm.toLowerCase();

    return (
      internship.title?.toLowerCase().includes(keyword) ||
      internship.company?.toLowerCase().includes(keyword) ||
      internship.location?.toLowerCase().includes(keyword)
    );
  });

  function handleSearch(event) {
    event.preventDefault();
    setSearchTerm(search.trim());

    document.getElementById("internships")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData({ ...emptyForm });
    setFormError("");
  }

  function handleNewInternship() {
    if (showForm) {
      handleCancelForm();
    } else {
      setEditingId(null);
      setFormData({ ...emptyForm });
      setFormError("");
      setShowForm(true);
    }
  }

  // CREATE or UPDATE internship
  async function handleSaveInternship(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setFormError("");

    try {
      const isEditing = Boolean(editingId);

      const url = isEditing
        ? `${API_URL}/${editingId}`
        : API_URL;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
          (isEditing
            ? "Failed to update internship."
            : "Failed to add internship.")
        );
      }

      if (isEditing) {
        setInternships((previous) =>
          previous.map((internship) =>
            internship._id === editingId ? result : internship
          )
        );

        // Update details if this internship is currently selected
        setSelectedInternship((previous) =>
          previous?._id === editingId ? result : previous
        );
      } else {
        setInternships((previous) => [result, ...previous]);
      }

      handleCancelForm();
      setSearch("");
      setSearchTerm("");

      alert(
        isEditing
          ? "Internship updated successfully!"
          : "Internship added successfully!"
      );
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Open the form with existing internship information
  function handleEditInternship(internship) {
    setEditingId(internship._id);

    setFormData({
      title: internship.title || "",
      company: internship.company || "",
      location: internship.location || "",
      type: internship.type || "On-site",
      description: internship.description || "",
      requirements: internship.requirements || "",
      deadline: internship.deadline
        ? internship.deadline.slice(0, 10)
        : "",
    });

    setFormError("");
    setShowForm(true);

    document.getElementById("internships")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  // DELETE internship from MongoDB
  async function handleDeleteInternship(id) {
    if (deletingId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this internship? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete internship.");
      }

      setInternships((previous) =>
        previous.filter((internship) => internship._id !== id)
      );

      setSelectedInternship((previous) =>
        previous?._id === id ? null : previous
      );

      if (editingId === id) {
        handleCancelForm();
      }

      alert("Internship deleted successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="app">
      {/* NAVIGATION */}
      <nav className="navbar">
        <h2>CareerBridge</h2>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#internships">Internships</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-buttons">
          <button type="button">Login</button>
          <button type="button" className="primary-btn">
            Register
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero" id="home">
        <h1>Find Your Dream Internship</h1>

        <p>
          Connect with companies and discover internship
          opportunities that match your career goals.
        </p>

        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search internships..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <button type="submit" className="primary-btn">
            Search
          </button>
        </form>
      </section>

      {/* INTERNSHIP SECTION */}
      <section className="internships" id="internships">
        <h2>Latest Internship Opportunities</h2>

        <button
          type="button"
          className="primary-btn"
          onClick={handleNewInternship}
          disabled={saving}
        >
          {showForm ? "Cancel" : "+ Post an Internship"}
        </button>

        {/* ADD / EDIT FORM */}
        {showForm && (
          <form
            className="internship-form"
            onSubmit={handleSaveInternship}
          >
            <h3>
              {editingId
                ? "Edit Internship"
                : "Post a New Internship"}
            </h3>

            <label htmlFor="title">Internship Title</label>
            <input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. Electrical Engineering Intern"
              required
            />

            <label htmlFor="company">Company Name</label>
            <input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              placeholder="e.g. ABC Engineering"
              required
            />

            <label htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g. Colombo"
              required
            />

            <label htmlFor="type">Internship Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
            >
              <option value="On-site">On-site</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
            </select>

            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the internship responsibilities"
              rows="4"
              required
            />

            <label htmlFor="requirements">Requirements</label>
            <textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              placeholder="e.g. Undergraduate in Electrical Engineering"
              rows="3"
            />

            <label htmlFor="deadline">Application Deadline</label>
            <input
              id="deadline"
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleInputChange}
              required
            />

            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}

            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Internship"
                : "Post Internship"}
            </button>
          </form>
        )}

        {/* LOADING AND ERROR MESSAGES */}
        {loading && <p>Loading internships...</p>}

        {error && (
          <p className="form-error" role="alert">
            {error} Please check that your backend is running.
          </p>
        )}

        {!loading &&
          !error &&
          filteredInternships.length === 0 && (
            <p>
              {searchTerm
                ? "No internships match your search."
                : "No internships available yet."}
            </p>
          )}

        {/* INTERNSHIP CARDS */}
        {!loading && !error && (
          <div className="internship-grid">
            {filteredInternships.map((internship) => (
              <div
                className="internship-card"
                key={internship._id}
              >
                <h3>{internship.title}</h3>

                <p>{internship.company}</p>

                <p>Location: {internship.location}</p>

                <p>Type: {internship.type}</p>

                <button
                  type="button"
                  className="primary-btn"
                  onClick={() =>
                    setSelectedInternship(internship)
                  }
                >
                  View Details
                </button>

                <div className="card-actions">
                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() =>
                      handleEditInternship(internship)
                    }
                    disabled={saving || Boolean(deletingId)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() =>
                      handleDeleteInternship(internship._id)
                    }
                    disabled={saving || Boolean(deletingId)}
                  >
                    {deletingId === internship._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW DETAILS */}
        {selectedInternship && (
          <div className="internship-details">
            <h3>{selectedInternship.title}</h3>

            <p>
              <strong>Company:</strong>{" "}
              {selectedInternship.company}
            </p>

            <p>
              <strong>Location:</strong>{" "}
              {selectedInternship.location}
            </p>

            <p>
              <strong>Type:</strong>{" "}
              {selectedInternship.type}
            </p>

            <p>
              <strong>Description:</strong>{" "}
              {selectedInternship.description}
            </p>

            <p>
              <strong>Requirements:</strong>{" "}
              {selectedInternship.requirements ||
                "Not specified"}
            </p>

            <p>
              <strong>Deadline:</strong>{" "}
              {selectedInternship.deadline
                ? new Date(
                    selectedInternship.deadline
                  ).toLocaleDateString()
                : "Not specified"}
            </p>

            <button
              type="button"
              className="primary-btn"
              onClick={() => setSelectedInternship(null)}
            >
              Close Details
            </button>
          </div>
        )}
      </section>

      {/* ABOUT SECTION */}
      <section className="about" id="about">
        <h2>About CareerBridge</h2>

        <p>
          CareerBridge helps students discover internships
          and enables companies to connect with talented
          future professionals.
        </p>
      </section>

      {/* FOOTER */}
      <footer>
        <p>© 2026 CareerBridge. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
