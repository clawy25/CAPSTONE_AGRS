const express = require('express');
const supabase = require('../supabaseServer');
const router = express.Router();

router.post('/set', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // Send the password reset email via Supabase
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL}/reset-password`, // Where the user will be redirected after resetting their password
        });

        if (error) {
            console.error('Supabase Error:', error);
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({ message: 'Password reset email sent successfully!' });
    } catch (err) {
        console.error('Unexpected server error:', err);
        res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
});

router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  console.log('Token:', token);
  console.log('New Password:', newPassword);

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required.' });
  }

  try {
    // Update the user's password using the recovery token
    const { data, error } = await supabase.auth.api.updateUser(token, {
      password: newPassword,
    });

    if (error || !data) {
      console.error('Error updating password:', error);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Password updated successfully!' });
  } catch (err) {
    console.error('Unexpected server error:', err);
    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
});



module.exports = router;
