import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { BASE_URL } from "../../../../Utils/Config";

const QmsDraftViewHealthSafetyIncidents = () => {
    const [formData, setFormData] = useState({
        source: "",
        title: "",
        incident_no: "",
        root_cause: "",
        reported_by: "",
        description: "",
        action: "",
        date_raised: "",
        date_completed: "",
        remarks: "",
        status: "",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchNcrNumber = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${BASE_URL}/qms/safety_incidents/${id}/`);
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                const data = await response.json();
                setFormData(data);
                setLoading(false);
            } catch (err) {
                setError("Failed to load data");
                setLoading(false);
                console.error("Error fetching ncr number data:", err);
            }
        };

        if (id) {
            fetchNcrNumber();
        }
    }, [id]);

    const handleClose = () => {
        navigate("/company/qms/draft-health-safety-incidents");
    };

    // if (loading) return (
    //     <div className="bg-[#1C1C24] text-white p-8 rounded-lg flex justify-center items-center">
    //         <p>Loading...</p>
    //     </div>
    // );

    if (error) return (
        <div className="bg-[#1C1C24] text-white p-8 rounded-lg">
            <p className="text-red-500">{error}</p>
            <button
                className="mt-4 bg-blue-600 px-4 py-2 rounded-md"
                onClick={() => navigate("/company/qms/draft-health-safety-incidents")}
            >
                Back to List
            </button>
        </div>
    );

    // Format dates for display
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div className="bg-[#1C1C24] text-white rounded-lg p-5">
            <div className="flex justify-between items-center border-b border-[#383840] pb-5">
                <h2 className="view-employee-head">Health and Safety Incidents Information</h2>
                <button
                    onClick={handleClose}
                    className="bg-[#24242D] h-[36px] w-[36px] flex justify-center items-center rounded-md"
                >
                    <X className="text-white" />
                </button>
            </div>

            <div className="p-5 relative">
                {/* Vertical divider line */}
                <div className="hidden md:block absolute top-[20px] bottom-[20px] left-1/2 border-l border-[#383840]"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[40px]">
                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Source
                        </label>
                        <div className="view-employee-data">{formData.source || "N/A"}</div>
                    </div>

                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Incident Title
                        </label>
                        <div className="view-employee-data">{formData.title || "N/A"}</div>
                    </div>

                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Incident No
                        </label>
                        <div className="view-employee-data">{formData.incident_no || "N/A"}</div>
                    </div>

                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Status
                        </label>
                        <div className="view-employee-data">{formData.status || "N/A"}</div>
                    </div>

                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Root Cause
                        </label>
                        <div className="view-employee-data">
                            {formData.root_cause?.title}
                        </div>
                    </div>

                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Report By
                        </label>
                        <div className="view-employee-data">
                            {formData.reported_by?.first_name} {formData.reported_by?.last_name}
                        </div>
                    </div>

                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Incident Description
                        </label>
                        <div className="view-employee-data">{formData.description || "N/A"}</div>
                    </div>

                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Action or Corrections
                        </label>
                        <div className="view-employee-data">{formData.action || "N/A"}</div>
                    </div>

                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Date Raised
                        </label>
                        <div className="view-employee-data">{formatDate(formData.date_raised)}</div>
                    </div>

                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Complete By
                        </label>
                        <div className="view-employee-data">{formatDate(formData.date_completed)}</div>
                    </div>
                    <div>
                        <label className="block view-employee-label mb-[6px]">
                            Remarks
                        </label>
                        <div className="view-employee-data">{formData.remarks}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default QmsDraftViewHealthSafetyIncidents
