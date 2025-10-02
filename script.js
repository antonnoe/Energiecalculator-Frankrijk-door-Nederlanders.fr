// Floating Euro Button Implementation

const euroButton = document.createElement('div');
euroButton.style.position = 'sticky';
euroButton.style.top = '10px';
euroButton.style.right = '10px';
euroButton.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
euroButton.style.padding = '10px';
euroButton.style.border = '1px solid #000';
euroButton.style.zIndex = '1000';
euroButton.innerText = '€0.00';
document.body.appendChild(euroButton);

function updateCost() {
    try {
        // Calculate current cost based on input fields
        let cost = 0;
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            cost += parseFloat(input.value) || 0;
        });

        // Update button text
        euroButton.innerText = `€${cost.toFixed(2)}`;
    } catch (error) {
        console.error('Error updating cost:', error);
        euroButton.innerText = 'Error';
    }
}

// Add event listeners to input fields
const inputs = document.querySelectorAll('input');
inputs.forEach(input => {
    input.addEventListener('input', updateCost);
});

// Initial cost update
updateCost();