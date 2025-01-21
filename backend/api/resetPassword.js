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

    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
    }

    try {
        // First, verify the token and get the user information
        const { user, error: tokenError } = await supabase.auth.api.getUser(token);

        if (tokenError || !user) {
            console.error('Invalid token:', tokenError);
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        // Now update the password
        const { error } = await supabase.auth.api.updateUser(token, { password: newPassword });

        if (error) {
            console.error('Supabase Error:', error);
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({ message: 'Password updated successfully!' });
    } catch (err) {
        console.error('Unexpected server error:', err);
        res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
});


module.exports = router;
