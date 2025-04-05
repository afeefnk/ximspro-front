import React, { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react';
import file from "../../../../assets/images/Company Documentation/file-icon.svg"
import "./addqmsmanual.css"

import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";

const EditDraftQmsManual = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage, setUsersPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileObject, setFileObject] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [manuals, setManuals] = useState([]);
    const [previewAttachment, setPreviewAttachment] = useState(null);
    const [manualDetails, setManualDetails] = useState(null);
    const { id } = useParams();
    const [isInitialLoad, setIsInitialLoad] = useState(true);

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
    useEffect(() => {
        if (companyId && id) {
            fetchManualDetails();

        }
    }, [companyId, id]);
    useEffect(() => {
        if (manualDetails) {
            setFormData({
                title: manualDetails.title || '',
                written_by: manualDetails.written_by?.id || null,
                no: manualDetails.no || '',
                checked_by: manualDetails.checked_by?.id || null,
                rivision: manualDetails.rivision || '',
                approved_by: manualDetails.approved_by?.id || null,
                document_type: manualDetails.document_type || 'System',
                date: manualDetails.date || formData.date,
                review_frequency_year: manualDetails.review_frequency_year || '',
                review_frequency_month: manualDetails.review_frequency_month || '',
                publish: manualDetails.publish || false,
                send_notification_checked_by: manualDetails.send_notification_checked_by || false,
                send_email_checked_by: manualDetails.send_email_checked_by || false,
                send_notification_approved_by: manualDetails.send_notification_approved_by || false,
                send_email_approved_by: manualDetails.send_email_approved_by || false,
            });
        }
    }, [manualDetails]);
    const fetchManualDetails = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/qms/manual-detail/${id}/`);
            setManualDetails(response.data);
            setIsInitialLoad(false);
            console.log("Manual Details:", response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching manual details:", err);
            setError("Failed to load manual details");
            setIsInitialLoad(false);
            setLoading(false);
        }
    };
    const renderAttachmentPreview = () => {

        if (previewAttachment) {
            const attachmentName = selectedFile || manualDetails?.upload_attachment_name || 'Attachment';

            return (
                <div className="mt-4 p-4 bg-[#2C2C35] rounded-lg flex flex-col items-center">
                    <div className="text-white flex items-center space-x-4">
                        <span>{attachmentName}</span>
                        <button
                            onClick={() => window.open(previewAttachment, '_blank')}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition duration-300"
                        >
                            View File
                        </button>
                    </div>
                </div>
            );
        }
        return null;
    };


    console.log("Stored Company ID:", companyId);

    const [formData, setFormData] = useState({
        title: '',
        written_by: null,
        no: '',
        checked_by: null,
        rivision: '',
        approved_by: null,
        document_type: 'System',
        date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`,
        review_frequency_year: '',
        review_frequency_month: '',
        publish: false,
        send_notification_checked_by: 'No',
        send_email_checked_by:  'No',
        send_notification_approved_by:  'No',
        send_email_approved_by:  'No',
      
    });

    const [openDropdowns, setOpenDropdowns] = useState({
        written_by: false,
        checked_by: false,
        approved_by: false,
        document_type: false,
        day: false,
        month: false,
        year: false,
        send_notification_checked_by: false,
        send_email_checked_by: false,
        send_notification_approved_by: false,
        send_email_approved_by: false
    });

    useEffect(() => {
        if (companyId) {
            fetchUsers();
        }
    }, [companyId]);

    const fetchUsers = async () => {
        try {
            if (!companyId) return;

            const response = await axios.get(`${BASE_URL}/company/users/${companyId}/`);

            console.log("API Response:", response.data);

            if (Array.isArray(response.data)) {
                setUsers(response.data);
                console.log("Users loaded:", response.data);
            } else {
                setUsers([]);
                console.error("Unexpected response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setError("Failed to load manuals. Please check your connection and try again.");
        }
    };

    const getDaysInMonth = (month, year) => {
        return new Date(year, month, 0).getDate();
    };


    const parseDate = () => {
        const dateObj = new Date(formData.date);
        return {
            day: dateObj.getDate(),
            month: dateObj.getMonth() + 1,
            year: dateObj.getFullYear()
        };
    };

    const dateParts = parseDate();

    const days = Array.from(
        { length: getDaysInMonth(dateParts.month, dateParts.year) },
        (_, i) => i + 1
    );


    const months = Array.from({ length: 12 }, (_, i) => i + 1);


    const years = Array.from(
        { length: 21 },
        (_, i) => currentYear - 10 + i
    );

    const documentTypes = [
        'System',
        'Paper',
        'External',
        'Work Instruction'
    ];

    const toggleDropdown = (dropdown) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [dropdown]: !prev[dropdown]
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file.name);
            setFileObject(file);
        }
    };




    useEffect(() => {

        const draftManualId = localStorage.getItem('selected_draft_manual_id');


        const routeState = location.state?.draftManualId;


        const urlParams = new URLSearchParams(window.location.search);
        const urlDraftManualId = urlParams.get('draftManualId');

        const id = draftManualId || routeState || urlDraftManualId;

        if (id) {
            console.log("Draft Manual ID found:", id);
            fetchDraftManualDetails(id);
        } else {
            console.warn("No draft manual ID found");
        }
    }, []);

    const handleDropdownChange = (e, dropdown) => {
        const value = e.target.value;

        if (dropdown === 'day' || dropdown === 'month' || dropdown === 'year') {
            const dateObj = parseDate();


            dateObj[dropdown] = parseInt(value, 10);


            const newDate = `${dateObj.year}-${String(dateObj.month).padStart(2, '0')}-${String(dateObj.day).padStart(2, '0')}`;

            setFormData(prev => ({
                ...prev,
                date: newDate
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [dropdown]: value
            }));
        }

        setOpenDropdowns(prev => ({ ...prev, [dropdown]: false }));
    };

    const handleCancelClick = () => {
        navigate('/company/qms/draftmanual')
    }

    useEffect(() => {
        if (manualDetails?.upload_attachment) {
            setPreviewAttachment(manualDetails.upload_attachment);
        }
    }, [manualDetails]);

    const getMonthName = (monthNum) => {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames[monthNum - 1];
    };


    const formatUserName = (user) => {
        return `${user.first_name} ${user.last_name}`;
    };

    const handleUpdateClick = async () => {
        try {
            setLoading(true);

            const companyId = getUserCompanyId();
            if (!companyId) {
                setError('Company ID not found. Please log in again.');
                setLoading(false);
                return;
            }

            const submitData = new FormData();
            submitData.append('company', companyId);


            // Before submitting the form data
            Object.keys(formData).forEach(key => {
                // Only append non-null values
                if (formData[key] !== null && formData[key] !== 'null') {
                    submitData.append(key, formData[key]);
                }
            });

            Object.keys(formData).forEach(key => {
                if (key === 'send_notification_checked_by' || key === 'send_notification_approved_by') {

                    return;
                }
                submitData.append(key, formData[key]);
            });

            submitData.append('send_notification_checked_by', formData.send_notification_checked_by === 'Yes');
            submitData.append('send_email_checked_by', formData.send_email_checked_by === 'Yes');
            submitData.append('send_notification_approved_by', formData.send_notification_approved_by === 'Yes');
            submitData.append('send_email_approved_by', formData.send_email_approved_by === 'Yes');

            submitData.set('send_notification_checked_by', formData.send_notification_checked_by === 'Yes');
            submitData.set('send_email_checked_by', formData.send_email_checked_by === 'Yes');
            submitData.set('send_notification_approved_by', formData.send_notification_approved_by === 'Yes');
            submitData.set('send_email_approved_by', formData.send_email_approved_by === 'Yes');


            if (fileObject) {
                submitData.append('upload_attachment', fileObject);
            }

            const response = await axios.put(`${BASE_URL}/qms/manuals/${id}/update/`, submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setLoading(false);
            alert('Manual updated successfully!');
            navigate('/company/qms/manual');
        } catch (err) {
            setLoading(false);
            setError('Failed to update manual');
            console.error('Error updating manual:', err);
        }
    };

    return (
        <div className="bg-[#1C1C24] rounded-lg text-white">
            <div>
                <h1 className="add-manual-sections">Manual Sections Draft</h1>

                {error && (
                    <div className="mx-[18px] px-[104px] mt-4 p-2 bg-red-500 rounded text-white">
                        {error}
                    </div>
                )}

                <div className="border-t border-[#383840] mx-[18px] pt-[22px] px-[104px]">
                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label className="add-qms-manual-label">
                                Section Name/Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full add-qms-manual-inputs"
                            />
                        </div>

                        <div>
                            <label className="add-qms-manual-label">
                                Written/Prepare By <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                    name="written_by"
                                    value={formData.written_by || ''}
                                    onFocus={() => toggleDropdown('written_by')}
                                    onChange={(e) => handleDropdownChange(e, 'written_by')}
                                    onBlur={() => setOpenDropdowns(prev => ({ ...prev, written_by: false }))}
                                >
                                    <option value="">Select User</option>
                                    {users.map(user => (
                                        <option key={`written-${user.id}`} value={user.id}>
                                            {formatUserName(user)}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.written_by ? 'rotate-180' : ''}`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="add-qms-manual-label">
                                Section Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="no"
                                value={formData.no}
                                onChange={handleChange}
                                className="w-full add-qms-manual-inputs"
                            />
                        </div>

                        <div className="flex space-x-4">
                            <div className="flex-1 w-1/2">
                                <label className="add-qms-manual-label">
                                    Checked/Reviewed By <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                        name="checked_by"
                                        value={formData.checked_by || ''}
                                        onFocus={() => toggleDropdown('checked_by')}
                                        onChange={(e) => handleDropdownChange(e, 'checked_by')}
                                        onBlur={() => setOpenDropdowns(prev => ({ ...prev, checked_by: false }))}
                                    >
                                        <option value="">Select User</option>
                                        {users.map(user => (
                                            <option key={`checked-${user.id}`} value={user.id}>
                                                {formatUserName(user)}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.checked_by ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            </div>
                            <div className="w-1/4">
                                <label className="add-qms-manual-label">
                                    System Notify
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                        name="send_notification_checked_by"
                                        value={formData.send_notification_checked_by ? "yes" : "no"}
                                        onFocus={() => toggleDropdown('send_notification_checked_by')}
                                        onChange={(e) => handleDropdownChange(e, 'send_notification_checked_by')}
                                        onBlur={() => setOpenDropdowns(prev => ({ ...prev, send_notification_checked_by: false }))}
                                    >
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                    <ChevronDown
                                        className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.send_notification_checked_by ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            </div>
                            <div className="w-1/4">
                                <label className="add-qms-manual-label">
                                    Email Notify
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                        name="send_email_checked_by"
                                        value={formData.send_email_checked_by ? "yes" : "no"}
                                        onFocus={() => toggleDropdown('send_email_checked_by')}
                                        onChange={(e) => handleDropdownChange(e, 'send_email_checked_by')}
                                        onBlur={() => setOpenDropdowns(prev => ({ ...prev, send_email_checked_by: false }))}
                                    >
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                    <ChevronDown
                                        className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.send_email_checked_by ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="add-qms-manual-label">
                                Revision
                            </label>
                            <input
                                type="text"
                                name="rivision"
                                value={formData.rivision}
                                onChange={handleChange}
                                className="w-full add-qms-manual-inputs"
                            />
                        </div>

                        <div className="flex space-x-4">
                            <div className="flex-1 w-1/2">
                                <label className="add-qms-manual-label">
                                    Approved by <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                        name="approved_by"
                                        value={formData.approved_by || ''}
                                        onFocus={() => toggleDropdown('approved_by')}
                                        onChange={(e) => handleDropdownChange(e, 'approved_by')}
                                        onBlur={() => setOpenDropdowns(prev => ({ ...prev, approved_by: false }))}
                                    >
                                        <option value="">Select User</option>
                                        {users.map(user => (
                                            <option key={`approved-${user.id}`} value={user.id}>
                                                {formatUserName(user)}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.approved_by ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            </div>
                            <div className="w-1/4">
                                <label className="add-qms-manual-label">
                                     System Notify
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                        name="send_notification_approved_by"
                                        value={formData.send_notification_approved_by ? "yes" : "no"}
                                        onFocus={() => toggleDropdown('send_notification_approved_by')}
                                        onChange={(e) => handleDropdownChange(e, 'send_notification_approved_by')}
                                        onBlur={() => setOpenDropdowns(prev => ({ ...prev, send_notification_approved_by: false }))}
                                    >
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                    <ChevronDown
                                        className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.send_notification_approved_by ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            </div>
                            <div className="w-1/4">
                                <label className="add-qms-manual-label">
                                     Email Notify
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                        name="send_email_approved_by"
                                        value={formData.send_email_approved_by ? "yes" : "no"}
                                        onFocus={() => toggleDropdown('send_email_approved_by')}
                                        onChange={(e) => handleDropdownChange(e, 'send_email_approved_by')}
                                        onBlur={() => setOpenDropdowns(prev => ({ ...prev, send_email_approved_by: false }))}
                                    >
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                    <ChevronDown
                                        className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.send_email_approved_by ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="add-qms-manual-label">
                                Document Type
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                    name="document_type"
                                    value={formData.document_type}
                                    onFocus={() => toggleDropdown('document_type')}
                                    onChange={(e) => handleDropdownChange(e, 'document_type')}
                                    onBlur={() => setOpenDropdowns(prev => ({ ...prev, document_type: false }))}
                                >
                                    {documentTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.document_type ? 'rotate-180' : ''}`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="add-qms-manual-label">
                                Date
                            </label>
                            <div className="flex space-x-5">
                                <div className="relative w-1/3">
                                    <select
                                        className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                        value={dateParts.day}
                                        onFocus={() => toggleDropdown('day')}
                                        onChange={(e) => handleDropdownChange(e, 'day')}
                                        onBlur={() => setOpenDropdowns(prev => ({ ...prev, day: false }))}
                                    >
                                        {days.map(day => (
                                            <option key={`day-${day}`} value={day}>
                                                {day < 10 ? `0${day}` : day}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.day ? 'rotate-180' : ''}`}
                                    />
                                </div>
                                <div className="relative w-1/3">
                                    <select
                                        className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                        value={dateParts.month}
                                        onFocus={() => toggleDropdown('month')}
                                        onChange={(e) => handleDropdownChange(e, 'month')}
                                        onBlur={() => setOpenDropdowns(prev => ({ ...prev, month: false }))}
                                    >
                                        {months.map(month => (
                                            <option key={`month-${month}`} value={month}>
                                                {month < 10 ? `0${month}` : month} - {getMonthName(month).substring(0, 3)}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.month ? 'rotate-180' : ''}`}
                                    />
                                </div>
                                <div className="relative w-1/3">
                                    <select
                                        className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                        value={dateParts.year}
                                        onFocus={() => toggleDropdown('year')}
                                        onChange={(e) => handleDropdownChange(e, 'year')}
                                        onBlur={() => setOpenDropdowns(prev => ({ ...prev, year: false }))}
                                    >
                                        {years.map(year => (
                                            <option key={`year-${year}`} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.year ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="add-qms-manual-label">
                                Attach Document
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    id="fileInput"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <button
                                    type="button"
                                    className="w-full add-qmsmanual-attach"
                                    onClick={() => document.getElementById('fileInput').click()}
                                >
                                    <span className="file-input">
                                        {selectedFile ? selectedFile : "Choose File"}
                                    </span>
                                    <img src={file} alt="File Icon" />
                                </button>
                                {!selectedFile && <p className="text-right no-file">No file chosen</p>}
                            </div>
                            {renderAttachmentPreview()}
                        </div>

                        <div>
                            <label className='add-qms-manual-label'>
                                Review Frequency
                            </label>
                            <div className="flex space-x-5">
                                <input
                                    type="text"
                                    name="review_frequency_year"
                                    placeholder='Years'
                                    value={formData.review_frequency_year}
                                    onChange={handleChange}
                                    className="w-full add-qms-manual-inputs"
                                />
                                <input
                                    type="text"
                                    name="review_frequency_month"
                                    placeholder='Months'
                                    value={formData.review_frequency_month}
                                    onChange={handleChange}
                                    className="w-full add-qms-manual-inputs"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center mt-[22px] justify-between">
                        <div className='mb-6'>
                            <button
                                className="request-correction-btn duration-200"
                            >
                                Save as Draft
                            </button>
                        </div>
                        <div className='flex gap-[22px] mb-6'>
                            <button
                                className="cancel-btn duration-200"
                                onClick={handleCancelClick}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                className="save-btn duration-200"
                                onClick={handleUpdateClick}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditDraftQmsManual