export const registrationRules = {
  name: {
    required: 'Full name is required',
    minLength: { value: 3, message: 'Name must be at least 3 characters' },
    maxLength: { value: 100, message: 'Name must be less than 100 characters' },
  },
  matricNumber: {
    required: 'Matric number is required',
    pattern: {
      value: /^[A-Za-z0-9/\-]+$/,
      message: 'Enter a valid matric number',
    },
  },
  department: {
    required: 'Department is required',
  },
  level: {
    required: 'Level is required',
  },
  course: {
    required: 'Course is required',
    minLength: { value: 2, message: 'Course code must be at least 2 characters' },
  },
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Enter a valid email address',
    },
  },
};

export const paymentRules = {
  rrr: {
    required: 'RRR number is required',
    minLength: { value: 10, message: 'RRR must be at least 10 digits' },
    pattern: {
      value: /^\d+$/,
      message: 'RRR must contain only numbers',
    },
  },
};
