const handleSelectAll = () => {
  if (selectedStudents.length === students.length) {
    // If all are selected, deselect all
    setSelectedStudents([]);
  } else {
    // Otherwise, select all
    setSelectedStudents(students.map((student) => student.id));
  }
};

const handleCheckboxClick = (studentId) => {
  setSelectedStudents((prev) => {
    if (prev.includes(studentId)) {
      return prev.filter((id) => id !== studentId);
    } else {
      return [...prev, studentId];
    }
  });
};
