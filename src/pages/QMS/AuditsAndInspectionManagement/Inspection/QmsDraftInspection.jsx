import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import deletes from "../../../../assets/images/Company Documentation/delete.svg";
import view from "../../../../assets/images/Company Documentation/view.svg";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { BASE_URL } from "../../../../Utils/Config";
import DeleteConfimModal from "../Modals/DeleteConfimModal";
import SuccessModal from "../Modals/SuccessModal";
import ErrorModal from "../Modals/ErrorModal";

const QmsDraftInspection = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [inspections, setInspections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [inspectionToDelete, setInspectionToDelete] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
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

    const fetchInspections = async () => {
        setLoading(true);
        try {
            const userId = getRelevantUserId();
            const response = await axios.get(`${BASE_URL}/qms/inspection-draft/${userId}/`, {
                params: { is_draft: true }
            });
            setInspections(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching inspections:", err);
            let errorMsg = err.message;

            if (err.response) {
                if (err.response.data.date) {
                    errorMsg = err.response.data.date[0];
                } else if (err.response.data.detail) {
                    errorMsg = err.response.data.detail;
                } else if (err.response.data.message) {
                    errorMsg = err.response.data.message;
                }
            } else if (err.message) {
                errorMsg = err.message;
            }

            setError(errorMsg);
            setShowErrorModal(true);
            setTimeout(() => {
                setShowErrorModal(false);
            }, 3000);
            setInspections([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInspections();
    }, []);

    const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "/");
  };

    // Open delete confirmation modal
    const openDeleteModal = (inspection) => {
        setInspectionToDelete(inspection);
        setShowDeleteModal(true);
        setDeleteMessage('Draft Inspection');
    };

    // Close all modals
    const closeAllModals = () => {
        setShowDeleteModal(false);
        setShowSuccessModal(false);
    };

    // Handle delete confirmation
    const confirmDelete = async () => {
        if (!inspectionToDelete) return;

        try {
            await axios.delete(`${BASE_URL}/qms/inspection-get/${inspectionToDelete.id}/`);
            setInspections(inspections.filter(item => item.id !== inspectionToDelete.id));
            setShowDeleteModal(false);
            setShowSuccessModal(true);
            setTimeout(() => {
                setShowSuccessModal(false);
            }, 3000);
            setSuccessMessage("Draft Inspection Deleted Successfully");
        } catch (error) {
            console.error("Error deleting draft inspection:", error);
            let errorMsg = error.message;

            if (error.response) {
                if (error.response.data.date) {
                    errorMsg = error.response.data.date[0];
                } else if (error.response.data.detail) {
                    errorMsg = error.response.data.detail;
                } else if (error.response.data.message) {
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
            setShowDeleteModal(false);
        }
    };

    const itemsPerPage = 10;
    const totalItems = inspections.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Filter items based on search query
    const filteredItems = inspections.filter(item =>
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.inspection_type && item.inspection_type.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Get current page items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleClose = () => {
        navigate('/company/qms/list-inspection');
    };

    const handleEditDraftInspection = (id) => {
        navigate(`/company/qms/edit-draft-inspection/${id}`);
    };

    const handleViewDraftInspection = (id) => {
        navigate(`/company/qms/view-draft-inspection/${id}`);
    };

    if (loading) {
        return <div className="bg-[#1C1C24] not-found p-5 rounded-lg text-center">Loading...</div>;
    }

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="list-awareness-training-head">Draft Inspections</h1>
                <div className="flex gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-[#1C1C24] text-white px-[10px] h-[42px] rounded-md w-[333px] border border-[#383840] outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className='absolute right-[1px] top-[1px] text-white bg-[#24242D] p-[11px] w-[55px] rounded-tr-[6px] rounded-br-[6px] flex justify-center items-center'>
                            <Search size={18} />
                        </div>
                    </div>

                    <button onClick={handleClose} className="bg-[#24242D] p-2 rounded-md">
                        <X className="text-white" />
                    </button>
                </div>
            </div>
            <div className="overflow-hidden">
                <table className="w-full">
                    <thead className='bg-[#24242D]'>
                        <tr className='h-[48px]'>
                            <th className="px-3 text-left list-awareness-training-thead">No</th>
                            <th className="px-3 text-left list-awareness-training-thead">Title</th>
                            <th className="px-3 text-left list-awareness-training-thead">Inspection Type</th>
                            <th className="px-3 text-left list-awareness-training-thead">Date Planned</th>
                            <th className="px-3 text-left list-awareness-training-thead">Action</th>
                            <th className="px-3 text-center list-awareness-training-thead">View</th>
                            <th className="px-3 text-center list-awareness-training-thead">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((item, index) => (
                                <tr key={item.id} className="border-b border-[#383840] hover:bg-[#131318] cursor-pointer h-[50px]">
                                    <td className="px-3 list-awareness-training-datas">{indexOfFirstItem + index + 1}</td>
                                    <td className="px-3 list-awareness-training-datas">{item.title || 'N/A'}</td>
                                    <td className="px-3 list-awareness-training-datas">{item.inspection_type || 'N/A'}</td>
                                    <td className="px-3 list-awareness-training-datas">{formatDate(item.proposed_date)}</td>
                                    <td className="px-3 list-awareness-training-datas text-left text-[#1E84AF]">
                                        <button
                                            onClick={() => handleEditDraftInspection(item.id)}
                                        >
                                            Click to Continue
                                        </button>
                                    </td>
                                    <td className="list-awareness-training-datas text-center ">
                                        <div className='flex justify-center items-center h-[50px]'>
                                            <button
                                                onClick={() => handleViewDraftInspection(item.id)}
                                            >
                                                <img src={view} alt="View Icon" className='w-[16px] h-[16px]' />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="list-awareness-training-datas text-center">
                                        <div className='flex justify-center items-center h-[50px]'>
                                            <button
                                                onClick={() => openDeleteModal(item)}
                                            >
                                                <img src={deletes} alt="Delete Icon" className='w-[16px] h-[16px]' />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-4 not-found">No draft inspections found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalItems > 0 && (
                <div className="flex justify-between items-center mt-3">
                    <div className='text-white total-text'>Total: {totalItems}</div>
                    <div className="flex items-center gap-5">
                        <button
                            className={`cursor-pointer swipe-text ${currentPage === 1 ? 'opacity-50' : ''}`}
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            Previous
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                            <button
                                key={number}
                                className={`w-8 h-8 rounded-md ${currentPage === number ? 'pagin-active' : 'pagin-inactive'}`}
                                onClick={() => handlePageChange(number)}
                            >
                                {number}
                            </button>
                        ))}

                        <button
                            className={`cursor-pointer swipe-text ${currentPage === totalPages ? 'opacity-50' : ''}`}
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfimModal
                showDeleteModal={showDeleteModal}
                onConfirm={confirmDelete}
                onCancel={closeAllModals}
                deleteMessage={deleteMessage}
            />

            {/* Success Modal */}
            <SuccessModal
                showSuccessModal={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                successMessage={successMessage}
            />

            {/* Error Modal */}
            <ErrorModal
                showErrorModal={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                error={error}
            />
        </div>
    );
};

export default QmsDraftInspection;