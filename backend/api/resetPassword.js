const express = require('express');
const supabase = require('./supabaseServer'); // Import your configured Supabase client
const router = express.Router();

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        console.log('Attempting password reset for email:', email);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'http://localhost:3000/reset-password', // Adjust this
        });

        if (error) {
            console.error('Supabase Error:', error);
            return res.status(400).json({ error: error.message });
        }

        console.log('Password reset email sent successfully for:', email);
        res.status(200).json({ message: 'Password reset email sent successfully!' });
    } catch (err) {
        console.error('Unexpected server error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;
