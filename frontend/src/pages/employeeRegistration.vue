<template>
  <div class="min-h-screen bg-slate-50/50 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-[#df5309] rounded-xl flex items-center justify-center text-white">
            <font-awesome-icon :icon="['fas', 'fa-plus']" class="text-xl" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Employee Registration</h1>
            <p class="text-sm text-slate-500">Please fill in your details to complete registration</p>
          </div>
        </div>
      </div>

      <!-- Reuse the same form from modal -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
        <form @submit.prevent="submitForm">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- Full Name -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name <span class="text-red-500">*</span>
              </label>
              <input
                  v-model="formData.fullName"
                  type="text"
                  :class="[
                  'w-full px-4 py-2.5 border rounded-lg outline-none transition-colors',
                  errors.fullName ? 'border-red-500 bg-red-50' : 'border-slate-300'
                ]"
                  placeholder="e.g. John Doe"
              />
              <span v-if="errors.fullName" class="text-xs text-red-500 mt-1 block">{{ errors.fullName }}</span>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">
                Email <span class="text-red-500">*</span>
              </label>
              <input
                  v-model="formData.email"
                  type="email"
                  :class="[
                  'w-full px-4 py-2.5 border rounded-lg outline-none transition-colors',
                  errors.email ? 'border-red-500 bg-red-50' : 'border-slate-300'
                ]"
                  placeholder="name@company.com"
              />
              <span v-if="errors.email" class="text-xs text-red-500 mt-1 block">{{ errors.email }}</span>
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">
                Phone <span class="text-red-500">*</span>
              </label>
              <input
                  v-model="formData.phone"
                  type="tel"
                  :class="[
                  'w-full px-4 py-2.5 border rounded-lg outline-none transition-colors',
                  errors.phone ? 'border-red-500 bg-red-50' : 'border-slate-300'
                ]"
                  placeholder="+92 300 1234567"
              />
              <span v-if="errors.phone" class="text-xs text-red-500 mt-1 block">{{ errors.phone }}</span>
            </div>

            <!-- Department -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">
                Department <span class="text-red-500">*</span>
              </label>
              <input
                  v-model="formData.department"
                  type="text"
                  :class="[
                  'w-full px-4 py-2.5 border rounded-lg outline-none transition-colors',
                  errors.department ? 'border-red-500 bg-red-50' : 'border-slate-300'
                ]"
                  placeholder="e.g. Engineering"
              />
              <span v-if="errors.department" class="text-xs text-red-500 mt-1 block">{{ errors.department }}</span>
            </div>

            <!-- Designation -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">
                Designation <span class="text-red-500">*</span>
              </label>
              <input
                  v-model="formData.designation"
                  type="text"
                  :class="[
                  'w-full px-4 py-2.5 border rounded-lg outline-none transition-colors',
                  errors.designation ? 'border-red-500 bg-red-50' : 'border-slate-300'
                ]"
                  placeholder="e.g. Flutter Developer"
              />
              <span v-if="errors.designation" class="text-xs text-red-500 mt-1 block">{{ errors.designation }}</span>
            </div>

            <!-- Employment Status -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">
                Employment Status <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <select
                    v-model="formData.employmentStatus"
                    :class="[
                    'w-full px-4 py-2.5 border rounded-lg outline-none appearance-none',
                    errors.employmentStatus ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  ]"
                >
                  <option value="Intern">Intern</option>
                  <option value="Probation">Probation</option>
                  <option value="Contract">Contract</option>
                  <option value="Permanent">Permanent</option>
                  <option value="Resigned">Resigned</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <font-awesome-icon :icon="['fas', 'chevron-down']" class="text-xs" />
                </div>
              </div>
              <span v-if="errors.employmentStatus" class="text-xs text-red-500 mt-1 block">{{ errors.employmentStatus }}</span>
            </div>

            <!-- Monthly Salary -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">
                Monthly Salary (PKR) <span class="text-red-500">*</span>
              </label>
              <input
                  v-model="formData.monthlySalary"
                  type="number"
                  :class="[
                  'w-full px-4 py-2.5 border rounded-lg outline-none transition-colors',
                  errors.monthlySalary ? 'border-red-500 bg-red-50' : 'border-slate-300'
                ]"
                  placeholder="75000"
              />
              <span v-if="errors.monthlySalary" class="text-xs text-red-500 mt-1 block">{{ errors.monthlySalary }}</span>
            </div>

            <!-- Join Date -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">
                Join Date <span class="text-red-500">*</span>
              </label>
              <input
                  v-model="formData.joinDate"
                  type="date"
                  :class="[
                  'w-full px-4 py-2.5 border rounded-lg outline-none transition-colors',
                  errors.joinDate ? 'border-red-500 bg-red-50' : 'border-slate-300'
                ]"
              />
              <span v-if="errors.joinDate" class="text-xs text-red-500 mt-1 block">{{ errors.joinDate }}</span>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex flex-col sm:flex-row items-center gap-3 mt-8 pt-6 border-t border-slate-200">
            <button
                type="submit"
                class="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#df5309] text-white font-medium rounded-lg hover:bg-[#c64907] transition-colors disabled:opacity-50"
                :disabled="isSubmitting"
            >
              <font-awesome-icon v-if="isSubmitting" :icon="['fas', 'spinner']" spin />
              <font-awesome-icon v-else :icon="['fas', 'paper-plane']" />
              {{ isSubmitting ? 'Submitting...' : 'Submit Registration' }}
            </button>

            <button
                type="button"
                @click="resetForm"
                class="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors"
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { Employee } from '../composables/Admin/addEmployeemodel.js';

const formData = reactive({
  fullName: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  employmentStatus: 'Intern',
  monthlySalary: '',
  joinDate: ''
});

const errors = ref({});
const isSubmitting = ref(false);

const submitForm = () => {
  const employee = new Employee(formData);
  const validationErrors = employee.validate();

  if (Object.keys(validationErrors).length > 0) {
    errors.value = validationErrors;
    return;
  }

  errors.value = {};
  isSubmitting.value = true;

  // Send to API
  console.log('Employee registration:', formData);

  setTimeout(() => {
    isSubmitting.value = false;
    alert('Registration submitted successfully!');
    resetForm();
  }, 500);
};

const resetForm = () => {
  Object.assign(formData, {
    fullName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    employmentStatus: 'Intern',
    monthlySalary: '',
    joinDate: ''
  });
  errors.value = {};
};
</script>