<template>
 <div class="flex h-screen bg-surface">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">

      <!-- Header -->
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <TopHeader
          userName="System Admin"
          role="admin"
          :notificationCount="3"
        />
      </div>

      <!-- Scrollable Content -->
      <main class="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
  <div class="  px-4 pt-0">

    <!-- Header -->
    <div class="mb-8">
      <div class="mb-8 flex items-center gap-3">
         <div v-if="jiraStore.jiraConnected" class="w-12 h-12 rounded-xl bg-gradient-to-r from-[#2F6FC4] via-[#4A88D8] to-[#5C97E3]
         hover:from-[#295FB0] hover:via-[#417FD0] hover:to-[#528CDB] flex items-center justify-center">
      <font-awesome-icon :icon="['fab', 'jira']" class="w-6 h-6 text-white" />
    </div>

        <div v-if="jiraStore.jiraConnected">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-800">
        Jira Integration
      </h1>

      <p class="text-gray-500 text-sm mt-0.5">
        Manage your Jira issues and sync tickets directly from Rasant Solutions
      </p>
    </div>


        <div v-if="jiraStore.jiraConnected" class="flex items-center gap-3 ml-auto">
          <button
              @click="openCredentialsModal"
              class="group bg-gradient-to-r from-[#2F6FC4] via-[#4A88D8] to-[#5C97E3] hover:from-[#295FB0] hover:via-[#417FD0] hover:to-[#528CDB] text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-300/40 hover:shadow-xl hover:shadow-blue-400/50 transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5">             <font-awesome-icon :icon="['fab', 'jira']" class="w-4 h-4" />
            Connect Jira
          </button>

          <button
              @click="openCreateModal"
              class="group bg-gradient-to-r from-[#2F6FC4] via-[#4A88D8] to-[#5C97E3] hover:from-[#295FB0] hover:via-[#417FD0] hover:to-[#528CDB] text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-300/40 hover:shadow-xl hover:shadow-blue-400/50 transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5">
            <font-awesome-icon icon="fa-solid fa-plus" class="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-300" />
            Create Issue
          </button>
        </div>
      </div>
    </div>

    <!-- Connect Form -->
    <div v-if=" !jiraStore.jiraConnected || jiraStore.jiraExpired " class="flex items-center justify-center">
      <div class="bg-white  rounded-2xl border border-gray-100 shadow-sm p-8 w-full max-w-md">

        <!-- Logo & Header -->
        <div class="flex flex-col items-center gap-3 mb-8">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-[#2F6FC4] via-[#4A88D8] to-[#5C97E3]
         hover:from-[#295FB0] hover:via-[#417FD0] hover:to-[#528CDB] flex items-center justify-center">
            <font-awesome-icon :icon="['fab', 'jira']" class="w-6 h-6 text-white" />
          </div>
          <div class="text-center">
            <h2 class="text-lg font-semibold text-gray-800">Connect to Jira</h2>
            <p class="text-sm text-gray-500 mt-1">Connect your Jira Account with Sentra AI</p>
          </div>
        </div>

        <!-- Form Fields -->
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1.5">
              Email <span class="text-red-500">*</span>
            </label>
            <input
                v-model="form.email"
                type="email"
                autocomplete="off"
                @input="errors.email = ''"
                placeholder="youremail@company.com"
                :class="errors.email ? 'border-red-300 focus:border-red-400' : 'border-gray-300 focus:border-blue-400'"
                class="w-full py-2 px-3 text-sm rounded-lg border-2 outline-none transition-all bg-white"
            />
            <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1.5">
              Api Token <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                  v-model="form.apiToken"
                  :type="showToken ? 'text' : 'password'"
                  autocomplete="new-password"
                  @input="errors.apiToken = ''"
                  placeholder="••••••••••••••••"
                  :class="errors.apiToken ? 'border-red-300 focus:border-red-400' : 'border-gray-300 focus:border-blue-400'"
                  class="w-full py-2 px-3 pr-10 text-sm rounded-lg border-2 outline-none transition-all bg-white"
              />
              <button
                  @click="showToken = !showToken"
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <font-awesome-icon :icon="['fas', showToken ? 'eye-slash' : 'eye']" class="w-4 h-4" />
              </button>
            </div>
            <p v-if="errors.apiToken" class="mt-1 text-xs text-red-500">{{ errors.apiToken }}</p>
            <p v-if="showExpiredBanner" class="mt-1.5 text-xs text-red-500 flex items-center gap-1">
              <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="w-3 h-3 flex-shrink-0" />
              API token expired — please enter a new token to reconnect.
            </p>
            <p class="mt-1.5 text-xs text-gray-400">
              Create Token:
              <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" class="text-[#0052CC] hover:underline">
                Atlassian Account Settings ↗
              </a>
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1.5">
              Jira Domain <span class="text-red-500">*</span>
            </label>
            <div
                :class="errors.domain ? 'border-red-300 focus-within:border-red-400' : 'border-gray-300 focus-within:border-blue-400'"
                class="flex items-center border-2 rounded-lg overflow-hidden transition-all"
            >
              <span class="px-3 py-2 text-xs text-gray-400 bg-gray-50 border-r border-gray-200 select-none whitespace-nowrap">
                https://
              </span>
              <input
                  v-model="form.domain"
                  type="text"
                  autocomplete="off"
                  @input="errors.domain = ''"
                  placeholder="yourcompany.atlassian.net"
                  class="flex-1 py-2 px-3 text-sm outline-none bg-white min-w-0"
              />
            </div>
            <p v-if="errors.domain" class="mt-1 text-xs text-red-500">{{ errors.domain }}</p>
          </div>
        </div>

        <div class="border-t border-gray-100 my-6">
          <button
              @click="connectJira"
              :disabled="isConnecting"
              class="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-[#2F6FC4] via-[#376FBE] to-[#3F79C8] hover:from-[#295FB0] hover:via-[#3168B6] hover:to-[#3972BF] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"         >
            <font-awesome-icon
                :icon="isConnecting ? ['fas', 'spinner'] : ['fab', 'jira']"
                :class="isConnecting ? 'animate-spin' : ''"
                class="w-4 h-4"
            />
            {{ isConnecting ?  'Connecting...' : 'Connect with Jira'}}
          </button>
          <p class="text-center text-xs text-gray-400 mt-4">
            <font-awesome-icon :icon="['fas', 'lock']" class="w-3 h-3 mr-1" />
            Your credentials are encrypted and never shared with third parties
          </p>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div v-if="jiraStore.jiraConnected && !jiraStore.jiraExpired && userIssues " class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 w-full mx-auto">

      <!-- Total -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Total Issues</p>
            <div v-if="isLoading" class="mt-1">
              <font-awesome-icon :icon="['fas', 'spinner']" class="w-5 h-5 text-blue-500 animate-spin" />
            </div>
            <p v-else class="text-2xl font-bold text-gray-800 mt-1">
              {{ userIssues.length }}
            </p>
          </div>
          <div class="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
            <font-awesome-icon icon="fa-solid fa-layer-group" class="w-5 h-5 text-teal-500" />
          </div>
        </div>
      </div>

      <!-- In Progress -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">In Progress </p>
            <div v-if="isLoading" class="mt-1">
              <font-awesome-icon :icon="['fas', 'spinner']" class="w-5 h-5 text-blue-500 animate-spin" />
            </div>
            <p v-else class="text-2xl font-bold text-gray-800 mt-1">
              {{ userIssues.filter(i => i.status_category === 'In Progress').length }}
            </p>
          </div>
          <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <font-awesome-icon icon="fa-solid fa-spinner" class="w-5 h-5 text-blue-500" />
          </div>
        </div>
      </div>

      <!-- To Do -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">To Do</p>
            <div v-if="isLoading" class="mt-1">
              <font-awesome-icon :icon="['fas', 'spinner']" class="w-5 h-5 text-blue-500 animate-spin" />
            </div>
            <p v-else class="text-2xl font-bold text-gray-800 mt-1">
              {{ userIssues.filter(i => i.status_category === 'To Do').length }}
            </p>
          </div>
          <div class="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
            <font-awesome-icon icon="fa-solid fa-circle-dot" class="w-5 h-5 text-orange-400" />
          </div>
        </div>
      </div>

      <!-- Done -->
      <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Done</p>
            <div v-if="isLoading" class="mt-1">
              <font-awesome-icon :icon="['fas', 'spinner']" class="w-5 h-5 text-teal-600 animate-spin" />
            </div>
            <p v-else class="text-2xl font-bold text-gray-800 mt-1">
              {{ userIssues.filter(i => i.status_category === 'Done').length }}
            </p>
          </div>
          <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <font-awesome-icon icon="fa-solid fa-check-circle" class="w-5 h-5 text-green-500" />
          </div>
        </div>
      </div>

    </div>

    <!--  Issues Section  -->
    <div v-if="jiraStore.jiraConnected && !jiraStore.jiraExpired" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 w-full max-w-full mx-auto">

      <!-- Header -->
      <div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-300">
        <div>
          <h2 class="text-lg font-bold text-gray-900">My Issues</h2>
          <p class="text-xs text-gray-400">Jira · assigned to you</p>
        </div>
        <div class="flex items-center gap-2">

          <!-- Controls Row -->
          <div class="flex items-center gap-2 mb-4 text-sm text-gray-500">
            <span class="text-sm">Show</span>
            <select
                v-model="ticketsPerPage"
                @change="ticketPage = 1"
                class="border border-gray-200 rounded-lg px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
            <span class="text-sm">entries</span>

            <div class="ml-auto px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
              {{ tabIssues.length }} issues
            </div>
          </div>

        </div>
      </div>

      <!-- Tabs -->
      <div class="flex items-center gap-1 mb-5 bg-gray-50 rounded-xl p-1">
        <button @click="switchTab('inProgress')"
                :class="activeTab === 'inProgress' ? 'border border-primary-500 bg-primary-500/5 text-primary-500 hover:bg-primary-500/10' : 'text-gray-500 hover:text-gray-700'"
                class="flex items-center gap-1.5 flex-1 justify-center text-xs font-medium px-3 py-2 rounded-lg transition-all">
          <span>In Progress</span>
        </button>

        <button @click="switchTab('toDo')"
                :class="activeTab === 'toDo' ? 'border border-primary-500 bg-primary-500/5 text-primary-500 hover:bg-primary-500/10' : 'text-gray-500 hover:text-gray-700'"
                class="flex items-center gap-1.5 flex-1 justify-center text-xs font-medium px-3 py-2 rounded-lg transition-all">
          <span>To Do</span>
        </button>

        <button @click="switchTab('done')"
                :class="activeTab === 'done' ? 'border border-primary-500 bg-primary-500/5 text-primary-500 hover:bg-primary-500/10' : 'text-gray-500 hover:text-gray-700'"
                class="flex items-center gap-1.5 flex-1 justify-center text-xs font-medium px-3 py-2 rounded-lg transition-all">
          <span>Done</span>
        </button>
      </div>

      <!-- Issues List -->
      <div class="divide-y divide-gray-50 min-h-[200px] ">

        <div v-if="isLoading" class="flex flex-col items-center justify-center py-12 gap-3">
          <font-awesome-icon :icon="['fas', 'spinner']" class="w-6 h-6 text-blue-500 animate-spin" />
          <p class="text-sm text-gray-400">Loading issues...</p>
        </div>

        <div v-else-if="!isLoading && paginatedTabIssues.length === 0" class="text-center py-12">
          <p class="text-sm text-gray-400">No issues in this category</p>
        </div>

        <template v-else>
        <div
            v-for="issue in paginatedTabIssues"
            :key="issue.issue_id"
            @click="openIssueModal(issue.issue_key)"
            class="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group"
        >
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <img :src="issue.issue_type_icon" :alt="issue.issue_type" class="w-5 h-5 flex-shrink-0" />
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-800 truncate">{{ issue.summary }}</p>
              <p class="text-xs text-gray-400 mt-0.5">
                {{ issue.issue_key }}
                <span class="mx-1">·</span>
                {{ issue.project_name }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-4 ml-4 flex-shrink-0">
          <span class="text-xs text-gray-400 flex-shrink-0 ml-4 group-hover:text-gray-600 transition-colors">
           {{ issue.status_category }}
          </span>
          <button @click="openIssueModal(issue.issue_key)"
          class="p-2 rounded-lg text-gray-400 hover:text-[#2F6FC4] hover:bg-blue-50 transition-all duration-300">
            <font-awesome-icon :icon="['fas', 'eye']" class="w-4 h-4" />
          </button>

            <button
                @click.stop="openDeleteIssueModal(issue)"
                class="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
              <font-awesome-icon :icon="['fas', 'trash']" class="w-4 h-4" />
            </button>
        </div>
        </div>
        </template>
      </div>

      <!-- Pagination -->
      <div v-if="totalTicketPages > 1" class="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
      <p class="text-xs text-gray-400">
         Showing {{ (ticketPage - 1) * ticketsPerPage + 1 }}–{{ Math.min(ticketPage * ticketsPerPage, tabIssues.length) }}
         of {{ tabIssues.length }}
      </p>
      <div class="flex items-center gap-1 flex-wrap justify-end">
        <button @click="ticketPage--" :disabled="ticketPage === 1"
            class="p-2 rounded-lg border border-gray-200 bg-white hover:border-teal-300 disabled:opacity-40 transition-colors">
         <font-awesome-icon icon="fas fa-chevron-left" class="w-3 h-3 text-gray-500" />
        </button>
       <template v-for="(p, index) in paginationRange" :key="index">
         <span v-if="p === '...'" class="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
          <button v-else @click="ticketPage = p"
              :class="p === ticketPage
              ? 'bg-gradient-to-r from-[#2F6FC4] via-[#3F7FD2] to-[#4A88D8] text-white border-transparent'
              : 'bg-blue-50 text-[#2F6FC4] border-blue-200 hover:bg-blue-100 hover:border-[#4A88D8] hover:text-[#295FB0]'"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium border transition-all duration-300">
             {{ p }}
         </button>
         </template>
          <button @click="ticketPage++" :disabled="ticketPage === totalTicketPages"
            class="p-2 rounded-lg border border-gray-200 bg-white hover:border-teal-300 disabled:opacity-40 transition-colors">
          <font-awesome-icon icon="fas fa-chevron-right" class="w-3 h-3 text-gray-500" />
    </button>
  </div>
</div>
    </div>
    </div>
    </main>
  </div>

 <Teleport to="body">
  <div
    v-if="showCredentialsModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 w-full max-w-md mx-4">

      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-[#2F6FC4] via-[#4A88D8] to-[#5C97E3]
         hover:from-[#295FB0] hover:via-[#417FD0] hover:to-[#528CDB]  flex items-center justify-center">
            <font-awesome-icon
              :icon="['fab', 'jira']"
              class="w-6 h-6 text-white"
            />
          </div>

          <div>
            <h2 class="text-lg font-semibold text-gray-800">
              Connect to Jira
            </h2>
            <p class="text-sm text-gray-500 mt-1">
              Connect your Jira account with Sentra AI
            </p>
          </div>
        </div>

        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600"
        >
          <font-awesome-icon
            :icon="['fas', 'xmark']"
            class="w-4 h-4"
          />
        </button>
      </div>

      <!-- Form -->
      <div class="space-y-5">

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">
            Email <span class="text-red-500">*</span>
          </label>

          <input
            v-model="form.email"
            type="email"
            autocomplete="off"
            @input="errors.email = ''"
            placeholder="youremail@company.com"
            :class="errors.email
              ? 'border-red-300 focus:border-red-400'
              : 'border-gray-300 focus-within:border-blue-400'"
            class="w-full py-2 px-3 text-sm rounded-lg border-2 outline-none transition-all bg-white"
          />

          <p
            v-if="errors.email"
            class="mt-1 text-xs text-red-500"
          >
            {{ errors.email }}
          </p>
        </div>

        <!-- API Token -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">
            API Token <span class="text-red-500">*</span>
          </label>

          <div class="relative">
            <input
              v-model="form.apiToken"
              :type="showToken ? 'text' : 'password'"
              autocomplete="new-password"
              @input="errors.apiToken = ''"
              placeholder="••••••••••••••••"
              :class="errors.apiToken
                ? 'border-red-300 focus:border-red-400'
                : 'border-gray-300 focus-within:border-blue-400'"
              class="w-full py-2 px-3 pr-10 text-sm rounded-lg border-2 outline-none transition-all bg-white"
            />

            <button
              @click="showToken = !showToken"
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <font-awesome-icon
                :icon="['fas', showToken ? 'eye-slash' : 'eye']"
                class="w-4 h-4"
              />
            </button>
          </div>

          <p
            v-if="errors.apiToken"
            class="mt-1 text-xs text-red-500"
          >
            {{ errors.apiToken }}
          </p>

          <p
            v-if="showExpiredBanner"
            class="mt-1.5 text-xs text-red-500 flex items-center gap-1"
          >
            <font-awesome-icon
              :icon="['fas', 'triangle-exclamation']"
              class="w-3 h-3 flex-shrink-0"
            />
            API token expired — please enter a new token to reconnect.
          </p>

          <p class="mt-1.5 text-xs text-gray-400">
            Create Token:
            <a
              href="https://id.atlassian.com/manage-profile/security/api-tokens"
              target="_blank"
              class="text-[#0052CC] hover:underline"
            >
              Atlassian Account Settings ↗
            </a>
          </p>
        </div>

        <!-- Jira Domain -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1.5">
            Jira Domain <span class="text-red-500">*</span>
          </label>

          <div
            :class="errors.domain
              ? 'border-red-300 focus-within:border-red-400'
              : 'border-gray-300 focus-within:border-blue-400'"
            class="flex items-center border-2 rounded-lg overflow-hidden transition-all"
          >
            <span
              class="px-3 py-2 text-xs text-gray-400 bg-gray-50 border-r border-gray-200 whitespace-nowrap"
            >
              https://
            </span>

            <input
              v-model="form.domain"
              type="text"
              autocomplete="off"
              @input="errors.domain = ''"
              placeholder="yourcompany.atlassian.net"
              class="flex-1 py-2 px-3 text-sm outline-none bg-white"
            />
          </div>

          <p
            v-if="errors.domain"
            class="mt-1 text-xs text-red-500"
          >
            {{ errors.domain }}
          </p>
        </div>

      </div>

      <!-- Footer -->
      <div class="border-t border-gray-100 mt-6 pt-6">
        <button
          @click="connectJira"
          :disabled="isConnecting"
          class="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-[#2F6FC4] via-[#4A88D8] to-[#5C97E3]
         hover:from-[#295FB0] hover:via-[#417FD0] hover:to-[#528CDB]  disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          <font-awesome-icon
            :icon="isConnecting ? ['fas', 'spinner'] : ['fab', 'jira']"
            :class="isConnecting ? 'animate-spin' : ''"
            class="w-4 h-4"
          />

          {{ isConnecting ? 'Connecting...' : 'Connect Jira' }}
        </button>

        <p class="text-center text-xs text-gray-400 mt-4">
          <font-awesome-icon
            :icon="['fas', 'lock']"
            class="w-3 h-3 mr-1"
          />
          Your credentials are encrypted and never shared with third parties.
        </p>
      </div>

    </div>
  </div>
</Teleport>

  <BaseModal
      :is-open="isCreateModalOpen"
      title= "Create Issue"
      submit-text="Create"
      mode="form"
      :loading="isSubmitting"
      :disabled="!isFormValid || isSubmitting"
      @close="closeCreateModal"
      @save="submitCreateIssue"
  >
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <!-- Space -->
        <div class>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Space <span class="text-red-500">*</span>
          </label>
          <div class="relative">
          <select v-model="createIssueForm.project"
                  :disabled="isProjectsLoading"
                  @change="errors.project = ''"
                  :class="['w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2 bg-white',
                  isWorkTypesLoading ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : '',
                  errors.project ? 'border-red-400 focus:border-red-400'
                  : 'border-gray-300 focus:border-blue-400'
                  ]">
            <option value="">{{ isProjectsLoading ? 'Loading...' : 'Select Space' }}</option>
            <option v-for="s in projects" :key="s.id" :value="s">{{ s.name }}</option>
          </select>
          <div v-if="isProjectsLoading" class="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
            <font-awesome-icon :icon="['fas', 'circle-notch']" class="animate-spin h-4 w-4 text-teal-500" />
          </div>
          </div>
          <p v-if="errors.project" class="text-red-500 text-xs mt-1">{{ errors.project }}</p>
        </div>

        <!-- Work Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Work Type <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <select v-model="createIssueForm.work_type"
                    :disabled="isWorkTypesLoading"
                    @change="errors.work_type = ''"
                    :class="['w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2 bg-white',
              isWorkTypesLoading ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : '',
              errors.work_type ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-blue-400'
            ]">
              <option value="">{{ isWorkTypesLoading ? 'Loading...' : 'Select Work Type' }}</option>
              <option v-for="w in workTypes" :key="w.name" :value="w.name">{{ w.name }}</option>
            </select>
            <div v-if="isWorkTypesLoading" class="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
              <font-awesome-icon :icon="['fas', 'circle-notch']" class="animate-spin h-4 w-4 text-teal-500" />
            </div>
          </div>
          <p v-if="errors.work_type" class="text-red-500 text-xs mt-1">{{ errors.work_type }}</p>
        </div>

        <!-- Summary -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Summary<span class="text-red-500">*</span>
          </label>
          <input
              v-model="createIssueForm.summary"
              @input="errors.summary = ''"
              :class="['w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2 bg-white',
               errors.summary
             ? 'border-red-400 focus:border-red-400'
             : 'border-gray-300 focus:border-blue-400']"
              placeholder="Enter issue summary"
          />
          <p v-if="errors.summary" class="text-red-500 text-xs mt-1">{{ errors.summary }}</p>
        </div>

        <!-- Reporter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Reporter  <span class="text-red-500">*</span>
          </label>
          <select v-model="createIssueForm.reporter"
                  @change="errors.reporter=''"
                  :class="['w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2 border-gray-300 focus:border-blue-400 bg-white',errors.reporter
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-gray-300 focus:border-blue-400'
                  ]">
            <option value="">Select Reporter</option>
            <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
          </select>
          <p v-if="errors.reporter" class="text-red-500 text-xs mt-1">{{ errors.reporter }}</p>
        </div>

        <!-- Assignee -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
          <div class="relative">
            <select v-model="createIssueForm.assignee"
                    :disabled="isAssigneesLoading"
                    class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2 border-gray-300 focus:border-blue-400 bg-white">
              <option value="">{{ isAssigneesLoading ? 'Loading...' : 'Select Assignee'}}</option>
              <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
            </select>
            <div v-if="isAssigneesLoading" class="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
              <font-awesome-icon :icon="['fas', 'circle-notch']" class="animate-spin h-4 w-4 text-teal-500" />
            </div>
          </div>
        </div>

        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <div class="relative">
            <select v-model="createIssueForm.status"
                    :disabled="isStatusesLoading"
                    class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2  border-gray-300 focus:border-blue-400 bg-white">
              <option value="">{{ isStatusesLoading ? 'Loading...' : 'Select Status'}}</option>
              <option v-for="s in statuses" :key="s.name" :value="s.name">{{ s.name }}</option>
            </select>
            <div v-if="isStatusesLoading" class="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
              <font-awesome-icon :icon="['fas', 'circle-notch']" class="animate-spin h-4 w-4 text-teal-500" />
            </div>
          </div>
        </div>

        <!-- Sprint -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Sprint</label>
          <div class="relative">
            <select v-model="createIssueForm.sprint"
                    :disabled="isSprintsLoading"
                    class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2  border-gray-300 focus:border-blue-400 bg-white">
              <option value="">{{ isSprintsLoading ? 'Loading...' : 'Select Sprint'}}</option>
              <option v-for="s in sprints" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
            <div v-if="isSprintsLoading" class="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
              <font-awesome-icon :icon="['fas', 'circle-notch']" class="animate-spin h-4 w-4 text-teal-500" />
            </div>
          </div>
        </div>

        <!-- Start Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input
              v-model="createIssueForm.start_date"
              type="date"
              class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2  border-gray-300 focus:border-blue-400 bg-white">
        </div>

        <!-- Due Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
          <input
              v-model="createIssueForm.due_date"
              type="date"
              class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2  border-gray-300 focus:border-blue-400 bg-white"
          />
        </div>

        <!-- Teams -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Teams</label>
          <select v-model="createIssueForm.teams"
                  class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2  border-gray-300 focus:border-blue-400 bg-white">
            <option value="" disabled selected>Select Team</option>
            <option v-for="t in teams" :key="String(t.teamId ?? t.id)" :value="t.teamId ?? t.id">{{ t.displayName ?? t.name }}</option>
          </select>
        </div>


        <!-- Issue Color  -->
        <div v-if="createIssueForm.work_type?.toLowerCase() === 'epic'" class="relative" ref="colorDropdownRef">
          <label class="block text-sm font-medium text-gray-700 mb-2">Issue Color</label>

          <!-- Trigger -->
          <button
              type="button"
              @click="showColorDropdown = !showColorDropdown"
              class="flex items-center gap-2 py-2 px-3 rounded-lg border-2  border-gray-300 focus:border-blue-400 bg-white transition-all w-full"
          >
          <span
              v-if="createIssueForm.issue_color"
              class="w-4 h-4 rounded-sm flex-shrink-0"
              :style="{ backgroundColor: issueColors.find(c => c.value === createIssueForm.issue_color)?.hex }"
          />
            <span v-else class="w-4 h-4 rounded-sm bg-gray-200 flex-shrink-0" />
            <span class="text-sm text-gray-700">
             {{ issueColors.find(c => c.value === createIssueForm.issue_color)?.label || 'Select color'}}
            </span>
            <font-awesome-icon :icon="['fas', 'chevron-down']" class="w-3 h-3 text-gray-400 ml-auto" />
          </button>

          <!-- Dropdown -->
          <div
              v-if="showColorDropdown"
              class="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-md py-1"
          >
            <button
                v-for="color in issueColors"
                :key="color.value"
                type="button"
                @click="createIssueForm.issue_color = color.value; showColorDropdown = false"
                class="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-gray-50 transition-colors"
                :class="createIssueForm.issue_color === color.value ? 'bg-gray-50' : ''"
            >
              <span class="w-4 h-4 rounded-sm flex-shrink-0" :style="{ backgroundColor: color.hex }" />
              <span class="text-sm text-gray-700">{{ color.label }}</span>
              <font-awesome-icon
                  v-if="createIssueForm.issue_color === color.value"
                  :icon="['fas', 'check']"
                  class="w-3 h-3 text-accent-3 ml-auto"
              />
            </button>
          </div>
        </div>

        <!-- Description -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
              v-model="createIssueForm.description"
              rows="3"
              class="w-full py-2 px-3 rounded-lg transition-all outline-none focus:ring-0 border-2 border-gray-300 focus:border-blue-400 bg-white"
              placeholder="Enter issue description"
          />
        </div>

        <!-- Attachments -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">Attachments</label>

          <!-- Drop Zone -->
          <div
              class="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 ] transition-colors"
              @dragover.prevent
              @drop.prevent="handleFileDrop"
              @click="($refs.fileInput as HTMLInputElement).click()"
          >
            <input ref="fileInput" type="file" multiple class="hidden" @change="handleFileSelect" />
            <p class="text-sm text-gray-400">Drop files here or<span class="text-primary"> click to browse</span></p>
          </div>

          <!-- File List -->
          <ul v-if="createIssueForm.attachment?.length" class="mt-3 space-y-2">
            <li
                v-for="(file, index) in createIssueForm.attachment"
                :key="index"
                class="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 text-sm"
            >
              <span class="text-gray-700 truncate max-w-xs">{{ file.name }}</span>
              <button
                  type="button"
                  class="text-gray-400 hover:text-red-500 transition-colors ml-2"
                  @click.stop="removeAttachment(index)"
              >
                <font-awesome-icon :icon="['fas', 'xmark']" class="w-4 h-4 text-gray-600" />
              </button>
            </li>
          </ul>
        </div>

      </div>
    </div>
  </BaseModal>

<!-- BASE VIEW MODAL-->
  <BaseDetailModal
      :is-open="isIssueModalOpen"
      title="Issue Details"
      :item-id="selectedIssue?.issue_id"
      @close="isIssueModalOpen = false"
  >

    <!-- Loading -->
    <div v-if="isModalLoading" class="flex flex-col items-center justify-center py-16 gap-3">
      <font-awesome-icon :icon="['fas', 'spinner']" class="w-8 h-8 text-blue-500 animate-spin" />
      <p class="text-sm text-gray-400">Loading issue details...</p>
    </div>

    <div v-else-if="selectedIssue" class="p-0">

      <!-- Header -->
      <div class="flex items-start justify-between gap-3 mb-5">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-md bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <img
                :src="selectedIssue.issue_type_icon"
                :alt="selectedIssue.issue_type"
                class="w-5 h-5"
            />
          </div>
          <div>
            <p class="text-[17px] font-medium text-gray-900 leading-snug">
              {{ selectedIssue.summary }}
            </p>
            <p class="text-xs text-gray-400 mt-1 font-mono">
              {{ selectedIssue.issue_key }}
            </p>
          </div>
        </div>

        <span class="flex-shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full
                   bg-orange-50 text-buttonBackground border border-buttonBackground uppercase tracking-wide whitespace-nowrap">
        {{ selectedIssue.status }}
      </span>
      </div>

      <!-- Description -->
      <div class="mb-5">
        <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1.5">
          Description
        </label>
        <div class="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-600 leading-relaxed">
          {{ extractDescription(selectedIssue.description) }}
        </div>
      </div>

      <!-- Details Grid -->
      <div class="grid grid-cols-3 gap-x-6 gap-y-4 border-t border-gray-100 pt-5">

        <!-- Project -->
        <div>
          <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
            Project
          </label>
          <div class="flex items-center gap-1.5 text-sm text-gray-800">
            <font-awesome-icon :icon="['fas', 'folder']" class="w-3.5 h-3.5 text-gray-400" />
            {{ selectedIssue.project_name }}
          </div>
        </div>

        <!-- Priority -->
        <div>
        <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
          Priority
        </label>
        <span
            v-if="selectedIssue.priority"
            class="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded border"
            :class="priorityConfig(selectedIssue.priority).classes"
        >
        {{ selectedIssue.priority }}
        </span>
        </div>

        <!-- Labels -->
        <div>
          <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
            Labels
          </label>
          <div v-if="selectedIssue.labels?.length" class="flex flex-wrap gap-1.5">
          <span
            v-for="label in selectedIssue.labels"
            :key="label"
            class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded
            bg-gray-100 text-gray-600 border border-gray-200">
            <font-awesome-icon :icon="['fas', 'tag']" class="w-3 h-3" />
            {{ label }}
          </span>
          </div>
          <span v-else class="text-sm text-gray-400">None</span>
        </div>

        <!-- Assignee -->
        <div>
          <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
            Assignee
          </label>
          <div class="flex items-center gap-2">
            <img
                v-if="selectedIssue.assignee"
                :src="selectedIssue.assignee.avatar"
                :alt="selectedIssue.assignee.name"
                class="w-6 h-6 rounded-full object-cover flex-shrink-0"
            />
            <span class="text-sm text-gray-800">
            {{ selectedIssue.assignee?.name || 'Unassigned'}}
          </span>
          </div>
        </div>

        <!-- Reporter -->
        <div>
          <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
            Reporter
          </label>
          <div class="flex items-center gap-2">
            <img
                v-if="selectedIssue.reporter"
                :src="selectedIssue.reporter.avatar"
                :alt="selectedIssue.reporter.name"
                class="w-6 h-6 rounded-full object-cover flex-shrink-0"
            />
            <span class="text-sm text-gray-800">
            {{ selectedIssue.reporter?.name || 'N/A' }}
            </span>
          </div>
        </div>

        <!-- Created -->
        <div>
          <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
            Due Date
          </label>
          <div class="flex items-center gap-1.5 text-sm text-gray-800">
            <font-awesome-icon :icon="['far', 'calendar']" class="w-3.5 h-3.5 text-gray-400" />
            {{ selectedIssue.due_date || 'N/A' }}
          </div>
        </div>

        <!-- SubTasks -->
        <div class="col-span-3" v-if="selectedIssue.subtasks?.length">
          <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
            Subtasks
          </label>
          <div class="grid grid-cols-2 xl:grid-cols-3 gap-2">
            <div
                v-for="subtask in selectedIssue.subtasks"
                :key="subtask.issue_key"
                class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 min-w-0"
            >
              <img
                  :src="subtask.issue_type_icon"
                  :alt="subtask.issue_type"
                  class="w-4 h-4 flex-shrink-0"
              />
              <span class="text-xs font-mono text-gray-400 flex-shrink-0">
              {{ subtask.issue_key }}
               </span>
              <span class="text-sm text-gray-700 truncate">
              {{ subtask.summary }}
              </span>
              <span class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 flex-shrink-0">
              {{ subtask.status }}
              </span>
            </div>
          </div>
        </div>

        <!-- Source -->
        <div>
          <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
            Source
          </label>
          <span class="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded border
               bg-pink-50 text-pink-700 border-pink-200">
              <font-awesome-icon :icon="['fas', 'circle-nodes']" class="w-3 h-3" />
             {{ selectedIssue.source?.name || 'N/A' }}
          </span>
        </div>

         <!-- Attachments -->
        <div class="col-span-3">
          <label class="block text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
            Attachments
          </label>

          <div v-if="selectedIssue.attachments?.length" class="grid grid-cols-3 xl:grid-cols-3 gap-2">

            <a
                v-for="attachment in selectedIssue.attachments"
                :key="attachment.id"
                :href="(jiraStore.attachmentUrls as Record<string, string>)[attachment.id]"
                target="_blank"
                :download="!attachment.mime_type.startsWith('image/') ? attachment.filename : null"
                class="flex items-center justify-between p-2 rounded-lg border border-gray-100 bg-gray-50
                hover:bg-gray-100 transition min-w-0"
            >

              <!-- filename -->
              <span class="text-xs text-gray-700 truncate pr-2 flex-1">
              {{ attachment.filename }}
               </span>

              <!-- size + icon -->
              <div class="flex items-center gap-2 flex-shrink-0">
              <span class="text-xs text-gray-400">
               {{ (attachment.size / 1024).toFixed(1) }}KB
              </span>

                <font-awesome-icon
                    :icon="['fas', 'arrow-up-right-from-square']"
                    class="w-3 h-3 text-gray-400"
                />
              </div>
            </a>
          </div>

          <span v-else class="text-sm text-gray-400">
          No Attachments
          </span>
        </div>
      </div>
    </div>
  </BaseDetailModal>

  <!-- Delete Jira Issue Confirmation Modal -->
  <BaseModal
      :is-open="showDeleteIssueConfirm"
      title="Delete Issue"
      :item-id="issueToDelete?.issue_id"
      submit-text="Delete Issue"
      mode="delete"
      :loading="isDeleting"
      :disabled="isDeleting"
      @close="closeDeleteIssueModal"
      @save="performDeleteIssue"
  >
    <!-- Status Message -->
    <div
        v-if="deleteStatusMessage.type && deleteStatusMessage.messages.length"
        :class="deleteStatusMessage.type === 'success'
        ? 'bg-green-50 border border-green-200 text-green-800'
        : 'bg-red-50 border border-red-200 text-red-800'"
        class="mb-6 p-4 rounded-xl flex items-start gap-2"
    >
      <font-awesome-icon
          v-if="deleteStatusMessage.type === 'success'"
          icon="fa-solid fa-check-circle"
          class="w-5 h-5 mt-0.5 text-green-600"
      />
      <font-awesome-icon
          v-else
          icon="fa-solid fa-times-circle"
          class="w-5 h-5 mt-0.5 text-red-600"
      />
      <p class="text-sm">{{ deleteStatusMessage.messages[0] }}</p>
    </div>

    <!-- Body -->
    <div class="text-center">
      <p class="text-gray-600 mb-4">
        Are you sure you want to delete this
        <span class="font-semibold font-mono">{{ issueToDelete?.issue_key }}</span>?
      </p>
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <div class="flex items-start">
          <font-awesome-icon
              icon="fa-solid fa-exclamation-triangle"
              class="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0"
          />
          <p class="text-sm text-yellow-700">
            This action is permanent and cannot be undone. The issue will be removed from Jira entirely.
          </p>

        </div>

      </div>

      <div v-if="issueToDelete?.subtasks?.length">
        <input type="checkbox" v-model="deleteSubtasks" />
        <label class="px-2 text-sm">Delete subtasks as well</label>
      </div>
    </div>
  </BaseModal>

  <!-- Toast Notification -->
  <Teleport to="body">
  <Transition name="toast">
    <div v-if="toastMessage.title" class="fixed top-4 right-4 z-50 max-w-md">
      <div
          :class="{
          'bg-green-50 border-green-200': toastMessage.type === 'success',
          'bg-red-50 border-red-200': toastMessage.type === 'error',
          'bg-blue-50 border-blue-200': toastMessage.type === 'info'
        }"
          class="p-4 rounded-xl border shadow-lg"
      >
        <div class="flex items-start gap-3">
          <div :class="{
            'text-green-600': toastMessage.type === 'success',
            'text-red-600': toastMessage.type === 'error',
            'text-blue-600': toastMessage.type === 'info'
          }">
            <font-awesome-icon
                v-if="toastMessage.type === 'success'"
                icon="fa-solid fa-check-circle"
                class="w-6 h-6"
            />
            <font-awesome-icon
                v-else-if="toastMessage.type === 'error'"
                icon="fa-solid fa-times-circle"
                class="w-6 h-6"
            />
            <font-awesome-icon
                v-else-if="toastMessage.type === 'info'"
                icon="fa-solid fa-info-circle"
                class="w-6 h-6"
            />
          </div>
          <div class="flex-1">
            <h4 :class="{
              'text-green-800': toastMessage.type === 'success',
              'text-red-800': toastMessage.type === 'error',
              'text-blue-800': toastMessage.type === 'info'
            }" class="font-semibold text-sm">{{ toastMessage.title }}</h4>
            <ul class="mt-1 text-sm" :class="{
              'text-green-700': toastMessage.type === 'success',
              'text-red-700': toastMessage.type === 'error',
              'text-blue-700': toastMessage.type === 'info'
            }">
              <li v-for="(msg, idx) in toastMessage.messages" :key="idx">{{ msg }}</li>
            </ul>
          </div>
          <button @click="toastMessage.title = ''" class="text-gray-400 hover:text-gray-600">
            <font-awesome-icon icon="fa-solid fa-times" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </Transition>
  </Teleport>
  </div>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue';
