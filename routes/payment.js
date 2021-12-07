const express = require('express');
const router = express.Router();
const config = require('../config.json');
const stripe = require('stripe')(config.stripe.apiKey);
const subscription = require('../models/subscription');
const development = config.DEVELOPMENT;

var Tip = require('../models/tip');
//
// only allow access if logged in
//


router.post('/subscribe', async (req, res) => {
    const expiry = (development) ? ["04","24"] : req.body.expiry.split("/");
    const payment_method = await stripe.paymentMethods.create({
        type: 'card',
        card: {
            number: (development) ? "4242 4242 4242 4242" : req.body.cardNumber,
            exp_month: parseInt(expiry[0].trim()),
            exp_year: parseInt('20'+expiry[1].trim()),
            cvc: (development) ? "424" : req.body.cvc
        }
    });
    const price = await stripe.prices.retrieve(config.stripe.priceID);
    const customer = await stripe.customers.create({
        email: (development) ? "maksjl01@gmail.com" : req.body.email,
        payment_method: payment_method.id,
        invoice_settings: {default_payment_method: payment_method.id},
    });
    const subscriptionResult = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
            price: price.id
        }],
    });
    
    if(subscriptionResult.status == "active"){
        var d = new Date();
        var user = (development) ? 'maksjl01' : req.user.username;
        var newUser = subscription.findOne({ user: user }, (err, returnUser) => {
            // if return user RESUBSCRIBE
            if(returnUser){
                if(!returnUser.active){
                    var updatedArray = returnUser.dates_subscribed.push([new Date(), 0]);
                    subscription.findOneAndUpdate({ user: user }, { $set: 
                        { dates_subscribed: updatedArray,
                            active: true,
                            price: price.unit_amount,
                            customerID: customer.id,
                            subscriptionID: subscriptionResult.id,
                            expires_in: subscriptionResult.current_period_end
                    }
                        }, (err) => console.log);
                } else {
                    return res.redirect('/login');
                }
            } else {
                var sub = new subscription({
                    customerID: customer.id,
                    subscriptionID: subscriptionResult.id,
                    user: user,
                    expires_in: subscriptionResult.current_period_end,
                    dates_subscribed: [[d, 0]],
                    price: price.unit_amount,
                    active: true
                });
                sub.save((err, sub) => {
                    if(err){
                        if(err) console.log(err);
                        return res.redirect('/payment');
                    }
                    if(!development){
                        sub.updateUserActive(customer.id);
                    }
                    return res.redirect('/home');
                });
            }
        })
    } else {
        return res.json({
            success: false
        });
    }
});

router.post('/tip', async function(req, res, next) {
    var date = new Date();
    var amount = req.body.amount, from = req.body.from, message = req.body.message,
        user = (development) ? "maksjl01" : req.user.username,
        customerID;

    subscription.findOne({user: user}, async (err, sub) => {
        if(err) return err;
        customerID = sub.customerID;
        console.log("Customer ID: " + customerID);
        var customer = await stripe.customers.retrieve(customerID);
        var paymentIntent = await stripe.paymentIntents.create({
            amount: amount*100,
            currency: 'usd',
            confirm: true,
            customer: sub.customerID,
            payment_method: customer.invoice_settings.default_payment_method,
        });
        console.log(paymentIntent);
        if(paymentIntent.status == 'succeeded'){
            var newTip = new Tip({
                amount: amount,
                message: message,
                from: from,
                user: user,
                date: date
            });
            newTip.save((err) => {
                return res.json(newTip);
            });
        }
    });
});

router.post('/stripe/update-subscription', function(req, res, next) {
    const event = req.body;

    // handle event
    switch(event.type){
        //created an hour before being paid at renewal
        case 'invoice.created':
            break;
        //after subscription renewed1
        case 'invoice.paid':
            const paidInvoice = event.data.object;
            var customerID = paidInvoice.customer;
            subscription.findOne({ customerID: customerID }, (err, sub) => {
                if(err) console.log(err);
                sub.updateUserActive(customerID);
            })
            console.log(paidInvoice);
            break;
        case 'invoice.payment_failed':
            const failedInvoice = event.data.object;
            var customerID = failedInvoice;
            subscriptions.findOne({ customerID: customerID }, (err, sub) => {
                if(err) console.log(err);
                sub.updateUserUnactive(customerID);
            })
        default:
            console.log('Unhandled event');
            break;
    }
});

router.get('/stripe/get-default-payment-method', async function(req, res, next) {
    var user = (config.DEVELOPMENT) ? "maksjl01" : req.user.username;
    console.log(user);
    subscription.findOne({ user: user }, async (err, user) => {
        if(err) console.log(err);
        const customer = await stripe.customers.retrieve(user.customerID);
        const payment_method = await stripe.paymentMethods.retrieve(customer.invoice_settings.default_payment_method);
        console.log(payment_method);
        var year = payment_method.card.exp_year.toString();
        var month = payment_method.card.exp_month.toString();
        return res.json({
            lastFour: payment_method.card.last4,
            exp_year: year.substr(year.length-2),
            exp_month: (month.length == 1) ? "0"+month : month,
            brand: payment_method.card.brand
        })
    })
})

module.exports = router;