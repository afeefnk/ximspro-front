import React from 'react'
import policy from "../../../../assets/images/Company-Sidebar/policy.svg";
import manual from "../../../../assets/images/Company-Sidebar/manual.svg";
import { useNavigate, useLocation } from "react-router-dom";

const ObjectiveSubmenu = (props) => {
    const navigate = useNavigate();
    const location = useLocation();

    const categories = [
        {
            id: "objectives-and-kpis",
            label: "Objectives and KPIs",
            icon: <img src={policy} alt="Policy" className="w-[15px] h-[15px]" />,
            path: "/company/qms/list-objectives",
            relatedPaths: [
                "/company/qms/add-objectives",
                "/company/qms/edit-objectives",
                "/company/qms/view-objectives",
                "/company/qms/draft-objectives",
                "/company/qms/edit-draft-objectives",
                "/company/qms/view-draft-objectives"
            ]
        },
        {
            id: "targets-and-programs",
            label: "Targets and Programs",
            icon: <img src={manual} alt="Manual" className="w-[15px] h-[15px]" />,
            path: "/company/qms/list-targets",
            relatedPaths: [
                "/company/qms/add-targets",
                "/company/qms/edit-targets",
                "/company/qms/view-targets",
                "/company/qms/draft-targets",
                "/company/qms/edit-draft-targets",
                "/company/qms/view-draft-targets"
            ]
        },
    ]

    const isActive = (category) => {
        const currentPath = location.pathname;
        return currentPath === category.path ||
            (category.relatedPaths &&
                category.relatedPaths.some(path => currentPath.startsWith(path)));
    };

    const handleCategoryClick = (category) => {
        if (props && props.handleItemClick) {
            props.handleItemClick(category.id, category.path, "qmsobjectives");
        } else {
            navigate(category.path);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-[10px] bg-[#1C1C24] p-5 w-[380px] absolute top-16 border-t border-r border-b border-[#383840]">
            {categories.map((category) => {
                const active = isActive(category);
                return (
                    <div
                        key={category.id}
                        className="flex flex-col items-center justify-center py-[10px] rounded-md bg-[#85858515] transition-colors duration-200 cursor-pointer w-[165px] h-[100px] gap-[10px] documentation-submenu-cards"
                        onClick={() => handleCategoryClick(category)}
                    >
                        <div className="bg-[#5B5B5B] rounded-full p-[5px] w-[26px] h-[26px] flex justify-center items-center">
                            {category.icon}
                        </div>
                        <span
                            className={`text-center ${active ? "text-white" : "text-[#5B5B5B]"
                                } documentation-submenu-label duration-200`}
                        >
                            {category.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default ObjectiveSubmenu