import AdminSidebar from "../../components/adminSidebar.vue"
import TopHeader from '@/components/header.vue'
import { useJiraConnect } from '@/composables/Admin/useJira.ts';
import BaseModal from '@/components/baseModal.vue';
import Multiselect from '@vueform/multiselect'
import BaseDetailModal from '@/components/baseDetailModal.vue';
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

const {
  // State
  form,
  errors,
  isConnecting,
  isLoading,
  showToken,
  totalTicketPages,
  ticketsPerPage,
  ticketPage,
  jiraUser,
  projects,
  workTypes,
  statuses,
  priorities,
  users,
  sprints,
  teams,
  activeTab,
  tabIssues,
  isModalLoading,
  selectedIssue,
  isIssueModalOpen,
  createIssueForm,
  colorDropdownRef,
  paginatedTabIssues,
  isSubmitting,
  isFormValid,
  search,
  submitCreateIssue,
  showToast,
  showExpiredBanner,
  IMAGE_EXTENSIONS,
  showColorDropdown,
  counts,
  API_BASE,
  isWorkTypesLoading,
  isProjectsLoading,
  isAssigneesLoading,
  isStatusesLoading,
  showCredentialsModal,
  handleConnectAndClose,
  isSprintsLoading,
  jiraExpired,
  userIssues,
    issueColors,
  openCreateModal,
  isCreateModalOpen,
  closeCreateModal,
  connectJira,
  showDeleteIssueConfirm,
  issueToDelete,
    assignees,
  isDeleting,
  toastMessage,
  deleteStatusMessage,
  issueSearchQuery,
  showIssueDropdown,
  openDeleteIssueModal,
  closeDeleteIssueModal,
    deleteSubtasks,
  performDeleteIssue,
  priorityConfig,
  formatDate,
  fetchSingleIssue,
  chatbotProject,
  agentProject,
  isSavingChatbot,
  isSavingAgent,
  saveDefaultProject,
  paginationRange,
  openIssueModal,
  extractDescription,
  handleFileDrop,
  handleFileSelect,
  removeAttachment,
  getAuthToken,
  switchTab,
  fetchUserIssues,
  openCredentialsModal,
  jiraStore,
  closeModal,
} = useJiraConnect();
</script>

<style scoped>
input::-ms-reveal,
input::-ms-clear {
  display: none;
}
.step-fade-enter-active,
.step-fade-leave-active {
  transition: all 0.25s ease;
}
.step-fade-enter-from {
  opacity: 0;
  transform: translateX(12px);
}
.step-fade-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>