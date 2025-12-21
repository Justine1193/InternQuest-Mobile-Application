/**
 * EmptyState Component
 * Displays a friendly empty state with illustration and actionable message
 */

import React from "react";
import PropTypes from "prop-types";
import { 
  IoAddCircleOutline, 
  IoSearchOutline, 
  IoDocumentTextOutline,
  IoPeopleOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoLockClosedOutline,
  IoCloudOfflineOutline
} from "react-icons/io5";
import "./EmptyState.css";

const EmptyState = ({ 
  type = "default", 
  title, 
  message, 
  actionLabel, 
  onAction,
  icon: CustomIcon,
  variant = "default" // default, error, success, warning
}) => {
  const getIcon = () => {
    if (CustomIcon) return <CustomIcon className="empty-state-icon" />;
    
    switch (type) {
      case "search":
        return <IoSearchOutline className="empty-state-icon" />;
      case "document":
        return <IoDocumentTextOutline className="empty-state-icon" />;
      case "students":
        return <IoPeopleOutline className="empty-state-icon" />;
      case "error":
        return <IoAlertCircleOutline className="empty-state-icon" />;
      case "success":
        return <IoCheckmarkCircleOutline className="empty-state-icon" />;
      case "no-permission":
        return <IoLockClosedOutline className="empty-state-icon" />;
      case "offline":
        return <IoCloudOfflineOutline className="empty-state-icon" />;
      default:
        return <IoAddCircleOutline className="empty-state-icon" />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case "search":
        return "No results found";
      case "document":
        return "No records yet";
      case "students":
        return "No students found";
      case "error":
        return "Something went wrong";
      case "success":
        return "All done!";
      case "no-permission":
        return "Access denied";
      case "offline":
        return "You're offline";
      default:
        return "Nothing here yet";
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case "search":
        return "Try adjusting your search or filters to find what you're looking for. You can also clear all filters to see all results.";
      case "document":
        return "Get started by adding your first record. Use the 'Add' button above to create a new entry.";
      case "students":
        return "No students found. Add a new student account or import students from a CSV file.";
      case "filtered":
        return "No students match your current filters. Try adjusting your search criteria or clear filters to see all students.";
      case "error":
        return "We encountered an error while loading this content. Please try refreshing the page or contact support if the problem persists.";
      case "success":
        return "Everything is up to date. There's nothing that needs your attention right now.";
      case "no-permission":
        return "You don't have permission to view this content. Please contact your administrator if you believe this is an error.";
      case "offline":
        return "It looks like you're not connected to the internet. Please check your connection and try again.";
      default:
        return "Start by adding your first item. Use the action buttons above to get started.";
    }
  };

  return (
    <div className={`empty-state type-${variant}`}>
      <div className="empty-state-content">
        <div className="empty-state-icon-wrapper">
          {getIcon()}
        </div>
        <h3 className="empty-state-title">
          {title || getDefaultTitle()}
        </h3>
        <p className="empty-state-message">
          {message || getDefaultMessage()}
        </p>
        {onAction && actionLabel && (
          <button 
            className="empty-state-action"
            onClick={onAction}
            aria-label={actionLabel}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

EmptyState.propTypes = {
  type: PropTypes.oneOf([
    "default", 
    "search", 
    "document", 
    "students", 
    "filtered",
    "error",
    "success",
    "no-permission",
    "offline"
  ]),
  title: PropTypes.string,
  message: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  icon: PropTypes.elementType,
  variant: PropTypes.oneOf(["default", "error", "success", "warning"]),
};

export default EmptyState;

