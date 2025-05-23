import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../../../Utils/Config";
import { ChevronDown } from "lucide-react";
import EditEmployeeSatisfactionSuccessModal from "../Modals/EditEmployeeSatisfactionSuccessModal";
import ErrorModal from "../Modals/ErrorModal";

const EditQmsEmployeeSatisfaction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    survey_title: "",
    description: "",
    valid_till: null,
    is_draft: true,
  });

  const [
    showEditEmployeeSatisfactionSuccessModal,
    setShowEditEmployeeSatisfactionSuccessModal,
  ] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Separate state for date values to handle the UI components
  const [dateValues, setDateValues] = useState({
    day: "",
    month: "",
    year: "",
  });

  const [focusedField, setFocusedField] = useState("");

  const handleFocus = (field) => setFocusedField(field);
  const handleBlur = () => setFocusedField("");

  // Fetch survey data on component mount
  useEffect(() => {
    const fetchsurveyData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/qms/survey-get/${id}/`);
        const data = response.data;

        // Set the main form data
        setFormData({
          survey_title: data.survey_title || "",
          description: data.description || "",
          valid_till: data.valid_till || null,
          is_draft: data.is_draft !== undefined ? data.is_draft : true,
        });

        // If valid_till exists, parse it to set the date values
        if (data.valid_till) {
          const date = new Date(data.valid_till);
          setDateValues({
            day: String(date.getDate()).padStart(2, "0"),
            month: String(date.getMonth() + 1).padStart(2, "0"),
            year: String(date.getFullYear()),
          });
        }

        setError(null);
      } catch (err) {
        let errorMsg = err.message;

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
        console.error("Error fetching employee survey data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchsurveyData();
    }
  }, [id]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.survey_title.trim()) {
      newErrors.survey_title = "Survey title is required";
    }

    // Validate date if any part is filled
    if (dateValues.day || dateValues.month || dateValues.year) {
      if (!dateValues.day || !dateValues.month || !dateValues.year) {
        newErrors.valid_till = "Please complete the date";
      }
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("valid_till.")) {
      const field = name.split(".")[1];
      setDateValues({
        ...dateValues,
        [field]: value,
      });

      // Clear date error if all fields are now filled
      if (
        fieldErrors.valid_till &&
        dateValues.day &&
        dateValues.month &&
        dateValues.year
      ) {
        setFieldErrors({
          ...fieldErrors,
          valid_till: "",
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });

      // Clear error for this field if it exists
      if (fieldErrors[name]) {
        setFieldErrors({
          ...fieldErrors,
          [name]: "",
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare submission data
    const submissionData = {
      ...formData,
    };

    // If all date fields are filled, format the date for submission
    if (dateValues.day && dateValues.month && dateValues.year) {
      submissionData.valid_till = `${dateValues.year}-${dateValues.month}-${dateValues.day}`;
    } else {
      submissionData.valid_till = null;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.put(`${BASE_URL}/qms/survey/${id}/update/`, submissionData);

      // Navigate after a brief delay to show success message
      setTimeout(() => {}, 1500);

      setShowEditEmployeeSatisfactionSuccessModal(true);
      setTimeout(() => {
        setShowEditEmployeeSatisfactionSuccessModal(false);
        navigate("/company/qms/list-satisfaction-survey");
      }, 1500);
    } catch (err) {
      console.error("Error updating survey evaluation:", err);
      setShowErrorModal(true);
      setTimeout(() => {
        setShowErrorModal(false);
      }, 3000);
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
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/company/qms/list-satisfaction-survey");
  };

  // Generate options for the date selectors
  const dayOptions = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    return (
      <option key={day} value={day < 10 ? `0${day}` : String(day)}>
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
        value={monthValue < 10 ? `0${monthValue}` : String(monthValue)}
      >
        {month}
      </option>
    );
  });

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => {
    const year = currentYear + i;
    return (
      <option key={year} value={String(year)}>
        {year}
      </option>
    );
  });

  if (loading && !formData.survey_title) {
    return (
      <div className="bg-[#1C1C24] text-white p-5 flex justify-center items-center h-screen">
        <p>Loading survey data...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1C1C24] text-white p-5">
      <div>
        <div className="flex justify-between items-center pb-5 border-b border-[#383840] px-[104px]">
          <h1 className="add-employee-performance-head">
            Edit Employee survey Evaluation
          </h1>
          <button
            className="border border-[#858585] text-[#858585] rounded px-[10px] h-[42px] list-training-btn duration-200"
            onClick={() => navigate("/company/qms/list-satisfaction-survey")}
          >
            List Employee Satisfaction survey
          </button>
        </div>

        <EditEmployeeSatisfactionSuccessModal
          showEditEmployeeSatisfactionSuccessModal={
            showEditEmployeeSatisfactionSuccessModal
          }
          onClose={() => {
            setShowEditEmployeeSatisfactionSuccessModal(false);
          }}
        />

        <ErrorModal
          showErrorModal={showErrorModal}
          onClose={() => {
            setShowErrorModal(false);
          }}
          error={error}
        />

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
                    value={dateValues.day}
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
                    value={dateValues.month}
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
                    value={dateValues.year}
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

          <div className="flex justify-end space-x-5 mt-5">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-btn duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-btn duration-200"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQmsEmployeeSatisfaction;
