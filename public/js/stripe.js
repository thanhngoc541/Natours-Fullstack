import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51JhW30IRI51oHvBegEtSsTTFSzhcipHPvTmKlWmQ7NfoaDHdgMFES8YXPTPgM7igT7tROYqzVEXmmMR5mMhS3MBO00QgOCguLk'
);
export const bookTour = async (tourId) => {
  try {
    const session = await axios(`http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`);
    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
