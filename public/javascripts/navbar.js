async function buySubscription() {
    const isLoggedIn = currentUser ? 'true' : 'false';

    if (!isLoggedIn) {
        window.location.href = '/login';
        return;
    }
    const amountInRupees = 1; // Set the amount in rupees
    const amountInPaise = amountInRupees * 100; // Convert to the smallest currency unit (paise)

    try {
        const response = await fetch('/payment/createOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: amountInPaise, // amount in the smallest currency unit
                currency: 'INR',
                receipt: 'receipt_id_12345'
            })
        });

        if (!response.ok) {
            if (response.status === 401) { // User is not authenticated
                window.location.href = '/login';
                return;
            }
            throw new Error('Failed to create order');
        }

        const order = await response.json();

        const options = {
            "key": "<%= process.env.RAZORPAY_KEY_ID %>", // Razorpay key ID from environment variables
            "amount": order.amount,
            "currency": order.currency,
            "name": "VibePocket",
            "description": "Subscription Payment",
            "order_id": order.id,
            "handler": async function (response) {
                const verificationResponse = await fetch('/payment/verifyPayment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(response)
                });

                if (verificationResponse.ok) {
                    const flashResponse = await fetch('/payment/flashMessage', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ message: 'Payment successful!' })
                    });

                    if (!flashResponse.ok) {
                        throw new Error('Failed to send flash message');
                    }
                } else {
                    throw new Error('Payment verification failed');
                }
            },
            "prefill": {
                "name": "Yash Anand",
                "email": "yashanand1000@gmail.com"
            },
            "theme": {
                "color": "#3399cc"
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();
    } catch (error) {
        console.error('Error during buySubscription:', error);
        const flashResponse = await fetch('/payment/flashMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: 'Oops, something went wrong while creating the order.' })
        });

        if (!flashResponse.ok) {
            console.error('Failed to send flash message:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Event listener for genre filter
    document.querySelectorAll('.dropdown-item[data-genre]').forEach(function (item) {
        item.addEventListener('click', function () {
            var genre = this.getAttribute('data-genre');
            window.location.href = '/audiobooks?genre=' + genre;
        });
    });

    // Event listener for search functionality
    document.querySelector('.search-input').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    function performSearch() {
        const searchPhrase = document.querySelector('.search-input').value.trim();
        if (searchPhrase.length > 0) {
            window.location.href = `/audiobooks?title=${encodeURIComponent(searchPhrase)}`;
        }
    }
});