import { reactive, ref, onMounted } from 'vue'
import axios from 'axios'

export function useCareers() {
    const isModalOpen   = ref(false)
    const submitSuccess = ref(false)
    const isDragging    = ref(false)
    const fileName      = ref('No file chosen')
    const fileUploaded  = ref(false)
    const fileInput     = ref(null)
    const cardsVisible  = ref(false)
    const isSubmitting  = ref(false)
    const submitError   = ref('')
    const savedScrollPos = ref(0)

    const formData = reactive({
        name: '',
        email: '',
        contact: '',
        position: '',
        coverLetter: '',
        file: null,
    })

    onMounted(() => {
        requestAnimationFrame(() => {
            cardsVisible.value = true
        })
    })

    const openModal = (defaultPosition = '') => {
        formData.position    = defaultPosition
        savedScrollPos.value = window.scrollY
        isModalOpen.value    = true
        submitSuccess.value  = false

        document.body.style.position = 'fixed'
        document.body.style.top      = `-${savedScrollPos.value}px`
        document.body.style.left     = '0'
        document.body.style.right    = '0'
        document.body.style.width    = '100%'
    }

    const closeModal = () => {
        isModalOpen.value = false
        resetForm()

        document.body.style.position = ''
        document.body.style.top      = ''
        document.body.style.left     = ''
        document.body.style.right    = ''
        document.body.style.width    = ''
        window.scrollTo(0, savedScrollPos.value)
    }

    const triggerFileSelect = () => {
        fileInput.value?.click()
    }

    const processUploadedFile = (uploadedFile) => {
        if (!uploadedFile) return
        if (uploadedFile.size > 5 * 1024 * 1024) {
            alert('File size exceeds 5MB limit.')
            return
        }
        formData.file      = uploadedFile
        fileName.value     = uploadedFile.name
        fileUploaded.value = true
    }

    const handleFileSelect = (event) => {
        processUploadedFile(event.target.files[0])
    }

    const handleFileDrop = (event) => {
        isDragging.value = false
        processUploadedFile(event.dataTransfer.files[0])
    }

    const handleSubmit = async () => {
        if (!formData.file) {
            alert('Please upload your CV before submitting.')
            return
        }

        isSubmitting.value = true
        submitError.value  = ''

        try {
            const payload = new FormData()
            payload.append('full_name',        formData.name)
            payload.append('email',            formData.email)
            payload.append('phone',            formData.contact)
            payload.append('desired_position', formData.position)
            payload.append('cv_file',          formData.file)
            if (formData.coverLetter) {
                payload.append('cover_letter', formData.coverLetter)
            }

            await axios.post('/api/cv_management/submit-cv/', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })

            submitSuccess.value = true
        } catch (error) {
            submitError.value = error.response?.data
                ? Object.values(error.response.data).flat().join(' ')
                : 'Something went wrong. Please try again.'
        } finally {
            isSubmitting.value = false
        }
    }

    const resetForm = () => {
        formData.name        = ''
        formData.email       = ''
        formData.contact     = ''
        formData.position    = ''
        formData.coverLetter = ''
        formData.file        = null
        fileName.value       = 'No file chosen'
        fileUploaded.value   = false
        if (fileInput.value) fileInput.value.value = ''
    }

    return {
        isModalOpen, submitSuccess, isDragging,
        fileName, fileUploaded, fileInput,
        cardsVisible, isSubmitting, submitError,
        formData,
        openModal, closeModal,
        triggerFileSelect, handleFileSelect, handleFileDrop,
        handleSubmit, resetForm,
    }
}