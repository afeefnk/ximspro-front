import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import axios from "axios";
import plusIcon from "../../../../assets/images/Company Documentation/plus icon.svg";
import viewIcon from "../../../../assets/images/Companies/view.svg";
import editIcon from "../../../../assets/images/Company Documentation/edit.svg";
import deleteIcon from "../../../../assets/images/Company Documentation/delete.svg";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../../../Utils/Config";
import DeleteConfimModal from "../Modals/DeleteConfimModal";
import SuccessModal from "../Modals/SuccessModal";
import ErrorModal from "../Modals/ErrorModal";

const QmsListEnergyAction = () => {
  // State
  const [energyActions, setEnergyActions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [draftCount, setDraftCount] = useState(0);

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [energyActionToDelete, setEnergyActionToDelete] = useState(null);
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
  const userId = getRelevantUserId();

  useEffect(() => {
    const fetchEnergyActions = async () => {
      setIsLoading(true);
      setError("");
      try {
        if (!companyId) {
          setError("Company ID not found. Please log in again.");
          setIsLoading(false);
          return;
        }

        // Fetch energy actions
        const response = await axios.get(`${BASE_URL}/qms/energy-action/company/${companyId}/`);
        // Sort energy actions by id in ascending order and format data
        const sortedData = response.data
          .sort((a, b) => a.id - b.id)
          .map(item => ({
            ...item,
            date: item.date ? new Date(item.date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric"
            }).split("/").join("/") : "",
            responsible_name: item.responsible ? item.responsible.name || "N/A" : "N/A"
          }));

        setEnergyActions(sortedData);

        // Fetch draft count
        const draftResponse = await axios.get(
          `${BASE_URL}/qms/energy-action/drafts-count/${userId}/`
        );
        setDraftCount(draftResponse.data.count);

      } catch (error) {
        console.error("Error fetching energy actions:", error);
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

    fetchEnergyActions();
  }, [companyId, userId]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Pagination
  const itemsPerPage = 10;
  const totalItems = energyActions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = energyActions.slice(indexOfFirstItem, indexOfLastItem);

  // Search functionality
  const filteredEnergyActions = currentItems.filter(
    (energyAction) =>
      (energyAction.title && energyAction.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (energyAction.statement && energyAction.statement.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (energyAction.responsible_name && energyAction.responsible_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (energyAction.action_plan && energyAction.action_plan.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddEnergyAction = () => {
    navigate("/company/qms/add-energy-action-plan");
  };

  const handleDraftEnergyAction = () => {
    navigate("/company/qms/draft-energy-action-plan");
  };

  const handleQmsViewEnergyAction = (id) => {
    navigate(`/company/qms/view-energy-action-plan/${id}`);
  };

  const handleQmsEditEnergyAction = (id) => {
    navigate(`/company/qms/edit-energy-action-plan/${id}`);
  };

  // Open delete confirmation modal
  const openDeleteModal = (energyAction) => {
    setEnergyActionToDelete(energyAction);
    setShowDeleteModal(true);
    setDeleteMessage('Energy Action Plan');
  };

  // Close all modals
  const closeAllModals = () => {
    setShowDeleteModal(false);
    setShowSuccessModal(false);
  };

  // Delete energy action
  const confirmDelete = async () => {
    if (!energyActionToDelete) return;

    setIsLoading(true);
    try {
      await axios.delete(`${BASE_URL}/qms/energy-action/${energyActionToDelete.id}/`);
      setEnergyActions(energyActions.filter(action => action.id !== energyActionToDelete.id));
      setShowDeleteModal(false);
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
      setSuccessMessage("Energy Action Plan deleted successfully");
    } catch (error) {
      console.error("Error deleting energy action:", error);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="list-manual-head">List Energy Action Plans</h1>
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="serach-input-manual focus:outline-none bg-transparent"
            />
            <div className="absolute right-[1px] top-[2px] text-white bg-[#24242D] p-[10.5px] w-[55px] rounded-tr-[6px] rounded-br-[6px] flex justify-center items-center">
              <Search size={18} />
            </div>
          </div>
          <button
            className="flex items-center justify-center add-manual-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white !w-[100px] relative"
            onClick={handleDraftEnergyAction}
          >
            <span>Drafts</span>
            {draftCount > 0 && (
              <span className="bg-red-500 text-white rounded-full text-xs flex justify-center items-center w-[20px] h-[20px] absolute top-[-8px] right-[-8px]">
                {draftCount}
              </span>
            )}
          </button>
          <button
            className="flex items-center justify-center add-manual-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white"
            onClick={handleAddEnergyAction}
          >
            <span>Add Energy Action Plans</span>
            <img
              src={plusIcon}
              alt="Add Icon"
              className="w-[18px] h-[18px] qms-add-plus"
            />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center not-found">
          Loading Energy Action Plans
        </div>
      ) : (
        <>
          {/* Empty state */}
          {energyActions.length === 0 ? (
            <div className="text-center not-found">
              <p>No Energy Action Plans Found</p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-[#24242D]">
                    <tr className="h-[48px]">
                      <th className="pl-4 pr-2 text-left add-manual-theads">No</th>
                      <th className="px-2 text-left add-manual-theads">Action Plan ID</th>
                      <th className="px-2 text-left add-manual-theads">Title</th>
                      <th className="px-2 text-left add-manual-theads">
                        Statement on Energy Improvement
                      </th>
                      <th className="px-2 text-left add-manual-theads">Responsible</th>
                      <th className="px-2 text-left add-manual-theads">Target Date</th>
                      <th className="px-2 text-center add-manual-theads">View</th>
                      <th className="px-2 text-center add-manual-theads">Edit</th>
                      <th className="pr-2 text-center add-manual-theads">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEnergyActions.map((energyAction, index) => (
                      <tr
                        key={energyAction.id}
                        className="border-b border-[#383840] hover:bg-[#1a1a20] h-[50px] cursor-pointer"
                      >
                        <td className="pl-5 pr-2 add-manual-datas">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="px-2 add-manual-datas">
                          {energyAction.action_plan || "N/A"}
                        </td>
                        <td className="px-2 add-manual-datas">
                          {energyAction.title || "N/A"}
                        </td>
                        <td className="px-2 add-manual-datas">
                          {energyAction.statement ? (
                            energyAction.statement.length > 50 ?
                              `${energyAction.statement.substring(0, 50)}...` :
                              energyAction.statement
                          ) : "N/A"}
                        </td>
                        <td className="px-2 add-manual-datas">
                          {(energyAction.responsible?.first_name || "N/A") + " " + (energyAction.responsible?.last_name || "")}
                        </td>

                        <td className="px-2 add-manual-datas">
                          {energyAction.date || "N/A"}
                        </td>
                        <td className="px-2 add-manual-datas !text-center">
                          <button onClick={() => handleQmsViewEnergyAction(energyAction.id)}>
                            <img
                              src={viewIcon}
                              alt="View Icon"
                              style={{
                                filter:
                                  "brightness(0) saturate(100%) invert(69%) sepia(32%) saturate(4%) hue-rotate(53deg) brightness(94%) contrast(86%)",
                              }}
                            />
                          </button>
                        </td>
                        <td className="px-2 add-manual-datas !text-center">
                          <button onClick={() => handleQmsEditEnergyAction(energyAction.id)}>
                            <img src={editIcon} alt="Edit Icon" />
                          </button>
                        </td>
                        <td className="px-2 add-manual-datas !text-center">
                          <button onClick={() => openDeleteModal(energyAction)}>
                            <img src={deleteIcon} alt="Delete Icon" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-6 text-sm">
                <div className="text-white total-text">Total-{totalItems}</div>
                <div className="flex items-center gap-5">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`cursor-pointer swipe-text ${currentPage === 1 ? "opacity-50" : ""
                      }`}
                  >
                    Previous
                  </button>

                  {totalPages <= 5 ? (
                    Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`${currentPage === number ? "pagin-active" : "pagin-inactive"
                          }`}
                      >
                        {number}
                      </button>
                    ))
                  ) : (
                    <>
                      {/* First page */}
                      <button
                        onClick={() => paginate(1)}
                        className={`${currentPage === 1 ? "pagin-active" : "pagin-inactive"
                          }`}
                      >
                        1
                      </button>

                      {/* Ellipsis if we're not at the start */}
                      {currentPage > 3 && <span className="text-gray-400">...</span>}

                      {/* Pages around current page */}
                      {Array.from(
                        { length: Math.min(totalPages, 3) },
                        (_, i) => {
                          let pageNum;
                          if (currentPage <= 2) {
                            pageNum = i + 2;
                          } else if (currentPage >= totalPages - 1) {
                            pageNum = totalPages - 2 + i;
                          } else {
                            pageNum = currentPage - 1 + i;
                          }
                          return pageNum > 1 && pageNum < totalPages ? pageNum : null;
                        }
                      )
                        .filter(Boolean)
                        .map((number) => (
                          <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={`${currentPage === number ? "pagin-active" : "pagin-inactive"
                              }`}
                          >
                            {number}
                          </button>
                        ))}

                      {/* Ellipsis if we're not at the end */}
                      {currentPage < totalPages - 2 && <span className="text-gray-400">...</span>}

                      {/* Last page */}
                      {totalPages > 1 && (
                        <button
                          onClick={() => paginate(totalPages)}
                          className={`${currentPage === totalPages ? "pagin-active" : "pagin-inactive"
                            }`}
                        >
                          {totalPages}
                        </button>
                      )}
                    </>
                  )}

                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`cursor-pointer swipe-text ${currentPage === totalPages ? "opacity-50" : ""
                      }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </>
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

export default QmsListEnergyAction;