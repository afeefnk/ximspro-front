import React from "react";
import policy from "../../../../assets/images/Company-Sidebar/policy.svg";
import manual from "../../../../assets/images/Company-Sidebar/manual.svg";
import procedure from "../../../../assets/images/Company-Sidebar/manual.svg";
import record from "../../../../assets/images/Company-Sidebar/record-format.svg";
import parties from "../../../../assets/images/Company-Sidebar/interested parties.svg";
import process from "../../../../assets/images/Company-Sidebar/interested parties.svg";
import scope from "../../../../assets/images/Company-Sidebar/record-format.svg";
import "./documentationsubmenu.css";
import { useNavigate, useLocation } from "react-router-dom";

const DocumentationSubmenu = (props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const categories = [
    {
      id: "policy",
      label: "Policy",
      icon: <img src={policy} alt="Policy" className="w-[15px] h-[15px]" />,
      path: "/company/qms/policy",
      relatedPaths: [
        "/company/qms/addpolicy",
        "/company/qms/editpolicy/",
      ]
    },
    {
      id: "manual",
      label: "Manual",
      icon: <img src={manual} alt="Manual" className="w-[15px] h-[15px]" />,
      path: "/company/qms/manual",
      relatedPaths: ["/company/qms/addmanual",
        "/company/qms/draftmanual",
        "/company/qms/viewmanual",
        "/company/qms/editmanual",
        "/company/qms/editdraftmanual",
      ]
    },
    {
      id: "procedure",
      label: "Procedure",
      icon: (
        <img src={procedure} alt="Procedure" className="w-[15px] h-[15px]" />
      ),
      path: "/company/qms/procedure",
      relatedPaths: ["/company/qms/addprocedure",
        "/company/qms/draftprocedure",
        "/company/qms/viewprocedure",
        "/company/qms/editprocedure",
        "/company/qms/editdraftprocedure",
      ]
    },
    {
      id: "record-format",
      label: "Record Format",
      icon: (
        <img src={record} alt="Record Format" className="w-[15px] h-[15px]" />
      ),
      path: "/company/qms/record-format",
      relatedPaths: ["/company/qms/addrecordformat",
        "/company/qms/draftrecordformat",
        "/company/qms/viewrecordformat",
        "/company/qms/editrecordformat",
        "/company/qms/editdraftrecordformat",
      ]
    },
    {
      id: "interested-parties",
      label: "Interested Parties",
      icon: (
        <img src={parties} alt="Interested Parties" className="w-[15px] h-[15px]" />
      ),
      path: "/company/qms/interested-parties",
      relatedPaths: ["/company/qms/add-interested-parties",
        "/company/qms/edit-interested-parties",
        "/company/qms/view-interested-parties",
        "/company/qms/draft-interested-parties",
        "/company/qms/edit-draft-interested-parties",
        "/company/qms/view-draft-interested-parties"
      ]
    },
    {
      id: "processes",
      label: "Processes",
      icon: <img src={process} alt="Processes" className="w-[15px] h-[15px]" />,
      path: "/company/qms/processes",
      relatedPaths: ["/company/qms/add-processes",
        "/company/qms/view-processes",
        "/company/qms/edit-processes",
        "/company/qms/draft-processes",
        "/company/qms/edit-draft-processes",
        "/company/qms/view-draft-processes"
      ]
    },
    {
      id: "scope-statements",
      label: "Scope Statements",
      icon: (
        <img src={scope} alt="Scope Statements" className="w-[15px] h-[15px]" />
      ),
      path: "/company/qms/scope",
      relatedPaths: [
        "/company/qms/addscope",
        "/company/qms/editscope", 
      ]
    },
  ];

  // Check if a category is active, including related paths
  const isActive = (category) => {
    const currentPath = location.pathname;
    return currentPath === category.path ||
      (category.relatedPaths &&
        category.relatedPaths.some(path => currentPath.startsWith(path)));
  };

  // Handle clicking on a submenu item
  const handleCategoryClick = (category) => {
    if (props && props.handleItemClick) {
      props.handleItemClick(category.id, category.path, "qmsdocumentation");
    } else {
      navigate(category.path);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-[10px] bg-[#1C1C24] p-5 w-[555px] absolute top-16 border-t border-r border-b border-[#383840]">
      {categories.map((category) => {
        const active = isActive(category);
        return (
          <div
            key={category.id}
            className={`flex flex-col items-center justify-center py-[10px] rounded-md bg-[#85858515] transition-colors duration-200 cursor-pointer h-[100px] gap-[10px] documentation-submenu-cards`}
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

export default DocumentationSubmenu;