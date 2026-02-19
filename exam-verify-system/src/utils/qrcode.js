export const encodeStudentData = (student) => {
  const data = {
    id: student.id,
    name: student.name,
    matricNumber: student.matricNumber,
    department: student.department,
    level: student.level,
    course: student.course,
    timestamp: Date.now(),
  };
  return btoa(JSON.stringify(data));
};

export const decodeStudentData = (qrString) => {
  try {
    const decoded = JSON.parse(atob(qrString));
    return { success: true, data: decoded };
  } catch {
    return { success: false, error: 'Invalid QR code data' };
  }
};

export const generateStudentQRValue = (student) => {
  return encodeStudentData(student);
};
