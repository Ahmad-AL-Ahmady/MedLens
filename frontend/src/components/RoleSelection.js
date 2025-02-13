import React from "react";
import { useSelector } from "react-redux";
import "./RoleSelection.css";

const RoleSelection = () => {
  const roles = useSelector((state) => state.roles);

  return (
    <section className="role-selection" id="roleSelection">
      <div className="role-container">
        <div className="role-header">
          <h2>Join Your Medical AI Assistant</h2>
          <p>
            Select your role to get started with personalized healthcare
            solutions
          </p>
        </div>
        <div className="role-cards">
          {roles.map((role, index) => (
            <div key={index} className="role-card">
              <span className="role-icon">{role.icon}</span>
              <h3>{role.title}</h3>
              <p>{role.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoleSelection;
