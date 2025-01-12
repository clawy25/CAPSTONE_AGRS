const express = require('express');
const supabase = require('../supabaseServer'); // Import your configured Supabase client
const router = express.Router();

router.post('/set', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        console.log('Attempting password reset for email:', email);

        // Fetch users with admin privileges (this call requires service role or server-side key)
        const { data, error: listError } = await supabase.auth.admin.listUsers({
            filter: `email.eq.${email}`, // Filter by email
        });

        if (listError) {
            console.error('Error fetching users:', listError);
            return res.status(500).json({ error: 'Error fetching users' });
        }

        if (data.length === 0) {
            console.log('Email does not exist:', email);
            return res.status(400).json({ error: 'Email does not exist' });
        }

        // If the email exists, proceed to reset the password
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'https://paranaquecitycollege.onrender.com/reset-password', // Primary redirect link
        });

        if (error) {
            console.error('Supabase Error with primary redirect:', error);

            // Try an alternative redirect
            const { error: altError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'http://localhost:3001/reset-password', // Alternative link
            });

            if (altError) {
                console.error('Supabase Error with alternative redirect:', altError);
                return res.status(400).json({ error: altError.message });
            }

            console.log('Password reset email sent successfully using alternative redirect for:', email);
            return res.status(200).json({ message: 'Password reset email sent successfully with alternative link!' });
        }

        console.log('Password reset email sent successfully using primary redirect for:', email);
        res.status(200).json({ message: 'Password reset email sent successfully!' });
    } catch (err) {
        console.error('Unexpected server error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});






module.exports = router;
