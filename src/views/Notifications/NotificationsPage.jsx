import React from "react";
import Notification from "./Notification"; // Import the Notification component
import "./notifications.css"; // Import the CSS file
import { Button } from "@/components/ui/button"; // Import shadcn Button

const NotificationsPage = () => {
  // Dummy data for demonstration
  const notifications = [
    {
      id: 1,
      imageSrc: "path/to/star-seller-image.png", // Replace with actual image paths
      title: "Lorem Ipsum",
      description:
        "Is simply dummy text of the printing and typesetting industry...",
      isHighlighted: false,
    },
    {
      id: 2,
      imageSrc: "path/to/flash-deals-image.png",
      title: "Lorem Ipsum",
      description:
        "Is simply dummy text of the printing and typesetting industry...",
      isHighlighted: true, // Highlight this one based on the image
    },
    {
      id: 3,
      imageSrc: "path/to/shopee-video-image.png",
      title: "Lorem Ipsum",
      description:
        "Is simply dummy text of the printing and typesetting industry...",
      isHighlighted: false,
    },
    {
      id: 4,
      imageSrc: "path/to/s-pay-image.png",
      title: "Lorem Ipsum",
      description:
        "Is simply dummy text of the printing and typesetting industry...",
      isHighlighted: false,
    },
  ];

  return (
    <div className="notifications-page-container">
      <div className="sidebar">
        {/* Sidebar content goes here */}
        <div className="user-profile">
          {/* User profile image and name */}
          <p className="user-name">Mik ko</p>
          <p className="edit-profile">Edit Profile</p>
        </div>
        <nav className="navigation-menu">
          <ul>
            <li className="nav-item">My Account</li>
            <li className="nav-item">Notifications</li>
            <li className="nav-item active">Order Updates</li>
            <li className="nav-item">Promotions</li>
          </ul>
        </nav>
      </div>
      <div className="main-content">
        <div className="main-content-header">
          <h2 className="page-title">Notifications</h2>
          <Button variant="outline" className="mark-all-read-btn">
            Mark as all read
          </Button>
        </div>
        <div className="notifications-list">
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              imageSrc={notification.imageSrc}
              title={notification.title}
              description={notification.description}
              isHighlighted={notification.isHighlighted}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
