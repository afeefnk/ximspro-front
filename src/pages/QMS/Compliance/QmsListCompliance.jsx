import React, { useState } from 'react';
import { Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import plusicon from '../../../assets/images/Company Documentation/plus icon.svg'
import edits from '../../../assets/images/Company Documentation/edit.svg'
import deletes from '../../../assets/images/Company Documentation/delete.svg'
import view from '../../..//assets/images/Company Documentation/view.svg'
import "./qmslistcompliance.css";


const QmsListCompliance = () => {
    const initialData = [
        { id: 1, title: "Safety Protocol 2025", complianceNo: "SP-2025-001", revision: "Revision", date: "03-12-2024" },
        { id: 2, title: "Environmental Compliance", complianceNo: "EC-2025-042", revision: "Revision", date: "03-12-2024" },
    ];

    // State for form data management
    const [complianceData, setComplianceData] = useState(initialData);
    const [formData, setFormData] = useState({
        title: "",
        complianceNo: "",
        revision: "",
        date: new Date().toISOString().split('T')[0]
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Form handlers
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddCompliance = () => {
        const newId = complianceData.length > 0 ? Math.max(...complianceData.map(item => item.id)) + 1 : 1;
        const newEntry = {
            id: newId,
            title: formData.title || "Anonymous",
            complianceNo: formData.complianceNo || "Anonymous",
            revision: formData.revision || "Revision",
            date: formData.date || new Date().toLocaleDateString('en-GB').split('/').join('-')
        };

        setComplianceData([...complianceData, newEntry]);
        setFormData({
            title: "",
            complianceNo: "",
            revision: "",
            date: new Date().toISOString().split('T')[0]
        });
        setShowAddForm(false);
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleDelete = (id) => {
        setComplianceData(complianceData.filter(item => item.id !== id));
    };

    // Filter and pagination
    const filteredData = complianceData.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.complianceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.revision.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div className="bg-[#1C1C24] text-white p-5 rounded-lg">
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="list-compliance-head">List Compliance</h1>
                    <div className="flex gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="serach-input-manual focus:outline-none bg-transparent"
                            />
                            <div className='absolute right-[1px] top-[2px] text-white bg-[#24242D] p-[10.5px] w-[55px] rounded-tr-[6px] rounded-br-[6px] flex justify-center items-center'>
                                <Search size={18} />
                            </div>
                        </div>
                        <button
                           className="flex items-center justify-center add-manual-btn gap-[10px] duration-200 border border-[#858585] text-[#858585] hover:bg-[#858585] hover:text-white"
                        >
                            <span>Add Compliance</span>
                            <img src={plusicon} alt="Add Icon" className='w-[18px] h-[18px] qms-add-plus' />
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className='bg-[#24242D]'>
                                <tr className="h-[48px]">
                                    <th className="px-4 qms-list-compliance-thead text-left w-24">No</th>
                                    <th className="px-4 qms-list-compliance-thead text-left">Title</th>
                                    <th className="px-4 qms-list-compliance-thead text-left">Compliance No</th>
                                    <th className="px-4 qms-list-compliance-thead text-left">Revision</th>
                                    <th className="px-4 qms-list-compliance-thead text-left">Date</th>
                                    <th className="px-4 qms-list-compliance-thead text-center">View</th>
                                    <th className="px-4 qms-list-compliance-thead text-center">Edit</th>
                                    <th className="px-4 qms-list-compliance-thead text-center">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((item) => (
                                    <tr key={item.id} className="border-b border-[#383840] hover:bg-[#1a1a20] h-[50px] cursor-pointer">
                                        <td className="px-4 qms-list-compliance-data">{item.id}</td>
                                        <td className="px-4 qms-list-compliance-data">{item.title}</td>
                                        <td className="px-4 qms-list-compliance-data">{item.complianceNo}</td>
                                        <td className="px-4 qms-list-compliance-data">
                                            <span className="text-[#1E84AF]">{item.revision}</span>
                                        </td>
                                        <td className="px-4 qms-list-compliance-data">{item.date}</td>
                                        <td className="px-4 qms-list-compliance-data text-center">
                                            <button c>
                                               <img src={view} alt="View Icon"  className='w-[16px] h-[16px]'/>
                                            </button>
                                        </td>
                                        <td className="px-4 qms-list-compliance-data text-center">
                                            <button c>
                                               <img src={edits} alt="Edit icon" className='w-[16px] h-[16px]' />
                                            </button>
                                        </td>
                                        <td className="px-4 qms-list-compliance-data text-center">
                                            <button     
                                                onClick={() => handleDelete(item.id)}
                                            >
                                               <img src={deletes} alt="Deletes icon" className='w-[16px] h-[16px]' />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-4 py-3 flex items-center justify-between">
                        <div className="text-sm text-gray-400">
                            Total-{filteredData.length}
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`px-2 py-1 rounded ${currentPage === 1 ? 'text-gray-600' : 'text-gray-400 hover:text-white'}`}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>

                            <span className="text-gray-400">Previous</span>

                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-8 h-8 text-sm rounded-md flex items-center justify-center ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <span className="text-gray-400">Next</span>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className={`px-2 py-1 rounded ${currentPage === totalPages || totalPages === 0 ? 'text-gray-600' : 'text-gray-400 hover:text-white'}`}
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QmsListCompliance
