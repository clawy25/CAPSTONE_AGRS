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

    console.log(token);
    console.log(newPassword);
  
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }
  
    try {
      // Decode and validate the token to get user ID

      /* const { data: user, error: tokenError } = await supabase.auth.getUser(token);
      console.log("Decoded token:", user); */
  
      /* if (tokenError || !user) {
        console.error('Token validation error:', tokenError);
        return res.status(400).json({ error: 'Invalid or expired token.' });
      } */
  
      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
  
      if (updateError) {
        console.error('Error updating password:', updateError);
        return res.status(400).json({ error: updateError.message });
      }
  
      res.status(200).json({ message: 'Password updated successfully!' });
    } catch (err) {
      console.error('Unexpected server error:', err);
      res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
});


module.exports = router;
