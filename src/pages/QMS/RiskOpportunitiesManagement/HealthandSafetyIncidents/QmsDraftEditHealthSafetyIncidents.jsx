import React, { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";
import RootCauseModal from './RootCauseModal';

const QmsDraftEditHealthSafetyIncidents = () => {
    const { id } = useParams(); // Get the incident ID from URL parameters
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

    // Now you can safely use the function
    const companyId = getUserCompanyId();
    const [isRootCauseModalOpen, setIsRootCauseModalOpen] = useState(false);
    const navigate = useNavigate();
    const [rootCauses, setRootCauses] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        source: '',
        title: '',
        next_hsi_no: '',
        root_cause: '',
        report_by: '',
        description: '',
        action: '',
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
        status: '',
        remarks: '',
        send_notification: false,
        is_draft: false
    });

    const [focusedDropdown, setFocusedDropdown] = useState(null);

    useEffect(() => {
        fetchIncidentDetails();
        fetchRootCauses();
        fetchUsers();
    }, [id]);

    const fetchIncidentDetails = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${BASE_URL}/qms/car/${id}/`);
            const incident = response.data;

            // Parse dates
            const dateRaised = parseDate(incident.date_raised);
            const dateCompleted = parseDate(incident.date_completed);

            // Format HSI number with prefix if not present
            const hsiNumber = incident.next_hsi_no.startsWith('HSI-')
                ? incident.next_hsi_no
                : `HSI-${incident.next_hsi_no}`;

            setFormData({
                source: incident.source || '',
                title: incident.title || '',
                next_hsi_no: hsiNumber,
                root_cause: incident.root_cause || '',
                report_by: incident.report_by || '',
                description: incident.description || '',
                action: incident.action || '',
                date_raised: dateRaised,
                date_completed: dateCompleted,
                status: incident.status || '',
                remarks: incident.remarks || '',
                send_notification: incident.send_notification || false,
                is_draft: incident.is_draft || false
            });

            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching incident details:', error);
            setIsLoading(false);
            setError('Failed to load incident details. Please try again.');
        }
    };

    // Helper function to parse date string into day, month, year object
    const parseDate = (dateStr) => {
        if (!dateStr) return { day: '', month: '', year: '' };

        try {
            const [year, month, day] = dateStr.split('-');
            return {
                day: day || '',
                month: month || '',
                year: year || ''
            };
        } catch (e) {
            console.error('Error parsing date:', e);
            return { day: '', month: '', year: '' };
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

    const handleListHealthSafetyIncidents = () => {
        navigate('/company/qms/draft-health-safety-incidents')
    }

    const fetchRootCauses = async () => {
        try {
            setIsLoading(true);
            const companyId = getUserCompanyId();
            const response = await axios.get(`${BASE_URL}/qms/root-cause/company/${companyId}/`);
            setRootCauses(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching root causes:', error);
            setIsLoading(false);
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
            setError("Failed to load users. Please check your connection and try again.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'next_hsi_no') return; // Prevent editing HSI number

        // Handle nested objects (dates)
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
            // Handle checkboxes
            setFormData({
                ...formData,
                [name]: e.target.checked
            });
        } else {
            // Handle regular inputs
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const formatDate = (dateObj) => {
        if (!dateObj.year || !dateObj.month || !dateObj.day) return null;
        return `${dateObj.year}-${dateObj.month}-${dateObj.day}`;
    };

    const handleDraftSave = async (e) => {
        e.preventDefault();

        try {
            setIsLoading(true);
            setError('');
            const companyId = getUserCompanyId();

            // Format the dates
            const dateRaised = formatDate(formData.date_raised);
            const dateCompleted = formatDate(formData.date_completed);

            // Extract just the number part for submission (remove HSI- prefix)
            const rawHsiNumber = formData.next_hsi_no.replace('HSI-', '');

            // Prepare submission data
            const submissionData = {
                company: companyId,
                title: formData.title,
                source: formData.source,
                root_cause: formData.root_cause,
                description: formData.description,
                date_raised: dateRaised,
                date_completed: dateCompleted,
                status: formData.status,
                report_by: formData.report_by,
                next_hsi_no: rawHsiNumber, // Send just the number part
                action: formData.action,
                remarks: formData.remarks,
                send_notification: formData.send_notification,
                is_draft: true
            };

            // Update the draft
            const response = await axios.put(`${BASE_URL}/qms/car/${id}/`, submissionData);

            console.log('Updated Draft:', response.data);

            setIsLoading(false);

            // Navigate after successful update
            navigate('/company/qms/draft-correction-actions');

        } catch (error) {
            console.error('Error saving draft:', error);
            setIsLoading(false);
            setError('Failed to save draft. Please check your inputs and try again.');
        }
    };

    const handleSubmit = async (e, asDraft = false) => {
        e.preventDefault();

        // If saving as draft, use the specialized draft save function
        if (asDraft) {
            handleDraftSave(e);
            return;
        }

        try {
            setIsLoading(true);
            const companyId = getUserCompanyId();

            // Format the dates
            const dateRaised = formatDate(formData.date_raised);
            const dateCompleted = formatDate(formData.date_completed);

            // Extract just the number part for submission (remove HSI- prefix)
            const rawHsiNumber = formData.next_hsi_no.replace('HSI-', '');

            // Prepare submission data
            const submissionData = {
                company: companyId,
                title: formData.title,
                source: formData.source,
                root_cause: formData.root_cause,
                description: formData.description,
                date_raised: dateRaised,
                date_completed: dateCompleted,
                status: formData.status,
                report_by: formData.report_by,
                next_hsi_no: rawHsiNumber, // Send just the number part
                action: formData.action,
                remarks: formData.remarks,
                send_notification: formData.send_notification,
                is_draft: false
            };

            // Update the record
            const response = await axios.put(`${BASE_URL}/qms/car/${id}/`, submissionData);

            console.log('Updated:', response.data);

            setIsLoading(false);

            navigate('/company/qms/list-health-safety-incidents');

        } catch (error) {
            console.error('Error updating incident:', error);
            setIsLoading(false);
            setError('Failed to update. Please check your inputs and try again.');
        }
    };

    // Generate options for dropdowns
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

    // if (isLoading && !formData.next_hsi_no) {
    //     return (
    //         <div className="bg-[#1C1C24] text-white p-5 rounded-lg min-h-[300px] flex items-center justify-center">
    //             <p>Loading incident details...</p>
    //         </div>
    //     );
    // }

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            <div className="flex justify-between items-center border-b border-[#383840] px-[104px] pb-5">
                <h1 className="add-training-head">Edit Draft Health and Safety Incident</h1>
                <button
                    className="border border-[#858585] text-[#858585] rounded px-3 h-[42px] list-training-btn duration-200"
                    onClick={() => handleListHealthSafetyIncidents()}
                >
                    List Draft Health and Safety Incidents
                </button>
            </div>

            {error && (
                <div className="bg-red-500 bg-opacity-20 text-red-300 px-[104px] py-2 my-2">
                    {error}
                </div>
            )}

            <RootCauseModal
                isOpen={isRootCauseModalOpen}
                onClose={handleCloseRootCauseModal}
            />

            <form onSubmit={(e) => handleSubmit(e, false)} className="grid grid-cols-1 md:grid-cols-2 gap-6 px-[104px] py-5">
                <div className="flex flex-col gap-3">
                    <label className="add-training-label">
                        Source <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="source"
                        value={formData.source}
                        onChange={handleChange}
                        className="add-training-inputs focus:outline-none"
                        required
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <label className="add-training-label">
                        Incident Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="add-training-inputs focus:outline-none"
                        required
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <label className="add-training-label">
                        Incident No
                    </label>
                    <input
                        type="text"
                        name="next_hsi_no"
                        value={formData.next_hsi_no}
                        className="add-training-inputs focus:outline-none cursor-not-allowed bg-gray-800"
                        readOnly
                        title="HSI number cannot be changed"
                    />
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
                        <option value="" disabled>Select Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Deleted">Deleted</option>
                    </select>
                    <ChevronDown
                        className={`absolute right-3 top-[60%] transform transition-transform duration-300 
                        ${focusedDropdown === "status" ? "rotate-180" : ""}`}
                        size={20}
                        color="#AAAAAA"
                    />
                </div>

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
                        <option value="" disabled>
                            {isLoading ? "Loading..." : "Select Root Cause"}
                        </option>
                        {rootCauses && rootCauses.length > 0 ? (
                            rootCauses.map(cause => (
                                <option key={cause.id} value={cause.id}>
                                    {cause.title}
                                </option>
                            ))
                        ) : !isLoading && (
                            <option value="" disabled>No root causes found</option>
                        )}
                    </select>
                    <ChevronDown
                        className={`absolute right-3 top-[40%] transform transition-transform duration-300 
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

                {/* Rest of the form remains the same */}
                <div className="flex flex-col gap-3 relative">
                    <label className="add-training-label">Report By</label>
                    <select
                        name="report_by"
                        value={formData.report_by}
                        onChange={handleChange}
                        onFocus={() => setFocusedDropdown("report_by")}
                        onBlur={() => setFocusedDropdown(null)}
                        className="add-training-inputs appearance-none pr-10 cursor-pointer"
                    >
                        <option value="" disabled>
                            {isLoading ? "Loading..." : "Select Executor"}
                        </option>
                        {users && users.length > 0 ? (
                            users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.first_name} {user.last_name || ''}
                                </option>
                            ))
                        ) : !isLoading && (
                            <option value="" disabled>No users found</option>
                        )}
                    </select>
                    <ChevronDown
                        className={`absolute right-3 top-[40%] transform transition-transform duration-300 
                        ${focusedDropdown === "report_by" ? "rotate-180" : ""}`}
                        size={20}
                        color="#AAAAAA"
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <label className="add-training-label">
                        Incident Description
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
                        name="action"
                        value={formData.action}
                        onChange={handleChange}
                        className="add-training-inputs focus:outline-none !h-[98px]"
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <label className="add-training-label">Date Raised</label>
                    <div className="grid grid-cols-3 gap-5">
                        {/* Day */}
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

                        {/* Month */}
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

                        {/* Year */}
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
                        {/* Day */}
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

                        {/* Month */}
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

                        {/* Year */}
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

                <div className="flex flex-col gap-3">
                    <label className="add-training-label">
                        Remarks
                    </label>
                    <textarea
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        className="add-training-inputs focus:outline-none !h-[98px]"
                        required
                    />
                </div>

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

                {/* Form Actions */}
                <div className="md:col-span-2 flex gap-4 justify-end">
                    <div className='flex gap-5'>
                        <button
                            type="button"
                            onClick={handleListHealthSafetyIncidents}
                            className="cancel-btn duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="save-btn duration-200"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};
export default QmsDraftEditHealthSafetyIncidents
