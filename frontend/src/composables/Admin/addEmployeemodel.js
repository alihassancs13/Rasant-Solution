// models/Employee.js

export class Employee {
    constructor(data = {}) {
        this.id = data.id || null;
        this.fullName = data.fullName || '';
        this.email = data.email || '';
        this.phone = data.phone || '';
        this.department = data.department || '';
        this.designation = data.designation || '';
        this.employmentStatus = data.employmentStatus || 'Intern';
        this.monthlySalary = data.monthlySalary || '';
        this.joinDate = data.joinDate || '';
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    // Validation method
    validate() {
        const errors = {};

        // Full Name validation
        if (!this.fullName || !this.fullName.trim()) {
            errors.fullName = 'Full name is required';
        } else if (this.fullName.trim().length < 2) {
            errors.fullName = 'Full name must be at least 2 characters';
        }

        // Email validation
        if (!this.email || !this.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Phone validation
        if (!this.phone || !this.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!/^[\+\d\s\-\(\)]{7,15}$/.test(this.phone)) {
            errors.phone = 'Please enter a valid phone number';
        }

        // Department validation
        if (!this.department || !this.department.trim()) {
            errors.department = 'Department is required';
        }

        // Designation validation
        if (!this.designation || !this.designation.trim()) {
            errors.designation = 'Designation is required';
        }

        // Employment Status validation
        if (!this.employmentStatus) {
            errors.employmentStatus = 'Employment status is required';
        }

        // Monthly Salary validation
        if (!this.monthlySalary) {
            errors.monthlySalary = 'Monthly salary is required';
        } else if (isNaN(this.monthlySalary) || Number(this.monthlySalary) <= 0) {
            errors.monthlySalary = 'Salary must be a positive number';
        }

        // Join Date validation - REMOVED future date check
        if (!this.joinDate) {
            errors.joinDate = 'Join date is required';
        }
        // ❌ REMOVED this block:
        // else {
        //     const selectedDate = new Date(this.joinDate);
        //     const today = new Date();
        //     today.setHours(0, 0, 0, 0);
        //     if (selectedDate > today) {
        //         errors.joinDate = 'Join date cannot be in the future';
        //     }
        // }

        return errors;
    }

    // Convert to API format
    toJSON() {
        return {
            full_name: this.fullName,
            email: this.email,
            phone: this.phone,
            department: this.department,
            designation: this.designation,
            employment_status: this.employmentStatus,
            monthly_salary: Number(this.monthlySalary),
            join_date: this.joinDate
        };
    }

    // Reset form data
    reset() {
        this.fullName = '';
        this.email = '';
        this.phone = '';
        this.department = '';
        this.designation = '';
        this.employmentStatus = 'Intern';
        this.monthlySalary = '';
        this.joinDate = '';
    }
}