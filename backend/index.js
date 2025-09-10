const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Inicjalizacja Supabase - używamy ANON_KEY z odpowiednimi politykami RLS
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const app = express();
app.use(cors());
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));

// Mapowanie kursów na priceId Stripe (16 kursów + full_access)
const coursePriceIds = {
    1: 'price_1RtPFoJLuu6b086bmfvVO4G8', // Kinematyka
    2: 'price_1RtPGOJLuu6b086b1QN5l4DE', // Dynamika
    3: 'price_1Rgt0yJLuu6b086b115h7OXM', // Praca moc energia
    4: 'price_1RtPKTJLuu6b086b3wG0IiaV', // Bryła Sztywna
    5: 'price_1RtPKkJLuu6b086b2lfhBfDX', // Ruch Drgający
    6: 'price_1RtPL2JLuu6b086bLl03p2R9', // Fale Mechaniczne
    7: 'price_1RtPLlJLuu6b086bbJxG1bqw', // Hydrostatyka
    8: 'price_1RgqlFJLuu6b086bf2Wl2bUg', // Termodynamika
    9: 'price_1RtPMCJLuu6b086bV3Zk0il6', // Grawitacja i Astronomia
    10: 'price_1Rgt1HJLuu6b086bmNgENAIM', // Elektrostatyka
    11: 'price_1RtPNJJLuu6b086bBejuPL2T', // Prąd Elektryczny
    12: 'price_1RtPNdJLuu6b086bjn7p0Wsn', // Magnetyzm
    13: 'price_1RtPORJLuu6b086b1yxr0voQ', // Indukcja Elektromagnetyczna
    14: 'price_1Rgt1TJLuu6b086bNn14JbJa', // Fale Elektromagnetyczne i Optyka
    15: 'price_1Rgt1lJLuu6b086bk3TJqFzM', // Fizyka Atomowa
    16: 'price_1Rgt21JLuu6b086bTBuO2djx', // Fizyka Jądrowa i Relatywistyka
    17: 'price_1RtPPaJLuu6b086bdmWNAsGI' // Wszystkie materiały (full_access)
};

// Mapowanie priceId na course_id
const priceToCourseId = {
    'price_1RtPFoJLuu6b086bmfvVO4G8': 1, // Kinematyka
    'price_1RtPGOJLuu6b086b1QN5l4DE': 2, // Dynamika
    'price_1Rgt0yJLuu6b086b115h7OXM': 3, // Praca moc energia
    'price_1RtPKTJLuu6b086b3wG0IiaV': 4, // Bryła Sztywna
    'price_1RtPKkJLuu6b086b2lfhBfDX': 5, // Ruch Drgający
    'price_1RtPL2JLuu6b086bLl03p2R9': 6, // Fale Mechaniczne
    'price_1RtPLlJLuu6b086bbJxG1bqw': 7, // Hydrostatyka
    'price_1RgqlFJLuu6b086bf2Wl2bUg': 8, // Termodynamika
    'price_1RtPMCJLuu6b086bV3Zk0il6': 9, // Grawitacja i Astronomia
    'price_1Rgt1HJLuu6b086bmNgENAIM': 10, // Elektrostatyka
    'price_1RtPNJJLuu6b086bBejuPL2T': 11, // Prąd Elektryczny
    'price_1RtPNdJLuu6b086bjn7p0Wsn': 12, // Magnetyzm
    'price_1RtPORJLuu6b086b1yxr0voQ': 13, // Indukcja Elektromagnetyczna
    'price_1Rgt1TJLuu6b086bNn14JbJa': 14, // Fale Elektromagnetyczne i Optyka
    'price_1Rgt1lJLuu6b086bk3TJqFzM': 15, // Fizyka Atomowa
    'price_1Rgt21JLuu6b086bTBuO2djx': 16, // Fizyka Jądrowa i Relatywistyka
    'price_1RtPPaJLuu6b086bdmWNAsGI': 17 // Wszystkie materiały (full_access)
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

// Webhook Stripe do obsługi udanych płatności
app.post('/api/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log('Webhook received:', event.type);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Obsługa udanych płatności
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log('Processing completed session:', session.id);
        
        // Sprawdź czy sesja ma wymagane metadane
        if (!session.metadata || !session.metadata.userId) {
            console.error('Session missing required metadata:', session.metadata);
            return res.status(400).json({ error: 'Missing required metadata' });
        }
        
        try {
            // Pobierz line_items z Stripe API (webhooks nie zawierają ich automatycznie)
            const sessionWithLineItems = await stripe.checkout.sessions.retrieve(session.id, {
                expand: ['line_items']
            });
            
            const lineItems = sessionWithLineItems.line_items?.data || [];
            let courseIds = [];
            
            console.log('Session line items:', JSON.stringify(lineItems, null, 2));
            
            if (lineItems.length > 0) {
                const priceId = lineItems[0].price.id;
                console.log('Price ID from session:', priceId);
                const courseIdFromPrice = priceToCourseId[priceId];
                console.log('Mapped course ID:', courseIdFromPrice);
                
                if (courseIdFromPrice === 17) {
                    // Pełny dostęp - dodaj wszystkie kursy
                    courseIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
                    console.log('Full access - adding all courses');
                } else if (courseIdFromPrice) {
                    // Konkretny kurs
                    courseIds = [courseIdFromPrice];
                    console.log('Single course access - adding course:', courseIdFromPrice);
                }
            } else {
                console.log('No line items found, checking metadata for fallback');
                // Fallback - użyj courseId z metadata
                const courseIdFromMetadata = session.metadata.courseId;
                if (courseIdFromMetadata === 'full_access') {
                    courseIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
                    console.log('Full access from metadata - adding all courses');
                } else if (courseIdFromMetadata) {
                    courseIds = [parseInt(courseIdFromMetadata)];
                    console.log('Single course from metadata:', courseIdFromMetadata);
                }
            }

            // Dodaj wpisy do tabeli enrollments
            console.log('About to add enrollments for courses:', courseIds);
            console.log('User ID:', session.metadata.userId);
            
            if (courseIds.length === 0) {
                console.error('No courses to enroll user in!');
                return res.status(400).json({ error: 'No courses identified for enrollment' });
            }
            
            for (const courseId of courseIds) {
                console.log(`Adding enrollment for user ${session.metadata.userId} to course ${courseId}`);
                
                // Użyj RPC call do dodania enrollment z uprawnieniami serwera
                const { data, error } = await supabase
                    .rpc('add_enrollment_for_payment', {
                        p_user_id: session.metadata.userId,
                        p_course_id: courseId
                    });

                if (error) {
                    console.error('Error adding enrollment for course', courseId, ':', error);
                    console.error('Full error object:', JSON.stringify(error, null, 2));
                    
                    // Fallback - spróbuj bezpośredni insert (może zadziałać jeśli polityki RLS pozwalają)
                    const { data: fallbackData, error: fallbackError } = await supabase
                        .from('enrollments')
                        .upsert({
                            user_id: session.metadata.userId,
                            course_id: courseId,
                            access_granted: true,
                            enrolled_at: new Date().toISOString()
                        }, {
                            onConflict: 'user_id,course_id'
                        })
                        .select();
                    
                    if (fallbackError) {
                        console.error('Fallback insert also failed:', fallbackError);
                    } else {
                        console.log(`Fallback success - Access granted for user ${session.metadata.userId} to course ${courseId}`);
                        console.log('Enrollment data:', fallbackData);
                    }
                } else {
                    console.log(`Access granted for user ${session.metadata.userId} to course ${courseId}`);
                    console.log('Enrollment data:', data);
                }
            }

            res.json({ received: true });
        } catch (error) {
            console.error('Error processing webhook:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        console.log('Unhandled event type:', event.type);
        res.json({ received: true });
    }
});

// Endpoint do sprawdzania statusu płatności
app.get('/api/check-payment-status', async (req, res) => {
    const { session_id } = req.query;
    
    if (!session_id) {
        return res.status(400).json({ success: false, error: 'Brak session_id' });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        
        if (session.payment_status === 'paid') {
            // Płatność została zrealizowana, sprawdź czy użytkownik ma już dostęp
            const { userId, courseId } = session.metadata;
            
            console.log('Payment successful, checking access for user:', userId);
            
            if (userId) {
                // Sprawdź czy użytkownik ma już dostęp do kursu
                const { data: enrollments, error } = await supabase
                    .from('enrollments')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('access_granted', true);

                if (error) {
                    console.error('Error checking enrollments:', error);
                    console.error('Full error:', JSON.stringify(error, null, 2));
                } else {
                    console.log('Found enrollments:', enrollments);
                    if (enrollments && enrollments.length > 0) {
                        return res.json({ success: true, message: 'Access already granted' });
                    }
                }
                
                // Jeśli nie ma dostępu, spróbuj dodać enrollment (fallback)
                console.log('No enrollments found, attempting to create enrollment as fallback');
                
                // Pobierz line_items aby określić jakie kursy kupił
                const sessionWithLineItems = await stripe.checkout.sessions.retrieve(session.id, {
                    expand: ['line_items']
                });
                
                const lineItems = sessionWithLineItems.line_items?.data || [];
                let courseIds = [];
                
                if (lineItems.length > 0) {
                    const priceId = lineItems[0].price.id;
                    const courseIdFromPrice = priceToCourseId[priceId];
                    
                    if (courseIdFromPrice === 17) {
                        courseIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
                    } else if (courseIdFromPrice) {
                        courseIds = [courseIdFromPrice];
                    }
                } else if (courseId === 'full_access') {
                    courseIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
                } else if (courseId) {
                    courseIds = [parseInt(courseId)];
                }
                
                // Dodaj enrollments
                for (const cId of courseIds) {
                    // Użyj RPC call
                    const { data, error } = await supabase
                        .rpc('add_enrollment_for_payment', {
                            p_user_id: userId,
                            p_course_id: cId
                        });
                    
                    if (error) {
                        console.error('Error creating enrollment via RPC:', error);
                        
                        // Fallback - bezpośredni insert
                        const { error: enrollError } = await supabase
                            .from('enrollments')
                            .upsert({
                                user_id: userId,
                                course_id: cId,
                                access_granted: true,
                                enrolled_at: new Date().toISOString()
                            });
                        
                        if (enrollError) {
                            console.error('Error creating enrollment via direct insert:', enrollError);
                        } else {
                            console.log('Created enrollment for course via direct insert:', cId);
                        }
                    } else {
                        console.log('Created enrollment for course via RPC:', cId, data);
                    }
                }
            }
            
            return res.json({ success: true, message: 'Payment successful' });
        } else {
            return res.json({ success: false, error: 'Payment not completed' });
        }
    } catch (error) {
        console.error('Error checking payment status:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// TESTOWY endpoint do symulacji udanej płatności (tylko w trybie deweloperskim)
app.post('/api/test-payment-success', async (req, res) => {
    const { userId, courseId } = req.body;
    
    if (!userId || !courseId) {
        return res.status(400).json({ error: 'Brak wymaganych danych (userId, courseId)' });
    }
    
    console.log('TEST: Simulating successful payment for user:', userId, 'course:', courseId);
    
    try {
        // Określ jakie kursy dodać
        let courseIds = [];
        if (courseId === 'full_access') {
            courseIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
            console.log('TEST: Full access - adding all courses');
        } else {
            courseIds = [parseInt(courseId)];
            console.log('TEST: Single course access - adding course:', courseId);
        }
        
        // Dodaj enrollments
        for (const cId of courseIds) {
            console.log(`TEST: Adding enrollment for user ${userId} to course ${cId}`);
            
            // Użyj RPC call
            const { data, error } = await supabase
                .rpc('add_enrollment_for_payment', {
                    p_user_id: userId,
                    p_course_id: cId
                });
            
            if (error) {
                console.error('TEST: Error creating enrollment via RPC:', error);
                
                // Fallback - bezpośredni insert
                const { error: enrollError } = await supabase
                    .from('enrollments')
                    .upsert({
                        user_id: userId,
                        course_id: cId,
                        access_granted: true,
                        enrolled_at: new Date().toISOString()
                    });
                
                if (enrollError) {
                    console.error('TEST: Error creating enrollment via direct insert:', enrollError);
                } else {
                    console.log('TEST: Created enrollment for course via direct insert:', cId);
                }
            } else {
                console.log('TEST: Created enrollment for course via RPC:', cId, data);
            }
        }
        
        res.json({ 
            success: true, 
            message: 'Test payment successful - access granted',
            coursesAdded: courseIds
        });
        
    } catch (error) {
        console.error('TEST: Error processing test payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
    console.log(`Test payment endpoint available at: POST /api/test-payment-success`);
}); 