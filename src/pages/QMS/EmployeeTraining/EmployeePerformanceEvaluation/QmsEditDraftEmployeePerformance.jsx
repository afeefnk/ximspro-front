import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";
import EditDraftEmployeePerformanceSuccessModal from '../Modals/EditDraftEmployeePerformanceSuccessModal';
import ErrorModal from '../Modals/ErrorModal';

const QmsEditDraftEmployeePerformance = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success , setSuccess ] = useState(null);
    const [formData, setFormData] = useState({
        evaluation_title: '',
        description: '',
        valid_till: null,
        is_draft: true
    });

    // For date picker UI
    const [dateValues, setDateValues] = useState({
        day: '',
        month: '',
        year: ''
    });

    const [showEditDraftEmployeePerformanceSuccessModal, setShowEditDraftEmployeePerformanceSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);

    const [focusedField, setFocusedField] = useState("");

    useEffect(() => {
        const fetchPerformanceData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${BASE_URL}/qms/performance-get/${id}/`);
                const data = response.data;

                // Set the main form data
                setFormData({
                    evaluation_title: data.evaluation_title || '',
                    description: data.description || '',
                    valid_till: data.valid_till || null,
                    is_draft: data.is_draft !== undefined ? data.is_draft : true
                });

                // If valid_till exists, parse it to set the date values
                if (data.valid_till) {
                    const date = new Date(data.valid_till);
                    setDateValues({
                        day: String(date.getDate()).padStart(2, '0'),
                        month: String(date.getMonth() + 1).padStart(2, '0'),
                        year: String(date.getFullYear())
                    });
                }

                setError(null);
            } catch (err) {
                setError("Failed to load employee performance data");
                console.error("Error fetching employee performance data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPerformanceData();
        }
    }, [id]);

    const handleFocus = (field) => setFocusedField(field);
    const handleBlur = () => setFocusedField("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            // Handle date fields
            const [parent, child] = name.split('.');
            setDateValues({
                ...dateValues,
                [child]: value
            });

            // Update the valid_till in formData if all date fields are filled
            if (child === 'day' || child === 'month' || child === 'year') {
                const updatedDateValues = {
                    ...dateValues,
                    [child]: value
                };

                // Only set valid_till if all date parts are present
                if (updatedDateValues.day && updatedDateValues.month && updatedDateValues.year) {
                    const formattedDate = `${updatedDateValues.year}-${updatedDateValues.month}-${updatedDateValues.day}`;
                    setFormData({
                        ...formData,
                        valid_till: formattedDate
                    });
                }
            }
        } else {
            // Handle other form fields
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const validateForm = () => {
        if (!formData.evaluation_title) {
            setError("Evaluation title is required");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.put(`${BASE_URL}/qms/performance/${id}/update/`, formData);
            console.log("Performance evaluation updated successfully:", response.data);
            setSuccess("Performance evaluation updated successfully");


            setShowEditDraftEmployeePerformanceSuccessModal(true);
            setTimeout(() => {
                setShowEditDraftEmployeePerformanceSuccessModal(false);
                navigate("/company/qms/draft-employee-performance");
            }, 1500);
        } catch (err) {
            console.error("Error updating performance evaluation:", err);
            setError("Failed to update performance evaluation");
            setShowErrorModal(true);
            setTimeout(() => {
                setShowErrorModal(false);
            }, 3000);
            setLoading(false);
        }
    };

    const handleListEmployeePerformance = () => {
        navigate('/company/qms/draft-employee-performance');
    };

    const handleCancel = () => {
        navigate('/company/qms/draft-employee-performance');
    };

    // Generate date options
    const dayOptions = Array.from({ length: 31 }, (_, i) => {
        const day = i + 1;
        return (
            <option key={day} value={day < 10 ? `0${day}` : String(day)}>
                {day < 10 ? `0${day}` : day}
            </option>
        );
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthOptions = months.map((month, index) => {
        const monthValue = index + 1;
        return (
            <option key={month} value={monthValue < 10 ? `0${monthValue}` : String(monthValue)}>
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

    return (
        <div className="bg-[#1C1C24] text-white p-5">
            <div>
                <div className="flex justify-between items-center pb-5 border-b border-[#383840] px-[104px]">
                    <h1 className="add-employee-performance-head">Edit Draft Employee Performance Evaluation</h1>
                    <button
                        className="border border-[#858585] text-[#858585] rounded px-[10px] h-[42px] list-training-btn duration-200"
                        onClick={handleListEmployeePerformance}
                    >
                        List Draft Employee Performance Evaluation
                    </button>
                </div>

                <EditDraftEmployeePerformanceSuccessModal
                    showEditDraftEmployeePerformanceSuccessModal={showEditDraftEmployeePerformanceSuccessModal}
                    onClose={() => {
                        setShowEditDraftEmployeePerformanceSuccessModal(false);
                    }}
                />

                <ErrorModal
                    showErrorModal={showErrorModal}
                    onClose={() => {
                        setShowErrorModal(false);
                    }}
                />



                {!loading && (
                    <form onSubmit={handleSubmit} className='px-[104px] pt-5'>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block employee-performace-label">
                                    Evaluation Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="evaluation_title"
                                    value={formData.evaluation_title}
                                    onChange={handleChange}
                                    className="w-full employee-performace-inputs"
                                    required
                                />
                            </div>

                            <div className="md:row-span-2">
                                <label className="block employee-performace-label">Evaluation Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full h-full min-h-[151px] employee-performace-inputs"
                                />
                            </div>

                            <div>
                                <label className="block employee-performace-label">Valid Till</label>
                                <div className="flex gap-5">
                                    {/* Day */}
                                    <div className="relative w-1/3">
                                        <select
                                            name="validTill.day"
                                            value={dateValues.day}
                                            onChange={handleChange}
                                            onFocus={() => handleFocus("day")}
                                            onBlur={handleBlur}
                                            className="appearance-none w-full employee-performace-inputs cursor-pointer"
                                        >
                                            <option value="">dd</option>
                                            {dayOptions}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                            <ChevronDown
                                                className={`w-5 h-5 transition-transform duration-300 text-[#AAAAAA] ${focusedField === "day" ? "rotate-180" : ""}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Month */}
                                    <div className="relative w-1/3">
                                        <select
                                            name="validTill.month"
                                            value={dateValues.month}
                                            onChange={handleChange}
                                            onFocus={() => handleFocus("month")}
                                            onBlur={handleBlur}
                                            className="appearance-none w-full employee-performace-inputs cursor-pointer"
                                        >
                                            <option value="">mm</option>
                                            {monthOptions}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                            <ChevronDown
                                                className={`w-5 h-5 transition-transform duration-300 text-[#AAAAAA] ${focusedField === "month" ? "rotate-180" : ""}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Year */}
                                    <div className="relative w-1/3">
                                        <select
                                            name="validTill.year"
                                            value={dateValues.year}
                                            onChange={handleChange}
                                            onFocus={() => handleFocus("year")}
                                            onBlur={handleBlur}
                                            className="appearance-none w-full employee-performace-inputs cursor-pointer"
                                        >
                                            <option value="">yyyy</option>
                                            {yearOptions}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                            <ChevronDown
                                                className={`w-5 h-5 transition-transform duration-300 text-[#AAAAAA] ${focusedField === "year" ? "rotate-180" : ""}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-5 mt-5 pl-[23.5rem]">
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
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default QmsEditDraftEmployeePerformance;