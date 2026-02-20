import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (Service Role)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY; // Must be set in Vercel Env Vars

export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { rrr, amount, user_id } = req.body;

        if (!rrr || !user_id) {
            return res.status(400).json({ error: 'Missing RRR or User ID' });
        }

        if (!supabaseUrl || !supabaseServiceRole) {
            console.error('Supabase credentials missing in Server Environment');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);
        const REMITA_SECRET_KEY = process.env.REMITA_SECRET_KEY;

        if (!REMITA_SECRET_KEY) {
            console.error('Remita Secret Key missing');
            return res.status(500).json({ error: 'Server configuration error: Key missing' });
        }

        console.log(`Verifying RRR: ${rrr}`);

        // Verify Payment with Provider
        // Using generic verification endpoint pattern for keys provided (Bearer Token)
        const verificationUrl = `https://remitademo.net/payment/v1/payment/status/${rrr}`;

        const response = await fetch(verificationUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${REMITA_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const verifyData = await response.json();
        console.log('Provider Response:', verifyData);

        let isSuccess = false;

        // Check success condition based on standard response formats
        if (response.ok && (verifyData.status === 'success' || verifyData.responseCode === '00' || verifyData.status === '00')) {
            isSuccess = true;
        } else {
            console.error('Payment Verification Failed:', verifyData);
        }

        // FOR TESTING: If the RRR is "TEST-SUCCESS", force success (remove in strict prod)
        if (rrr === 'TEST-SUCCESS') isSuccess = true;

        if (!isSuccess) {
            return res.status(400).json({ error: 'Payment verification failed', details: verifyData });
        }

        // 2. Update Student & Payment Records
        // Mark payment as verified
        const { error: updatePaymentError } = await supabaseAdmin
            .from('payments')
            .update({ status: 'verified', rrr: rrr })
            .eq('user_id', user_id)
            .eq('status', 'pending');

        if (updatePaymentError) throw updatePaymentError;

        // enable QR generation for student
        const { error: updateStudentError } = await supabaseAdmin
            .from('students')
            .update({
                payment_verified: true,
                qr_generated: true
            })
            .eq('user_id', user_id);

        if (updateStudentError) throw updateStudentError;

        return res.status(200).json({ success: true, message: 'Payment verified and QR generated' });

    } catch (error) {
        console.error('Server Function Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
