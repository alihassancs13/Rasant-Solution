<template>
  <!-- Page background wrapper -->
  <div :class="isDirectAccess ? 'min-h-screen w-full bg-slate-100 flex flex-col items-center md:py-8 md:px-4' : ''">

    <!-- Navbar -->
    <Navbar v-if="isDirectAccess" class="w-full mb-10" />

    <!-- Outer container -->
    <div :class="[
      'bg-white w-full relative mx-auto flex flex-col',
      isDirectAccess ? 'md:max-w-5xl md:my-8 md:rounded-2xl md:shadow-xl md:border md:border-slate-200' : 'max-w-4xl max-h-[95vh] rounded-xl shadow-xl border border-slate-200 overflow-hidden'
    ]">

      <!-- Pinned Close Button -->
      <button v-if="!isDirectAccess" type="button" class="absolute top-5 right-6 cursor-pointer text-slate-400 hover:text-slate-600 transition z-50" @click="close">
        <i class="fa-solid fa-xmark text-xl"></i>
      </button>

      <!-- HEADER SECTION -->
      <div :class="[
        'border-b border-slate-100 bg-white',
        isDirectAccess ? 'px-6 md:px-8 py-6' : 'p-5 px-6 pr-16 shrink-0'
      ]">
        <div class="mb-3">
          <h1 :class="[
            'font-bold text-slate-800',
            isDirectAccess ? 'text-2xl' : 'text-xl'
          ]">Employee Onboarding Form</h1>
          <p class="text-xs text-slate-400 mt-0.5">Complete the multi-step registration to register a new employee.</p>
        </div>

        <!-- Progress tracker line -->
        <div class="flex justify-between items-center mb-1.5">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Progress</span>
          <span class="text-sm font-bold text-blue-600">{{ currentProgressPercentage }}</span>
        </div>
        <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div class="bg-blue-500 h-full transition-all duration-300" :style="{ width: currentProgressPercentage }"></div>
        </div>
      </div>

      <!-- CONTENT BODY -->
      <div :class="[
        isDirectAccess ? 'bg-slate-50/30' : 'flex-1 overflow-y-auto space-y-4'
      ]">
        <div :class="isDirectAccess ? 'px-2 md:px-4 py-6 space-y-4' : ''">

          <!-- STEP WIZARD INDICATORS -->
          <div class="px-6 pt-5 bg-slate-50/50 pb-4 border-b border-slate-100 rounded-t-xl">
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

          <!-- FORM FIELDS -->
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
                <!-- Row 1: First Name + Last Name -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">First Name <span class="text-rose-500">*</span></label>
                    <input
                        type="text"
                        v-model="formData.first_name"
                        :required="isDirectAccess"
                        :class="[
        'w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm',
        (touched.first_name && errors.first_name) ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
      ]"
                        placeholder="e.g. Sarah"
                        @input="markTouched('first_name')"
                        @blur="markTouched('first_name')"
                    >
                    <span v-if="touched.first_name && errors.first_name" class="text-xs text-rose-500 mt-1 block">
      <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ errors.first_name }}
    </span>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Last Name <span class="text-rose-500">*</span></label>
                    <input
                        type="text"
                        v-model="formData.last_name"
                        :required="isDirectAccess"
                        :class="[
        'w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm',
        (touched.last_name && errors.last_name) ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
      ]"
                        placeholder="e.g. Ali"
                        @input="markTouched('last_name')"
                        @blur="markTouched('last_name')"
                    >
                    <span v-if="touched.last_name && errors.last_name" class="text-xs text-rose-500 mt-1 block">
      <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ errors.last_name }}
    </span>
                  </div>
                </div>

                <!-- Row 1b: CNIC (moved to next row) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">CNIC <span class="text-rose-500">*</span></label>
                    <input
                        type="text"
                        v-model="formData.cnic"
                        :required="isDirectAccess"
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
                  <!-- You can add another field here if needed, or leave empty -->
                  <div></div>
                </div>

                <!-- CNIC Scan -->
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">CNIC Scan copy <span class="text-rose-500" v-if="!fileNames.cnic_scan">*</span></label>

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

                  <div v-else :class="[
                    'border-2 border-dashed rounded-2xl p-6 text-center hover:bg-slate-50 transition relative group cursor-pointer',
                    fileErrors.cnic_scan ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200'
                  ]">
                    <input type="file" @change="handleFileUpload($event, 'cnic_scan')" data-field="cnic_scan" :required="isDirectAccess" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                    <div class="text-blue-500 text-3xl mb-2 group-hover:scale-110 transition-transform"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                    <p class="text-sm font-medium text-slate-600">Drag & drop or <span class="text-blue-500 underline font-semibold">click to upload</span></p>
                    <p class="text-xs text-slate-400 mt-1">.pdf, .png, .jpg, .jpeg (Max 10MB)</p>
                  </div>
                  <span v-if="fileErrors.cnic_scan" class="text-xs text-rose-500 mt-1 block">
                    <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ fileErrors.cnic_scan }}
                  </span>
                </div>

                <!-- Row 2: Email + Phone -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email <span class="text-rose-500">*</span></label>
                    <input
                        type="email"
                        v-model="formData.email"
                        :required="isDirectAccess"
                        :class="[
                        'w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm',
                        (touched.email && errors.email) ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
                      ]"
                        placeholder="employee@company.com"
                        @input="markTouched('email')"
                        @blur="markTouched('email')"
                    >
                    <span v-if="touched.email && errors.email" class="text-xs text-rose-500 mt-1 block">
                      <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ errors.email }}
                    </span>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Phone Number <span class="text-rose-500">*</span></label>
                    <input
                        type="text"
                        inputmode="numeric"
                        v-model="formData.phone_number"
                        :required="isDirectAccess"
                        :class="[
                        'w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm',
                        (touched.phone_number && errors.phone_number) ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
                      ]"
                        placeholder="03XXXXXXXXX"
                        @keydown="handlePhoneKeydown"
                        @paste="handlePhonePaste"
                        @input="handlePhoneInput"
                        @blur="markTouched('phone_number')"
                    >
                    <span v-if="touched.phone_number && errors.phone_number" class="text-xs text-rose-500 mt-1 block">
                      <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ errors.phone_number }}
                    </span>
                  </div>
                </div>

                <!-- Row 3: Gender + Department -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Gender <span class="text-rose-500">*</span></label>
                    <div class="flex gap-4">
                      <label :class="genderPillClass">
                        <input
                            type="radio"
                            v-model="formData.gender"
                            value="Male"
                            :required="isDirectAccess"
                            class="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 mr-2"
                            @change="markTouched('gender')"
                        > Male
                      </label>
                      <label :class="genderPillClass">
                        <input
                            type="radio"
                            v-model="formData.gender"
                            value="Female"
                            class="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 mr-2"
                            @change="markTouched('gender')"
                        > Female
                      </label>
                    </div>
                    <span v-if="touched.gender && errors.gender" class="text-xs text-rose-500 mt-1 block">
                      <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ errors.gender }}
                    </span>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Department <span class="text-rose-500">*</span></label>
                    <input
                        type="text"
                        v-model="formData.department"
                        :required="isDirectAccess"
                        :class="[
                        'w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm',
                        (touched.department && errors.department) ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
                      ]"
                        placeholder="e.g. Engineering"
                        @input="markTouched('department')"
                        @blur="markTouched('department')"
                    >
                    <span v-if="touched.department && errors.department" class="text-xs text-rose-500 mt-1 block">
                      <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ errors.department }}
                    </span>
                  </div>
                </div>

                <!-- Row 4: Designation + Salary -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Designation <span class="text-rose-500">*</span></label>
                    <input
                        type="text"
                        v-model="formData.designation"
                        :required="isDirectAccess"
                        :class="[
                        'w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm',
                        (touched.designation && errors.designation) ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
                      ]"
                        placeholder="e.g. Software Engineer"
                        @input="markTouched('designation')"
                        @blur="markTouched('designation')"
                    >
                    <span v-if="touched.designation && errors.designation" class="text-xs text-rose-500 mt-1 block">
                      <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ errors.designation }}
                    </span>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Salary <span class="text-rose-500">*</span></label>
                    <input
                        type="text"
                        inputmode="decimal"
                        v-model="formData.salary"
                        :required="isDirectAccess"
                        :class="[
                        'w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm',
                        (touched.salary && errors.salary) ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
                      ]"
                        placeholder="0.00"
                        @keydown="handleSalaryKeydown"
                        @paste="handleSalaryPaste"
                        @input="handleSalaryInput"
                        @blur="markTouched('salary')"
                    >
                    <span v-if="touched.salary && errors.salary" class="text-xs text-rose-500 mt-1 block">
                      <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ errors.salary }}
                    </span>
                  </div>
                </div>

                <!-- Row 5: Joined Date + Status -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Joined Date <span class="text-rose-500">*</span></label>
                    <input
                        type="date"
                        v-model="formData.joined_date"
                        :required="isDirectAccess"
                        :class="[
                        'w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm',
                        (touched.joined_date && errors.joined_date) ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
                      ]"
                        @change="markTouched('joined_date')"
                        @blur="markTouched('joined_date')"
                    >
                    <span v-if="touched.joined_date && errors.joined_date" class="text-xs text-rose-500 mt-1 block">
                      <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ errors.joined_date }}
                    </span>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Status <span class="text-rose-500">*</span></label>
                    <select
                        v-model="formData.status"
                        :required="isDirectAccess"
                        :class="[
                        'w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white',
                        (touched.status && errors.status) ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
                      ]"
                        @change="markTouched('status')"
                        @blur="markTouched('status')"
                    >
                      <option value="">Select Status</option>
                      <option
                          v-for="st in employmentStatuses"
                          :key="st.id || st.code || st.name"
                          :value="st.name"
                      >{{ st.name }}</option>
                    </select>
                    <span v-if="touched.status && errors.status" class="text-xs text-rose-500 mt-1 block">
                      <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ errors.status }}
                    </span>
                  </div>
                </div>

                <div class="mt-4">
                  <label class="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input type="checkbox" v-model="formData.work_from_home" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    Work from home
                  </label>
                  <p class="text-xs text-slate-500 mt-1">If enabled, attendance outside the office radius is marked as Work from home.</p>
                </div>

                <!-- Present Address -->
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Present Address <span class="text-rose-500">*</span></label>
                  <textarea
                      v-model="formData.present_address"
                      :required="isDirectAccess"
                      rows="3"
                      
                      :class="[
                      'w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm',
                      (touched.present_address && errors.present_address) ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
                    ]"
                      placeholder="Your current residential address"
                      @input="markTouched('present_address')"
                      @blur="markTouched('present_address')"
                  ></textarea>
                  <div class="flex items-center justify-between mt-1">
                    <span v-if="touched.present_address && errors.present_address" class="text-xs text-rose-500">
                      <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ errors.present_address }}
                    </span>
                    <span class="text-[10px] text-slate-400 ml-auto">{{ (formData.present_address || '').length }}/250</span>
                  </div>
                </div>

                <!-- Permanent Address -->
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Permanent Address</label>
                  <textarea v-model="formData.permanent_address" rows="3"  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="Your permanent home address"></textarea>
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
                    <input
                        type="text"
                        v-model="formData.emergency_name"
                        :required="isDirectAccess"
                        :class="[
                        'w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm',
                        (touched.emergency_name && errors.emergency_name) ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
                      ]"
                        placeholder="Full Name"
                        @input="markTouched('emergency_name')"
                        @blur="markTouched('emergency_name')"
                    >
                    <span v-if="touched.emergency_name && errors.emergency_name" class="text-xs text-rose-500 mt-1 block">
                      <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ errors.emergency_name }}
                    </span>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Relation <span class="text-rose-500">*</span></label>
                    <input
                        type="text"
                        v-model="formData.emergency_relation"
                        :required="isDirectAccess"
                        :class="[
                        'w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm',
                        (touched.emergency_relation && errors.emergency_relation) ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
                      ]"
                        placeholder="Spouse, Parent, Sibling"
                        @input="markTouched('emergency_relation')"
                        @blur="markTouched('emergency_relation')"
                    >
                    <span v-if="touched.emergency_relation && errors.emergency_relation" class="text-xs text-rose-500 mt-1 block">
                      <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ errors.emergency_relation }}
                    </span>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">CNIC <span class="text-rose-500">*</span></label>
                  <input
                      type="text"
                      v-model="formData.emergency_cnic"
                      :required="isDirectAccess"
                      :class="[
                      'w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm',
                      emergencyCnicError ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
                    ]"
                      placeholder="00000-0000000-0"
                      @input="formatEmergencyCnic"
                      maxlength="15"
                  >
                  <span v-if="emergencyCnicError" class="text-xs text-rose-500 mt-1 block">
                    <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ emergencyCnicError }}
                  </span>
                  <span v-else class="text-[10px] text-slate-400 mt-1 block">National identity card number (13 digits)</span>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">CNIC scan copy <span class="text-rose-500" v-if="!fileNames.emergency_cnic_scan">*</span></label>

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

                  <div v-else :class="[
                    'border-2 border-dashed rounded-2xl p-6 text-center hover:bg-slate-50 transition relative group cursor-pointer',
                    fileErrors.emergency_cnic_scan ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200'
                  ]">
                    <input type="file" @change="handleFileUpload($event, 'emergency_cnic_scan')" data-field="emergency_cnic_scan" :required="isDirectAccess" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                    <div class="text-blue-500 text-3xl mb-2 group-hover:scale-110 transition-transform"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                    <p class="text-sm font-medium text-slate-600">Drag & drop or <span class="text-blue-500 underline font-semibold">click to upload</span></p>
                    <p class="text-xs text-slate-400 mt-1">.pdf, .png, .jpg, .jpeg (Max 10MB)</p>
                  </div>
                  <span v-if="fileErrors.emergency_cnic_scan" class="text-xs text-rose-500 mt-1 block">
                    <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ fileErrors.emergency_cnic_scan }}
                  </span>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Phone no <span class="text-rose-500">*</span></label>
                  <input
                      type="text"
                      inputmode="numeric"
                      v-model="formData.emergency_phone"
                      :required="isDirectAccess"
                      :class="[
                      'w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm',
                      (touched.emergency_phone && errors.emergency_phone) ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
                    ]"
                      placeholder="03XXXXXXXXX"
                      @keydown="handleEmergencyPhoneKeydown"
                      @paste="handleEmergencyPhonePaste"
                      @input="handleEmergencyPhoneInput"
                      @blur="markTouched('emergency_phone')"
                  >
                  <span v-if="touched.emergency_phone && errors.emergency_phone" class="text-xs text-rose-500 mt-1 block">
                    <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ errors.emergency_phone }}
                  </span>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Address <span class="text-rose-500">*</span></label>
                  <textarea
                      v-model="formData.emergency_address"
                      :required="isDirectAccess"
                      rows="3"
                      
                      :class="[
                      'w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm',
                      (touched.emergency_address && errors.emergency_address) ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
                    ]"
                      placeholder="Residential address of contact person"
                      @input="markTouched('emergency_address')"
                      @blur="markTouched('emergency_address')"
                  ></textarea>
                  <div class="flex items-center justify-between mt-1">
                    <span v-if="touched.emergency_address && errors.emergency_address" class="text-xs text-rose-500">
                      <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ errors.emergency_address }}
                    </span>
                    <span class="text-[10px] text-slate-400 ml-auto">{{ (formData.emergency_address || '').length }}/250</span>
                  </div>
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

                  <div v-else :class="[
                    'border-2 border-dashed rounded-2xl p-6 text-center hover:bg-slate-50 transition relative group cursor-pointer',
                    fileErrors.matric_certificate ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200'
                  ]">
                    <input type="file" @change="handleFileUpload($event, 'matric_certificate')" data-field="matric_certificate" :required="isDirectAccess" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                    <div class="text-blue-500 text-3xl mb-2 group-hover:scale-110 transition-transform"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                    <p class="text-sm font-medium text-slate-600">Drag & drop or <span class="text-blue-500 underline font-semibold">click to upload</span></p>
                    <p class="text-xs text-slate-400 mt-1">.pdf, .png, .jpg, .jpeg (Max 10MB)</p>
                  </div>
                  <span v-if="fileErrors.matric_certificate" class="text-xs text-rose-500 mt-1 block">
                    <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ fileErrors.matric_certificate }}
                  </span>
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

                  <div v-else :class="[
                    'border-2 border-dashed rounded-2xl p-6 text-center hover:bg-slate-50 transition relative group cursor-pointer',
                    fileErrors.fsc_certificate ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200'
                  ]">
                    <input type="file" @change="handleFileUpload($event, 'fsc_certificate')" data-field="fsc_certificate" :required="isDirectAccess" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                    <div class="text-blue-500 text-3xl mb-2 group-hover:scale-110 transition-transform"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                    <p class="text-sm font-medium text-slate-600">Drag & drop or <span class="text-blue-500 underline font-semibold">click to upload</span></p>
                    <p class="text-xs text-slate-400 mt-1">.pdf, .png, .jpg, .jpeg (Max 10MB)</p>
                  </div>
                  <span v-if="fileErrors.fsc_certificate" class="text-xs text-rose-500 mt-1 block">
                    <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ fileErrors.fsc_certificate }}
                  </span>
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

                  <div v-else :class="[
                    'border-2 border-dashed rounded-2xl p-6 text-center hover:bg-slate-50 transition relative group cursor-pointer',
                    fileErrors.university_degree ? 'border-rose-400 bg-rose-50/40' : 'border-blue-200 bg-blue-50/10'
                  ]">
                    <input type="file" @change="handleFileUpload($event, 'university_degree')" data-field="university_degree" :required="isDirectAccess" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                    <div class="text-blue-500 text-3xl mb-2 group-hover:scale-110 transition-transform"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                    <p class="text-sm font-medium text-slate-600">Drag & drop or <span class="text-blue-500 underline font-semibold">click to upload</span></p>
                    <p class="text-xs text-slate-400 mt-1">.pdf, .png, .jpg, .jpeg (Max 10MB)</p>
                  </div>
                  <span v-if="fileErrors.university_degree" class="text-xs text-rose-500 mt-1 block">
                    <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ fileErrors.university_degree }}
                  </span>
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

                  <div v-else :class="[
                    'border-2 border-dashed rounded-2xl p-6 text-center hover:bg-slate-50 transition relative group cursor-pointer',
                    fileErrors.other_course ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200'
                  ]">
                    <input type="file" @change="handleFileUpload($event, 'other_course')" data-field="other_course" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                    <div class="text-blue-500 text-3xl mb-2 group-hover:scale-110 transition-transform"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                    <p class="text-sm font-medium text-slate-600">Drag & drop or <span class="text-blue-500 underline font-semibold">click to upload</span></p>
                    <p class="text-xs text-slate-400 mt-1">.pdf, .png, .jpg, .jpeg (Max 10MB)</p>
                  </div>
                  <span v-if="fileErrors.other_course" class="text-xs text-rose-500 mt-1 block">
                    <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ fileErrors.other_course }}
                  </span>
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
                    <input
                        type="text"
                        v-model="formData.bank_name"
                        :required="isDirectAccess"
                        :class="[
                        'w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm',
                        (touched.bank_name && errors.bank_name) ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
                      ]"
                        placeholder="e.g. Meezan Bank"
                        @input="markTouched('bank_name')"
                        @blur="markTouched('bank_name')"
                    >
                    <span v-if="touched.bank_name && errors.bank_name" class="text-xs text-rose-500 mt-1 block">
                      <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ errors.bank_name }}
                    </span>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Branch Name</label>
                    <input
                        type="text"
                        v-model="formData.branch_name"
                        :class="[
                        'w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm',
                        (touched.branch_name && errors.branch_name) ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
                      ]"
                        placeholder="Branch location name"
                        @input="markTouched('branch_name')"
                        @blur="markTouched('branch_name')"
                    >
                    <span v-if="touched.branch_name && errors.branch_name" class="text-xs text-rose-500 mt-1 block">
                      <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ errors.branch_name }}
                    </span>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Account no / IBAN Number <span class="text-rose-500">*</span></label>
                  <input
                      type="text"
                      v-model="formData.account_number"
                      :required="isDirectAccess"
                      :class="[
                      'w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm',
                      (touched.account_number && errors.account_number) ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
                    ]"
                      placeholder="PK00XXXX0000000000000000"
                      @input="markTouched('account_number')"
                      @blur="markTouched('account_number')"
                  >
                  <div class="flex items-center justify-between mt-1">
                    <span v-if="touched.account_number && errors.account_number" class="text-xs text-rose-500">
                      <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ errors.account_number }}
                    </span>
                    <span class="text-[10px] text-slate-400 ml-auto">{{ (formData.account_number || '').length }}/24</span>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <!-- SUCCESS MESSAGE -->
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
      </div>

      <!-- FOOTER SECTION -->
      <div v-if="!isSubmitted" :class="[
        'border-t border-slate-100 flex justify-between items-center',
        isDirectAccess ? 'px-6 md:px-8 py-4 bg-white' : 'p-6 bg-slate-50/80 shrink-0'
      ]">
        <button type="button" @click="prevStep" :class="['px-5 py-2.5 rounded-xl border cursor-pointer border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100 transition flex items-center bg-white', currentStep === 1 ? 'invisible' : '']">
          <i class="fa-solid fa-arrow-left mr-2 mt-0.5"></i> Back
        </button>

        <div class="flex gap-3">
          <button v-if="!isDirectAccess" type="button" @click="close" class="px-5 py-2.5 cursor-pointer rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100 transition bg-white">
            Close
          </button>
          <button type="button" @click="customNextStep" class="px-6 py-2.5 rounded-xl cursor-pointer bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 shadow-lg shadow-orange-600/20 transition flex items-center">
            <span v-if="currentStep === totalSteps">Submit form</span>
            <span v-else>Continue</span>
            <i v-if="currentStep === totalSteps" class="fa-solid fa-paper-plane ml-2 mt-0.5"></i>
            <i v-else class="fa-solid fa-arrow-right ml-2 mt-0.5"></i>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { useEmployeeRegistration } from '@/composables/useEmployeeRegistration.js';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '@/components/Navbar.vue';
