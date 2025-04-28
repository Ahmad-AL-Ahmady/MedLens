import React, { useState, useEffect } from "react";
import "../Styles/Pharmacy.css";
import { useNavigate } from "react-router-dom";

export default function PharmacyPage() {
  const [searchQuery, setSearchQuery] = useState(""); // لحفظ استعلام البحث
  const [medicines, setMedicines] = useState([]); // لتخزين الأدوية المسترجعة من الـ API
  const [loading, setLoading] = useState(true); // لتحديد حالة التحميل
  const navigate = useNavigate();

  // استدعاء الـ API لجلب الأدوية باستخدام دالة getAllMedications
  useEffect(() => {
    setLoading(true); // تعيين التحميل إلى true عند بدء الاستدعاء

    fetch("http://localhost:4000/api/medications") // هنا استدعاء الـ API
      .then((response) => response.json())
      .then((data) => {
        setMedicines(data.data.medications); // حفظ الأدوية في الـ state
        setLoading(false); // تعيين التحميل إلى false بعد استرجاع البيانات
        console.log("Medications data:", data);
      })
      .catch((error) => {
        console.error("Error fetching medications:", error);
        setLoading(false); // تعيين التحميل إلى false في حال حدوث خطأ
      });
  }, []);

  // تصفية الأدوية بناءً على استعلام البحث
  const filteredMedicines = medicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pharmacy-page">
      <h1 className="pharmacy-page__title">Search for medicines</h1>

      <div className="pharmacy-page__search-container">
        <input
          type="text"
          placeholder="Search medicine or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // تحديث استعلام البحث
          className="pharmacy-page__search-input"
        />
      </div>

      {/* عرض حالة التحميل */}
      {loading ? (
        <p>Loading medicines...</p>
      ) : (
        <div className="pharmacy-page__medicine-grid">
          {filteredMedicines.length > 0 ? (
            filteredMedicines.map((medicine) => (
              <div
                key={medicine._id} // _id هو المعرف الفريد لكل دواء
                className="pharmacy-page__medicine-card"
                onClick={() => navigate(`/medicines/${medicine._id}`)} // الانتقال إلى صفحة تفاصيل الدواء
                role="button"
                tabIndex={0}
              >
                <div className="pharmacy-page__medicine-header">
                  <h2 className="pharmacy-page__medicine-name">
                    {medicine.name}
                  </h2>
                  <span className="pharmacy-page__medicine-category">
                    {medicine.strength}
                  </span>
                </div>
                <p className="pharmacy-page__medicine-description">
                  {medicine.description}
                </p>
              </div>
            ))
          ) : (
            <p>No medications found</p> // رسالة في حال عدم وجود أدوية تطابق البحث
          )}
        </div>
      )}
    </div>
  );
}
