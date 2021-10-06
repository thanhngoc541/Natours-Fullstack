import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (type, data) => {
  try {
    const url = type === 'password' ? 'updatePassword' : 'updateMe';
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/${url}`,
      data: data,
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Update successfully');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
