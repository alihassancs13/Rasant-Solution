<template>
  <!-- Outer container: fixed max-height, flex layout to separate pinned headers/footers -->
  <div class="bg-white w-full max-w-4xl rounded-xl shadow-xl relative border border-slate-200 mx-auto max-h-[95vh] flex flex-col overflow-hidden">

    <!-- Pinned Close Button - Hidden when in direct access mode -->
    <button v-if="!isDirectAccess" type="button" class="absolute top-5 right-6 text-slate-400 hover:text-slate-600 transition z-50" @click="close">
      <i class="fa-solid fa-xmark text-xl"></i>
    </button>

    <!-- FIXED CLEAN HEADER SECTION WITH NEW TITLE -->
    <div class="p-5 px-6 border-b border-slate-100 bg-white shrink-0 pr-16">
      <div class="mb-3">
        <h1 class="text-xl font-bold text-slate-800">Employee Onboarding Form</h1>
        <p class="text-xs text-slate-400 mt-0.5">Complete the multi-step registration to register a new employee.</p>
      </div>

      <!-- Minimalist Pinned Progress tracker line -->
      <div class="flex justify-between items-center mb-1.5">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Progress</span>
        <span class="text-sm font-bold text-blue-600">{{ currentProgressPercentage }}</span>
      </div>
      <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div class="bg-blue-500 h-full transition-all duration-300" :style="{ width: currentProgressPercentage }"></div>
      </div>
    </div>

    <!-- SCROLLABLE CONTENT BODY -->
    <div class="flex-1 overflow-y-auto space-y-4">

      <!-- STEP WIZARD INDICATORS -->
      <div class="px-6 pt-5 bg-slate-50/50 pb-4 border-b border-slate-100">
        <div class="flex justify-between max-w-2xl mx-auto relative">
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

        <!-- Preview Note -->
        <div class="text-center mt-3">
          <p class="text-xs text-slate-400"><i class="fa-regular fa-eye mr-1"></i> Preview only — changes are not saved</p>
        </div>
      </div>

      <!-- IMPORTANT NOTICE BOX -->
      <div class="mx-6 p-4 bg-amber-50 rounded-xl border border-amber-200/70 text-amber-800 text-xs space-y-1">
        <p class="font-bold text-sm mb-1 text-amber-900">Important:</p>
        <p>1. Employee found to have made false or incorrect statement in the form is liable for expulsion.</p>
        <p>2. Relevant documents for the verification may please be attached with the application.</p>
      </div>

      <!-- FORM FIELDS - Show only when not submitted -->
      <div v-if="!isSubmitted">
        <form @submit.prevent id="employeeForm" enctype="multipart/form-data" class="px-6 pb-6">

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

            <!-- Row 1: Name + CNIC -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Name <span class="text-rose-500">*</span></label>
                <input type="text" v-model="formData.name" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="Full Name">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">CNIC <span class="text-rose-500">*</span></label>
                <input
                    type="text"
                    v-model="formData.cnic"
                    required
                    :class="[
      'w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm',
      (cnicError || validationError) ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
    ]"
                    placeholder="00000-0000000-0"
                    @input="formatCnic"
                    @focus="validationError = ''"
                    maxlength="15"
                >
                <span v-if="cnicError" class="text-xs text-rose-500 mt-1 block">
    <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ cnicError }}
  </span>
                <span v-else-if="validationError" class="text-xs text-rose-500 mt-1 block">
    <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ validationError }}
  </span>
                <span v-else class="text-[10px] text-slate-400 mt-1 block">National identity card number (13 digits)</span>
              </div>
            </div>

            <!-- CNIC Scan (full width) -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">CNIC Scan copy <span class="text-rose-500" v-if="!fileNames.cnic_scan">*</span></label>

              <!-- Show file info if uploaded -->
              <div v-if="fileNames.cnic_scan" class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <i class="fa-solid fa-file-pdf text-emerald-600 text-2xl"></i>
                  <div>
                    <p class="text-sm font-medium text-slate-700">{{ fileNames.cnic_scan }}</p>
                    <p class="text-xs text-emerald-600">✓ File uploaded successfully</p>
                  </div>
                </div>
                <button type="button" @click="removeFile('cnic_scan')" class="text-slate-400 hover:text-rose-500 transition p-1">
                  <i class="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>

              <!-- Show upload area if no file -->
              <div v-else class="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition relative group cursor-pointer">
                <input type="file" @change="handleFileUpload($event, 'cnic_scan')" data-field="cnic_scan" required class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                <div class="text-blue-500 text-3xl mb-2 group-hover:scale-110 transition-transform"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                <p class="text-sm font-medium text-slate-600">Drag & drop or <span class="text-blue-500 underline font-semibold">click to upload</span></p>
                <p class="text-xs text-slate-400 mt-1">.pdf, .png, .jpg, .jpeg (Max 10MB)</p>
              </div>
            </div>

            <!-- Row 2: Email + Phone -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email <span class="text-rose-500">*</span></label>
                <input type="email" v-model="formData.email" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="employee@company.com">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Phone Number <span class="text-rose-500">*</span></label>
                <input type="text" v-model="formData.phone_number" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="+92 300 0000000">
              </div>
            </div>

            <!-- Row 3: Gender + Department -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Gender <span class="text-rose-500">*</span></label>
                <div class="flex gap-4">
                  <label class="inline-flex items-center text-sm font-medium text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-xl cursor-pointer hover:bg-slate-50">
                    <input type="radio" v-model="formData.gender" value="Male" required class="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 mr-2"> Male
                  </label>
                  <label class="inline-flex items-center text-sm font-medium text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-xl cursor-pointer hover:bg-slate-50">
                    <input type="radio" v-model="formData.gender" value="Female" class="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 mr-2"> Female
                  </label>
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Department <span class="text-rose-500">*</span></label>
                <input type="text" v-model="formData.department" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="e.g. Engineering">
              </div>
            </div>

            <!-- Row 4: Designation + Salary -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-if="!isDirectAccess">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Designation <span class="text-rose-500">*</span></label>
                <input type="text" v-model="formData.designation" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="e.g. Software Engineer">
              </div>
              <div v-if="!isDirectAccess">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Salary <span class="text-rose-500">*</span></label>
                <input type="number" step="0.01" v-model="formData.salary" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="0.00">
              </div>
            </div>

            <!-- Row 5: Joined Date + Status -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Joined Date <span class="text-rose-500">*</span></label>
                <input type="date" v-model="formData.joined_date" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Status</label>
                <select v-model="formData.status" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white">
                  <option value="Intern">Intern</option>
                  <option value="Probation">Probation</option>
                  <option value="Contract">Contract</option>
                  <option value="Permanent">Permanent</option>
                </select>
              </div>
            </div>
            <!-- Present Address -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Present Address <span class="text-rose-500">*</span></label>
              <textarea v-model="formData.present_address" required rows="3" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="Your current residential address"></textarea>
            </div>

            <!-- Permanent Address -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Permanent Address</label>
              <textarea v-model="formData.permanent_address" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="Your permanent home address"></textarea>
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
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">CNIC scan copy <span class="text-rose-500" v-if="!fileNames.emergency_cnic_scan">*</span></label>

              <!-- Show file info if uploaded -->
              <div v-if="fileNames.emergency_cnic_scan" class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <i class="fa-solid fa-file-pdf text-emerald-600 text-2xl"></i>
                  <div>
                    <p class="text-sm font-medium text-slate-700">{{ fileNames.emergency_cnic_scan }}</p>
                    <p class="text-xs text-emerald-600">✓ File uploaded successfully</p>
                  </div>
                </div>
                <button type="button" @click="removeFile('emergency_cnic_scan')" class="text-slate-400 hover:text-rose-500 transition p-1">
                  <i class="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>

              <!-- Show upload area if no file -->
              <div v-else class="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition relative group cursor-pointer">
                <input type="file" @change="handleFileUpload($event, 'emergency_cnic_scan')" data-field="emergency_cnic_scan" required class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                <div class="text-blue-500 text-3xl mb-2 group-hover:scale-110 transition-transform"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                <p class="text-sm font-medium text-slate-600">Drag & drop or <span class="text-blue-500 underline font-semibold">click to upload</span></p>
                <p class="text-xs text-slate-400 mt-1">.pdf, .png, .jpg, .jpeg (Max 10MB)</p>
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

            <!-- Matric -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Matric certificate or marksheet <span class="text-rose-500" v-if="!fileNames.matric_certificate">*</span></label>

              <div v-if="fileNames.matric_certificate" class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <i class="fa-solid fa-file-pdf text-emerald-600 text-2xl"></i>
                  <div>
                    <p class="text-sm font-medium text-slate-700">{{ fileNames.matric_certificate }}</p>
                    <p class="text-xs text-emerald-600">✓ File uploaded successfully</p>
                  </div>
                </div>
                <button type="button" @click="removeFile('matric_certificate')" class="text-slate-400 hover:text-rose-500 transition p-1">
                  <i class="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>

              <div v-else class="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition relative group cursor-pointer">
                <input type="file" @change="handleFileUpload($event, 'matric_certificate')" data-field="matric_certificate" required class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                <div class="text-blue-500 text-3xl mb-2 group-hover:scale-110 transition-transform"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                <p class="text-sm font-medium text-slate-600">Drag & drop or <span class="text-blue-500 underline font-semibold">click to upload</span></p>
                <p class="text-xs text-slate-400 mt-1">.pdf, .png, .jpg, .jpeg (Max 10MB)</p>
              </div>
            </div>

            <!-- FSC -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">FSC / Intermediate certificate or marksheet <span class="text-rose-500" v-if="!fileNames.fsc_certificate">*</span></label>

              <div v-if="fileNames.fsc_certificate" class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <i class="fa-solid fa-file-pdf text-emerald-600 text-2xl"></i>
                  <div>
                    <p class="text-sm font-medium text-slate-700">{{ fileNames.fsc_certificate }}</p>
                    <p class="text-xs text-emerald-600">✓ File uploaded successfully</p>
                  </div>
                </div>
                <button type="button" @click="removeFile('fsc_certificate')" class="text-slate-400 hover:text-rose-500 transition p-1">
                  <i class="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>

              <div v-else class="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition relative group cursor-pointer">
                <input type="file" @change="handleFileUpload($event, 'fsc_certificate')" data-field="fsc_certificate" required class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                <div class="text-blue-500 text-3xl mb-2 group-hover:scale-110 transition-transform"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                <p class="text-sm font-medium text-slate-600">Drag & drop or <span class="text-blue-500 underline font-semibold">click to upload</span></p>
                <p class="text-xs text-slate-400 mt-1">.pdf, .png, .jpg, .jpeg (Max 10MB)</p>
              </div>
            </div>

            <!-- University -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">University degree / graduation certificate <span class="text-rose-500" v-if="!fileNames.university_degree">*</span></label>

              <div v-if="fileNames.university_degree" class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <i class="fa-solid fa-file-pdf text-emerald-600 text-2xl"></i>
                  <div>
                    <p class="text-sm font-medium text-slate-700">{{ fileNames.university_degree }}</p>
                    <p class="text-xs text-emerald-600">✓ File uploaded successfully</p>
                  </div>
                </div>
                <button type="button" @click="removeFile('university_degree')" class="text-slate-400 hover:text-rose-500 transition p-1">
                  <i class="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>

              <div v-else class="border-2 border-dashed border-blue-200 bg-blue-50/10 rounded-2xl p-6 text-center hover:bg-slate-50 transition relative group cursor-pointer">
                <input type="file" @change="handleFileUpload($event, 'university_degree')" data-field="university_degree" required class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                <div class="text-blue-500 text-3xl mb-2 group-hover:scale-110 transition-transform"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                <p class="text-sm font-medium text-slate-600">Drag & drop or <span class="text-blue-500 underline font-semibold">click to upload</span></p>
                <p class="text-xs text-slate-400 mt-1">.pdf, .png, .jpg, .jpeg (Max 10MB)</p>
              </div>
            </div>

            <!-- Other Courses -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Other courses / certificates</label>

              <div v-if="fileNames.other_course" class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <i class="fa-solid fa-file-pdf text-emerald-600 text-2xl"></i>
                  <div>
                    <p class="text-sm font-medium text-slate-700">{{ fileNames.other_course }}</p>
                    <p class="text-xs text-emerald-600">✓ File uploaded successfully</p>
                  </div>
                </div>
                <button type="button" @click="removeFile('other_course')" class="text-slate-400 hover:text-rose-500 transition p-1">
                  <i class="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>

              <div v-else class="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition relative group cursor-pointer">
                <input type="file" @change="handleFileUpload($event, 'other_course')" data-field="other_course" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                <div class="text-blue-500 text-3xl mb-2 group-hover:scale-110 transition-transform"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                <p class="text-sm font-medium text-slate-600">Drag & drop or <span class="text-blue-500 underline font-semibold">click to upload</span></p>
                <p class="text-xs text-slate-400 mt-1">.pdf, .png, .jpg, .jpeg (Max 10MB)</p>
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
        </form>
      </div>

      <!-- SUCCESS MESSAGE - Show after submission -->
      <div v-else class="px-6 py-12">
        <div class="text-center max-w-md mx-auto">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fa-solid fa-check text-3xl text-green-600"></i>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">Form Submitted Successfully!</h2>
          <p class="text-gray-600 mb-4">
            {{ isDirectAccess
              ? 'Thank you for completing the onboarding form. Our team will review your application and contact you soon.'
              : 'The employee has been successfully onboarded. They will receive a confirmation email.'
            }}
          </p>
          <button
              v-if="isDirectAccess"
              @click="redirectToHome"
              class="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
          >
            Go to Home
          </button>
          <button
              v-else
              @click="close"
              class="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- FIXED FOOTER SECTION - Hide when submitted -->
    <div v-if="!isSubmitted" class="p-6 border-t border-slate-100 bg-slate-50/80 flex justify-between items-center shrink-0">
      <button type="button" @click="prevStep" :class="['px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100 transition flex items-center bg-white', currentStep === 1 ? 'invisible' : '']">
        <i class="fa-solid fa-arrow-left mr-2 mt-0.5"></i> Back
      </button>

      <div class="flex gap-3">
        <!-- Show Close button only in modal mode -->
        <button v-if="!isDirectAccess" type="button" @click="close" class="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100 transition bg-white">
          Close
        </button>
        <button type="button" @click="customNextStep" class="px-6 py-2.5 rounded-xl bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 shadow-lg shadow-orange-600/20 transition flex items-center">
          <span v-if="currentStep === totalSteps">Submit form</span>
          <span v-else>Continue</span>
          <i v-if="currentStep === totalSteps" class="fa-solid fa-paper-plane ml-2 mt-0.5"></i>
          <i v-else class="fa-solid fa-arrow-right ml-2 mt-0.5"></i>
        </button>
      </div>
    </div>

  </div>
