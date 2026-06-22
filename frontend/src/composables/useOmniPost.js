// useOmniPost.js

export function useOmniPost() {
    // Mesh background style
    const meshStyle = {
        background: `
      radial-gradient(circle at 18% 20%, rgba(167, 139, 250, 0.35) 0%, transparent 42%),
      radial-gradient(circle at 82% 18%, rgba(236, 72, 153, 0.22) 0%, transparent 40%),
      radial-gradient(circle at 50% 80%, rgba(99, 102, 241, 0.12) 0%, transparent 45%)
    `
    }

    // Platform modules data
    const modules = [
        { name: 'Dashboard', icon: 'fas fa-gauge-high', href: '#dashboard' },
        { name: 'AI Generator', icon: 'fas fa-wand-magic-sparkles', href: '#generator' },
        { name: 'Approvals', icon: 'fas fa-clipboard-check', href: '#approval' },
        { name: 'Scheduler', icon: 'fas fa-calendar-check', href: '#scheduler' },
        { name: 'Bulk Upload', icon: 'fas fa-file-csv', href: '#bulk' },
        { name: 'Team & Roles', icon: 'fas fa-users-gear', href: '#team' },
        { name: 'Social Previews', icon: 'fab fa-facebook', href: '#social-feed' },
        { name: 'How It Works', icon: 'fas fa-route', href: '#how-it-works' }
    ]

    // Social platforms data
    const platforms = [
        {
            name: 'Facebook',
            icon: 'fab fa-facebook',
            image: new URL('../assets/svg/omnipost-post-facebook.svg', import.meta.url).href
        },
        {
            name: 'Instagram',
            icon: 'fab fa-instagram',
            image: new URL('../assets/svg/omnipost-post-instagram.svg', import.meta.url).href
        },
        {
            name: 'LinkedIn',
            icon: 'fab fa-linkedin',
            image: new URL('../assets/svg/omnipost-post-linkedin.svg', import.meta.url).href
        }
    ]

    // How it works steps
    const steps = [
        { title: 'Generate or bulk-import', description: 'Use AI for single posts or CSV batches to seed campaigns at scale.' },
        { title: 'Submit for approval', description: 'Creators hand off drafts; approvers review before anything goes live.' },
        { title: 'Schedule or publish', description: 'Approved content posts automatically to Twitter, Facebook, and LinkedIn.' }
    ]

    // Capabilities data
    const capabilities = [
        { title: 'AI Post Generator', icon: 'fas fa-wand-magic-sparkles', description: 'Platform-tailored copy and hashtags for Twitter, LinkedIn, and Facebook in seconds.' },
        { title: 'AI Image Creation', icon: 'fas fa-image', description: 'Generate matching visuals from your post content — ready for social feeds.' },
        { title: 'Approval Workflow', icon: 'fas fa-clipboard-check', description: 'Creators submit drafts; approvers review, approve, or reject with audit trail.' },
        { title: 'Smart Scheduler', icon: 'fas fa-calendar-check', description: 'Schedule approved posts and publish automatically when the time is right.' },
        { title: 'Bulk Upload', icon: 'fas fa-file-csv', description: 'Import CSV batches, generate at scale, and manage large campaigns efficiently.' },
        { title: 'Team & Roles', icon: 'fas fa-users-gear', description: 'Owners manage users, roles, and connected social accounts in one place.' }
    ]

    return {
        modules,
        platforms,
        steps,
        capabilities,
        meshStyle
    }
}