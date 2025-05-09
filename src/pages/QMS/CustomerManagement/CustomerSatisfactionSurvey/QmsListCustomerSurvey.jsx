import React, { useState, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import plusIcon from "../../../../assets/images/Company Documentation/plus icon.svg";
import viewIcon from "../../../../assets/images/Companies/view.svg";
import editIcon from "../../../../assets/images/Company Documentation/edit.svg";
import deleteIcon from "../../../../assets/images/Company Documentation/delete.svg";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";
import DeleteEmployeeSatisfactionConfirmModal from '../Modals/DeleteEmployeeSatisfactionConfirmModal';
import DeleteEmployeeSatisfactionSuccessModal from '../Modals/DeleteEmployeeSatisfactionSuccessModal';
import ErrorModal from '../Modals/ErrorModal';
import QuestionAddSuccessModal from '../Modals/QuestionAddSuccessModal';
import DeleteQuestionConfirmModal from '../Modals/DeleteQuestionConfirmModal';
import DeleteQuestionSuccessModal from '../Modals/DeleteQuestionSuccessModal';
import RatingAddSuccessModal from '../Modals/RatingAddSuccessModal';

const EvaluationModal = ({ isOpen, onClose, customer, customerList, surveyId }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(customer ? customer.id || 'Select Customer' : 'Select Customer');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [surveys, setSurveys] = useState([]);

  const [showAddRatingSuccessModal, setShowAddRatingSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const getUserCompanyId = () => {
    const role = localStorage.getItem("role");
    if (role === "company") {
      return localStorage.getItem("company_id");
    } else if (role === "user") {
      try {
        const userCompanyId = localStorage.getItem("user_company_id");
        return userCompanyId ? JSON.parse(userCompanyId) : null;
      } catch (e) {
        console.error("Error parsing user company ID:", e);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const companyId = getUserCompanyId();

        const response = await axios.get(
          `${BASE_URL}/qms/customer/survey/${companyId}/evaluation/${surveyId}/`
        );

        setCustomers(response.data);
        console.log('fetch customers survey:', response);

      } catch (error) {
        console.error('Error fetching unsubmitted users:', error);
      }
    };

    if (isOpen && surveyId) {
      fetchCustomers();
    }
  }, [isOpen, surveyId]);


  useEffect(() => {
    const fetchSurveyData = async () => {
      setLoading(true);
      try {
        const companyId = getUserCompanyId();
        if (!companyId) {
          setError('Company ID not found');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${BASE_URL}/qms/customer/survey/${companyId}/`);
        setSurveys(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load customer survey data');
        console.error('Error fetching customer survey data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyData();

  }, []);

  // Fetch questions when modal opens
  useEffect(() => {
    if (isOpen && surveyId) {
      fetchQuestions();
    }
  }, [isOpen, surveyId]);


  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/qms/customer/survey/${surveyId}/questions/`);
      setQuestions(response.data);
      console.log('Fetched questions:', response.data);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };


  const handleAnswerChange = async (questionId, rating) => {
    if (selectedCustomer === 'Select Customer') {
      setError('Please select a customer first');
      return;
    }

    const updatedQuestions = questions.map(q =>
      q.id === questionId ? { ...q, answer: rating } : q
    );
    setQuestions(updatedQuestions);

    console.log("Submitting answer change with data:", {
      questionId,
      answer: rating,
      customer_id: selectedCustomer
    });

    try {
      await axios.patch(`${BASE_URL}/qms/customer/survey/question/answer/${questionId}/`, {
        answer: rating,
        customer_id: selectedCustomer
      });
      setShowAddRatingSuccessModal(true);
      setTimeout(() => {
        setShowAddRatingSuccessModal(false);
        navigate('/company/qms/list-customer-survey');
      }, 1500);
    } catch (err) {
      console.error('Error updating answer:', err);
      setShowErrorModal(true);
      setTimeout(() => {
        setShowErrorModal(false);
      }, 3000);
      setError('Failed to save answer');
    }
  };

  const combinedOptions = [...(customerList || []), ...(customers || [])].reduce((unique, item) => {
    const exists = unique.find(x => x.id === item.id);
    if (!exists) {
      unique.push(item);
    }
    return unique;
  }, []);

  const [openDropdown, setOpenDropdown] = useState(null);
  const toggleDropdown = (questionId) => {
    setOpenDropdown(openDropdown === questionId ? null : questionId);
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
            className="bg-[#24242D] rounded-lg w-[528px]"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="bg-[#1C1C24] text-white flex items-start justify-center rounded-lg">

              <RatingAddSuccessModal
                showAddRatingSuccessModal={showAddRatingSuccessModal}
                onClose={() => {
                  setShowAddRatingSuccessModal(false);
                }}
              />

              <ErrorModal
                showErrorModal={showErrorModal}
                onClose={() => {
                  setShowErrorModal(false);
                }}
              />

              <div className="w-[528px]  ">
                <div className="px-[8px] pt-5 pb-6 border-b border-[#383840] mx-3">
                  <p className="evaluate-modal-head">
                    Please respond to each question on a scale of 1-10, 1<br />
                    being Very Poor and 10 being Excellent
                  </p>
                </div>

                <div className="p-5 pt-6">
                  <div className="flex relative items-center gap-3">
                    <label className="block evaluate-modal-head">Select Customer</label>
                    <select
                      className="w-[215px] h-[49px] bg-[#24242D] p-2 rounded-md appearance-none cursor-pointer border-none px-3 select-employee-dropdown"
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                      onFocus={() => setIsDropdownOpen(true)}
                      onBlur={() => setIsDropdownOpen(false)}
                    >
                      <option value="Select Customer">Select Customer</option>
                      {combinedOptions.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.first_name && item.last_name
                            ? `${item.first_name} ${item.last_name}`
                            : item.first_name || item.last_name || item.username || item.name}
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

                {loading ? (
                  <div className="text-center py-6">Loading questions...</div>
                ) : (
                  <div className="max-h-[320px] overflow-y-auto">
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
                        {questions.length > 0 ? (
                          questions.map((question, index) => (
                            <tr key={question.id} className="bg-[#1C1C24] border-b border-[#383840] cursor-pointer h-[54px]">
                              <td className="px-4 whitespace-nowrap employee-evaluate-data">
                                {index + 1}
                              </td>
                              <td className="px-4 whitespace-nowrap employee-evaluate-data">
                                {question.question_text}
                              </td>
                              <td className="px-4 whitespace-nowrap text-right">
                                <div className="relative">
                                  <button
                                    onClick={() => toggleDropdown(question.id)}
                                    className="bg-[#24242D] rounded-md px-[10px] flex items-center justify-between w-[78px] h-[30px] ml-auto rating-data"
                                  >
                                    <span>{question.answer || 'N/A'}</span>
                                    <ChevronDown
                                      size={16}
                                      className={`transition-transform duration-300 ${openDropdown === question.id ? 'rotate-180' : ''}`}
                                    />
                                  </button>

                                  {openDropdown === question.id && (
                                    <div className="absolute right-0 mt-1 w-24 bg-[#24242D] rounded shadow-lg z-[100]">
                                      {['N/A', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                                        <div
                                          key={rating}
                                          className="px-4 py-2 text-sm hover:bg-[#0e0e13] cursor-pointer text-center"
                                          onClick={() => {
                                            handleAnswerChange(question.id, rating);
                                            toggleDropdown(null);
                                          }}
                                        >
                                          {rating}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center py-4 not-found">No questions available</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="p-4 flex justify-end space-x-4">
                  <button className="cancel-btn duration-200"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button className="save-btn duration-200"
                    onClick={() => {
                      onClose();
                    }}
                  >
                    Done
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

const QuestionsModal = ({ isOpen, onClose, surveyId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    question_text: '',
    answer: ''
  });
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Modal states
  const [showAddQuestionSuccessModal, setShowAddQuestionSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [showDeleteQuestionSuccessModal, setShowDeleteQuestionSuccessModal] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (surveyId) {
        setLoading(true);
        try {
          const response = await axios.get(`${BASE_URL}/qms/customer/survey/${surveyId}/questions/`);
          setQuestions(response.data);
        } catch (err) {
          console.error('Error fetching questions:', err);
          setError('Failed to load questions');
          setErrorMessage('Failed to load questions');
          setShowErrorModal(true);
        } finally {
          setLoading(false);
        }
      }
    };

    if (isOpen) {
      fetchQuestions();
    }
  }, [isOpen, surveyId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting formData:', formData);
    if (!formData.question_text.trim()) {
      setError('Question is required');
      setErrorMessage('Question is required');
      setShowErrorModal(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/qms/customer/survey/question-add/`, {
        customer: surveyId, // Changed from survey to customer to match model
        question_text: formData.question_text,
        answer: formData.answer || null // Include answer field
      });

      setQuestions([...questions, response.data]);
      setFormData({ question_text: '', answer: '' });
      setShowAddQuestionSuccessModal(true);
      setTimeout(() => {
        setShowAddQuestionSuccessModal(false);
        navigate("/company/qms/list-customer-survey");
      }, 1500);
      setError('');
    } catch (err) {
      console.error('Error adding question:', err);
      setErrorMessage('Failed to add question');
      setShowErrorModal(true);
      setTimeout(() => {
        setShowErrorModal(false);
      }, 3000);
      setError('Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (question) => {
    setQuestionToDelete(question);
    setShowDeleteModal(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setQuestionToDelete(null);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!questionToDelete) return;

    setLoading(true);
    try {
      await axios.delete(`${BASE_URL}/qms/customer/survey/question/${questionToDelete.id}/delete/`);
      setQuestions(questions.filter(q => q.id !== questionToDelete.id));
      setShowDeleteModal(false);
      setShowDeleteQuestionSuccessModal(true);
      setTimeout(() => {
        setShowDeleteQuestionSuccessModal(false);
      }, 3000);
    } catch (err) {
      console.error('Error deleting question:', err);
      setShowDeleteModal(false);
      setErrorMessage('Failed to delete question');
      setShowErrorModal(true);
      setTimeout(() => {
        setShowErrorModal(false);
      }, 3000);
    } finally {
      setLoading(false);
      setQuestionToDelete(null);
    }
  };

  const handleCancel = () => {
    setFormData({ question_text: '', answer: '' });
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
            className="bg-[#1C1C24] rounded-lg w-[528px] max-h-[600px]"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <form onSubmit={handleSubmit} className="p-5">
              <div className="mb-4">
                <label className="block mb-3 add-question-label">
                  Question <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="question_text"
                  value={formData.question_text}
                  onChange={handleChange}
                  className="w-full bg-[#24242D] rounded-md p-3 h-[100px] text-white outline-none add-question-inputs"
                  placeholder="Add Question"
                  disabled={loading}
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
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 save-btn duration-200"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </form>

            {loading && questions.length === 0 ? (
              <div className="text-center py-4">Loading questions...</div>
            ) : (
              questions.length > 0 && (
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
                  <div className="max-h-[200px] overflow-y-auto">
                    <table className="w-full text-left">
                      <tbody>
                        {questions.map((question, index) => (
                          <tr key={question.id} className="border-b border-[#383840] h-[42px] last:border-b-0">
                            <td className="px-4 add-question-data w-[10%]">{index + 1}</td>
                            <td className="px-4 add-question-data w-[70%]">
                              {question.question_text}
                            </td>
                            <td className="px-4 text-center">
                              <button
                                onClick={() => openDeleteModal(question)}
                                className="text-gray-400 hover:text-white"
                                disabled={loading}
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
              )
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Modals */}
      <QuestionAddSuccessModal
        showAddQuestionSuccessModal={showAddQuestionSuccessModal}
        onClose={() => setShowAddQuestionSuccessModal(false)}
      />

      <ErrorModal
        showErrorModal={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        errorMessage={errorMessage}
      />

      <DeleteQuestionConfirmModal
        showDeleteModal={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
      />

      <DeleteQuestionSuccessModal
        showDeleteQuestionSuccessModal={showDeleteQuestionSuccessModal}
        onClose={() => setShowDeleteQuestionSuccessModal(false)}
      />
    </AnimatePresence>
  );
};

const QmsListCustomerSurvey = () => {
  // State for data management
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();

  // Modal states
  const [evaluationModal, setEvaluationModal] = useState({ isOpen: false, customer: null });
  const [questionsModal, setQuestionsModal] = useState({ isOpen: false });

  // Delete related modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [satisfactionToDelete, setSatisfactionToDelete] = useState(null);
  const [showDeleteEmployeeSatisfactionSuccessModal, setShowDeleteEmployeeSatisfactionSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getUserCompanyId = () => {
    const role = localStorage.getItem("role");
    if (role === "company") {
      return localStorage.getItem("company_id");
    } else if (role === "user") {
      try {
        const userCompanyId = localStorage.getItem("user_company_id");
        return userCompanyId ? JSON.parse(userCompanyId) : null;
      } catch (e) {
        console.error("Error parsing user company ID:", e);
        return null;
      }
    }
    return null;
  };

  // Fetch customer survey data
  useEffect(() => {
    const fetchSurveyData = async () => {
      setLoading(true);
      try {
        const companyId = getUserCompanyId();
        if (!companyId) {
          setError('Company ID not found');
          setLoading(false);
          return;
        }

        // Updated to match the model names
        const response = await axios.get(`${BASE_URL}/qms/customer/survey/${companyId}/`);
        setSurveys(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load customer survey data');
        console.error('Error fetching customer survey data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyData();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter surveys based on search term - updated to match model field name
  const filteredSurveys = surveys.filter(survey =>
    survey.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add new customer survey evaluation
  const handleAddCustomerSurvey = () => {
    navigate('/company/qms/add-customer-survey');
  };

  // Go to drafts
  const handleDraftCustomerSurvey = () => {
    navigate('/company/qms/draft-customer-survey');
  };

  // View survey
  const handleView = (id) => {
    navigate(`/company/qms/view-customer-survey/${id}`);
  };

  // Edit survey
  const handleEdit = (id) => {
    navigate(`/company/qms/edits-customer-survey/${id}`);
  };

  // Open delete confirmation modal
  const openDeleteModal = (survey) => {
    setSatisfactionToDelete(survey);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation - updated endpoint
  const confirmDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/qms/customer/survey/${satisfactionToDelete.id}/update/`);
      setSurveys(surveys.filter(survey => survey.id !== satisfactionToDelete.id));
      setShowDeleteModal(false);
      setShowDeleteEmployeeSatisfactionSuccessModal(true);
      setTimeout(() => {
        setShowDeleteEmployeeSatisfactionSuccessModal(false);
      }, 2000);
    } catch (err) {
      console.error('Error deleting survey evaluation:', err);
      setShowDeleteModal(false);
      setErrorMessage('Failed to delete the evaluation');
      setShowErrorModal(true);
      setTimeout(() => {
        setShowErrorModal(false);
      }, 2000);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSatisfactionToDelete(null);
  };

  // Send email
  const handleSendEmail = async (surveyId) => {
    // try {
    //   await axios.post(`${BASE_URL}/qms/customer-satisfaction/send-email/${surveyId}/`);
    //   alert('Email sent successfully');
    // } catch (err) {
    //   console.error('Error sending email:', err);
    //   setErrorMessage('Failed to send email');
    //   setShowErrorModal(true);
    // }
  };

  // Open evaluation modal
  const openEvaluationModal = (survey) => {
    setEvaluationModal({
      isOpen: true,
      customer: survey,
      surveyId: survey.id
    });
  };

  // Open questions modal
  const openQuestionsModal = (surveyId) => {
    setQuestionsModal({ isOpen: true, surveyId });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .replace(/(\d+)\/(\d+)\/(\d+)/, "$2-$1-$3");
  };

  // Pagination
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSurveys.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSurveys.length / itemsPerPage);

  if (loading) {
    return <div className="bg-[#1C1C24] text-white p-5 rounded-lg flex justify-center">Loading...</div>;
  }

  return (
    <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
      {/* Header and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center pb-5">
        <h1 className="employee-performance-head">List Customer Satisfaction Survey</h1>

        <div className="flex w-full md:w-auto gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-[#1C1C24] text-white px-[10px] h-[42px] rounded-md w-[180px] border border-[#383840] outline-none"
              value={searchTerm}
              onChange={handleSearch}
            />
            <div className='absolute right-[1px] top-[1px] text-white bg-[#24242D] p-[11px] w-[55px] rounded-tr-[6px] rounded-br-[6px] flex justify-center items-center'>
              <Search size={18} />
            </div>
          </div>

          <button
            className="flex items-center justify-center !w-[100px] add-manual-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white"
            onClick={handleDraftCustomerSurvey}
          >
            <span>Draft</span>
          </button>

          <button
            className="flex items-center justify-center !px-[5px] add-manual-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white"
            onClick={handleAddCustomerSurvey}
          >
            <span>Add Customer Satisfaction Survey</span>
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
            {currentItems.length > 0 ? (
              currentItems.map((survey, index) => (
                <tr key={survey.id} className="border-b border-[#383840] hover:bg-[#1a1a20] h-[50px] cursor-pointer">
                  <td className="pl-5 pr-2 add-manual-datas">{indexOfFirstItem + index + 1}</td>
                  <td className="px-2 add-manual-datas">{survey.title || 'Anonymous'}</td>
                  <td className="px-2 add-manual-datas">{formatDate(survey.valid_till)}</td>
                  <td className="px-2 add-manual-datas">
                    <button
                      className="text-[#1E84AF]"
                      onClick={() => handleSendEmail(survey.id)}
                    >
                      Send Mail
                    </button>
                  </td>
                  <td className="px-2 add-manual-datas">
                    <button
                      className="text-[#1E84AF] hover:text-[#176d8e] transition-colors"
                      onClick={() => openEvaluationModal(survey)}
                    >
                      Click to Evaluate
                    </button>
                  </td>
                  <td className="px-2 add-manual-datas">
                    <button className="text-[#1E84AF]">See Result Graph</button>
                  </td>
                  <td className="px-2 add-manual-datas">
                    <button
                      className="text-[#1E84AF] hover:text-[#176d8e] transition-colors"
                      onClick={() => openQuestionsModal(survey.id)}
                    >
                      Add Questions
                    </button>
                  </td>
                  <td className="px-2 add-manual-datas !text-center">
                    <button onClick={() => handleView(survey.id)}>
                      <img src={viewIcon} alt="View Icon" className='action-btn' />
                    </button>
                  </td>
                  <td className="px-2 add-manual-datas !text-center">
                    <button onClick={() => handleEdit(survey.id)}>
                      <img src={editIcon} alt="Edit Icon" className='action-btn' />
                    </button>
                  </td>
                  <td className="px-2 add-manual-datas !text-center">
                    <button onClick={() => openDeleteModal(survey)}>
                      <img src={deleteIcon} alt="Delete Icon" className='action-btn' />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center py-4 not-found">No customer satisfaction survey found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredSurveys.length > 0 && (
        <div className="flex justify-between items-center mt-3">
          <div className='text-white total-text'>Total-{filteredSurveys.length}</div>
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
                    className={`${currentPage === pageToShow ? 'pagin-active' : 'pagin-inactive'}`}
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
      )}

      {/* Modals */}
      <EvaluationModal
        isOpen={evaluationModal.isOpen}
        onClose={() => setEvaluationModal({ isOpen: false, customer: null })}
        customer={evaluationModal.customer}
        customerList={customers}
        surveyId={evaluationModal.surveyId}
      />

      <QuestionsModal
        isOpen={questionsModal.isOpen}
        onClose={() => setQuestionsModal({ isOpen: false })}
        surveyId={questionsModal.surveyId}
      />

      {/* Delete Confirmation Modal */}
      <DeleteEmployeeSatisfactionConfirmModal
        showDeleteModal={showDeleteModal}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Success Modal */}
      <DeleteEmployeeSatisfactionSuccessModal
        showDeleteEmployeeSatisfactionSuccessModal={showDeleteEmployeeSatisfactionSuccessModal}
        onClose={() => setShowDeleteEmployeeSatisfactionSuccessModal(false)}
      />

      {/* Error Modal */}
      <ErrorModal
        showErrorModal={showErrorModal}
        onClose={() => setShowErrorModal(false)}
      />
    </div>
  );
};
export default QmsListCustomerSurvey
