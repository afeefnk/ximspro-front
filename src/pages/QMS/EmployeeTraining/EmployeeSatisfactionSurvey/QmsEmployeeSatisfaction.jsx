import React, { useEffect, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import plusIcon from "../../../../assets/images/Company Documentation/plus icon.svg";
import viewIcon from "../../../../assets/images/Companies/view.svg";
import editIcon from "../../../../assets/images/Company Documentation/edit.svg";
import deleteIcon from "../../../../assets/images/Company Documentation/delete.svg";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const QmsEmployeeSatisfaction = () => {
    const initialData = [
        { id: 1, title: 'Anonymous', validTill: '03-12-2024', email: 'employee1@company.com' },
        { id: 2, title: 'Anonymous', validTill: '03-12-2024', email: 'employee2@company.com' },
    ];

    const SurveyModal = ({ isOpen, onClose, employee, employeeList = initialData }) => {
        // Initialize with the employee ID if available, otherwise 'Select Employee'
        const [selectedEmployeeId, setSelectedEmployeeId] = useState(
            employee ? employee.id : 'Select Employee'
        );
        const [ratings, setRatings] = useState(Array(4).fill('N/A'));
        const [openDropdown, setOpenDropdown] = useState(null);
        const [isDropdownOpen, setIsDropdownOpen] = useState(false);

        // Update selectedEmployeeId when employee prop changes
        useEffect(() => {
            if (employee) {
                setSelectedEmployeeId(employee.id);
            }
        }, [employee]);

        const handleRatingChange = (index, rating) => {
            const newRatings = [...ratings];
            newRatings[index] = rating;
            setRatings(newRatings);
            setOpenDropdown(null);
        };

        const toggleDropdown = (index) => {
            setOpenDropdown(openDropdown === index ? null : index);
        };

        // Find selected employee details
        const selectedEmployeeDetails = employeeList.find(emp => emp.id === selectedEmployeeId) || {};

        return (
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            className="bg-[#24242D] rounded-lg w-[528px]"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >

                            <div className="bg-[#1C1C24] text-white flex items-start justify-center rounded-lg">
                                <div className="w-[528px]">
                                    <div className="px-[8px] pt-5 pb-6 border-b border-[#383840] mx-3">
                                        <p className="evaluate-modal-head">
                                            Please respond to each question on a scale of 1-10, 1<br />
                                            being Very Poor and 10 being Excellent
                                        </p>
                                    </div>

                                    <div className="p-5 pt-6">
                                        <div className="flex relative items-center gap-3">
                                            <label className="block evaluate-modal-head">Select Employee</label>
                                            <select
                                                className="w-[215px] h-[49px] bg-[#24242D] p-2 rounded-md appearance-none cursor-pointer border-none px-3 select-employee-dropdown"
                                                value={selectedEmployeeId}
                                                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                                onFocus={() => setIsDropdownOpen(true)}
                                                onBlur={() => setIsDropdownOpen(false)}
                                            >
                                                <option value="Select Employee">Select Employee</option>
                                                {employeeList.map(emp => (
                                                    <option key={emp.id} value={emp.id}>
                                                        {emp.title || emp.email}
                                                    </option>
                                                ))}
                                            </select>

                                            <div className="absolute -top-[9px] right-[145px] flex items-center pr-2 pointer-events-none mt-6">
                                                <ChevronDown
                                                    size={20}
                                                    className={`transition-transform duration-300 text-[#AAAAAA] ${isDropdownOpen ? 'rotate-180' : ''}`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="max-h-[320px]">
                                        <table className="min-w-full">
                                            <thead className='bg-[#24242D]'>
                                                <tr className="h-[48px]">
                                                    <th className="px-4 text-left employee-evaluation-theads w-16">
                                                        No
                                                    </th>
                                                    <th className="px-4 text-left employee-evaluation-theads">
                                                        Question
                                                    </th>
                                                    <th className="px-4 text-right employee-evaluation-theads w-32">
                                                        Answer
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[1, 2, 3, 4].map((num, index) => (
                                                    <tr key={index} className="bg-[#1C1C24] border-b border-[#383840] cursor-pointer h-[54px]">
                                                        <td className="px-4 whitespace-nowrap employee-evaluate-data">
                                                            {num}
                                                        </td>
                                                        <td className="px-4 whitespace-nowrap employee-evaluate-data">
                                                            Anonymous
                                                        </td>
                                                        <td className="px-4 whitespace-nowrap text-right">
                                                            <div className="relative">
                                                                <button
                                                                    onClick={() => toggleDropdown(index)}
                                                                    className="bg-[#24242D] rounded-md px-[10px] flex items-center justify-between w-[78px] h-[30px] ml-auto rating-data"
                                                                >
                                                                    <span>{ratings[index]}</span>
                                                                    <ChevronDown
                                                                        size={16}
                                                                        className={`transition-transform duration-300 ${openDropdown === index ? 'rotate-180' : ''}`}
                                                                    />
                                                                </button>

                                                                {openDropdown === index && (
                                                                    <div className="absolute right-0 mt-1 w-24 bg-gray-700 rounded shadow-lg z-[100]">
                                                                        {['N/A', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                                                                            <div
                                                                                key={rating}
                                                                                className="px-4 py-2 text-sm hover:bg-gray-600 cursor-pointer text-center"
                                                                                onClick={() => handleRatingChange(index, rating)}
                                                                            >
                                                                                {rating}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="p-4 flex justify-end space-x-4">
                                        <button className="cancel-btn duration-200"
                                            onClick={onClose}
                                        >
                                            Cancel
                                        </button>
                                        <button className="save-btn duration-200">
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    };


    const QuestionsModal = ({ isOpen, onClose }) => {
        const [formData, setFormData] = useState({
            question: '',
        });

        const [questions, setQuestions] = useState([]);
        const [error, setError] = useState('');

        const handleChange = (e) => {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value
            });
        };

        const handleSubmit = (e) => {
            e.preventDefault();

            if (!formData.question.trim()) {
                setError('Question is required');
                return;
            }

            setQuestions([...questions, {
                id: questions.length + 1,
                question: formData.question,
                anonymous: true
            }]);

            // Reset form data
            setFormData({ question: '' });
            setError('');
        };

        const handleDelete = (id) => {
            setQuestions(questions.filter(question => question.id !== id));
        };

        const handleCancel = () => {
            setFormData({ question: '' });
            setError('');
        };

        return (
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            className="bg-[#1C1C24] rounded-lg w-[528px] max-h-[505px]"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                            <form onSubmit={handleSubmit} className="p-5">
                                <div className="mb-5">
                                    <label className="block mb-3 add-question-label">
                                        Question <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="question"
                                        value={formData.question}
                                        onChange={handleChange}
                                        className="w-full bg-[#24242D] rounded-md p-3 h-[111px] text-white outline-none add-question-inputs"
                                        placeholder="Add Question"
                                    />
                                    {error && <p className="text-red-500 mt-1">{error}</p>}
                                </div>

                                <div className="flex justify-end w-full">
                                    <div className='flex w-[80%] gap-5'>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                handleCancel();
                                                onClose();
                                            }}
                                            className="flex-1 cancel-btn duration-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 save-btn duration-200"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {questions.length > 0 && (
                                <div className="mb-4">
                                    <table className="w-full text-left">
                                        <thead className="bg-[#24242D]">
                                            <tr className='h-[48px]'>
                                                <th className="px-4 add-question-theads text-left w-[10%]">No</th>
                                                <th className="px-4 add-question-theads text-left w-[70%]">Question</th>
                                                <th className="px-4 pr-8 add-question-theads text-right">Delete</th>
                                            </tr>
                                        </thead>
                                    </table>
                                    <div className="max-h-[148px] overflow-y-auto">
                                        <table className="w-full text-left">
                                            <tbody>
                                                {questions.map((question) => (
                                                    <tr key={question.id} className="border-b border-[#383840] h-[42px] last:border-b-0">
                                                        <td className="px-4 add-question-data w-[10%]">{question.id}</td>
                                                        <td className="px-4 add-question-data w-[70%]">
                                                            {question.question}
                                                        </td>
                                                        <td className="px-4 text-center">
                                                            <button
                                                                onClick={() => handleDelete(question.id)}
                                                                className="text-gray-400 hover:text-white"
                                                            >
                                                                <img src={deleteIcon} alt="Delete Icon" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    };

    // State for data management
    const [employees, setEmployees] = useState(initialData);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const [surveyModal, setSurveyModal] = useState({ isOpen: false, employee: null });
    const [questionsModal, setQuestionsModal] = useState({ isOpen: false });

    // Handle search
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter employees based on search term
    const filteredEmployees = employees.filter(employee =>
        employee.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Add new employee
    const handleAddEmployee = (e) => {
        navigate('/company/qms/add-satisfaction-survey')
    };

    const handleView = () => {
        navigate('/company/qms/view-satisfaction-survey')
    }

    // Open evaluation modal
    const openSurveyModalModal = (employee) => {
        setSurveyModal({ isOpen: true, employee });
    };

    const openQuestionsModal = () => {
        setQuestionsModal({ isOpen: true, });
    };

    const handleEdit = () => {
        navigate('/company/qms/edit-satisfaction-survey')
    };

    // Delete employee
    const handleDelete = (id) => {

    };

    // Pagination
    const itemsPerPage = 10;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            {/* Header and Search Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center pb-5">
                <h1 className="employee-performance-head">List Employee Satisfaction Survey</h1>

                <div className="flex w-full md:w-auto gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-[#1C1C24] text-white px-[10px] h-[42px] rounded-md w-[250px] border border-[#383840] outline-none"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        <div className='absolute right-[1px] top-[1px] text-white bg-[#24242D] p-[11px] w-[55px] rounded-tr-[6px] rounded-br-[6px] flex justify-center items-center'>
                            <Search size={18} />
                        </div>
                    </div>

                    <button
                        className="flex items-center justify-center !px-[5px] add-manual-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white"
                        onClick={handleAddEmployee}
                    >
                        <span>Add Employee Satisfaction Survey</span>
                        <img src={plusIcon} alt="Add Icon" className='w-[18px] h-[18px] qms-add-plus' />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className='bg-[#24242D]'>
                        <tr className="h-[48px]">
                            <th className="pl-4 pr-2 text-left add-manual-theads">No</th>
                            <th className="px-2 text-left add-manual-theads">Title</th>
                            <th className="px-2 text-left add-manual-theads">Valid Till</th>
                            <th className="px-2 text-left add-manual-theads">Email</th>
                            <th className="px-2 text-left add-manual-theads">Survey</th>
                            <th className="px-2 text-left add-manual-theads">See Result Graph</th>
                            <th className="px-2 text-left add-manual-theads">Add Questions</th>
                            <th className="px-2 text-center add-manual-theads">View</th>
                            <th className="px-2 text-center add-manual-theads">Edit</th>
                            <th className="px-2 text-center add-manual-theads">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((employee) => (
                            <tr key={employee.id} className="border-b border-[#383840] hover:bg-[#1a1a20] h-[50px] cursor-pointer">
                                <td className="pl-5 pr-2 add-manual-datas">{employee.id}</td>
                                <td className="px-2 add-manual-datas">{employee.title}</td>
                                <td className="px-2 add-manual-datas">{employee.validTill}</td>
                                <td className="px-2 add-manual-datas">
                                    <button className="text-[#1E84AF]">Send Mail</button>
                                </td>
                                <td className="px-2 add-manual-datas">
                                    <button className="text-[#1E84AF]"
                                        onClick={() => openSurveyModalModal(employee)}
                                    >Click to Survey</button>
                                </td>
                                <td className="px-2 add-manual-datas">
                                    <button className="text-[#1E84AF]">See Result Graph</button>
                                </td>
                                <td className="px-2 add-manual-datas">
                                    <button className="text-[#1E84AF]"
                                        onClick={() => openQuestionsModal(employee)}
                                    >Add Questions</button>
                                </td>
                                <td className="px-2 add-manual-datas !text-center">
                                    <button onClick={() => handleView()}>
                                        <img src={viewIcon} alt="View Icon" className='action-btn' />
                                    </button>
                                </td>
                                <td className="px-2 add-manual-datas !text-center">
                                    <button onClick={() => handleEdit()}>
                                        <img src={editIcon} alt="Edit Icon" className='action-btn' />
                                    </button>
                                </td>
                                <td className="px-2 add-manual-datas !text-center">
                                    <button onClick={() => handleDelete(employee.id)}>
                                        <img src={deleteIcon} alt="Delete Icon" className='action-btn' />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-3">
                <div className='text-white total-text'>Total-{filteredEmployees.length}</div>
                <div className="flex items-center gap-5">
                    <button
                        className={`cursor-pointer swipe-text ${currentPage === 1 ? 'opacity-50' : ''}`}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>

                    {Array.from({ length: Math.min(4, totalPages) }, (_, i) => {
                        // Show pages around current page
                        const pageToShow = currentPage <= 2 ? i + 1 :
                            currentPage >= totalPages - 1 ? totalPages - 3 + i :
                                currentPage - 2 + i;

                        if (pageToShow <= totalPages) {
                            return (
                                <button
                                    key={pageToShow}
                                    className={`${currentPage === pageToShow ? 'pagin-active' : 'pagin-inactive'
                                        }`}
                                    onClick={() => setCurrentPage(pageToShow)}
                                >
                                    {pageToShow}
                                </button>
                            );
                        }
                        return null;
                    })}

                    <button
                        className={`cursor-pointer swipe-text ${currentPage === totalPages ? 'opacity-50' : ''}`}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>
            <SurveyModal
                isOpen={surveyModal.isOpen}
                onClose={() => setSurveyModal({ isOpen: false, employee: null })}
                employee={surveyModal.employee}
            />

            <QuestionsModal
                isOpen={questionsModal.isOpen}
                onClose={() => setQuestionsModal({ isOpen: false })}
            />
        </div>
    );
};

export default QmsEmployeeSatisfaction
