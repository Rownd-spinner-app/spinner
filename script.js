// Team member class to store member data
class TeamMember {
    constructor(name, photoUrl) {
        this.id = Date.now();
        this.name = name;
        this.photoUrl = photoUrl;
        this.isHidden = false;
    }
}

// State management
let teamMembers = [];
let isSpinning = false;
let currentRotation = 0;

// DOM Elements
const spinner = document.querySelector('.spinner');
const memberNameInput = document.getElementById('member-name');
const memberPhotoInput = document.getElementById('member-photo');
const addMemberButton = document.getElementById('add-member');
const teamList = document.getElementById('team-list');
const winnerAnnouncement = document.getElementById('winner-announcement');

// Sound effects
const spinSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
spinSound.volume = 0.2; // Lower initial spin sound

// Ticker sound during spin
const tickSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3');
tickSound.playbackRate = 3;
tickSound.volume = 0.15;
tickSound.loop = true;

// More cheerful celebration sound
const celebrationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3');
celebrationSound.volume = 0.7;

// Event Listeners
addMemberButton.addEventListener('click', addTeamMember);

// Add team member
function addTeamMember() {
    const name = memberNameInput.value.trim();
    const photoFile = memberPhotoInput.files[0];

    if (!name) {
        alert('Please enter a name');
        return;
    }

    // Create a proper URL for the uploaded file that will work
    let photoUrl = null;
    if (photoFile) {
        photoUrl = URL.createObjectURL(photoFile);
    }
    
    const member = new TeamMember(name, photoUrl);
    teamMembers.push(member);

    // Clear inputs
    memberNameInput.value = '';
    memberPhotoInput.value = '';

    // Update UI
    updateTeamList();
    updateSpinner();
}

// Function to convert degrees to radians
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

// Update spinner segments
function updateSpinner() {
    spinner.innerHTML = ''; // Clear previous segments and button

    // No need to add a pointer here as it's already in the HTML
    // The fixed triangle at the top comes from the HTML structure

    const activeMembers = teamMembers.filter(m => !m.isHidden);
    console.log(`Updating spinner with ${activeMembers.length} active members:`, 
                activeMembers.map(m => m.name).join(', '));
    
    const numSegments = activeMembers.length;

    if (numSegments === 0) {
        const placeholder = document.createElement('div');
        placeholder.textContent = 'Add members to spin!';
        placeholder.style.textAlign = 'center';
        placeholder.style.padding = '2rem';
        placeholder.style.color = 'var(--rownd-purple-dark)';
        spinner.appendChild(placeholder);
        createSpinButton(true);
        return;
    }

    const segmentAngle = 360 / numSegments;

    // Define alternating light and dark colors
    const lightColors = [
        'var(--rownd-purple-light)',
        'var(--rownd-purple-extra-light)',
        'var(--rownd-purple-lighter)'
    ];
    const darkColors = [
        'var(--rownd-purple)',
        'var(--rownd-purple-dark)',
        'var(--rownd-purple-extra-dark)'
    ];

    // Create alternating color array based on number of segments
    const segmentColors = [];
    for (let i = 0; i < numSegments; i++) {
        if (i % 2 === 0) {
            segmentColors.push(darkColors[i % darkColors.length]);
        } else {
            segmentColors.push(lightColors[i % lightColors.length]);
        }
    }

    activeMembers.forEach((member, index) => {
        const segment = document.createElement('div');
        segment.className = 'spinner-segment';

        // Calculate the rotation for this segment
        const rotation = segmentAngle * index;
        
        // Create and style content container
        const content = document.createElement('div');
        content.className = 'segment-content';
        content.style.background = segmentColors[index];
        
        // Set the rotation for this segment
        segment.style.transform = `rotate(${rotation}deg)`;

        // Calculate the clip path for a perfect pie slice
        const startAngle = -90; // Start from top
        const endAngle = startAngle + segmentAngle;
        
        // Create points for the clip path with more points for smoother edges
        const points = [];
        points.push('50% 50%'); // Center point
        
        // Add more points around the arc for smoother curve
        const numPoints = 100; // Increased number of points for smoother edges
        for (let i = 0; i <= numPoints; i++) {
            const angle = startAngle + (i / numPoints) * segmentAngle;
            const angleRad = degToRad(angle);
            // Add a tiny bit of overlap (0.01) to prevent gaps
            const radius = 50.01;
            const x = 50 + radius * Math.cos(angleRad);
            const y = 50 + radius * Math.sin(angleRad);
            points.push(`${x}% ${y}%`);
        }
        
        content.style.clipPath = `polygon(${points.join(', ')})`;

        // Add either image or text circle with consistent positioning
        if (member.photoUrl) {
            const img = document.createElement('img');
            img.src = member.photoUrl;
            img.alt = member.name;
            img.className = 'member-image';
            
            // Position consistently with text circles
            const midAngle = degToRad(startAngle + segmentAngle / 2);
            const radius = 35; // Distance from center (in percentage)
            const imgX = 50 + radius * Math.cos(midAngle);
            const imgY = 50 + radius * Math.sin(midAngle);
            
            img.style.left = `${imgX}%`;
            img.style.top = `${imgY}%`;
            img.style.transform = `translate(-50%, -50%) rotate(${-rotation}deg)`;
            
            // Add error handling for images
            img.onerror = function() {
                console.log(`Image error for ${member.name}`);
                this.style.display = 'none';
                
                // Create text circle as fallback
                const textCircle = document.createElement('div');
                textCircle.className = 'text-circle';
                textCircle.textContent = member.name.charAt(0).toUpperCase();
                textCircle.style.left = `${imgX}%`;
                textCircle.style.top = `${imgY}%`;
                textCircle.style.transform = `translate(-50%, -50%) rotate(${-rotation}deg)`;
                content.appendChild(textCircle);
            };
            
            content.appendChild(img);
        } else {
            const textCircle = document.createElement('div');
            textCircle.className = 'text-circle';
            textCircle.textContent = member.name;
            
            // Position the text circle in the middle of the segment
            const midAngle = degToRad(startAngle + segmentAngle / 2);
            const radius = 35; // Distance from center (in percentage)
            const textX = 50 + radius * Math.cos(midAngle);
            const textY = 50 + radius * Math.sin(midAngle);
            
            textCircle.style.left = `${textX}%`;
            textCircle.style.top = `${textY}%`;
            textCircle.style.transform = `translate(-50%, -50%) rotate(${-rotation}deg)`;
            content.appendChild(textCircle);
        }

        segment.appendChild(content);
        spinner.appendChild(segment);
    });

    createSpinButton(false);
}

