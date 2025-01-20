const express = require('express');
const supabase = require('../supabaseServer');
const router = express.Router();

const rateLimit = new Map(); // Store email and timestamps for rate-limiting

router.post('/set', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const currentTime = Date.now();
    const cooldownPeriod = 5 * 60 * 1000; // 5 minutes in milliseconds


    if (rateLimit.has(email)) {
        const lastRequestTime = rateLimit.get(email);
        const timeDiff = currentTime - lastRequestTime;

        if (timeDiff < cooldownPeriod) {
            const remainingTime = Math.ceil((cooldownPeriod - timeDiff) / 60000); // Remaining time in minutes
            return res.status(429).json({
                error: `You can request another password reset email in ${remainingTime} minutes.`,
            });
        }
    }

    // Update rate limit timestamp
    rateLimit.set(email, currentTime);

    try {
        // Send the password reset email via Supabase
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
        });

        if (error) {
            console.error('Supabase Error:', error);

            // Handle Supabase rate limit error
            if (error.message.includes('Rate limit exceeded')) {
                return res.status(429).json({
                    error: 'Too many requests. Please try again later.',
                });
            }

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
        const { error } = await supabase.auth.api.updateUser(token, { password: newPassword });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({ message: 'Password reset successful!' });
    } catch (err) {
        console.error('Error resetting password:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
    }

    try {
        const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

        if (error) {
            return res.status(400).json({ error: 'Invalid or expired refresh token' });
        }

        res.status(200).json({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in, // Time in seconds until the token expires
        });
    } catch (err) {
        console.error('Error refreshing token:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
