import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import viewIcon from "../../../../assets/images/Companies/view.svg";
import editIcon from "../../../../assets/images/Company Documentation/edit.svg";
import deleteIcon from "../../../../assets/images/Company Documentation/delete.svg";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";
import DeleteConfimModal from "../Modals/DeleteConfimModal";
import SuccessModal from "../Modals/SuccessModal";
import ErrorModal from "../Modals/ErrorModal";

const QmsDraftEnergyBaseLines = () => {
    const [energyBaseLines, setEnergyBaseLines] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Delete modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [baselineToDelete, setBaselineToDelete] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

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

    const userId = getRelevantUserId();

    const fetchDraftBaselines = async () => {
        try {
            setIsLoading(true);
            setError('');
            if (!userId) return;

            const response = await axios.get(`${BASE_URL}/qms/baselines-draft/${userId}/`, {
                params: { is_draft: true }
            });
            if (Array.isArray(response.data)) {
                setEnergyBaseLines(response.data);
            } else {
                setEnergyBaseLines([]);
                console.error("Unexpected response format:", response.data);
            }
            console.log('Draft Baselines:', response.data);

        } catch (error) {
            console.error("Error fetching draft baselines:", error);
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
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDraftBaselines();
    }, []);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        setCurrentPage(1);
    };

    // Pagination
    const itemsPerPage = 10;
    const totalItems = energyBaseLines.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Get current items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = energyBaseLines.slice(indexOfFirstItem, indexOfLastItem);

    // Search functionality
    const filteredEnergyBaseLines = currentItems.filter(energyBaseLine =>
        energyBaseLine.basline_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        energyBaseLine.energy_review?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        energyBaseLine.responsible?.first_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleClose = () => {
        navigate('/company/qms/list-energy-baselines');
    };

    const handleQmsViewEnergyBaseLines = (id) => {
        navigate(`/company/qms/view-draft-energy-baselines/${id}`);
    };

    const handleQmsEditEnergyBaseLines = (id) => {
        navigate(`/company/qms/edit-draft-energy-baselines/${id}`);
    };

    // Open delete confirmation modal
    const openDeleteModal = (baseline) => {
        setBaselineToDelete(baseline);
        setShowDeleteModal(true);
        setDeleteMessage('Draft Energy Baseline');
    };

    // Close all modals
    const closeAllModals = () => {
        setShowDeleteModal(false);
        setShowSuccessModal(false);
    };

    // Handle delete confirmation
    const confirmDelete = async () => {
        if (!baselineToDelete) return;

        try {
            await axios.delete(`${BASE_URL}/qms/baselines/${baselineToDelete.id}/`);
            setEnergyBaseLines(energyBaseLines.filter(item => item.id !== baselineToDelete.id));
            setShowDeleteModal(false);
            setShowSuccessModal(true);
            setTimeout(() => {
                setShowSuccessModal(false);
            }, 3000);
            setSuccessMessage("Draft Energy Baseline Deleted Successfully");
        } catch (error) {
            console.error('Error deleting draft energy baseline:', error);
            setShowErrorModal(true);
            setTimeout(() => {
                setShowErrorModal(false);
            }, 3000);
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
            setShowDeleteModal(false);
        }
    };

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="list-manual-head">Draft Base Line</h1>
                <div className="flex gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="serach-input-manual focus:outline-none bg-transparent"
                        />
                        <div className='absolute right-[1px] top-[2px] text-white bg-[#24242D] p-[10.5px] w-[55px] rounded-tr-[6px] rounded-br-[6px] flex justify-center items-center'>
                            <Search size={18} />
                        </div>
                    </div>
                    <button onClick={handleClose} className="bg-[#24242D] p-2 rounded-md">
                        <X className="text-white" />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead className='bg-[#24242D]'>
                        <tr className="h-[48px]">
                            <th className="pl-4 pr-2 text-left add-manual-theads">No</th>
                            <th className="px-2 text-left add-manual-theads">Title</th>
                            <th className="px-2 text-left add-manual-theads">Related Energy Review</th>
                            <th className="px-2 text-left add-manual-theads">Responsible</th>
                            <th className="px-2 text-left add-manual-theads">Action</th>
                            <th className="px-2 text-center add-manual-theads">View</th>
                            <th className="pr-2 text-center add-manual-theads">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4 not-found">Loading...</td>
                            </tr>
                        ) : filteredEnergyBaseLines.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4 not-found">No draft baselines found</td>
                            </tr>
                        ) : (
                            filteredEnergyBaseLines.map((energyBaseLine, index) => (
                                <tr key={energyBaseLine.id} className="border-b border-[#383840] hover:bg-[#1a1a20] h-[50px] cursor-pointer">
                                    <td className="pl-5 pr-2 add-manual-datas">{indexOfFirstItem + index + 1}</td>
                                    <td className="px-2 add-manual-datas">{energyBaseLine.basline_title || 'N/A'}</td>
                                    <td className="px-2 add-manual-datas">{energyBaseLine.energy_review?.title || 'N/A'}</td>
                                    <td className="px-2 add-manual-datas">
                                        {energyBaseLine.responsible?.first_name} {energyBaseLine.responsible?.last_name || 'N/A'}
                                    </td>
                                    <td className="px-2 add-manual-datas">
                                        <button
                                            onClick={() => handleQmsEditEnergyBaseLines(energyBaseLine.id)}
                                            className='text-[#1E84AF]'
                                        >
                                            Click to Continue
                                        </button>
                                    </td>
                                    <td className="px-2 add-manual-datas !text-center">
                                        <button onClick={() => handleQmsViewEnergyBaseLines(energyBaseLine.id)}>
                                            <img src={viewIcon} alt="View Icon" style={{ filter: 'brightness(0) saturate(100%) invert(69%) sepia(32%) saturate(4%) hue-rotate(53deg) brightness(94%) contrast(86%)' }} />
                                        </button>
                                    </td>
                                    <td className="px-2 add-manual-datas !text-center">
                                        <button onClick={() => openDeleteModal(energyBaseLine)}>
                                            <img src={deleteIcon} alt="Delete Icon" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 text-sm">
                <div className='text-white total-text'>Total-{totalItems}</div>
                <div className="flex items-center gap-5">
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className={`cursor-pointer swipe-text ${currentPage === 1 ? 'opacity-50' : ''}`}
                    >
                        Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                        <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`${currentPage === number ? 'pagin-active' : 'pagin-inactive'}`}
                        >
                            {number}
                        </button>
                    ))}

                    <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className={`cursor-pointer swipe-text ${currentPage === totalPages ? 'opacity-50' : ''}`}
                    >
                        Next
                    </button>
                </div>
            </div>

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

export default QmsDraftEnergyBaseLines;