// Function to create and add the spin button
function createSpinButton(isDisabled) {
    const existingButton = spinner.querySelector('.spin-button');
    if (existingButton) existingButton.remove();

    const button = document.createElement('button');
    button.className = 'spin-button';
    button.innerHTML = '<span>SPIN!</span>';
    button.onclick = spin;
    button.disabled = isDisabled;
    spinner.appendChild(button);
}

// Update team list UI
function updateTeamList() {
    teamList.innerHTML = '';
    teamMembers.forEach(member => {
        const div = document.createElement('div');
        div.className = `team-member ${member.isHidden ? 'hidden' : ''}`;
        
        // Create image or initial circle display
        let imageHtml = '';
        if (member.photoUrl) {
            imageHtml = `
                <div class="member-image-container">
                    <img src="${member.photoUrl}" 
                         alt="${member.name}" 
                         class="team-list-image"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="team-list-text-circle" style="display:none;">${member.name.charAt(0).toUpperCase()}</div>
                </div>
            `;
        } else {
            imageHtml = `
                <div class="member-image-container">
                    <div class="team-list-text-circle">${member.name.charAt(0).toUpperCase()}</div>
                </div>
            `;
        }
        
        div.innerHTML = `
            ${imageHtml}
            <h3>${member.name}</h3>
            <div class="member-actions">
                <button onclick="toggleHide(${member.id})">${member.isHidden ? 'Unhide' : 'Hide'}</button>
                <button class="remove-btn" onclick="removeMember(${member.id})" aria-label="Remove member">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5 4.5H13.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M5.5 4.5V3C5.5 2.44772 5.94772 2 6.5 2H9.5C10.0523 2 10.5 2.44772 10.5 3V4.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12.5 4.5L11.9179 12.1747C11.8489 13.1765 11.0142 13.9375 10.0087 13.9375H5.99134C4.98584 13.9375 4.15114 13.1765 4.08208 12.1747L3.5 4.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        `;
        teamList.appendChild(div);
    });
}

