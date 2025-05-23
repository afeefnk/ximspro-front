import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import { BASE_URL } from "../../../../Utils/Config";
import AddEmployeeSatisfactionSuccessModal from "../Modals/AddEmployeeSatisfactionSuccessModal";
import ErrorModal from "../Modals/ErrorModal";
import DraftEmployeeSatisfactionSuccessModal from "../Modals/DraftEmployeeSatisfactionSuccessModal";
const AddQmsEmployeeSatisfaction = () => {
  const [formData, setFormData] = useState({
    survey_title: "",
    description: "",
    valid_till: {
      day: "",
      month: "",
      year: "",
    },
  });

  const [
    showAddEmployeeSatisfactionSuccessModal,
    setShowAddEmployeeSatisfactionSuccessModal,
  ] = useState(false);
  const [
    showDraftEmployeeSatisfactionSuccessModal,
    setShowDraftEmployeeSatisfactionSuccessModal,
  ] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const [focusedField, setFocusedField] = useState("");
  const [loading, setLoading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const handleFocus = (field) => setFocusedField(field);
  const handleBlur = () => setFocusedField("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }

    // Clear error for this field if it exists
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: "",
      });
    }
  };

  const getUserCompanyId = () => {
    // First check if company_id is stored directly
    const storedCompanyId = localStorage.getItem("company_id");
    if (storedCompanyId) return storedCompanyId;

    // If user data exists with company_id
    const userRole = localStorage.getItem("role");
    if (userRole === "user") {
      // Try to get company_id from user data that was stored during login
      const userData = localStorage.getItem("user_company_id");
      if (userData) {
        try {
          return JSON.parse(userData);
        } catch (e) {
          console.error("Error parsing user company ID:", e);
          return null;
        }
      }
    }
    return null;
  };

  const getRelevantUserId = () => {
    const userRole = localStorage.getItem("role");

    if (userRole === "user") {
      const userId = localStorage.getItem("user_id");
      if (userId) return userId;
    }

    const companyId = localStorage.getItem("company_id");
    if (companyId) return companyId;

    return null;
  };

  // Validate the form data
  const validateForm = () => {
    const newErrors = {};
    if (!formData.survey_title.trim()) {
      newErrors.survey_title = "Survey title is required";
    }

    // Validate date if any part is filled
    if (
      formData.valid_till.day ||
      formData.valid_till.month ||
      formData.valid_till.year
    ) {
      if (
        !formData.valid_till.day ||
        !formData.valid_till.month ||
        !formData.valid_till.year
      ) {
        newErrors.valid_till = "Please complete the date";
      }
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Format date for submission
  const formatDateForSubmission = () => {
    const { day, month, year } = formData.valid_till;
    if (day && month && year) {
      return `${year}-${month}-${day}`;
    }
    return null;
  };

  const prepareSubmissionData = (isDraft = false) => {
    const userId = getRelevantUserId();
    const companyId = getUserCompanyId();

    if (!companyId) {
      setError("Company ID not found. Please log in again.");
      return null;
    }

    const submissionData = new FormData();
    submissionData.append("company", companyId);
    submissionData.append("user", userId);
    submissionData.append("survey_title", formData.survey_title);
    submissionData.append("description", formData.description || "");

    // Format and append valid_till date if all parts are filled
    const formattedDate = formatDateForSubmission();
    if (formattedDate) {
      submissionData.append("valid_till", formattedDate);
    }

    if (isDraft) {
      submissionData.append("is_draft", true);
    }

    return submissionData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const submissionData = prepareSubmissionData();
      if (!submissionData) {
        setLoading(false);
        return;
      }

      await axios.post(`${BASE_URL}/qms/survey/create/`, submissionData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setShowAddEmployeeSatisfactionSuccessModal(true);
      setTimeout(() => {
        setShowAddEmployeeSatisfactionSuccessModal(false);
        navigate("/company/qms/list-satisfaction-survey");
      }, 1500);
    } catch (error) {
      console.error("Error submitting form:", error);
      setShowErrorModal(true);
      setTimeout(() => {
        setShowErrorModal(false);
      }, 3000);
      let errorMsg = error.message;

      if (error.response) {
        // Check for field-specific errors first
        if (error.response.data.date) {
          errorMsg = error.response.data.date[0];
        }
        // Check for non-field errors
        else if (error.response.data.detail) {
          errorMsg = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    setDraftLoading(true);
    setError("");

    try {
      const submissionData = prepareSubmissionData(true);
      if (!submissionData) {
        setDraftLoading(false);
        return;
      }

      await axios.post(`${BASE_URL}/qms/survey/draft-create/`, submissionData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setShowDraftEmployeeSatisfactionSuccessModal(true);
      setTimeout(() => {
        setShowDraftEmployeeSatisfactionSuccessModal(false);
        navigate("/company/qms/draft-satisfaction-survey");
      }, 1500);
    } catch (err) {
      setDraftLoading(false);
      let errorMsg =err.message;

      if (err.response) {
        // Check for field-specific errors first
        if (err.response.data.date) {
          errorMsg = err.response.data.date[0];
        }
        // Check for non-field errors
        else if (err.response.data.detail) {
          errorMsg = err.response.data.detail;
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError(errorMsg);
      console.error("Error saving Draft:", err.response?.data || err);
    }
  };

  const handleListEmployeePerformance = () => {
    navigate("/company/qms/list-satisfaction-survey");
  };

  const handleCancel = () => {
    navigate("/company/qms/list-satisfaction-survey");
  };

  const dayOptions = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    return (
      <option key={day} value={day < 10 ? `0${day}` : day}>
        {day < 10 ? `0${day}` : day}
      </option>
    );
  });

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthOptions = months.map((month, index) => {
    const monthValue = index + 1;
    return (
      <option
        key={month}
        value={monthValue < 10 ? `0${monthValue}` : monthValue}
      >
        {month}
      </option>
    );
  });

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => {
    const year = currentYear + i;
    return (
      <option key={year} value={year}>
        {year}
      </option>
    );
  });

  return (
    <div className="bg-[#1C1C24] text-white p-5">
      <div>
        <div className="flex justify-between items-center pb-5 border-b border-[#383840] px-[104px]">
          <h1 className="add-employee-performance-head">
            Add Employee Satisfaction Survey
          </h1>
          <button
            className="border border-[#858585] text-[#858585] rounded px-[10px] h-[42px] list-training-btn duration-200"
            onClick={handleListEmployeePerformance}
          >
            List Employee Satisfaction Survey
          </button>
        </div>

        <AddEmployeeSatisfactionSuccessModal
          showAddEmployeeSatisfactionSuccessModal={
            showAddEmployeeSatisfactionSuccessModal
          }
          onClose={() => {
            setShowAddEmployeeSatisfactionSuccessModal(false);
          }}
        />

        <ErrorModal
          showErrorModal={showErrorModal}
          onClose={() => {
            setShowErrorModal(false);
          }}
          error={error}
        />

        <DraftEmployeeSatisfactionSuccessModal
          showDraftEmployeeSatisfactionSuccessModal={
            showDraftEmployeeSatisfactionSuccessModal
          }
          onClose={() => {
            setShowDraftEmployeeSatisfactionSuccessModal(false);
          }}
        />

        {/* {error && (
                    <div className="bg-red-500 bg-opacity-20 text-red-500 p-3 my-3 rounded mx-[104px]">
                        {error}
                    </div>
                )} */}

        <form onSubmit={handleSubmit} className="px-[104px] pt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block employee-performace-label">
                Survey Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="survey_title"
                value={formData.survey_title}
                onChange={handleChange}
                className={`w-full employee-performace-inputs ${
                  fieldErrors.survey_title ? "border-red-500" : ""
                }`}
              />
              {fieldErrors.survey_title && (
                <p className="text-red-500 text-sm mt-1">
                  {fieldErrors.survey_title}
                </p>
              )}
            </div>

            <div className="md:row-span-2">
              <label className="block employee-performace-label">
                Survey Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full h-full min-h-[151px] employee-performace-inputs"
              />
            </div>

            <div>
              <label className="block employee-performace-label">
                Valid Till
              </label>
              <div className="flex gap-5">
                {/* Day */}
                <div className="relative w-1/3">
                  <select
                    name="valid_till.day"
                    value={formData.valid_till.day}
                    onChange={handleChange}
                    onFocus={() => handleFocus("day")}
                    onBlur={handleBlur}
                    className={`appearance-none w-full employee-performace-inputs cursor-pointer ${
                      fieldErrors.valid_till ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">dd</option>
                    {dayOptions}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 text-[#AAAAAA] ${
                        focusedField === "day" ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Month */}
                <div className="relative w-1/3">
                  <select
                    name="valid_till.month"
                    value={formData.valid_till.month}
                    onChange={handleChange}
                    onFocus={() => handleFocus("month")}
                    onBlur={handleBlur}
                    className={`appearance-none w-full employee-performace-inputs cursor-pointer ${
                      fieldErrors.valid_till ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">mm</option>
                    {monthOptions}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 text-[#AAAAAA] ${
                        focusedField === "month" ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Year */}
                <div className="relative w-1/3">
                  <select
                    name="valid_till.year"
                    value={formData.valid_till.year}
                    onChange={handleChange}
                    onFocus={() => handleFocus("year")}
                    onBlur={handleBlur}
                    className={`appearance-none w-full employee-performace-inputs cursor-pointer ${
                      fieldErrors.valid_till ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">yyyy</option>
                    {yearOptions}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 text-[#AAAAAA] ${
                        focusedField === "year" ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
              {fieldErrors.valid_till && (
                <p className="text-red-500 text-sm mt-1">
                  {fieldErrors.valid_till}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-between space-x-5 mt-5">
            <div>
              <button
                type="button"
                onClick={handleSaveAsDraft}
                disabled={draftLoading}
                className="request-correction-btn duration-200"
              >
                {draftLoading ? "Saving..." : "Save as Draft"}
              </button>
            </div>
            <div className="flex gap-5">
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-btn duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="save-btn duration-200"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQmsEmployeeSatisfaction;
