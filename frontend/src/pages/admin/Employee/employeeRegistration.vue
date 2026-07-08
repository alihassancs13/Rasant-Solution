<template>
  <!-- Outer container: fixed max-height, NO internal scrolling here so the X button stays pinned -->
  <div class="bg-white w-full max-w-4xl rounded-2xl shadow-xl relative border border-slate-200 mx-auto max-h-[90vh] flex flex-col overflow-hidden">

    <!-- Pinned Close Button: stays fixed in place -->
    <button type="button" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition z-50" @click="close">
      <i class="fa-solid fa-xmark text-xl"></i>
    </button>

    <!-- Scrollable Content Wrapper: Contains everything else -->
    <div class="flex-1 overflow-y-auto">

      <div class="p-6 border-b border-slate-100 bg-white">
        <div class="flex justify-between items-center mb-4 pr-6"> <!-- Added pr-6 so progress text doesn't clash with X button -->
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Progress</span>
          <span class="text-sm font-bold text-blue-600">{{ currentProgressPercentage }}</span>
        </div>
        <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
          <div class="bg-blue-500 h-full transition-all duration-300" :style="{ width: currentProgressPercentage }"></div>
        </div>

        <div class="flex justify-between max-w-2xl mx-auto relative">
          <!-- ... rest of your steps indicators ... -->
        <div v-for="step in steps" :key="step.id" class="flex flex-col items-center flex-1">
          <div :class="[
            'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300',
            currentStep > step.id ? 'bg-emerald-600 text-white' : (currentStep === step.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400')
          ]">
            <i v-if="currentStep > step.id" class="fa-solid fa-check"></i>
            <span v-else>{{ step.id }}</span>
          </div>
          <span :class="[
            'text-xs mt-2 transition-all duration-300',
            currentStep > step.id ? 'font-bold text-emerald-600' : (currentStep === step.id ? 'font-bold text-blue-600' : 'font-semibold text-slate-400')
          ]">{{ step.name }}</span>
        </div>
      </div>
      <div class="text-center mt-4">
        <p class="text-xs text-slate-400"><i class="fa-regular fa-eye mr-1"></i> Preview only — changes are not saved</p>
      </div>
    </div>
    <div class="mx-6 mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200/70 text-amber-800 text-xs space-y-1">
      <p class="font-bold text-sm mb-1 text-amber-900">Important:</p>
      <p>1. Employee found to have made false or incorrect statement in the form is liable for expulsion.</p>
      <p>2. Relevant documents for the verification may please be attached with the application.</p>
    </div>

    <form @submit.prevent id="employeeForm" enctype="multipart/form-data" class="p-6">

      <!-- STEP 1: Personal Details -->
      <div v-if="currentStep === 1" class="space-y-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
            <i class="fa-solid fa-id-card text-lg"></i>
          </div>
          <div>
            <span class="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">Section 1 of 4</span>
            <h2 class="text-lg font-bold text-slate-800 mt-0.5">Personal Details</h2>
            <p class="text-xs text-slate-400">Basic identity and contact information.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Name <span class="text-rose-500">*</span></label>
            <input type="text" v-model="formData.name" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="Full Name">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">CNIC <span class="text-rose-500">*</span></label>
            <input type="text" v-model="formData.cnic" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="00000-0000000-0">
            <span class="text-[10px] text-slate-400 mt-1 block">National identity card number</span>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">CNIC Scan copy <span class="text-rose-500">*</span></label>
          <div class="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition relative group cursor-pointer">
            <input type="file" @change="handleFileUpload($event, 'cnic_scan')" required class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
            <div class="text-blue-500 text-3xl mb-2 group-hover:scale-110 transition-transform"><i class="fa-solid fa-cloud-arrow-up"></i></div>
            <p class="text-sm font-medium text-slate-600">Drag & drop or <span class="text-blue-500 underline font-semibold">click to upload</span></p>
            <p class="text-xs text-slate-400 mt-1">.pdf, .png, .jpg, .jpeg (Max 10MB)</p>
            <div v-if="fileNames.cnic_scan" class="mt-2 text-xs text-emerald-600 font-bold">Selected: {{ fileNames.cnic_scan }}</div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Present Address <span class="text-rose-500">*</span></label>
          <textarea v-model="formData.present_address" required rows="3" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="Your current residential address"></textarea>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Permanent Address</label>
          <textarea v-model="formData.permanent_address" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="Your permanent home address"></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Phone Number <span class="text-rose-500">*</span></label>
            <input type="text" v-model="formData.phone_number" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="+92 300 0000000">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Gender</label>
            <div class="flex gap-4">
              <label class="inline-flex items-center text-sm font-medium text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-xl cursor-pointer hover:bg-slate-50">
                <input type="radio" v-model="formData.gender" value="Male" class="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 mr-2"> Male
              </label>
              <label class="inline-flex items-center text-sm font-medium text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-xl cursor-pointer hover:bg-slate-50">
                <input type="radio" v-model="formData.gender" value="Female" class="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 mr-2"> Female
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 2: Emergency Contact -->
      <div v-if="currentStep === 2" class="space-y-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
            <i class="fa-solid fa-phone-flip text-lg"></i>
          </div>
          <div>
            <span class="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">Section 2 of 4</span>
            <h2 class="text-lg font-bold text-slate-800 mt-0.5">Emergency Contact</h2>
            <p class="text-xs text-slate-400">Person to contact in case of emergency.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Name <span class="text-rose-500">*</span></label>
            <input type="text" v-model="formData.emergency_name" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="Full Name">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Relation <span class="text-rose-500">*</span></label>
            <input type="text" v-model="formData.emergency_relation" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="Spouse, Parent, Sibling">
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">CNIC <span class="text-rose-500">*</span></label>
          <input type="text" v-model="formData.emergency_cnic" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="00000-0000000-0">
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">CNIC scan copy <span class="text-rose-500">*</span></label>
          <div class="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition relative group cursor-pointer">
            <input type="file" @change="handleFileUpload($event, 'emergency_cnic_scan')" required class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
            <div class="text-blue-500 text-3xl mb-2 group-hover:scale-110 transition-transform"><i class="fa-solid fa-cloud-arrow-up"></i></div>
            <p class="text-sm font-medium text-slate-600">Drag & drop or <span class="text-blue-500 underline font-semibold">click to upload</span></p>
            <p class="text-xs text-slate-400 mt-1">.pdf, .png, .jpg, .jpeg (Max 10MB)</p>
            <div v-if="fileNames.emergency_cnic_scan" class="mt-2 text-xs text-emerald-600 font-bold">Selected: {{ fileNames.emergency_cnic_scan }}</div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Phone no <span class="text-rose-500">*</span></label>
          <input type="text" v-model="formData.emergency_phone" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="+92 300 0000000">
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Address <span class="text-rose-500">*</span></label>
          <textarea v-model="formData.emergency_address" required rows="3" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="Residential address of contact person"></textarea>
        </div>
      </div>

      <!-- STEP 3: Educational -->
      <div v-if="currentStep === 3" class="space-y-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
            <i class="fa-solid fa-graduation-cap text-lg"></i>
          </div>
          <div>
            <span class="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">Section 3 of 4</span>
            <h2 class="text-lg font-bold text-slate-800 mt-0.5">Educational Information</h2>
            <p class="text-xs text-slate-400">Upload copies of your academic certificates and marksheets.</p>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Matric certificate or marksheet <span class="text-rose-500">*</span></label>
          <div class="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition relative group cursor-pointer">
            <input type="file" @change="handleFileUpload($event, 'matric_certificate')" required class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
            <div class="text-blue-500 text-3xl mb-2 group-hover:scale-110 transition-transform"><i class="fa-solid fa-cloud-arrow-up"></i></div>
            <p class="text-sm font-medium text-slate-600">Drag & drop or <span class="text-blue-500 underline font-semibold">click to upload</span></p>
            <p class="text-xs text-slate-400 mt-1">.pdf, .png, .jpg, .jpeg (Max 10MB)</p>
            <div v-if="fileNames.matric_certificate" class="mt-2 text-xs text-emerald-600 font-bold">Selected: {{ fileNames.matric_certificate }}</div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">FSC / Intermediate certificate or marksheet <span class="text-rose-500">*</span></label>
          <div class="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition relative group cursor-pointer">
            <input type="file" @change="handleFileUpload($event, 'fsc_certificate')" required class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
            <div class="text-blue-500 text-3xl mb-2 group-hover:scale-110 transition-transform"><i class="fa-solid fa-cloud-arrow-up"></i></div>
            <p class="text-sm font-medium text-slate-600">Drag & drop or <span class="text-blue-500 underline font-semibold">click to upload</span></p>
            <p class="text-xs text-slate-400 mt-1">.pdf, .png, .jpg, .jpeg (Max 10MB)</p>
            <div v-if="fileNames.fsc_certificate" class="mt-2 text-xs text-emerald-600 font-bold">Selected: {{ fileNames.fsc_certificate }}</div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">University degree / graduation certificate <span class="text-rose-500">*</span></label>
          <div class="border-2 border-dashed border-blue-200 bg-blue-50/10 rounded-2xl p-6 text-center hover:bg-slate-50 transition relative group cursor-pointer">
            <input type="file" @change="handleFileUpload($event, 'university_degree')" required class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
            <div class="text-blue-500 text-3xl mb-2 group-hover:scale-110 transition-transform"><i class="fa-solid fa-cloud-arrow-up"></i></div>
            <p class="text-sm font-medium text-slate-600">Drag & drop or <span class="text-blue-500 underline font-semibold">click to upload</span></p>
            <p class="text-xs text-slate-400 mt-1">.pdf, .png, .jpg, .jpeg (Max 10MB)</p>
            <div v-if="fileNames.university_degree" class="mt-2 text-xs text-emerald-600 font-bold">Selected: {{ fileNames.university_degree }}</div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Other courses / certificates</label>
          <div class="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition relative group cursor-pointer">
            <input type="file" @change="handleFileUpload($event, 'other_course')" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
            <div class="text-blue-500 text-3xl mb-2 group-hover:scale-110 transition-transform"><i class="fa-solid fa-cloud-arrow-up"></i></div>
            <p class="text-sm font-medium text-slate-600">Drag & drop or <span class="text-blue-500 underline font-semibold">click to upload</span></p>
            <p class="text-xs text-slate-400 mt-1">.pdf, .png, .jpg, .jpeg (Max 10MB)</p>
            <div v-if="fileNames.other_course" class="mt-2 text-xs text-emerald-600 font-bold">Selected: {{ fileNames.other_course }}</div>
          </div>
        </div>
      </div>

      <!-- STEP 4: Bank Details -->
      <div v-if="currentStep === 4" class="space-y-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
            <i class="fa-solid fa-building-columns text-lg"></i>
          </div>
          <div>
            <span class="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">Section 4 of 4</span>
            <h2 class="text-lg font-bold text-slate-800 mt-0.5">Bank Details</h2>
            <p class="text-xs text-slate-400">Salary disbursement account information.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Bank Name <span class="text-rose-500">*</span></label>
            <input type="text" v-model="formData.bank_name" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="e.g. Meezan Bank">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Branch Name</label>
            <input type="text" v-model="formData.branch_name" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="Branch location name">
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Account no / IBAN Number <span class="text-rose-500">*</span></label>
          <input type="text" v-model="formData.account_number" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="PK00XXXX0000000000000000">
        </div>
      </div>

      <!-- Footer buttons -->
      <div class="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50 -mx-6 -mb-6 p-6">
        <button type="button" @click="prevStep" :class="['px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100 transition flex items-center', currentStep === 1 ? 'invisible' : '']">
          <i class="fa-solid fa-arrow-left mr-2 mt-0.5"></i> Back
        </button>

        <button type="button" @click="customNextStep" class="px-6 py-2.5 rounded-xl bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 shadow-lg shadow-orange-600/20 transition flex items-center ml-auto">
          <span v-if="currentStep === totalSteps">Submit form</span>
          <span v-else>Continue</span>
          <i v-if="currentStep === totalSteps" class="fa-solid fa-paper-plane ml-2 mt-0.5"></i>
          <i v-else class="fa-solid fa-arrow-right ml-2 mt-0.5"></i>
        </button>
      </div>
    </form>
  </div>
  </div>
</template>

<script>
import { useEmployeeRegistration } from '@/composables/useEmployeeRegistration.js';

export default {
  emits: ['close'],
  setup(props, { emit }) {
    const registration = useEmployeeRegistration();

    const {
      currentStep,
      totalSteps,
      steps,
      formData,
      fileNames,
      currentProgressPercentage,
      handleFileUpload,
      nextStep,
      prevStep,
      submitForm,
    } = registration;

    // Custom handler for Continue/Submit button
    const customNextStep = () => {
      if (currentStep.value === totalSteps) {
        // Submit and close modal on success
        submitForm(() => {
          emit('close');
        });
      } else {
        // Validate and move to next step
        nextStep();
      }
    };

    // Close handler for the X button
    const close = () => {
      emit('close');
    };

    return {
      currentStep,
      totalSteps,
      steps,
      formData,
      fileNames,
      currentProgressPercentage,
      handleFileUpload,
      prevStep,
      customNextStep,
      close,
    };
  }
};
</script>