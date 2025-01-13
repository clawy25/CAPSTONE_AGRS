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
    const cooldownPeriod = 60 * 60 * 1000; // 1 hour in milliseconds

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

module.exports = router;
