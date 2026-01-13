import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaTrash, FaBookOpen, FaLayerGroup } from "react-icons/fa";
import AdminNavbar from "../../components/layouts/AdminNavbar";
import "../../index.css";
import "../../admin.css";
import "../../components/CssStyle/admGradesStyles.css";
import "../../components/CssStyle/softBlobBackground.css";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import Alert from "../../components/layouts/Alert";
import ConfirmModal from "../../components/layouts/ConfirmModal";

const DEFAULT_GRADES = [
  "Grade 6", "Grade 7", "Grade 8",
  "Grade 9", "Grade 10", "Grade 11"
];

const AdmSubject = () => {
  const navbarRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(85);

  const [subjects, setSubjects] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [newSubject, setNewSubject] = useState("");
  const [newUnit, setNewUnit] = useState({ name: "", content: "" });

  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [addingSubject, setAddingSubject] = useState(false);
  const [addingUnit, setAddingUnit] = useState(false);

  const [removingSubjectId, setRemovingSubjectId] = useState(null);
  const [removingUnitId, setRemovingUnitId] = useState(null);

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmTitle, setConfirmTitle] = useState("Confirm");
  const [confirmHandler, setConfirmHandler] = useState(() => {});

  // Auto-clear alerts
  useEffect(() => {
    if (!alertMessage) return;
    const t = setTimeout(() => setAlertMessage(""), 3000);
    return () => clearTimeout(t);
  }, [alertMessage]);

  const currentGradeObj = subjects.find(
    (g) => String(g.gradeId) === String(selectedGrade)
  ) || null;

  const currentSubjectObj =
    currentGradeObj?.subjects?.find(
      (s) => String(s.subjectId) === String(selectedSubject)
    ) || null;

  useEffect(() => {
    const updateHeight = () => {
      if (navbarRef.current) setNavbarHeight(navbarRef.current.offsetHeight);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Fetch grades and then subjects
  useEffect(() => {
    const fetchGrades = async () => {
      setLoadingGrades(true);
      try {
        const res = await axiosInstance.get(API_PATHS.ADMIN.GRADES);
        let grades = res.data?.grades || [];

        // ⭐ SORT GRADES ASC (main update you requested)
        grades = grades.sort((a, b) => {
          const numA = parseInt(a.name.match(/\d+/)?.[0] || 0);
          const numB = parseInt(b.name.match(/\d+/)?.[0] || 0);
          return numA - numB;
        });

        let container = grades.map((g) => ({
          grade: g.name,
          gradeId: g._id,
          subjects: [],
        }));

        if (container.length === 0) {
          container = DEFAULT_GRADES.map((g, i) => ({
            grade: g,
            gradeId: `default_${i}`,
            subjects: [],
          }));
        }

        setSubjects(container);
        setSelectedGrade(container[0]?.gradeId ?? "");

        // Fetch subjects for each grade
        for (const g of container) {
          if (String(g.gradeId).startsWith("default_")) continue;

          try {
            const resSub = await axiosInstance.get(
              API_PATHS.ADMIN.GET_SUBJECTS,
              { params: { gradeId: g.gradeId } }
            );

            const list = resSub.data?.subjects || [];

            setSubjects((prev) =>
              prev.map((item) =>
                String(item.gradeId) === String(g.gradeId)
                  ? {
                      ...item,
                      subjects: list.map((s) => ({
                        name: s.name,
                        subjectId: s._id,
                        units: (s.units || []).map((u) => ({
                          id: u._id,
                          name: u.name,
                          content: u.content,
                        })),
                      })),
                    }
                  : item
              )
            );
          } catch {}
        }
      } catch (err) {
        setAlertType("error");
        setAlertMessage("Failed to load grade list.");
      } finally {
        setLoadingGrades(false);
      }
    };

    fetchGrades();
  }, []);
  // Fetch subjects when selecting grade
  useEffect(() => {
    if (!selectedGrade) return;

    if (String(selectedGrade).startsWith("default_")) return;

    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const res = await axiosInstance.get(API_PATHS.ADMIN.GET_SUBJECTS, {
          params: { gradeId: selectedGrade },
        });

        const apiSubjects = res.data?.subjects || [];

        const transformed = apiSubjects.map((s) => ({
          name: s.name,
          subjectId: s._id,
          units: (s.units || []).map((u) => ({
            id: u._id,
            name: u.name,
            content: u.content,
          })),
        }));

        setSubjects((prev) =>
          prev.map((g) =>
            String(g.gradeId) === String(selectedGrade)
              ? { ...g, subjects: transformed }
              : g
          )
        );
      } catch (err) {
        setAlertType("error");
        setAlertMessage("Failed to load subjects.");
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [selectedGrade]);

  /* ADD SUBJECT */
  const addSubject = async () => {
    if (!selectedGrade) {
      setAlertType("error");
      setAlertMessage("Select a grade first!");
      return;
    }

    const name = (newSubject || "").trim();
    if (!name) {
      setAlertType("error");
      setAlertMessage("Enter subject name");
      return;
    }

    const exists =
      currentGradeObj?.subjects?.some(
        (s) => (s.name || "").trim().toLowerCase() === name.toLowerCase()
      ) || false;

    if (exists) {
      setAlertType("error");
      setAlertMessage(`Subject "${name}" already exists in ${currentGradeObj.grade}`);
      return;
    }

    if (String(selectedGrade).startsWith("default_")) {
      setAlertType("error");
      setAlertMessage("Cannot add subject to a placeholder grade.");
      return;
    }

    setAddingSubject(true);
    try {
      const res = await axiosInstance.post(API_PATHS.ADMIN.ADD_SUBJECT, {
        gradeId: selectedGrade,
        name,
      });

      const created = res.data?.subject;
      if (!created) throw new Error("No subject returned");

      const newSub = {
        name: created.name,
        subjectId: created._id,
        units: [],
      };

      setSubjects((prev) =>
        prev.map((g) =>
          String(g.gradeId) === String(selectedGrade)
            ? { ...g, subjects: [...(g.subjects || []), newSub] }
            : g
        )
      );

      setNewSubject("");
      setSelectedSubject(newSub.subjectId);

      setAlertType("success");
      setAlertMessage("Subject added successfully!");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to add subject.";
      setAlertType("error");
      setAlertMessage(msg);
    } finally {
      setAddingSubject(false);
    }
  };

  /* REMOVE SUBJECT */
  const removeSubject = (subId) => {
    const subjectObj = currentGradeObj?.subjects.find(
      (s) => String(s.subjectId) === String(subId)
    );
    if (!subjectObj) return;

    setConfirmTitle("Delete Subject?");
    setConfirmMessage(`Are you sure you want to delete "${subjectObj.name}"?`);

    setConfirmHandler(() => async () => {
      setConfirmOpen(false);
      setRemovingSubjectId(subId);

      try {
        await axiosInstance.post(API_PATHS.ADMIN.REMOVE_SUBJECT, {
          subjectId: subId,
        });

        setSubjects((prev) =>
          prev.map((g) =>
            String(g.gradeId) === String(selectedGrade)
              ? {
                  ...g,
                  subjects: (g.subjects || []).filter(
                    (s) => String(s.subjectId) !== String(subId)
                  ),
                }
              : g
          )
        );

        if (String(selectedSubject) === String(subId)) {
          setSelectedSubject("");
        }

        setAlertType("success");
        setAlertMessage("Subject removed successfully!");
      } catch (err) {
        const msg =
          err?.response?.data?.message || "Failed to delete subject.";
        setAlertType("error");
        setAlertMessage(msg);
      } finally {
        setRemovingSubjectId(null);
      }
    });

    setConfirmOpen(true);
  };

  /* ADD UNIT */
  const addUnit = async () => {
    const subj = currentGradeObj?.subjects?.find(
      (s) => String(s.subjectId) === String(selectedSubject)
    );

    if (!subj) {
      setAlertType("error");
      setAlertMessage("Subject not found.");
      return;
    }

    const name = (newUnit.name || "").trim();
    const content = (newUnit.content || "").trim();

    if (!name || !content) {
      setAlertType("error");
      setAlertMessage("Enter unit details.");
      return;
    }

    setAddingUnit(true);
    try {
      const res = await axiosInstance.post(API_PATHS.ADMIN.ADD_UNIT, {
        subjectId: subj.subjectId,
        name,
        content,
      });

      const updatedUnits = (res.data?.subject?.units || []).map((u) => ({
        id: u._id,
        name: u.name,
        content: u.content,
      }));

      setSubjects((prev) =>
        prev.map((g) =>
          String(g.gradeId) === String(selectedGrade)
            ? {
                ...g,
                subjects: (g.subjects || []).map((s) =>
                  String(s.subjectId) === String(subj.subjectId)
                    ? { ...s, units: updatedUnits }
                    : s
                ),
              }
            : g
        )
      );

      setNewUnit({ name: "", content: "" });
      setAlertType("success");
      setAlertMessage("Unit added successfully!");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to add unit.";
      setAlertType("error");
      setAlertMessage(msg);
    } finally {
      setAddingUnit(false);
    }
  };
  /* REMOVE UNIT */
  const removeUnit = (unitId) => {
    const subj = currentGradeObj?.subjects?.find(
      (s) => String(s.subjectId) === String(selectedSubject)
    );
    if (!subj) return;

    setConfirmTitle("Delete Unit?");
    setConfirmMessage("Are you sure you want to delete this unit?");

    setConfirmHandler(() => async () => {
      setConfirmOpen(false);
      setRemovingUnitId(unitId);

      try {
        const res = await axiosInstance.post(API_PATHS.ADMIN.REMOVE_UNIT, {
          subjectId: subj.subjectId,
          unitId,
        });

        const updatedUnits = (res.data?.subject?.units || []).map((u) => ({
          id: u._id,
          name: u.name,
          content: u.content,
        }));

        setSubjects((prev) =>
          prev.map((g) =>
            String(g.gradeId) === String(selectedGrade)
              ? {
                  ...g,
                  subjects: (g.subjects || []).map((s) =>
                    String(s.subjectId) === String(subj.subjectId)
                      ? { ...s, units: updatedUnits }
                      : s
                  ),
                }
              : g
          )
        );

        setAlertType("success");
        setAlertMessage("Unit removed successfully!");
      } catch (err) {
        const msg =
          err?.response?.data?.message || "Failed to remove unit";
        setAlertType("error");
        setAlertMessage(msg);
      } finally {
        setRemovingUnitId(null);
      }
    });

    setConfirmOpen(true);
  };

  /* SORT GRADES ASCENDING (FINAL APPLY) */
  const sortedGrades = [...subjects].sort((a, b) => {
    const numA = parseInt(a.grade.match(/\d+/)?.[0] || 0);
    const numB = parseInt(b.grade.match(/\d+/)?.[0] || 0);
    return numA - numB;
  });

  return (
    <div className="min-h-screen flex flex-col app-background">
      <header ref={navbarRef} className="w-full fixed top-0 left-0 z-50">
        <AdminNavbar />
      </header>

      <main
        className="flex-1 p-8 overflow-y-auto"
        style={{ paddingTop: navbarHeight + 140 }}
      >
        {/* PAGE TITLE */}
        <div className="text-center animate-fadeIn mb-6">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-700 to-purple-800 bg-clip-text text-transparent">
            Manage Subjects & Units
          </h1>
          <p className="text-gray-600 mt-2">
            Add subjects, create units, and organize learning material.
          </p>
        </div>

        <Alert type={alertType} message={alertMessage} />

        {/* SELECT GRADE + ADD SUBJECT */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8 mt-8">
          <div className="flex items-center gap-3">
            <label className="text-indigo-700 font-semibold">Select Grade:</label>

            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedSubject("");
              }}
              className="add-grade-input !w-[180px]"
            >
              {sortedGrades.map((g) => (
                <option key={g.gradeId} value={g.gradeId}>
                  {g.grade}
                </option>
              ))}
            </select>
          </div>

          {/* ADD SUBJECT */}
          <div className="add-grade-box !w-auto flex">
            <input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Add new subject"
              className="add-grade-input"
            />
            <button
              onClick={addSubject}
              disabled={addingSubject}
              className="add-grade-btn"
            >
              {addingSubject ? "Adding..." : "Add Subject"}
            </button>
          </div>
        </div>

        {/* SORTED GRADE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {sortedGrades.map((g) => (
            <div
              key={g.gradeId}
              onClick={() => setSelectedGrade(g.gradeId)}
              className={`summary-card cursor-pointer p-6 transition ${
                String(g.gradeId) === String(selectedGrade)
                  ? "ring-4 ring-indigo-300"
                  : ""
              }`}
            >
              <h2 className="text-lg font-bold text-indigo-800 flex items-center gap-2">
                <FaLayerGroup /> {g.grade}
              </h2>
              <p className="text-gray-600 text-sm">
                {(g.subjects || []).length} Subjects
              </p>
            </div>
          ))}
        </div>

        {/* SUBJECT SELECT DROPDOWN */}
        {currentGradeObj && (currentGradeObj.subjects || []).length > 0 && (
          <div className="flex gap-3 items-center mb-10">
            <label className="text-indigo-700 font-semibold">
              Select Subject:
            </label>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="add-grade-input !w-[220px]"
            >
              <option value="">-- Select Subject --</option>

              {(currentGradeObj.subjects || []).map((s) => (
                <option key={s.subjectId} value={s.subjectId}>
                  {s.name} ({(s.units || []).length} units)
                </option>
              ))}
            </select>

            {selectedSubject && (
              <button
                onClick={() => removeSubject(selectedSubject)}
                disabled={removingSubjectId === selectedSubject}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                {removingSubjectId === selectedSubject
                  ? "Removing..."
                  : "Delete Subject"}
              </button>
            )}
          </div>
        )}

        {/* UNIT MANAGEMENT */}
        {selectedSubject && currentSubjectObj && (
          <>
            <h3 className="text-2xl font-semibold text-indigo-800 mb-4 flex items-center gap-2">
              <FaBookOpen /> {currentSubjectObj.name} – Units
              {/* Units Section */}
            </h3>

            {/* ADD UNIT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <input
                value={newUnit.name}
                onChange={(e) =>
                  setNewUnit({ ...newUnit, name: e.target.value })
                }
                placeholder="Unit (Lesson) Name"
                className="add-grade-input"
              />

              <input
                value={newUnit.content}
                onChange={(e) =>
                  setNewUnit({ ...newUnit, content: e.target.value })
                }
                placeholder="Lesson Description"
                className="add-grade-input"
              />

              <button
                onClick={addUnit}
                disabled={addingUnit}
                className="add-grade-btn"
              >
                {addingUnit ? "Adding..." : "Add Unit"}
              </button>
            </div>

            {/* LIST UNITS */}
            {(currentSubjectObj.units || []).length === 0 ? (
              <p className="text-gray-500">
                No units yet. Add lessons using the form above.
              </p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(currentSubjectObj.units || []).map((u) => (
                  <div
                    key={u.id}
                    className="p-5 rounded-xl shadow border border-indigo-300
                      bg-[linear-gradient(155deg,rgba(250,250,255,0.97),
                      rgba(235,242,255,0.96),rgba(220,232,255,0.94),
                      rgba(205,218,255,0.93),rgba(198,185,255,0.92))]
                      hover:shadow-lg hover:scale-[1.02] transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-indigo-800">
                          {u.name}
                        </h4>
                        <p className="text-gray-700 text-sm">{u.content}</p>
                      </div>

                      <button
                        onClick={() => removeUnit(u.id)}
                        disabled={removingUnitId === u.id}
                        className="text-red-600 hover:text-red-800"
                      >
                        {removingUnitId === u.id ? "Removing..." : <FaTrash />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <ConfirmModal
          open={confirmOpen}
          title={confirmTitle}
          message={confirmMessage}
          onConfirm={confirmHandler}
          onCancel={() => setConfirmOpen(false)}
        />
      </main>
    </div>
  );
};

export default AdmSubject;
