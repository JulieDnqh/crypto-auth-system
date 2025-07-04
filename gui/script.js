const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');
const signupForm = document.getElementById('signup-form');
const signinForm = document.getElementById('signin-form');
const userInputDisplay = document.getElementById('user-input-display');

signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});

signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(signupForm);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    console.log('User Input (Sign Up):', data);

    // Example of sending data to backend (uncomment to enable)
    // const response = await fetch('/submit-form', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(data),
    // });
    // const result = await response.text();
    // console.log(result);
});

signinForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(signinForm);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    console.log('User Input (Sign In):', data);

    // Example of sending data to backend (uncomment to enable)
    // const response = await fetch('/submit-form', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(data),
    // });
    // const result = await response.text();
    // console.log(result);
});