// Toggle hide member
function toggleHide(memberId) {
    const member = teamMembers.find(m => m.id === memberId);
    if (member) {
        member.isHidden = !member.isHidden;
        console.log(`${member.name} is now ${member.isHidden ? 'hidden' : 'visible'}`);
        updateTeamList();
        updateSpinner();
    }
}

// Remove team member
function removeMember(memberId) {
    teamMembers = teamMembers.filter(m => m.id !== memberId);
    updateTeamList();
    updateSpinner();
}

// Add confetti effect
function createConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100%';
    confettiContainer.style.height = '100%';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '1000';

    // Create multiple confetti pieces
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetti.style.opacity = Math.random();
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confettiContainer.appendChild(confetti);
    }

    document.body.appendChild(confettiContainer);

    // Remove confetti after animation
    setTimeout(() => {
        confettiContainer.remove();
    }, 5000);
}

// Spin functionality
function spin() {
    if (isSpinning) return;

    const activeMembers = teamMembers.filter(m => !m.isHidden);
    if (activeMembers.length === 0) {
        alert('No active team members to spin!');
        return;
    }

    isSpinning = true;
    winnerAnnouncement.textContent = '';
    const spinButtonElement = spinner.querySelector('.spin-button');
    if(spinButtonElement) spinButtonElement.disabled = true;

    // Reset the spinner's transition and transform before starting new spin
    spinner.style.transition = 'none';
    spinner.style.transform = `rotate(${currentRotation}deg)`;
    // Force reflow to ensure the reset takes effect
    spinner.offsetHeight;

    // Start spinning sound and after a short delay, start ticking
    spinSound.currentTime = 0;
    spinSound.play().catch(err => console.log('Sound play error:', err));
    
    setTimeout(() => {
        tickSound.currentTime = 0;
        tickSound.play().catch(err => console.log('Tick sound error:', err));
    }, 200);

    const numSegments = activeMembers.length;
    const segmentAngle = 360 / numSegments;
    const targetIndex = Math.floor(Math.random() * numSegments);
    const selectedMember = activeMembers[targetIndex];

    // Calculate final position
    const targetRotation = 360 - (segmentAngle * targetIndex + segmentAngle / 2);
    // Always spin 8 full rotations plus the target position for more dramatic effect
    const finalRotation = (360 * 8) + targetRotation;

    // Start the spin with easing
    requestAnimationFrame(() => {
        spinner.style.transition = 'transform 6s cubic-bezier(0.32, 0, 0.23, 1)';
        spinner.style.transform = `rotate(${finalRotation}deg)`;
    });

    // Store the final rotation
    currentRotation = finalRotation % 360;

    // Adjust sound timing for longer spin
    setTimeout(() => {
        const fadeOutInterval = setInterval(() => {
            if (tickSound.volume > 0.02) {
                tickSound.volume -= 0.015;
            } else {
                clearInterval(fadeOutInterval);
                tickSound.pause();
                tickSound.volume = 0.15; // Reset volume
            }
        }, 100);
    }, 4000);

    // After animation ends
    setTimeout(() => {
        // Stop ticker sound completely before playing celebration
        tickSound.pause();
        tickSound.volume = 0.15; // Reset volume

        // Play celebration sound with a slight delay for better timing
        setTimeout(() => {
            celebrationSound.currentTime = 0;
            celebrationSound.play().catch(err => {
                console.log('Celebration sound error:', err);
                // Try playing again if first attempt fails
                setTimeout(() => celebrationSound.play().catch(err => console.log('Retry failed:', err)), 100);
            });
        }, 200);

        // Winner announcement
        const winner = selectedMember;
        winnerAnnouncement.innerHTML = `
            <div class="celebration">
                🎉 ${winner.name} WINS! 🎊
                <div class="celebration-subtitle">Congratulations! 🌟</div>
                <button id="hide-winner-button" class="hide-winner-btn">
                    Hide ${winner.name} from next spin
                </button>
            </div>
        `;
        winnerAnnouncement.classList.add('celebrate');
        
        // Attach the hide winner function properly
        const hideWinnerButton = document.getElementById('hide-winner-button');
        if (hideWinnerButton) {
            hideWinnerButton.addEventListener('click', function() {
                hideWinner(winner.id);
            });
        }
        
        createConfetti();
        
        isSpinning = false;
        if(spinButtonElement) spinButtonElement.disabled = false;
    }, 6000);
}

