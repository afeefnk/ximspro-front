import React, { useEffect, useState } from 'react'
import { ChevronDown, Eye } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import RootCauseModal from '../RootCauseModal';
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";
import SuccessModal from '../SuccessModal';
import ErrorModal from '../ErrorModal';
import file from "../../../../assets/images/Company Documentation/file-icon.svg";

const QmsEditDraftCorrectionActions = () => {
    const { id } = useParams();
    const navigate = useNavigate();

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

    const companyId = getUserCompanyId();

    const [isRootCauseModalOpen, setIsRootCauseModalOpen] = useState(false);
    const [rootCauses, setRootCauses] = useState([]);
    const [users, setUsers] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState({
        source: '',
        title: '',
    });
    const [selectedFile, setSelectedFile] = useState(null);

    const [successMessage, setSuccessMessage] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [showErrorModal, setShowErrorModal] = useState(false);

    const [formData, setFormData] = useState({
        source: '',
        title: '',
        next_action_no: '',
        root_cause: '',
        executor: '',
        description: '',
        action_or_corrections: '',
        supplier: '',
        date_raised: {
            day: '',
            month: '',
            year: ''
        },
        date_completed: {
            day: '',
            month: '',
            year: ''
        },
        upload_attachment: null,
        status: 'Pending',
        send_notification: false,
        is_draft: true
    });

    const [focusedDropdown, setFocusedDropdown] = useState(null);

    useEffect(() => {
        fetchDraftCorrectionAction();
        fetchRootCauses();
        fetchUsers();
        fetchSuppliers();
    }, [id]);

    const fetchDraftCorrectionAction = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${BASE_URL}/qms/car-numbers/${id}/`);
            const data = response.data;

            if (!data.is_draft) {
                navigate('/company/qms/list-correction-actions');
                return;
            }

            const processDate = (dateString) => {
                if (!dateString) return { day: '', month: '', year: '' };
                const [year, month, day] = dateString.split('-');
                return { day, month, year };
            };

            const formData = {
                source: data.source || '',
                title: data.title || '',
                next_action_no: data.action_no || '',
                root_cause: data.root_cause?.id || '',
                executor: data.executor?.id || '',
                description: data.description || '',
                action_or_corrections: data.action_or_corrections || '',
                supplier: data.supplier?.id || '',
                date_raised: processDate(data.date_raised),
                date_completed: processDate(data.date_completed),
                upload_attachment: data.upload_attachment || null,
                status: data.status || 'Pending',
                send_notification: data.send_notification || false,
                is_draft: data.is_draft || true
            };

            setFormData(formData);

            if (data.upload_attachment) {
                setSelectedFile(data.upload_attachment.split('/').pop());
            }

            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching draft correction action:', error);
            let errorMsg = error.message;

            if (error.response) {
                if (error.response.data.date) {
                    errorMsg = error.response.data.date[0];
                }
                else if (error.response.data.detail) {
                    errorMsg = error.response.data.detail;
                }
                else if (error.response.data.message) {
                    errorMsg = error.response.data.message;
                }
            } else if (error.message) {
                errorMsg = error.message;
            }

            setError(errorMsg);
            setShowErrorModal(true);
            setTimeout(() => {
                setShowErrorModal(false);
            }, 3000);
            setIsLoading(false);
        }
    };

    const fetchRootCauses = async () => {
        try {
            const companyId = getUserCompanyId();
            const response = await axios.get(`${BASE_URL}/qms/root-cause/company/${companyId}/`);
            setRootCauses(response.data);
        } catch (error) {
            console.error('Error fetching root causes:', error);
            setError('Failed to load root causes');
            setShowErrorModal(true);
            setTimeout(() => {
                setShowErrorModal(false);
            }, 3000);
        }
    };

    const fetchUsers = async () => {
        try {
            const companyId = getUserCompanyId();
            if (!companyId) return;

            const response = await axios.get(`${BASE_URL}/company/users-active/${companyId}/`);

            if (Array.isArray(response.data)) {
                setUsers(response.data);
            } else {
                setUsers([]);
                console.error("Unexpected response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setError("Failed to load users");
            setShowErrorModal(true);
            setTimeout(() => {
                setShowErrorModal(false);
            }, 3000);
        }
    };

    const fetchSuppliers = async () => {
        try {
            if (!companyId) return;

            const response = await axios.get(`${BASE_URL}/qms/suppliers/company/${companyId}/`);
            const activeSuppliers = response.data.filter(supplier =>
                supplier.active === 'active'
            );
            setSuppliers(activeSuppliers);
        } catch (err) {
            console.error('Error fetching suppliers:', err);
            setError('Failed to fetch suppliers data');
            setShowErrorModal(true);
            setTimeout(() => {
                setShowErrorModal(false);
            }, 3000);
        }
    };

    const handleOpenRootCauseModal = () => {
        setIsRootCauseModalOpen(true);
    };

    const handleCloseRootCauseModal = (newCauseAdded = false) => {
        setIsRootCauseModalOpen(false);
        if (newCauseAdded) {
            fetchRootCauses();
        }
    };

    const handleListDraftCorrectionActions = () => {
        navigate('/company/qms/draft-correction-actions');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'next_action_no') return;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData({
                ...formData,
                [parent]: {
                    ...formData[parent],
                    [child]: value
                }
            });
        } else if (e.target.type === 'checkbox') {
            setFormData({
                ...formData,
                [name]: e.target.checked
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
            if (name === "source" || name === "title" || name === "supplier") {
                setFormErrors({
                    ...formErrors,
                    [name]: ""
                });
            }
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file.name);
            setFormData({
                ...formData,
                upload_attachment: file,
            });
        } else {
            setSelectedFile(null);
            setFormData({
                ...formData,
                upload_attachment: null,
            });
        }
    };

    const handleViewFile = () => {
        if (formData.upload_attachment && typeof formData.upload_attachment === 'string') {
            window.open(formData.upload_attachment, '_blank');
        }
    };

    const formatDate = (dateObj) => {
        if (!dateObj.year || !dateObj.month || !dateObj.day) return null;
        return `${dateObj.year}-${dateObj.month}-${dateObj.day}`;
    };

    const validateForm = () => {
        const errors = {};
        let isValid = true;

        if (!formData.source) {
            errors.source = "Source is required";
            isValid = false;
        }

        if (!formData.title.trim()) {
            errors.title = "Title is required";
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);

            const dateRaised = formatDate(formData.date_raised);
            const dateCompleted = formatDate(formData.date_completed);

            const submissionData = new FormData();
            submissionData.append('company', companyId);
            submissionData.append('title', formData.title);
            submissionData.append('source', formData.source);
            submissionData.append('root_cause', formData.root_cause || '');
            submissionData.append('description', formData.description);
            if (dateRaised) submissionData.append('date_raised', dateRaised);
            if (dateCompleted) submissionData.append('date_completed', dateCompleted);
            submissionData.append('status', formData.status);
            submissionData.append('executor', formData.executor || '');
            submissionData.append('next_action_no', formData.next_action_no);
            submissionData.append('action_or_corrections', formData.action_or_corrections);
            submissionData.append('send_notification', formData.send_notification);
            submissionData.append('is_draft', 'false');

            if (formData.upload_attachment && typeof formData.upload_attachment === 'object') {
                submissionData.append('upload_attachment', formData.upload_attachment);
            }

            if (formData.source === 'Supplier') {
                submissionData.append('supplier', formData.supplier);
            }

            const response = await axios.put(`${BASE_URL}/qms/car-draft/update/${id}/`, submissionData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setIsLoading(false);

            setShowSuccessModal(true);
            setTimeout(() => {
                setShowSuccessModal(false);
                navigate('/company/qms/draft-correction-actions');
            }, 1500);
            setSuccessMessage("Correction Action Saved Successfully")

        } catch (error) {
            console.error('Error updating draft form:', error);
            setIsLoading(false);
            let errorMsg = error.message;

            if (error.response) {
                if (error.response.data.date) {
                    errorMsg = error.response.data.date[0];
                }
                else if (error.response.data.detail) {
                    errorMsg = error.response.data.detail;
                }
                else if (error.response.data.message) {
                    errorMsg = error.response.data.message;
                }
            } else if (error.message) {
                errorMsg = error.message;
            }

            setError(errorMsg);
            setShowErrorModal(true);
            setTimeout(() => {
                setShowErrorModal(false);
            }, 3000);
        }
    };

    const generateOptions = (start, end, prefix = '') => {
        const options = [];
        for (let i = start; i <= end; i++) {
            const value = i < 10 ? `0${i}` : `${i}`;
            options.push(
                <option key={i} value={value}>
                    {prefix}{value}
                </option>
            );
        }
        return options;
    };

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            <div className="flex justify-between items-center border-b border-[#383840] px-[104px] pb-5">
                <h1 className="add-training-head">Edit Draft Correction/Corrective Action</h1>
                <button
                    className="border border-[#858585] text-[#858585] rounded px-3 h-[42px] list-training-btn duration-200"
                    onClick={() => handleListDraftCorrectionActions()}
                >
                    List Draft Correction / Corrective Actions
                </button>
            </div>

                <>
                    <RootCauseModal
                        isOpen={isRootCauseModalOpen}
                        onClose={handleCloseRootCauseModal}
                    />

                    <SuccessModal
                        showSuccessModal={showSuccessModal}
                        onClose={() => setShowSuccessModal(false)}
                        successMessage={successMessage}
                    />

                    <ErrorModal
                        showErrorModal={showErrorModal}
                        onClose={() => setShowErrorModal(false)}
                        error={error}
                    />

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 px-[104px] py-5">
                        <div className="flex flex-col gap-3 relative">
                            <label className="add-training-label">Source <span className="text-red-500">*</span></label>
                            <select
                                name="source"
                                value={formData.source}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("source")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>Select</option>
                                <option value="Audit">Audit</option>
                                <option value="Customer">Customer</option>
                                <option value="Internal">Internal</option>
                                <option value="Supplier">Supplier</option>
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-[55px] transform transition-transform duration-300 
                                ${focusedDropdown === "source" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                            {formErrors.source && (
                                <p className="text-red-500 text-sm">{formErrors.source}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="add-training-label">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="add-training-inputs focus:outline-none"
                            />
                            {formErrors.title && (
                                <p className="text-red-500 text-sm">{formErrors.title}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="add-training-label">
                                Action No
                            </label>
                            <input
                                type="text"
                                name="next_action_no"
                                value={formData.next_action_no}
                                className="add-training-inputs focus:outline-none cursor-not-allowed bg-gray-800"
                                readOnly
                                title="Auto-generated action number"
                            />
                        </div>

                        {formData.source === 'Supplier' ? (
                            <div className="flex flex-col gap-3 relative">
                                <label className="add-training-label">Supplier</label>
                                <select
                                    name="supplier"
                                    value={formData.supplier}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedDropdown("supplier")}
                                    onBlur={() => setFocusedDropdown(null)}
                                    className="add-training-inputs appearance-none pr-10 cursor-pointer"
                                >
                                    <option value="" disabled>Select Supplier</option>
                                    {suppliers.map(supplier => (
                                        <option key={supplier.id} value={supplier.id}>
                                            {supplier.company_name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    className={`absolute right-3 top-[60%] transform transition-transform duration-300 
                                    ${focusedDropdown === "supplier" ? "rotate-180" : ""}`}
                                    size={20}
                                    color="#AAAAAA"
                                />
                            </div>
                        ) : (
                            <div></div>
                        )}

                        <div className="flex flex-col gap-3 relative">
                            <label className="add-training-label">Root Cause</label>
                            <select
                                name="root_cause"
                                value={formData.root_cause}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("root_cause")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>Select Root Cause</option>
                                {rootCauses.map(cause => (
                                    <option key={cause.id} value={cause.id}>
                                        {cause.title}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-[42%] transform transition-transform duration-300 
                                ${focusedDropdown === "root_cause" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                            <button
                                className='flex justify-start add-training-label !text-[#1E84AF] mt-1'
                                onClick={handleOpenRootCauseModal}
                                type="button"
                            >
                                View / Add Root Cause
                            </button>
                        </div>

                        <div className="flex flex-col gap-3 relative">
                            <label className="add-training-label">Executor</label>
                            <select
                                name="executor"
                                value={formData.executor}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("executor")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="" disabled>Select Executor</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.first_name} {user.last_name || ''}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-[42%] transform transition-transform duration-300 
                                ${focusedDropdown === "executor" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="add-training-label">
                                Problem Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="add-training-inputs focus:outline-none !h-[98px]"
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="add-training-label">
                                Action or Corrections
                            </label>
                            <textarea
                                name="action_or_corrections"
                                value={formData.action_or_corrections}
                                onChange={handleChange}
                                className="add-training-inputs focus:outline-none !h-[98px]"
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="add-training-label">Date Raised</label>
                            <div className="grid grid-cols-3 gap-5">
                                <div className="relative">
                                    <select
                                        name="date_raised.day"
                                        value={formData.date_raised.day}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedDropdown("date_raised.day")}
                                        onBlur={() => setFocusedDropdown(null)}
                                        className="add-training-inputs appearance-none pr-10 cursor-pointer"
                                    >
                                        <option value="" disabled>dd</option>
                                        {generateOptions(1, 31)}
                                    </select>
                                    <ChevronDown
                                        className={`absolute right-3 top-[35%] transform transition-transform duration-300
                                        ${focusedDropdown === "date_raised.day" ? "rotate-180" : ""}`}
                                        size={20}
                                        color="#AAAAAA"
                                    />
                                </div>
                                <div className="relative">
                                    <select
                                        name="date_raised.month"
                                        value={formData.date_raised.month}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedDropdown("date_raised.month")}
                                        onBlur={() => setFocusedDropdown(null)}
                                        className="add-training-inputs appearance-none pr-10 cursor-pointer"
                                    >
                                        <option value="" disabled>mm</option>
                                        {generateOptions(1, 12)}
                                    </select>
                                    <ChevronDown
                                        className={`absolute right-3 top-[35%] transform transition-transform duration-300
                                        ${focusedDropdown === "date_raised.month" ? "rotate-180" : ""}`}
                                        size={20}
                                        color="#AAAAAA"
                                    />
                                </div>
                                <div className="relative">
                                    <select
                                        name="date_raised.year"
                                        value={formData.date_raised.year}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedDropdown("date_raised.year")}
                                        onBlur={() => setFocusedDropdown(null)}
                                        className="add-training-inputs appearance-none pr-10 cursor-pointer"
                                    >
                                        <option value="" disabled>yyyy</option>
                                        {generateOptions(2023, 2030)}
                                    </select>
                                    <ChevronDown
                                        className={`absolute right-3 top-[35%] transform transition-transform duration-300
                                        ${focusedDropdown === "date_raised.year" ? "rotate-180" : ""}`}
                                        size={20}
                                        color="#AAAAAA"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="add-training-label">Complete By</label>
                            <div className="grid grid-cols-3 gap-5">
                                <div className="relative">
                                    <select
                                        name="date_completed.day"
                                        value={formData.date_completed.day}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedDropdown("date_completed.day")}
                                        onBlur={() => setFocusedDropdown(null)}
                                        className="add-training-inputs appearance-none pr-10 cursor-pointer"
                                    >
                                        <option value="" disabled>dd</option>
                                        {generateOptions(1, 31)}
                                    </select>
                                    <ChevronDown
                                        className={`absolute right-3 top-[35%] transform transition-transform duration-300
                                        ${focusedDropdown === "date_completed.day" ? "rotate-180" : ""}`}
                                        size={20}
                                        color="#AAAAAA"
                                    />
                                </div>
                                <div className="relative">
                                    <select
                                        name="date_completed.month"
                                        value={formData.date_completed.month}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedDropdown("date_completed.month")}
                                        onBlur={() => setFocusedDropdown(null)}
                                        className="add-training-inputs appearance-none pr-10 cursor-pointer"
                                    >
                                        <option value="" disabled>mm</option>
                                        {generateOptions(1, 12)}
                                    </select>
                                    <ChevronDown
                                        className={`absolute right-3 top-[35%] transform transition-transform duration-300
                                        ${focusedDropdown === "date_completed.month" ? "rotate-180" : ""}`}
                                        size={20}
                                        color="#AAAAAA"
                                    />
                                </div>
                                <div className="relative">
                                    <select
                                        name="date_completed.year"
                                        value={formData.date_completed.year}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedDropdown("date_completed.year")}
                                        onBlur={() => setFocusedDropdown(null)}
                                        className="add-training-inputs appearance-none pr-10 cursor-pointer"
                                    >
                                        <option value="" disabled>yyyy</option>
                                        {generateOptions(2023, 2030)}
                                    </select>
                                    <ChevronDown
                                        className={`absolute right-3 top-[35%] transform transition-transform duration-300
                                        ${focusedDropdown === "date_completed.year" ? "rotate-180" : ""}`}
                                        size={20}
                                        color="#AAAAAA"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 relative">
                            <label className="add-training-label">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                onFocus={() => setFocusedDropdown("status")}
                                onBlur={() => setFocusedDropdown(null)}
                                className="add-training-inputs appearance-none pr-10 cursor-pointer"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Completed">Completed</option>
                                <option value="Deleted">Deleted</option>
                            </select>
                            <ChevronDown
                                className={`absolute right-3 top-[55px] transform transition-transform duration-300
                                ${focusedDropdown === "status" ? "rotate-180" : ""}`}
                                size={20}
                                color="#AAAAAA"
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="add-training-label">Upload Attachment</label>
                            <div className="relative -top-[9px]">
                                <input
                                    type="file"
                                    id="fileInput"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <button
                                    type="button"
                                    className="w-full add-qmsmanual-attach"
                                    onClick={() => document.getElementById("fileInput").click()}
                                >
                                    <span className="file-input">
                                        {selectedFile ? selectedFile : "Choose File"}
                                    </span>
                                    <img src={file} alt="File Icon" />
                                </button>
                                <div className="flex items-center justify-between">
                                    {(typeof formData.upload_attachment === 'string' || selectedFile) && (
                                        <div
                                            onClick={handleViewFile}
                                            className="flex items-center gap-[8px] text-[#1E84AF] mt-[10.65px] click-view-file-text !text-[14px] cursor-pointer"
                                        >
                                            Click to view file
                                            <Eye size={17} />
                                        </div>
                                    )}
                                    {!selectedFile && (
                                        <p className="text-right no-file">No file chosen</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div></div>

                        <div className="flex items-end justify-end mt-3">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="send_notification"
                                    className="mr-2 form-checkboxes"
                                    checked={formData.send_notification || false}
                                    onChange={handleChange}
                                />
                                <span className="permissions-texts cursor-pointer">
                                    Send Notification
                                </span>
                            </label>
                        </div>

                        <div className="md:col-span-2 flex gap-4 justify-end">
                            <div className='flex gap-5'>
                                <button
                                    type="button"
                                    onClick={handleListDraftCorrectionActions}
                                    className="cancel-btn duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="save-btn duration-200"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </form>
                </>
        </div>
    );
};

export default QmsEditDraftCorrectionActions;