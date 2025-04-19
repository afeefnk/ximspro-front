import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import viewIcon from "../../../../assets/images/Companies/view.svg";
import deleteIcon from "../../../../assets/images/Company Documentation/delete.svg";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";
import { ChevronDown } from 'lucide-react';


const EditQmsEmployeeSatisfaction = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    const [formData, setFormData] = useState({
        survey_title: '',
        description: '',
        valid_till: null,
        is_draft: true
    });
    
    // Separate state for date values to handle the UI components
    const [dateValues, setDateValues] = useState({
        day: '',
        month: '',
        year: ''
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
                    survey_title: data.survey_title || '',
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
                setError("Failed to load employee survey data");
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
        if (!formData.survey_title) {
            setError("Evaluation title is required");
            return false;
        }
        
        // Validate date if all date fields are filled
        if (dateValues.day && dateValues.month && dateValues.year) {
            const dateStr = `${dateValues.year}-${dateValues.month}-${dateValues.day}`;
            const date = new Date(dateStr);
            
            if (isNaN(date.getTime())) {
                setError("Invalid date");
                return false;
            }
            
            // Update the valid_till field in formData
            setFormData({
                ...formData,
                valid_till: dateStr
            });
        } else if (dateValues.day || dateValues.month || dateValues.year) {
            // If some date fields are filled but not all
            setError("Please complete the date");
            return false;
        }
        
        return true;
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name.startsWith('valid_till.')) {
            const field = name.split('.')[1];
            setDateValues({
                ...dateValues,
                [field]: value
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        // Prepare submission data
        const submissionData = {
            ...formData
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
            setSuccess("survey evaluation updated successfully");
            
            // Navigate after a brief delay to show success message
            setTimeout(() => {
                navigate("/company/qms/list-satisfaction-survey");
            }, 1500);
        } catch (err) {
            console.error("Error updating survey evaluation:", err);
            setError("Failed to update survey evaluation");
            setLoading(false);
        }
    };
    
    const handleCancel = () => {
        navigate('/company/qms/list-satisfaction-survey');
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
                    <h1 className="add-employee-survey-head">Edit Employee survey Evaluation</h1>
                    <button 
                        className="border border-[#858585] text-[#858585] rounded px-[10px] h-[42px] list-training-btn duration-200"
                        onClick={() => navigate('/company/qms/employee-survey')}
                    >
                        List Employee Satisfaction survey  
                    </button>
                </div>
                
                {error && (
                    <div className="mx-[104px] mt-4 p-3 bg-red-900/30 border border-red-500 rounded text-red-400">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="mx-[104px] mt-4 p-3 bg-green-900/30 border border-green-500 rounded text-green-400">
                        {success}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className='px-[104px] pt-5'>
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
                                className="w-full employee-performace-inputs"
                                required
                            />
                        </div>
                        
                        <div className="md:row-span-2">
                            <label className="block employee-performace-label">Survey Description</label>
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
                                        name="valid_till.day"
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
                                        name="valid_till.month"
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
                                        name="valid_till.year"
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
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditQmsEmployeeSatisfaction