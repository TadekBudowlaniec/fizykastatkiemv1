const express = require('express');
const cors = require('cors');

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());

// Mapowanie kursów na priceId Stripe (te same co w frontendzie)
const coursePriceIds = {
    mechanika: 'price_mechanika',
    // productId: prod_Sc4vpFdyoHuAbV
    termodynamika: 'price_1RgqlFJLuu6b086bf2Wl2bUg',
    elektromagnetyzm: 'price_elektromagnetyzm',
    optyka: 'price_optyka',
    atomowa: 'price_atomowa',
    jadrowa: 'price_jadrowa',
    full_access: 'price_full_access'
};

app.post('/api/create-checkout-session', async (req, res) => {
    const { userId, email, courseId, priceId } = req.body;
    if (!userId || !email || !courseId || !priceId) {
        return res.status(400).json({ error: 'Brak wymaganych danych.' });
    }
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: email,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            metadata: {
                userId,
                courseId
            },
            success_url: `${process.env.FRONTEND_URL}/?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/kurs`,
        });
        res.json({ id: session.id });
    } catch (err) {
        console.error('Stripe error:', err);
        res.status(500).json({ error: 'Błąd Stripe: ' + err.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
}); 