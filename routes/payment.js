const express = require('express');
const router = express.Router();
const config = require('../config.json');
const stripe = require('stripe')(config.stripe.apiKey);
const subscription = require('../models/subscription');

//
// only allow access if logged in
//


router.post('/confirm', async (req, res) => {
    // const product = await stripe.products.retrieve(config.stripe.productID);
    const expiry = req.body.expiry.split("/");
    const payment_method = await stripe.paymentMethods.create({
        type: 'card',
        card: {
            number: req.body.cardNumber,
            exp_month: parseInt(expiry[0].trim()),
            exp_year: parseInt('20'+expiry[1].trim()),
            cvc: req.body.cvc
        }
    });
    const price = await stripe.prices.retrieve(config.stripe.priceID);
    const customer = await stripe.customers.create({
        email: req.body.email,
        payment_method: payment_method.id,
        expand: ['default_source']
    });
    const subscriptionResult = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
            price: price.id
        }],
        default_payment_method: payment_method.id
    });
    if(subscriptionResult.status == "active"){
        var sub = new subscription({
            customerID: customer.id,
            subscriptionID: subscriptionResult.id,
            user: req.user.username,
            expires_in: subscriptionResult.current_period_end
        });
        sub.save((err, sub) => {
            if(err){
                // duplicate
                if(err.code == 11000) console.log('duplicate');
                return res.redirect('/payment');
            }
            console.log(sub);
            sub.updateUserActive(req.user.username);
            return res.redirect('/home');
        });
    } else {
        return res.json({
            success: false
        });
    }
});

module.exports = router;