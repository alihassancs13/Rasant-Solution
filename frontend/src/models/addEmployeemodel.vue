<template>
  <!-- Modal Backdrop -->
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop with blur -->
    <div
        class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        @click="$emit('close')"
    ></div>

    <!-- Modal Container -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl">
        <!-- Header -->
        <div class="flex items-start justify-between p-6 border-b border-slate-200">
          <div>
            <h3 class="text-xl font-bold text-slate-900">Add New Employee</h3>
            <p class="text-sm text-slate-500 mt-0.5">Fill in the details to add a new employee</p>
          </div>
          <button
              @click="$emit('close')"
              class="p-2 hover:bg-slate-100 rounded-xl transition-colors -mt-1 -mr-1"
              type="button"
          >
            <font-awesome-icon :icon="['fas', 'xmark']" class="text-slate-400 text-lg" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="submitForm" class="p-6">
          <!-- Form Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <!-- Full Name -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name <span class="text-red-500">*</span>
              </label>
              <input
                  v-model="localForm.fullName"
                  type="text"
                  :class="[
                  'w-full px-4 py-2.5 border rounded-lg outline-none transition-colors',
                  'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.fullName ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                ]"
                  placeholder="e.g. John Doe"
              />
              <span v-if="errors.fullName" class="text-xs text-red-500 mt-1 block">
                {{ errors.fullName }}
              </span>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">
                Email <span class="text-red-500">*</span>
              </label>
              <input
                  v-model="localForm.email"
                  type="email"
                  :class="[
                  'w-full px-4 py-2.5 border rounded-lg outline-none transition-colors',
                  'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.email ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                ]"
                  placeholder="name@company.com"
              />
              <span v-if="errors.email" class="text-xs text-red-500 mt-1 block">
                {{ errors.email }}
              </span>
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">
                Phone <span class="text-red-500">*</span>
              </label>
              <input
                  v-model="localForm.phone"
                  type="tel"
                  :class="[
                  'w-full px-4 py-2.5 border rounded-lg outline-none transition-colors',
                  'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.phone ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                ]"
                  placeholder="+92 300 1234567"
              />
              <span v-if="errors.phone" class="text-xs text-red-500 mt-1 block">
                {{ errors.phone }}
              </span>
            </div>

            <!-- Department -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">
                Department <span class="text-red-500">*</span>
              </label>
              <input
                  v-model="localForm.department"
                  type="text"
                  :class="[
                  'w-full px-4 py-2.5 border rounded-lg outline-none transition-colors',
                  'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.department ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                ]"
                  placeholder="e.g. Engineering"
              />
              <span v-if="errors.department" class="text-xs text-red-500 mt-1 block">
                {{ errors.department }}
              </span>
            </div>

            <!-- Designation -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">
                Designation <span class="text-red-500">*</span>
              </label>
              <input
                  v-model="localForm.designation"
                  type="text"
                  :class="[
                  'w-full px-4 py-2.5 border rounded-lg outline-none transition-colors',
                  'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.designation ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                ]"
                  placeholder="e.g. Flutter Developer"
              />
              <span v-if="errors.designation" class="text-xs text-red-500 mt-1 block">
                {{ errors.designation }}
              </span>
            </div>

            <!-- Employment Status Dropdown -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">
                Employment Status <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <select
                    v-model="localForm.employmentStatus"
                    :class="[
                    'w-full px-4 py-2.5 border rounded-lg outline-none transition-colors appearance-none',
                    'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    errors.employmentStatus ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
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
              <span v-if="errors.employmentStatus" class="text-xs text-red-500 mt-1 block">
                {{ errors.employmentStatus }}
              </span>
            </div>

            <!-- Monthly Salary -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">
                Monthly Salary (PKR) <span class="text-red-500">*</span>
              </label>
              <input
                  v-model="localForm.monthlySalary"
                  type="number"
                  :class="[
                  'w-full px-4 py-2.5 border rounded-lg outline-none transition-colors',
                  'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.monthlySalary ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                ]"
                  placeholder="75000"
              />
              <span v-if="errors.monthlySalary" class="text-xs text-red-500 mt-1 block">
                {{ errors.monthlySalary }}
              </span>
            </div>

            <!-- Join Date -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">
                Join Date <span class="text-red-500">*</span>
              </label>
              <input
                  v-model="localForm.joinDate"
                  type="date"
                  :class="[
                  'w-full px-4 py-2.5 border rounded-lg outline-none transition-colors',
                  'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  errors.joinDate ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
                ]"
              />
              <span v-if="errors.joinDate" class="text-xs text-red-500 mt-1 block">
                {{ errors.joinDate }}
              </span>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex flex-col sm:flex-row items-center gap-3 mt-8 pt-6 border-t border-slate-200">
            <button
                type="submit"
                class="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#df5309] text-white font-medium rounded-lg hover:bg-[#c64907] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isSubmitting"
            >
              <font-awesome-icon v-if="isSubmitting" :icon="['fas', 'spinner']" spin class="text-sm" />
              <font-awesome-icon v-else :icon="['fas', 'plus']" class="text-sm" />
              {{ isSubmitting ? 'Adding...' : 'Add Employee' }}
            </button>

            <button
                type="button"
                @click="$emit('close')"
                class="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { Employee } from '../composables/Admin/addEmployeemodel.js';

const emit = defineEmits(['close', 'add-employee']);

// Local form data
const localForm = reactive({
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

// Submit form
const submitForm = () => {
  // Create employee instance
  const employee = new Employee(localForm);

  // Validate
  const validationErrors = employee.validate();

  if (Object.keys(validationErrors).length > 0) {
    errors.value = validationErrors;
    return;
  }

  // Clear errors
  errors.value = {};

  // Set submitting state
  isSubmitting.value = true;

  // Emit to parent
  emit('add-employee', { ...localForm });

  // Reset after success
  setTimeout(() => {
    isSubmitting.value = false;
    resetForm();
  }, 500);
};

// Reset form
const resetForm = () => {
  const employee = new Employee();
  employee.reset();
  Object.assign(localForm, employee);
  errors.value = {};
};

// Clear errors on input
watch(localForm, () => {
  errors.value = {};
});
</script>