import { useEmployeeStore } from '@/stores/employeeStore.js';

export default {
  components: { Navbar },
  emits: ['close'],
  setup(props, { emit }) {
    const router = useRouter();
    const isDirectAccess = ref(false);
    const employeeStore = useEmployeeStore();
    const employmentStatuses = computed(() => employeeStore.employmentStatuses || []);

    const getTokenFromURL = () => {
      const path = window.location.pathname;
      const segments = path.split('/');
      const lastSegment = segments[segments.length - 1];
      return lastSegment === 'onboarding' ? null : lastSegment;
    };

    const token = getTokenFromURL();

    const checkDirectAccess = () => {
      const path = window.location.pathname;
      if (path.includes('/onboarding')) {
        isDirectAccess.value = true;
      }
    };
    const registration = useEmployeeRegistration(isDirectAccess);

    const {
      currentStep,
      totalSteps,
      steps,
      formData,
      fileNames,
      isSubmitted,
      currentProgressPercentage,
      touched,
      errors,
      fileErrors,
      validationError,
      emergencyCnicError,
      markTouched,
      isValidCnic,
      handleFileUpload,
      removeFile,
      formatCnic: registrationFormatCnic,
      formatEmergencyCnic,
      handlePhoneKeydown,
      handlePhonePaste,
      handlePhoneInput,
      handleEmergencyPhoneKeydown,
      handleEmergencyPhonePaste,
      handleEmergencyPhoneInput,
      handleSalaryKeydown,
      handleSalaryPaste,
      handleSalaryInput,
      nextStep,
      prevStep,
      submitForm,
    } = registration;

    const genderPillClass = computed(() => [
      'inline-flex items-center text-sm font-medium text-slate-700 bg-white px-4 py-2 rounded-xl cursor-pointer hover:bg-slate-50 border',
      (touched.value.gender && errors.value.gender) ? 'border-rose-500 bg-rose-50' : 'border-slate-200',
    ])

    const cnicError = computed(() => {
      if (currentStep.value !== 1) return '';
      if (!formData.value.cnic) return '';
      if (!isValidCnic(formData.value.cnic)) {
        return 'CNIC must be exactly 13 digits (e.g., 12345-1234567-8)';
      }
      return '';
    });

    // Wrap the composable's formatCnic so the step-1 "Please enter CNIC number"
    // banner clears as soon as the user starts typing again.
    const formatCnic = (event) => {
      registrationFormatCnic(event);
      validationError.value = '';
    };

    onMounted(() => {
      checkDirectAccess();
      employeeStore.fetchEmploymentStatuses();

      if (token) {
        console.log('Token from URL:', token);
      }
    });

    const customNextStep = () => {
      if (currentStep.value === totalSteps) {
        // CHANGE THIS LINE - pass the source
        // Determine source based on context
        const source = isDirectAccess.value ? 'user_onboarding' : 'admin_onboarding';

        submitForm((data) => {
          if (!isDirectAccess.value) {
            window.dispatchEvent(new CustomEvent('employee-created', { detail: data }));
            setTimeout(() => {
              emit('close');
            }, 2500);
          }
        }, source); // Pass source here
      } else {
        nextStep();
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
      prevStep,
      customNextStep,
      close,
      isDirectAccess,
      isSubmitted,
      redirectToHome,
      removeFile,
      cnicError,
      formatCnic,
      formatEmergencyCnic,
      emergencyCnicError,
      validationError,
      employmentStatuses,
      touched,
      errors,
      fileErrors,
      markTouched,
      genderPillClass,
      handlePhoneKeydown,
      handlePhonePaste,
      handlePhoneInput,
      handleEmergencyPhoneKeydown,
      handleEmergencyPhonePaste,
      handleEmergencyPhoneInput,
      handleSalaryKeydown,
      handleSalaryPaste,
      handleSalaryInput,
    };
  }
};
</script>