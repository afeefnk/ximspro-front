import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import file from "../../../../assets/images/Company Documentation/file-icon.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../../../Utils/Config";
import QmsAddManagementSuccessModal from "./Modals/QmsAddManagementSuccessModal";
import QmsAddManagementErrorModal from "./Modals/QmsAddManagementErrorModal";
import QmsSaveDraftManagementSuccessModal from "./Modals/QmsSaveDraftManagementSuccessModal";
import QmsSaveDraftManagementErrorModal from "./Modals/QmsSaveDraftManagementErrorModal";

const QmsAddmanagementChange = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    moc_title: "",
    moc_no: "MOC-1",
    moc_type: "",
    day: "",
    month: "",
    year: "",
    attach_document: null,
    related_record_format: "",
    resources_required: "",
    purpose_of_chnage: "",
    potential_cosequences: "",
    impact_on_process: "",
    moc_remarks: "",
    rivision: "",
    send_notification: false,
    is_draft: false,
  });

  const [showAddManagementSuccessModal, setShowAddManagementSuccessModal] =
    useState(false);
  const [showAddManagementErrorModal, setShowAddManagementErrorModal] =
    useState(false);
  const [showDraftManagementSuccessModal, setShowDraftManagementSuccessModal] =
    useState(false);
  const [showDraftManagementErrorModal, setShowDraftManagementErrorModal] =
    useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [saveDraftLoading, setSaveDraftLoading] = useState(false); // Loading state for Save as Draft
  const [saveLoading, setSaveLoading] = useState(false); // Loading state for Save
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({
    moc_title: "",
  });

  const [dropdowns, setDropdowns] = useState({
    moc_type: false,
    day: false,
    month: false,
    year: false,
  });

  const getUserCompanyId = () => {
    const storedCompanyId = localStorage.getItem("company_id");
    if (storedCompanyId) return storedCompanyId;

    const userRole = localStorage.getItem("role");
    if (userRole === "user") {
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

  const companyId = getUserCompanyId();

  useEffect(() => {
    const fetchNextMocNumber = async () => {
      try {
        if (!companyId) {
          setFormData((prev) => ({ ...prev, moc_no: "MOC-1" }));
          return;
        }

        const response = await axios.get(
          `${BASE_URL}/qms/changes/next-action/${companyId}/`
        );
        const nextNumber = response.data?.next_moc_no || "1";
        setFormData((prev) => ({ ...prev, moc_no: `${nextNumber}` }));
      } catch (error) {
        console.error("Error fetching next MOC number:", error);
        setFormData((prev) => ({ ...prev, moc_no: "MOC-1" }));
        let errorMsg = error.message;

        if (error.response) {
          if (error.response.data.detail) {
            errorMsg = error.response.data.detail;
          } else if (error.response.data.message) {
            errorMsg = error.response.data.message;
          }
        }

        setError(errorMsg);
        setShowAddManagementErrorModal(true);
        setTimeout(() => {
          setShowAddManagementErrorModal(false);
        }, 3000);
      }
    };

    fetchNextMocNumber();
  }, [companyId]);

  const handleDropdownFocus = (key) => {
    setDropdowns((prev) => ({ ...prev, [key]: true }));
  };

  const handleDropdownBlur = (key) => {
    setDropdowns((prev) => ({ ...prev, [key]: false }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "moc_no") return; // Prevent manual changes to moc_no
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (name === "moc_title" && value.trim()) {
      setErrors({ moc_title: "" });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file.name);
      setFormData({
        ...formData,
        attach_document: file,
      });
    } else {
      setSelectedFile(null);
      setFormData({
        ...formData,
        attach_document: null,
      });
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      setSaveDraftLoading(true); // Set Save as Draft loading state

      const companyId = getUserCompanyId();
      const userId = getRelevantUserId();

      if (!companyId || !userId) {
        setError("Company ID or User ID not found. Please log in again.");
        setSaveDraftLoading(false);
        return;
      }

      let dateString = null;
      if (formData.year && formData.month && formData.day) {
        dateString = `${formData.year}-${formData.month.padStart(
          2,
          "0"
        )}-${formData.day.padStart(2, "0")}`;
      }

      const submitData = new FormData();
      submitData.append("company", companyId);
      submitData.append("user", userId);
      submitData.append("is_draft", true);

      Object.keys(formData).forEach((key) => {
        if (["day", "month", "year"].includes(key)) return;
        if (formData[key] !== null && formData[key] !== "") {
          submitData.append(key, formData[key]);
        }
      });

      if (dateString) {
        submitData.append("date", dateString);
      }

      const response = await axios.post(
        `${BASE_URL}/qms/changes/draft-create/`,
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSaveDraftLoading(false);
      setShowDraftManagementSuccessModal(true);
      setTimeout(() => {
        setShowDraftManagementSuccessModal(false);
        navigate("/company/qms/draft-management-change");
      }, 1500);
    } catch (err) {
      setSaveDraftLoading(false);
      let errorMsg = err.message;

      if (err.response) {
        if (err.response.data.date) {
          errorMsg = err.response.data.date[0];
        } else if (err.response.data.detail) {
          errorMsg = err.response.data.detail;
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        }
      }

      setError(errorMsg);
      setShowDraftManagementErrorModal(true);
      setTimeout(() => {
        setShowDraftManagementErrorModal(false);
      }, 3000);
      console.error("Error saving Draft:", err.response?.data || err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaveLoading(true); // Set Save loading state
      setError("");

      if (!formData.moc_title.trim()) {
        setErrors({
          moc_title: "MOC Name / Title is required",
        });
        setSaveLoading(false);
        return;
      }

      setErrors({ moc_title: "" });

      const userId = getRelevantUserId();
      const companyId = getUserCompanyId();
      if (!companyId) {
        setError("Company ID not found. Please log in again.");
        setSaveLoading(false);
        return;
      }

      let dateString = null;
      if (formData.year && formData.month && formData.day) {
        dateString = `${formData.year}-${formData.month.padStart(
          2,
          "0"
        )}-${formData.day.padStart(2, "0")}`;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("company", companyId);
      formDataToSend.append("is_draft", false);
      formDataToSend.append("user", userId);

      Object.keys(formData).forEach((key) => {
        if (["day", "month", "year"].includes(key)) return;
        if (key === "attach_document" && formData[key]) {
          formDataToSend.append(key, formData[key]);
        } else if (
          key !== "attach_document" &&
          formData[key] !== null &&
          formData[key] !== undefined
        ) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (dateString) {
        formDataToSend.append("date", dateString);
      }

      const response = await axios.post(
        `${BASE_URL}/qms/changes/create/`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSaveLoading(false);
      setShowAddManagementSuccessModal(true);
      setTimeout(() => {
        setShowAddManagementSuccessModal(false);
        navigate("/company/qms/list-management-change");
      }, 1500);
    } catch (error) {
      setSaveLoading(false);
      let errorMsg = error.message;

      if (error.response) {
        if (error.response.data.date) {
          errorMsg = error.response.data.date[0];
        } else if (error.response.data.detail) {
          errorMsg = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        }
      }

      setError(errorMsg);
      setShowAddManagementErrorModal(true);
      setTimeout(() => {
        setShowAddManagementErrorModal(false);
      }, 3000);
      console.error("Error adding management change:", error);
    }
  };

  const handleListManagementChange = () => {
    navigate("/company/qms/list-management-change");
  };

  const handleCancel = () => {
    navigate("/company/qms/list-management-change");
  };

  return (
    <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
      <div className="flex justify-between items-center mb-5 px-[122px] pb-5 border-b border-[#383840]">
        <h2 className="add-compliance-head">Add Management of Change</h2>
        <QmsAddManagementSuccessModal
          showAddManagementSuccessModal={showAddManagementSuccessModal}
          onClose={() => setShowAddManagementSuccessModal(false)}
        />
        <QmsAddManagementErrorModal
          showAddManagementErrorModal={showAddManagementErrorModal}
          onClose={() => setShowAddManagementErrorModal(false)}
          error={error}
        />
        <QmsSaveDraftManagementSuccessModal
          showDraftManagementSuccessModal={showDraftManagementSuccessModal}
          onClose={() => setShowDraftManagementSuccessModal(false)}
        />
        <QmsSaveDraftManagementErrorModal
          showDraftManagementErrorModal={showDraftManagementErrorModal}
          onClose={() => setShowDraftManagementErrorModal(false)}
          error={error}
        />
        <button
          className="flex items-center justify-center add-manual-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white"
          onClick={handleListManagementChange}
        >
          <span>List Management of Change</span>
        </button>
      </div>
      <form onSubmit={handleSubmit} className="px-[122px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="add-compliance-label">
              MOC Name / Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="moc_title"
              value={formData.moc_title}
              onChange={handleInputChange}
              className="w-full add-compliance-inputs"
            />
            {errors.moc_title && (
              <p className="text-red-500 text-sm mt-1">{errors.moc_title}</p>
            )}
          </div>
          <div>
            <label className="add-compliance-label">
              MOC Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="moc_no"
              value={formData.moc_no}
              className="w-full add-compliance-inputs cursor-not-allowed bg-gray-800"
              readOnly
            />
          </div>
          <div>
            <label className="add-compliance-label">MOC Type</label>
            <div className="relative">
              <select
                name="moc_type"
                value={formData.moc_type}
                onChange={handleInputChange}
                onFocus={() => handleDropdownFocus("moc_type")}
                onBlur={() => handleDropdownBlur("moc_type")}
                className="appearance-none w-full add-compliance-inputs cursor-pointer"
              >
                <option value="">Select MOC Type</option>
                <option value="Manual/Procedure">Manual/Procedure</option>
                <option value="Guideline/Policy">Guideline/Policy</option>
                <option value="Specification/Standards">
                  Specification/Standards
                </option>
                <option value="Facility/Equipment">Facility/Equipment</option>
                <option value="System/Process">System/Process</option>
              </select>
              <div
                className={`pointer-events-none absolute inset-y-0 right-0 top-[12px] flex items-center px-2 text-[#AAAAAA] transition-transform duration-300 ${
                  dropdowns.moc_type ? "rotate-180" : ""
                }`}
              >
                <ChevronDown size={20} />
              </div>
            </div>
          </div>
          <div>
            <label className="add-compliance-label">Date</label>
            <div className="grid grid-cols-3 gap-5">
              <div className="relative">
                <select
                  name="day"
                  value={formData.day}
                  onChange={handleInputChange}
                  onFocus={() => handleDropdownFocus("day")}
                  onBlur={() => handleDropdownBlur("day")}
                  className="appearance-none w-full add-compliance-inputs cursor-pointer"
                >
                  <option value="">dd</option>
                  {[...Array(31)].map((_, i) => (
                    <option
                      key={i + 1}
                      value={(i + 1).toString().padStart(2, "0")}
                    >
                      {i + 1}
                    </option>
                  ))}
                </select>
                <div
                  className={`pointer-events-none absolute inset-y-0 top-[12px] right-0 flex items-center px-2 text-[#AAAAAA] transition-transform duration-300 ${
                    dropdowns.day ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDown size={20} />
                </div>
              </div>
              <div className="relative">
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  onFocus={() => handleDropdownFocus("month")}
                  onBlur={() => handleDropdownBlur("month")}
                  className="appearance-none w-full add-compliance-inputs cursor-pointer"
                >
                  <option value="">mm</option>
                  {[...Array(12)].map((_, i) => (
                    <option
                      key={i + 1}
                      value={(i + 1).toString().padStart(2, "0")}
                    >
                      {i + 1}
                    </option>
                  ))}
                </select>
                <div
                  className={`pointer-events-none absolute inset-y-0 right-0 top-[12px] flex items-center px-2 text-[#AAAAAA] transition-transform duration-300 ${
                    dropdowns.month ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDown size={20} />
                </div>
              </div>
              <div className="relative">
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  onFocus={() => handleDropdownFocus("year")}
                  onBlur={() => handleDropdownBlur("year")}
                  className="appearance-none w-full add-compliance-inputs cursor-pointer"
                >
                  <option value="">yyyy</option>
                  {[...Array(10)].map((_, i) => (
                    <option key={2020 + i} value={(2020 + i).toString()}>
                      {2020 + i}
                    </option>
                  ))}
                </select>
                <div
                  className={`pointer-events-none absolute inset-y-0 right-0 top-[12px] flex items-center px-2 text-[#AAAAAA] transition-transform duration-300 ${
                    dropdowns.year ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="add-compliance-label">Attach Document</label>
            <div className="relative">
              <input
                type="file"
                id="attach_document"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                className="w-full add-qmsmanual-attach"
                onClick={() =>
                  document.getElementById("attach_document").click()
                }
              >
                <span className="file-input">
                  {selectedFile ? selectedFile : "Choose File"}
                </span>
                <img src={file} alt="File Icon" />
              </button>
              {!selectedFile && (
                <p className="text-right no-file">No file chosen</p>
              )}
            </div>
          </div>
          <div>
            <label className="add-compliance-label">Relate Record Format</label>
            <input
              type="text"
              name="related_record_format"
              value={formData.related_record_format}
              onChange={handleInputChange}
              className="w-full add-compliance-inputs"
            />
          </div>
          <div>
            <label className="add-compliance-label">Purpose of Change</label>
            <input
              type="text"
              name="purpose_of_chnage"
              value={formData.purpose_of_chnage}
              onChange={handleInputChange}
              className="w-full add-compliance-inputs"
            />
          </div>
          <div>
            <label className="add-compliance-label">Resources Required</label>
            <input
              type="text"
              name="resources_required"
              value={formData.resources_required}
              onChange={handleInputChange}
              className="w-full add-compliance-inputs"
            />
          </div>
          <div>
            <label className="add-compliance-label">
              Potential Consequences of Change
            </label>
            <input
              type="text"
              name="potential_cosequences"
              value={formData.potential_cosequences}
              onChange={handleInputChange}
              className="w-full add-compliance-inputs"
            />
          </div>
          <div>
            <label className="add-compliance-label">
              Impact on Processes/Activity
            </label>
            <input
              type="text"
              name="impact_on_process"
              value={formData.impact_on_process}
              onChange={handleInputChange}
              className="w-full add-compliance-inputs"
            />
          </div>
          <div>
            <label className="add-compliance-label">MOC Remarks</label>
            <textarea
              name="moc_remarks"
              value={formData.moc_remarks}
              onChange={handleInputChange}
              className="w-full add-compliance-inputs !h-[95px] !py-2"
            />
          </div>
          <div>
            <label className="add-compliance-label">Revision</label>
            <textarea
              name="rivision"
              value={formData.rivision}
              onChange={handleInputChange}
              className="w-full add-compliance-inputs !h-[95px] !py-2"
            />
          </div>
          <div></div>
          <div className="flex items-end justify-end mt-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="send_notification"
                className="mr-2 form-checkboxes"
                checked={formData.send_notification}
                onChange={handleInputChange}
              />
              <span className="permissions-texts cursor-pointer">
                Send Notification
              </span>
            </label>
          </div>
          <div>
            <button
              type="button"
              onClick={handleSaveAsDraft}
              className="request-correction-btn duration-200"
              disabled={saveDraftLoading}
            >
              {saveDraftLoading ? "Saving Draft..." : "Save as Draft"}
            </button>
          </div>
          <div className="flex items-end gap-5">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-btn duration-200 !w-full"
              disabled={saveLoading || saveDraftLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-btn duration-200 !w-full"
              disabled={saveLoading}
            >
              {saveLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default QmsAddmanagementChange;