</template>

<script>
import { useEmployeeRegistration } from '@/composables/useEmployeeRegistration.js';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';

export default {
  emits: ['close'],
  setup(props, { emit }) {
    const router = useRouter();
    const isSubmitted = ref(false);
    const isDirectAccess = ref(false);
    const validationError = ref(''); // Add this

    // Get token from URL
    const getTokenFromURL = () => {
      const path = window.location.pathname;
      const segments = path.split('/');
      const lastSegment = segments[segments.length - 1];
      return lastSegment === 'onboarding' ? null : lastSegment;
    };

    const token = getTokenFromURL();

    // Check if opened directly (not in modal)
    const checkDirectAccess = () => {
      const path = window.location.pathname;
      if (path.includes('/onboarding')) {
        isDirectAccess.value = true;
      }
    };

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

    // CNIC validation functions
    const isCnicValid = (cnic) => {
      if (!cnic) return false;
      const cleanCnic = cnic.replace(/[-\s]/g, '');
      return /^\d{13}$/.test(cleanCnic);
    };

    // Computed for CNIC error
    const cnicError = computed(() => {
      if (currentStep.value !== 1) return '';
      if (!formData.value.cnic) return '';
      if (!isCnicValid(formData.value.cnic)) {
        return 'CNIC must be exactly 13 digits (e.g., 12345-1234567-8)';
      }
      return '';
    });

    // Format CNIC with dashes
    const formatCnic = (event) => {
      let value = event.target.value.replace(/[^0-9]/g, '');

      // Limit to 13 digits
      if (value.length > 13) {
        value = value.slice(0, 13);
      }

      // Auto-format with dashes: 00000-0000000-0
      let formatted = '';
      if (value.length > 0) {
        formatted = value.slice(0, 5);
        if (value.length > 5) {
          formatted += '-' + value.slice(5, 12);
        }
        if (value.length > 12) {
          formatted += '-' + value.slice(12, 13);
        }
      }

      event.target.value = formatted;
      formData.value.cnic = formatted;
      // Clear validation error when user types
      validationError.value = '';
    };

    // Add removeFile function
    const removeFile = (fieldName) => {
      fileNames.value[fieldName] = null;
      formData.value[fieldName] = null;
      const inputs = document.querySelectorAll(`input[data-field="${fieldName}"]`);
      inputs.forEach(input => {
        input.value = '';
      });
    };

    // Add scroll to top function
    const scrollToTop = () => {
      const container = document.querySelector('.flex-1.overflow-y-auto');
      if (container) {
        container.scrollTop = 0;
      }
    };

    onMounted(() => {
      checkDirectAccess();

      if (token) {
        console.log('Token from URL:', token);
        // loadEmployeeData(token);
      }
    });

    const customNextStep = () => {
      // Validate CNIC if on step 1
      if (currentStep.value === 1) {
        if (!formData.value.cnic) {
          validationError.value = 'Please enter CNIC number';
          const cnicInput = document.querySelector('input[v-model="formData.cnic"]');
          if (cnicInput) cnicInput.focus();
          return;
        }
        if (!isCnicValid(formData.value.cnic)) {
          validationError.value = 'CNIC must be exactly 13 digits. Please check and try again.';
          const cnicInput = document.querySelector('input[v-model="formData.cnic"]');
          if (cnicInput) cnicInput.focus();
          return;
        }
      }

      // Clear validation error if everything is valid
      validationError.value = '';

      if (currentStep.value === totalSteps) {
        submitForm(() => {
          isSubmitted.value = true;

          if (!isDirectAccess.value) {
            setTimeout(() => {
              emit('close');
            }, 4000);
          }
        });
      } else {
        nextStep();
        scrollToTop();
      }
    };

    // Override or extend the prevStep function
    const customPrevStep = () => {
      if (currentStep.value > 1) {
        prevStep();
        scrollToTop();
        // Clear validation error when going back
        validationError.value = '';
      }
    };

    const close = () => {
      emit('close');
    };

    const redirectToHome = () => {
      router.push('/');
    };

    return {
      currentStep,
      totalSteps,
      steps,
      formData,
      fileNames,
      currentProgressPercentage,
      handleFileUpload,
      prevStep: customPrevStep,
      customNextStep,
      close,
      isDirectAccess,
      isSubmitted,
      redirectToHome,
      removeFile,
      cnicError,
      formatCnic,
      validationError, // Add this to return
    };
  }
};
</script>