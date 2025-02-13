import React from "react";
import { useSelector } from "react-redux";
import "./Stats.css";

const Stats = () => {
  const stats = useSelector((state) => state.stats);

  return (
    <section className="stats">
      <div className="stats-container">
        <div className="stat">
          <div className="value">{stats.diagnosisAccuracy}</div>
          <div className="label">Diagnosis Accuracy</div>
        </div>
        <div className="stat">
          <div className="value">{stats.medicalProfessionals}</div>
          <div className="label">Medical Professionals</div>
        </div>
        <div className="stat">
          <div className="value">{stats.patientsHelped}</div>
          <div className="label">Patients Helped</div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
