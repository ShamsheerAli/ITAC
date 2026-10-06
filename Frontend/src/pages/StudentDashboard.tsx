import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const StudentDashboard = () => {
    const [studentEmail, setStudentEmail] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setStudentEmail(user.email || "Student");
        }
    }, []);

    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto">
            {/* Welcome Banner */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-[#FE5C00]"></div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">Welcome to the ITAC Portal</h1>
                <p className="text-gray-500 font-medium mb-8">Logged in as {studentEmail}</p>
                
                <p className="text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
                    As a student researcher, your primary role is to review client facility details and upload your field notes, calculations, and images following an on-site assessment.
                </p>

                <Link 
                    to="/student-kanban" 
                    className="inline-flex items-center gap-2 bg-[#FE5C00] text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-700 transition shadow-md hover:shadow-lg"
                >
                    View Active Assessments
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </Link>
            </div>

            {/* Placeholder for Future Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 border-dashed text-center flex flex-col items-center justify-center h-48 opacity-60">
                    <span className="text-gray-400 font-bold mb-2">Map Widget Coming Soon</span>
                    <span className="text-xs text-gray-400">Space reserved for assessment locations</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 border-dashed text-center flex flex-col items-center justify-center h-48 opacity-60">
                    <span className="text-gray-400 font-bold mb-2">Recent Activity Coming Soon</span>
                    <span className="text-xs text-gray-400">Space reserved for recent document uploads</span>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;