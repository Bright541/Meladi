interface UserData {
    username: string;
    email: string;
    profilePicture: string | null;
    backgroundColor: string | null;
    theme: string;
}

class ProfileManager {
    private profilePreview: HTMLElement;
    private fileInput: HTMLInputElement;

    constructor() {
        this.profilePreview = document.getElementById('profilePreview') as HTMLElement;
        this.fileInput = document.getElementById('profileFileInput') as HTMLInputElement;
        this.initializeEventListeners();
    }

    private initializeEventListeners(): void {
        this.fileInput.addEventListener('change', (e: Event) => this.handleFileUpload(e));
        document.addEventListener('DOMContentLoaded', () => this.initializeProfile());
    }

    private handleFileUpload(event: Event): void {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            const imageData = e.target?.result as string;
            if (!imageData) return;

            // Save image data immediately to both storages
            localStorage.setItem('userProfileImage', imageData);
            const userData = JSON.parse(localStorage.getItem('currentUser') || '{}') as UserData;
            userData.profilePicture = imageData;
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            // Update preview
            this.updateProfilePreview(imageData);
        };
        reader.readAsDataURL(file);
    }

    private updateProfilePreview(imageData: string): void {
        this.profilePreview.style.background = 'none';
        this.profilePreview.innerHTML = `
            <img 
                src="${imageData}" 
                alt="Profile" 
                style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"
            >
            <div class="upload-overlay" onclick="document.getElementById('profileFileInput').click()">
                <i class="fas fa-camera"></i> Change Picture
            </div>
        `;
    }

    public saveChanges(): void {
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}') as UserData;
        const imageData = localStorage.getItem('userProfileImage');

        if (imageData) {
            // Update user data with new image
            userData.profilePicture = imageData;
            
            // Update users array
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex((u: UserData) => u.email === userData.email);
            if (userIndex !== -1) {
                users[userIndex].profilePicture = imageData;
                localStorage.setItem('users', JSON.stringify(users));
            }
        }

        // Save final user data
        localStorage.setItem('currentUser', JSON.stringify(userData));

        // Redirect to main page
        window.location.href = 'true meladi.html';
    }

    private initializeProfile(): void {
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}') as UserData;
        if (!userData.email) {
            window.location.href = 'login.html';
            return;
        }

        const savedImage = userData.profilePicture;
        if (savedImage) {
            this.updateProfilePreview(savedImage);
        }
    }
}

// Initialize profile manager
const profileManager = new ProfileManager();

// Add to window object to make it accessible from HTML
(window as any).profileManager = profileManager; 