// Add function to hide winner
function hideWinner(winnerId) {
    // Find the winner by ID
    const winner = teamMembers.find(m => m.id === winnerId);
    if (!winner) {
        console.error(`Could not find team member with ID ${winnerId}`);
        return;
    }
    
    // Toggle hidden state
    const isNowHidden = !winner.isHidden;
    winner.isHidden = isNowHidden;
    
    console.log(`${winner.name} is now ${isNowHidden ? 'hidden' : 'visible'}`);
    
    // Update the UI to reflect changes
    updateTeamList();
    updateSpinner();
    
    // Update button text
    const hideButton = document.getElementById('hide-winner-button');
    if (hideButton) {
        if (isNowHidden) {
            hideButton.textContent = `Unhide ${winner.name}`;
        } else {
            hideButton.textContent = `Hide ${winner.name} from next spin`;
        }
    }
}

// Update the flash animation CSS
if (!document.getElementById('spinner-animations')) {
    const style = document.createElement('style');
    style.id = 'spinner-animations';
    style.textContent = `
        @keyframes flash {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.5); }
        }
        @keyframes celebrate {
            0% { transform: scale(0.8); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        .celebration {
            animation: celebrate 0.5s ease-out forwards;
        }
        .celebration-subtitle {
            font-size: 1.2rem;
            margin-top: 0.5rem;
            animation: bounce 1s ease-in-out infinite;
        }
        .spin-button span {
            display: inline-block;
            transition: transform 0.3s ease;
        }
        .spin-button:hover span {
            transform: scale(1.1) rotate(15deg);
        }
    `;
    document.head.appendChild(style);
}

// Make functions globally available
window.toggleHide = toggleHide;
window.removeMember = removeMember;
window.hideWinner = hideWinner;

// Initial Rownd team data with reliable avatar URLs
const rowndTeamData = [
    { name: "Rachel", photoUrl: "https://ui-avatars.com/api/?name=Rachel&background=6e3ff3&color=fff&size=200&bold=true" },
    { name: "Matt", photoUrl: "https://ui-avatars.com/api/?name=Matt&background=5931c2&color=fff&size=200&bold=true" },
    { name: "Davon", photoUrl: "https://ui-avatars.com/api/?name=Davon&background=9171f8&color=fff&size=200&bold=true" },
    { name: "Rob", photoUrl: "https://ui-avatars.com/api/?name=Rob&background=4a2a94&color=fff&size=200&bold=true" },
    { name: "Racheal", photoUrl: "https://ui-avatars.com/api/?name=Racheal&background=b299ff&color=fff&size=200&bold=true" },
    { name: "Bobby", photoUrl: "https://ui-avatars.com/api/?name=Bobby&background=6e3ff3&color=fff&size=200&bold=true" }
];

// Function to initialize the spinner with Rownd team
function initializeWithRowndTeam() {
    // Clear current team first
    teamMembers = [];
    
    // Add each Rownd team member
    rowndTeamData.forEach(member => {
        const newMember = new TeamMember(member.name, member.photoUrl);
        teamMembers.push(newMember);
    });
    
    // Update UI
    updateTeamList();
    updateSpinner();
}

// Add a function to clear the team and start fresh
function clearTeam() {
    if (confirm('Are you sure you want to clear all team members?')) {
        teamMembers = [];
        updateTeamList();
        updateSpinner();
        winnerAnnouncement.textContent = '';
        winnerAnnouncement.classList.remove('celebrate');
    }
}

// Add a clear button to the UI and initialize the team
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing spinner...');
    
    // First initialize the team
    initializeWithRowndTeam();
    
    // Then add the clear button
    const teamManagement = document.querySelector('.team-management');
    const clearButtonContainer = document.createElement('div');
    clearButtonContainer.style.marginTop = '1rem';
    clearButtonContainer.style.textAlign = 'center';
    
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear Team';
    clearButton.onclick = clearTeam;
    clearButton.style.background = '#f44336';
    clearButton.style.color = 'white';
    clearButton.style.border = 'none';
    clearButton.style.padding = '0.5rem 1rem';
    clearButton.style.borderRadius = '8px';
    clearButton.style.cursor = 'pointer';
    
    clearButtonContainer.appendChild(clearButton);
    teamManagement.appendChild(clearButtonContainer);
});
