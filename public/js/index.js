import '@babel/polyfill';
import { bookTour } from './stripe';
import { login, logout, signup } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';

const mapBox = document.getElementById('map');
const logoutBtn = document.querySelector('.nav__el--logout');
const loginForm = document.querySelector('.form--login');
const signUpForm = document.getElementById('sign-up-form');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

if (mapBox) {
  const locations = JSON.parse(document.getElementById('map').dataset.locations);
  displayMap(locations);
}
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
if (signUpForm) {
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('sign-up-name').value;
    const email = document.getElementById('sign-up-email').value;
    const password = document.getElementById('sign-up-password').value;
    const passwordConfirm = document.getElementById('sign-up-confirm-password').value;
    signup(name, email, password, passwordConfirm);
  });
}
if (logoutBtn) logoutBtn.addEventListener('click', logout);
if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateSettings('data', form);
  });
if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-passowrd').innerHTML = 'Updating..';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings('password', { passwordCurrent, password, passwordConfirm });
    document.querySelector('.btn--save-passowrd').innerHTML = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
