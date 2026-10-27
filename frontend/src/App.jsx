import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/internships";
const AUTH_URL = "http://localhost:5000/api/auth";
const APPLICATION_URL = "http://localhost:5000/api/applications";

const emptyForm = {
  title: "",
  company: "",
  location: "",
  type: "On-site",
  description: "",
  requirements: "",
  deadline: "",
};

const emptyAuthForm = {
  name: "",
  email: "",
  password: "",
  role: "student",
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

  // Internship CRUD
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Authentication
  const [authMode, setAuthMode] = useState(null);
  const [authForm, setAuthForm] = useState({ ...emptyAuthForm });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState("");

  // Student application state
  const [applyingInternship, setApplyingInternship] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applicationError, setApplicationError] = useState("");
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [myApplications, setMyApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  // Company application review state
  const [reviewingInternship, setReviewingInternship] = useState(null);
  const [companyApplications, setCompanyApplications] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [applicantError, setApplicantError] = useState("");
  const [updatingApplicationId, setUpdatingApplicationId] = useState(null);

  // Permissions
  const isCompany = currentUser?.role === "company";
  const isStudent = currentUser?.role === "student";

  function canManageInternship(internship) {
    return (
      isCompany &&
      Boolean(currentUser?.id) &&
      String(internship.postedBy || "") === String(currentUser.id)
    );
  }

  function hasApplied(internshipId) {
    return myApplications.some(
      (application) =>
        (application.internship?._id || application.internship) ===
        internshipId
    );
  }

  // READ - Fetch internships
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

  // Search internships
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

  // Open login or registration form
  function openAuthForm(mode) {
    setAuthMode(mode);
    setAuthForm({ ...emptyAuthForm });
    setAuthError("");
  }

  function handleAuthInputChange(event) {
    const { name, value } = event.target;

    setAuthForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Fetch the logged-in student's applications
  async function fetchMyApplications(authToken) {
    setLoadingApplications(true);
    setApplicationError("");

    try {
      const response = await fetch(`${APPLICATION_URL}/my`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load applications."
        );
      }

      setMyApplications(result);
    } catch (err) {
      setApplicationError(err.message);
    } finally {
      setLoadingApplications(false);
    }
  }

  // REGISTER or LOGIN
  async function handleAuthSubmit(event) {
    event.preventDefault();

    if (authLoading) return;

    setAuthLoading(true);
    setAuthError("");

    try {
      const endpoint =
        authMode === "register" ? "register" : "login";

      const payload =
        authMode === "register"
          ? authForm
          : {
              email: authForm.email,
              password: authForm.password,
            };

      const response = await fetch(`${AUTH_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Authentication failed."
        );
      }

      setCurrentUser(result.user);
      setToken(result.token);
      setAuthMode(null);
      setAuthForm({ ...emptyAuthForm });
      setApplicationError("");
      setApplyingInternship(null);
      setReviewingInternship(null);
      setCompanyApplications([]);
      setApplicantError("");

      if (result.user.role === "student") {
        await fetchMyApplications(result.token);
      } else {
        setMyApplications([]);
      }

      alert(
        authMode === "register"
          ? "Registration successful! You are now logged in."
          : "Login successful!"
      );
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    setCurrentUser(null);
    setToken("");
    setAuthMode(null);

    handleCancelForm();

    setApplyingInternship(null);
    setCoverLetter("");
    setApplicationError("");
    setMyApplications([]);
    setLoadingApplications(false);
    setReviewingInternship(null);
    setCompanyApplications([]);
    setApplicantError("");
    setLoadingApplicants(false);
    setUpdatingApplicationId(null);

    alert("You have logged out successfully.");
  }

  // Internship form input
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

  // Open or close internship form
  function handleNewInternship() {
    if (!isCompany) return;

    if (showForm) {
      handleCancelForm();
    } else {
      setEditingId(null);

      setFormData({
        ...emptyForm,
        company: currentUser.name,
      });

      setFormError("");
      setShowForm(true);
    }
  }

  // CREATE or UPDATE internship
  async function handleSaveInternship(event) {
    event.preventDefault();

    if (saving || !isCompany || !token) return;

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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          location: formData.location,
          type: formData.type,
          description: formData.description,
          requirements: formData.requirements,
          deadline: formData.deadline,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to save internship."
        );
      }

      if (isEditing) {
        setInternships((previous) =>
          previous.map((internship) =>
            internship._id === editingId ? result : internship
          )
        );

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

  // Open Edit form
  function handleEditInternship(internship) {
    if (!canManageInternship(internship)) return;

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

  // DELETE internship
  async function handleDeleteInternship(id) {
    if (deletingId || !isCompany || !token) return;

    const internship = internships.find(
      (item) => item._id === id
    );

    if (!internship || !canManageInternship(internship)) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this internship?"
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const result = await response.json();

        throw new Error(
          result.message || "Failed to delete internship."
        );
      }

      setInternships((previous) =>
        previous.filter((item) => item._id !== id)
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

  // Open student application form
  function handleApplyClick(internship) {
    if (!isStudent || hasApplied(internship._id)) return;

    setApplyingInternship(internship);
    setCoverLetter("");
    setApplicationError("");

    document.getElementById("application-form")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  // Submit an application
  async function handleSubmitApplication(event) {
    event.preventDefault();

    if (
      submittingApplication ||
      !isStudent ||
      !token ||
      !applyingInternship
    ) {
      return;
    }

    setSubmittingApplication(true);
    setApplicationError("");

    try {
      const response = await fetch(APPLICATION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          internshipId: applyingInternship._id,
          coverLetter: coverLetter.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to submit application."
        );
      }

      setMyApplications((previous) => [
        result.application,
        ...previous,
      ]);

      setApplyingInternship(null);
      setCoverLetter("");

      await fetchMyApplications(token);

      alert("Application submitted successfully!");
    } catch (err) {
      setApplicationError(err.message);
    } finally {
      setSubmittingApplication(false);
    }
  }

  // Company views applications submitted for one of its internships
  async function handleViewApplicants(internship) {
    if (!canManageInternship(internship) || !token) return;

    setReviewingInternship(internship);
    setCompanyApplications([]);
    setApplicantError("");
    setLoadingApplicants(true);

    try {
      const response = await fetch(
        `${APPLICATION_URL}/internship/${internship._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load applicants.");
      }

      setCompanyApplications(result);
    } catch (err) {
      setApplicantError(err.message);
    } finally {
      setLoadingApplicants(false);
    }
  }

  // Company accepts or rejects an application
  async function handleUpdateApplicationStatus(applicationId, status) {
    if (!isCompany || !token || updatingApplicationId) return;

    setUpdatingApplicationId(applicationId);
    setApplicantError("");

    try {
      const response = await fetch(
        `${APPLICATION_URL}/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update application.");
      }

      setCompanyApplications((previous) =>
        previous.map((application) =>
          application._id === applicationId
            ? { ...application, status: result.application.status }
            : application
        )
      );

      alert(`Application ${status.toLowerCase()} successfully!`);
    } catch (err) {
      setApplicantError(err.message);
    } finally {
      setUpdatingApplicationId(null);
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
          {isStudent && (
            <a href="#my-applications">My Applications</a>
          )}
          <a href="#about">About</a>
        </div>

        <div className="nav-buttons">
          {currentUser ? (
            <>
              <span className="user-info">
                {currentUser.name} ({currentUser.role})
              </span>

              <button type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openAuthForm("login")}
              >
                Login
              </button>

              <button
                type="button"
                className="primary-btn"
                onClick={() => openAuthForm("register")}
              >
                Register
              </button>
            </>
          )}
        </div>
      </nav>

      {/* LOGIN / REGISTER FORM */}
      {authMode && (
        <section className="auth-section">
          <form
            className="auth-form"
            onSubmit={handleAuthSubmit}
          >
            <h2>
              {authMode === "register"
                ? "Create Your CareerBridge Account"
                : "Login to CareerBridge"}
            </h2>

            {authMode === "register" && (
              <>
                <label htmlFor="auth-name">
                  Full Name / Company Name
                </label>

                <input
                  id="auth-name"
                  type="text"
                  name="name"
                  value={authForm.name}
                  onChange={handleAuthInputChange}
                  required
                />
              </>
            )}

            <label htmlFor="auth-email">Email</label>

            <input
              id="auth-email"
              type="email"
              name="email"
              value={authForm.email}
              onChange={handleAuthInputChange}
              required
            />

            <label htmlFor="auth-password">
              Password
            </label>

            <input
              id="auth-password"
              type="password"
              name="password"
              value={authForm.password}
              onChange={handleAuthInputChange}
              minLength={
                authMode === "register" ? 8 : undefined
              }
              required
            />

            {authMode === "register" && (
              <>
                <label htmlFor="auth-role">
                  Register As
                </label>

                <select
                  id="auth-role"
                  name="role"
                  value={authForm.role}
                  onChange={handleAuthInputChange}
                >
                  <option value="student">Student</option>
                  <option value="company">Company</option>
                </select>
              </>
            )}

            {authError && (
              <p className="form-error" role="alert">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="primary-btn"
              disabled={authLoading}
            >
              {authLoading
                ? "Please wait..."
                : authMode === "register"
                ? "Register"
                : "Login"}
            </button>

            <button
              type="button"
              onClick={() => setAuthMode(null)}
            >
              Cancel
            </button>
          </form>
        </section>
      )}

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

        {/* Only companies can post internships */}
        {isCompany && (
          <button
            type="button"
            className="primary-btn"
            onClick={handleNewInternship}
            disabled={saving}
          >
            {showForm ? "Cancel" : "+ Post an Internship"}
          </button>
        )}

        {/* ADD / EDIT FORM - COMPANY ONLY */}
        {showForm && isCompany && (
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
              value={currentUser.name}
              readOnly
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

        {/* LOADING AND ERRORS */}
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
                  onClick={() => setSelectedInternship(internship)}
                >
                  View Details
                </button>

                {/* Apply Now - Students only */}
                {isStudent && (
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => handleApplyClick(internship)}
                    disabled={
                      loadingApplications ||
                      hasApplied(internship._id)
                    }
                  >
                    {hasApplied(internship._id)
                      ? "Already Applied"
                      : "Apply Now"}
                  </button>
                )}

                {/* Edit and Delete - Company owner only */}
                {canManageInternship(internship) && (
                  <div className="card-actions">
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => handleViewApplicants(internship)}
                    >
                      View Applicants
                    </button>

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
                )}
              </div>
            ))}
          </div>
        )}

        {/* STUDENT APPLICATION FORM */}
        {applyingInternship && isStudent && (
          <div className="internship-details" id="application-form">
            <h3>Apply for {applyingInternship.title}</h3>

            <p>Company: {applyingInternship.company}</p>

            <form onSubmit={handleSubmitApplication}>
              <label htmlFor="cover-letter">
                Cover Letter
              </label>

              <textarea
                id="cover-letter"
                value={coverLetter}
                onChange={(event) =>
                  setCoverLetter(event.target.value)
                }
                placeholder="Explain why you are interested in this internship..."
                rows="6"
                maxLength={2000}
                required
              />

              {applicationError && (
                <p className="form-error" role="alert">
                  {applicationError}
                </p>
              )}

              <button
                type="submit"
                className="primary-btn"
                disabled={submittingApplication}
              >
                {submittingApplication
                  ? "Submitting..."
                  : "Submit Application"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setApplyingInternship(null);
                  setApplicationError("");
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* MY APPLICATIONS - STUDENTS ONLY */}
        {isStudent && (
          <div
            className="internship-details"
            id="my-applications"
          >
            <h3>My Applications</h3>

            {loadingApplications ? (
              <p>Loading applications...</p>
            ) : myApplications.length === 0 ? (
              <p>
                You have not applied for any internships yet.
              </p>
            ) : (
              myApplications.map((application) => (
                <div
                  key={application._id}
                  className="application-item"
                >
                  <h4>
                    {application.internship?.title ||
                      "Internship no longer available"}
                  </h4>

                  <p>
                    Company:{" "}
                    {application.internship?.company ||
                      "Not available"}
                  </p>

                  <p>
                    Status:{" "}
                    <strong>{application.status}</strong>
                  </p>
                </div>
              ))
            )}

            {applicationError && !applyingInternship && (
              <p className="form-error" role="alert">
                {applicationError}
              </p>
            )}
          </div>
        )}

        {/* COMPANY APPLICATION REVIEW */}
        {reviewingInternship && isCompany && (
          <div className="internship-details" id="company-applicants">
            <h3>Applicants for {reviewingInternship.title}</h3>

            {loadingApplicants && <p>Loading applicants...</p>}

            {applicantError && (
              <p className="form-error" role="alert">
                {applicantError}
              </p>
            )}

            {!loadingApplicants &&
              !applicantError &&
              companyApplications.length === 0 && (
                <p>No applications received yet.</p>
              )}

            {!loadingApplicants &&
              companyApplications.map((application) => (
                <div className="application-item" key={application._id}>
                  <h4>{application.student?.name || "Student"}</h4>
                  <p>Email: {application.student?.email || "Not available"}</p>
                  <p>Cover Letter: {application.coverLetter}</p>
                  <p>
                    Status: <strong>{application.status}</strong>
                  </p>

                  <div className="card-actions">
                    <button
                      type="button"
                      className="primary-btn"
                      disabled={Boolean(updatingApplicationId) || application.status === "Accepted"}
                      onClick={() =>
                        handleUpdateApplicationStatus(application._id, "Accepted")
                      }
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="delete-btn"
                      disabled={Boolean(updatingApplicationId) || application.status === "Rejected"}
                      onClick={() =>
                        handleUpdateApplicationStatus(application._id, "Rejected")
                      }
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}

            <button
              type="button"
              onClick={() => {
                setReviewingInternship(null);
                setCompanyApplications([]);
                setApplicantError("");
              }}
            >
              Close Applicants
            </button>
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

      {/* ABOUT */}
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
