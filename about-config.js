/**
 * ABOUT PAGE CONFIGURATION
 * Edit this file to customize your About page information
 * Then include it in index.html: <script src="about-config.js"></script>
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // PERSONAL INFORMATION
    // ==========================================
    
    const aboutConfig = {
        // Your full name
        name: "Vipul Meshram",
        
        // Your professional title
        title: "Pursuing B.Tech in Mechanical Engineering",
        
        
        // Profile image URL (can be a local file or external URL)
        // To use your own image:
        // 1. Place your image in the same folder (e.g., "profile.jpg")
        // 2. Change the path below to "./profile.jpg"
        profileImage: "VIPUL.JPG",
        
        // About Me description (can use HTML for formatting)
        description: `
            Welcome to the AeroTrack! This application was developed to provide 
            a reliable, offline-capable solution for managing aircraft parts inventory. 
            <br><br>
            Built with clean code principles and aviation industry standards in mind, this tool 
            demonstrates professional engineering practices suitable for aerospace applications.
        `,
        
        // Contact Information
        email: "vipulmeshramv20@gmail.com",
        github: "github.com/vipulmesh",
        linkedin: "linkedin.com/in/vipul-meshram-83645732a",
        
        // Skills (add or remove as needed)
        skills: [
            "HTML5",
            "CSS3",
            "JavaScript (ES6+)",
            "Responsive Design",
            "LocalStorage API",
            "WebView Development",
            "UI/UX Design",
            "Aviation Systems"
        ]
    };
    
    // ==========================================
    // UPDATE THE PAGE (Don't edit below unless you know what you're doing)
    // ==========================================
    
    // Update profile information
    const nameElement = document.getElementById('developerName');
    const titleElement = document.getElementById('developerTitle');
    const profileImageElement = document.getElementById('profileImage');
    const descriptionElement = document.getElementById('aboutDescription');
    
    if (nameElement) nameElement.textContent = aboutConfig.name;
    if (titleElement) titleElement.textContent = aboutConfig.title;
    if (profileImageElement) profileImageElement.src = aboutConfig.profileImage;
    if (descriptionElement) descriptionElement.innerHTML = aboutConfig.description;
    
    // Update contact information
    const emailElement = document.getElementById('contactEmail');
    const githubElement = document.getElementById('contactGithub');
    const linkedinElement = document.getElementById('contactLinkedin');
    
    if (emailElement) {
        emailElement.textContent = aboutConfig.email;
        emailElement.href = `mailto:${aboutConfig.email}`;
    }
    
    if (githubElement) {
        githubElement.textContent = aboutConfig.github;
        githubElement.href = `https://${aboutConfig.github}`;
    }
    
    if (linkedinElement) {
        linkedinElement.textContent = aboutConfig.linkedin;
        linkedinElement.href = `https://${aboutConfig.linkedin}`;
    }
    
    // Update skills
    const skillsGrid = document.getElementById('skillsGrid');
    if (skillsGrid && aboutConfig.skills) {
        skillsGrid.innerHTML = '';
        aboutConfig.skills.forEach(skill => {
            const skillTag = document.createElement('span');
            skillTag.className = 'skill-tag';
            skillTag.textContent = skill;
            skillsGrid.appendChild(skillTag);
        });
    }
    
    console.log('About page configuration loaded successfully');
});