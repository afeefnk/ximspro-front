import React, { useState } from 'react';
import profile from "../../assets/images/Company-Navbar/profile.svg";

const NotificationItem = ({ statusStages = [], notificationDetails = {} }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-4 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
      {/* Profile Image and Notification Details */}
      <div className='flex gap-2'>
        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
          <img src={profile} alt="" />
        </div>

        <div className="flex-grow">
          <div className="text-white text-sm font-medium">{notificationDetails.title}</div>
          <div className="text-gray-400 text-xs mt-1">{notificationDetails.description}</div>
          <div className="text-gray-500 text-xs mt-1">Section Name/Title: {notificationDetails.sectionName}</div>
          <div className="text-gray-500 text-xs">Section Number: {notificationDetails.sectionNumber}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full md:w-[45%] relative">
        <div className="absolute top-2 left-0 right-0 z-0 flex justify-between w-full px-12">
          {statusStages.map((stage, index) => {
            // Set segment color based on previous step completion
            const isPrevCompleted = index > 0 && statusStages[index - 0].completed;
            const segmentColor = isPrevCompleted ? 'border-green-500' : 'border-[#D9D9D9]';

            return (
              index !== 0 && (
                <div key={index} className={`w-full h-[2px] border-t-2 border-dashed ${segmentColor}`}></div>
              )
            );
          })}
        </div>

        {/* Stages Container */}
        <div className="relative flex justify-between items-center">
          {statusStages.map((stage, index) => (
            <div key={stage.status} className="flex flex-col items-center z-10">
              {/* Status Point */}
              <div
                className={`w-4 h-4 rounded-full border-4 ${
                  stage.completed ? 'bg-green-500 border-green-500' : 'bg-[#D9D9D9] border-[#D9D9D9]'
                }`}
              ></div>

              {/* Stage Details */}
              <div className="text-center mt-2">
                <div className="text-xs text-white">{stage.status}</div>
                <div className="text-xs text-white">{stage.user}</div>
                <div className="text-xs text-[#AAAAAA]">{stage.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Button */}
      <button className="ml-0 md:ml-4 text-blue-400 text-sm border border-blue-400 rounded px-3 py-1 hover:bg-blue-400 hover:text-white transition-colors">
        Click to view
      </button>
    </div>
  );
};


const ViewAllNotifications = ({
  tabs = ['QMS', 'EMS', 'OHS', 'EnMS', 'BMS', 'AMS', 'IMS'],
  notifications = {
    'QMS': [
      {
        statusStages: [
          { status: 'Written By', user: 'User A', timestamp: '20-04-2025 06:30am', completed: true },
          { status: 'Checked By', user: 'User B', timestamp: '20-04-2025 09:30am', completed: true },
          { status: 'Approved By', user: 'User D', timestamp: '20-04-2025 09:30am', completed: true }
        ],
        notificationDetails: {
          title: 'QMS Manual Update',
          description: 'Quality Management System manual needs review.',
          sectionName: 'Quality Procedures',
          sectionNumber: 'QMS-001'
        }
      },
      {
        statusStages: [
          { status: 'Written By', user: 'User X', timestamp: '21-04-2025 10:30am', completed: true },
          { status: 'Checked By', user: 'User Y', timestamp: '22-04-2025 11:30am', completed: false },
          { status: 'Approved By', user: 'User Z', timestamp: '21-04-2025 10:30am', completed: false }
        ],
        notificationDetails: {
          title: 'QMS Process Improvement',
          description: 'New quality improvement document submitted.',
          sectionName: 'Continuous Improvement',
          sectionNumber: 'QMS-002'
        }
      }
    ],
    'EMS': [
      {
        statusStages: [
          { status: 'Written By', user: 'User E', timestamp: '15-04-2025 02:45pm', completed: true },
          { status: 'Checked By', user: 'User F', timestamp: '17-04-2025 03:15pm', completed: true },
          { status: 'Approved By', user: 'User G', timestamp: '19-04-2025 04:00pm', completed: false }
        ],
        notificationDetails: {
          title: 'Environmental Impact Assessment',
          description: 'New environmental report requires approval.',
          sectionName: 'Sustainability Initiatives',
          sectionNumber: 'EMS-101'
        }
      }
    ],
    'OHS': [],
    'EnMS': [],
    'BMS': [],
    'AMS': [],
    'IMS': []
  }
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="bg-gray-900 p-6">
      <div>
        <div className="flex mb-4 space-x-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm rounded transition-colors flex-shrink-0 ${activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
                }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Notification Items or No Notifications Message */}
        {notifications[activeTab].length > 0 ? (
          notifications[activeTab].map((notification, index) => (
            <NotificationItem
              key={index}
              statusStages={notification.statusStages}
              notificationDetails={notification.notificationDetails}
            />
          ))
        ) : (
          <div className="text-gray-400 text-center py-10">
            No notifications for {activeTab} at the moment
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllNotifications;