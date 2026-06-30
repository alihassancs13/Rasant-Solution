<template>
  <div>
    <div class="md:hidden fixed top-0 left-0 p-3 z-50">
      <button
          @click="isSidebarOpen = true"
          class="p-2.5 rounded-xl bg-blue-400 text-white shadow-md hover:bg-[#1546B8] transition-colors focus:outline-none cursor-pointer"
          aria-label="Open Sidebar"
      >
        <font-awesome-icon icon="fa-solid fa-bars" class="text-xl" />
      </button>
    </div>

    <div
        v-if="isSidebarOpen"
        @click="isSidebarOpen = false"
        class="fixed inset-0 z-40 bg-neutral-950/40 backdrop-blur-[2px] md:hidden transition-opacity"
    ></div>

    <aside
        class="fixed inset-y-0 left-0 z-40 w-64 h-screen bg-[#F4F7FE] flex flex-col justify-between border-r border-gray-200 font-sans select-none shrink-0 transform md:transform-none md:static transition-transform duration-300 ease-in-out overflow-hidden"
        :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    >

      <div class="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-track-[#F4F7FE] scrollbar-thumb-[#5E5CE6] hover:scrollbar-thumb-[#4A48C6] scrollbar-thumb-rounded-full">

        <div class="flex items-center justify-between mb-6 px-2">
          <router-link to="/home" @click="isSidebarOpen = false" class="cursor-pointer transition-opacity hover:opacity-90 mx-auto md:mx-0">
            <img src="../assets/images/rasant-logo.png" alt="Rasant Solutions" class="h-11 object-contain" />
          </router-link>

          <button
              @click="isSidebarOpen = false"
              class="md:hidden text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" class="text-lg" />
          </button>
        </div>

        <div class="mb-4">
          <div class="bg-[#E2ECF9] text-[#1B55E2] font-bold text-xs tracking-wider text-center py-2 px-4 rounded-xl uppercase">
            Administrator
          </div>
        </div>

        <nav class="space-y-3">
          <div>
            <p class="text-[11px] font-bold text-gray-400 tracking-widest px-3 mb-1 uppercase">Company</p>
            <div class="space-y-0.5">

              <router-link
                  to="/admin/overview"
                  @click="isSidebarOpen = false"
                  class="flex items-center space-x-3 px-4 py-2 rounded-xl text-gray-500 hover:bg-[#E2ECF9] hover:text-[#1B55E2] font-medium transition-all"
                  active-class="bg-[#E2ECF9] text-[#1B55E2] font-semibold shadow-sm border-l-4 border-[#1B55E2]"
                  exact-active-class="bg-[#E2ECF9] text-[#1B55E2] font-semibold shadow-sm border-l-4 border-[#1B55E2]"
              >
                <font-awesome-icon
                    icon="fa-solid fa-house"
                    class="text-lg w-5"
                    :class="$route.path === '/admin/overview' ? 'text-[#1B55E2]' : 'text-gray-500'"
                />
                <span>Overview</span>
              </router-link>

              <router-link
                  to="/admin/inbox"
                  @click="isSidebarOpen = false"
                  class="flex items-center space-x-3 px-4 py-2 rounded-xl text-gray-500 hover:bg-[#E2ECF9] hover:text-[#1B55E2] font-medium transition-all"
                  exact-active-class="bg-white text-[#1B55E2] font-semibold shadow-sm border-l-4 border-[#1B55E2]"
              >
                <font-awesome-icon icon="fa-solid fa-envelope" class="text-lg w-5" />
                <span>Inbox</span>
              </router-link>

              <div>
                <button
                    @click="isEmployeesOpen = !isEmployeesOpen"
                    class="w-full flex items-center justify-between px-4 py-2 cursor-pointer rounded-xl text-gray-500 hover:bg-[#E2ECF9] hover:text-[#1B55E2] font-medium transition-all focus:outline-none"
                    :class="{'bg-white text-[#1B55E2] font-semibold shadow-sm border-l-4 border-[#1B55E2]': $route.path.includes('/admin/employees')}"
                >
                  <div class="flex items-center space-x-3">
                    <font-awesome-icon icon="fa-solid fa-users" class="text-lg w-5" />
                    <span>Employees</span>
                  </div>
                  <font-awesome-icon :icon="isEmployeesOpen ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-right'" class="text-xs transition-transform duration-200" />
                </button>

                <div v-show="isEmployeesOpen" class="mt-0.5 ml-6 pl-4 border-l border-gray-300 space-y-0.5">
                  <router-link to="/admin/employees/dashboard" @click="isSidebarOpen = false" class="block px-4 py-1.5 text-sm text-gray-500 hover:bg-[#E2ECF9] hover:text-[#1B55E2] rounded-lg transition-all" exact-active-class="bg-white/80 text-[#1B55E2] font-semibold shadow-xs">Dashboard</router-link>
                  <router-link to="/admin/employees/attendance" @click="isSidebarOpen = false" class="block px-4 py-1.5 text-sm text-gray-500 hover:bg-[#E2ECF9] hover:text-[#1B55E2] rounded-lg transition-all" exact-active-class="bg-white/80 text-[#1B55E2] font-semibold shadow-xs">Attendance</router-link>
                  <router-link to="/admin/career" @click="isSidebarOpen = false" class="block px-4 py-1.5 text-sm text-gray-500 hover:bg-[#E2ECF9] hover:text-[#1B55E2] rounded-lg transition-all" exact-active-class="bg-white/80 text-[#1B55E2] font-semibold shadow-xs">Careers</router-link>
                  <router-link tabIndex="-1" to="/admin/employees/salaries" @click="isSidebarOpen = false" class="block px-4 py-1.5 text-sm text-gray-500 hover:bg-[#E2ECF9] hover:text-[#1B55E2] rounded-lg transition-all" exact-active-class="bg-white/80 text-[#1B55E2] font-semibold shadow-xs">Salaries</router-link>
                </div>
              </div>

              <router-link
                  to="/admin/inquiries"
                  @click="isSidebarOpen = false"
                  class="flex items-center space-x-3 px-4 py-2 rounded-xl text-gray-500 hover:bg-[#E2ECF9] hover:text-[#1B55E2] font-medium transition-all"
                  exact-active-class="bg-white text-[#1B55E2] font-semibold shadow-sm border-l-4 border-[#1B55E2]"
              >
                <font-awesome-icon icon="fa-solid fa-paper-plane" class="text-lg w-5" />
                <span>Inquiries</span>
              </router-link>

              <router-link
                  to="/admin/jira"
                  @click="isSidebarOpen = false"
                  class="flex items-center space-x-3 px-4 py-2 rounded-xl text-gray-500 hover:bg-[#E2ECF9] hover:text-[#1B55E2] font-medium transition-all"
                  exact-active-class="bg-white text-[#1B55E2] font-semibold shadow-sm border-l-4 border-[#1B55E2]"
              >
                <font-awesome-icon icon="fa-brands fa-jira" class="text-lg w-5" />
                <span>Jira</span>
              </router-link>
            </div>
          </div>

          <div>
            <p class="text-[11px] font-bold text-gray-400 tracking-widest px-3 mb-1 uppercase">Projects</p>
            <div class="space-y-0.5">
              <router-link
                  to="/admin/projects/sentra-ai"
                  @click="isSidebarOpen = false"
                  class="flex items-center space-x-3 px-4 py-2 rounded-xl text-gray-500 hover:bg-[#E2ECF9] hover:text-[#1B55E2] font-medium transition-all"
                  exact-active-class="bg-white text-[#1B55E2] font-semibold shadow-sm border-l-4 border-[#1B55E2]"
              >
                <font-awesome-icon icon="fa-solid fa-phone" class="text-lg w-5" />
                <span>Sentra AI</span>
              </router-link>

              <router-link
                  to="/admin/projects/ai-agent"
                  @click="isSidebarOpen = false"
                  class="flex items-center space-x-3 px-4 py-2 rounded-xl text-gray-500 hover:bg-[#E2ECF9] hover:text-[#1B55E2] font-medium transition-all"
                  exact-active-class="bg-white text-[#1B55E2] font-semibold shadow-sm border-l-4 border-[#1B55E2]"
              >
                <font-awesome-icon icon="fa-solid fa-robot" class="text-lg w-5" />
                <span>AI Agent</span>
              </router-link>

              <router-link
                  to="/admin/projects/chatbot"
                  @click="isSidebarOpen = false"
                  class="flex items-center space-x-3 px-4 py-2 rounded-xl text-gray-500 hover:bg-[#E2ECF9] hover:text-[#1B55E2] font-medium transition-all"
                  exact-active-class="bg-white text-[#1B55E2] font-semibold shadow-sm border-l-4 border-[#1B55E2]"
              >
                <font-awesome-icon icon="fa-regular fa-comment" class="text-lg w-5" />
                <span>Chatbot</span>
              </router-link>

              <router-link
                  to="/admin/projects/orchestri"
                  @click="isSidebarOpen = false"
                  class="flex items-center space-x-3 px-4 py-2 rounded-xl text-gray-500 hover:bg-[#E2ECF9] hover:text-[#1B55E2] font-medium transition-all"
                  exact-active-class="bg-white text-[#1B55E2] font-semibold shadow-sm border-l-4 border-[#1B55E2]"
              >
                <font-awesome-icon icon="fa-solid fa-gear" class="text-lg w-5" />
                <span>Orchestri</span>
              </router-link>
            </div>
          </div>
        </nav>
      </div>

      <div class="p-4 border-t border-gray-200/60 bg-[#F4F7FE] shrink-0">
        <p class="text-[11px] font-bold text-gray-400 tracking-widest px-3 mb-1 uppercase">Account</p>
        <router-link
            to="/admin/profile"
            @click="isSidebarOpen = false"
            class="flex items-center space-x-3 px-4 py-2 rounded-xl text-gray-500 hover:bg-[#E2ECF9] hover:text-[#1B55E2] font-medium transition-all"
            exact-active-class="bg-white text-[#1B55E2] font-semibold shadow-sm border-l-4 border-[#1B55E2]"
        >
          <font-awesome-icon icon="fa-solid fa-user" class="text-lg w-5" />
          <span>Manage Profile</span>
        </router-link>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isEmployeesOpen = ref(false);
const isSidebarOpen = ref(false);
</script>