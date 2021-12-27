const express = require('express');
const router = express.Router();
var process = require('process');
var data = require('../config.json');
const stripe = require('stripe')(data.STRIPE_DEV_KEY);
const subscription = require('../models/subscription');
const development = data.DEV;

var Tip = require('../models/tip');
const User = require('../models/user');

function developmentAuth(req, res, next){
    return next();
}
function isAuthenticated(req, res, next){
    console.log('auth check');
    if(!req.user) return res.redirect('/login');
    next();
}
var authCheck = (development) ? developmentAuth : isAuthenticated;
//
// only allow access if logged in
//

router.get('/subscribe', authCheck, function(req, res, next) {
    res.sendFile('dist/index.html', { root: process.cwd() });
})

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
    const price = await stripe.prices.retrieve(data.STRIPE_PRICE_ID);
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
        subscription.findOne({ user: req.user.username }, (err, returnUser) => {
            // if return user RESUBSCRIBE
            // date_subscribed: (date subbed, how many months subbed (starting from 0))
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
                    user: req.user.username,
                    expires_in: subscriptionResult.current_period_end,
                    dates_subscribed: [[d, 1]],
                    price: price.unit_amount,
                    active: true
                });
                User.updateOne({ username: req.user.username }, {$set:{customerID: customer.id}});
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
            success: false,
            message: "Payment Failed"
        });
    }
});

router.post('/tip', async function(req, res, next) {
    var date = new Date();
    var amount = req.body.amount, from = req.body.from, message = req.body.message,
        user = req.user.username,
        customerID;

    subscription.findOne({user: user}, async (err, sub) => {
        if(err) return err;
        if(sub.customerID){
            customerID = sub.customerID;
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
        } else {
            return res.status(401).json({ success: false });
        }
    });
});

router.post('/stripe/update-subscription', function(req, res, next) {
    const event = req.body;
    // handle event
    switch(event.type){
        //created an hour before being paid at renewal
        case 'invoice.created':
            res.send();
            break;
        //after subscription renewed
        case 'invoice.paid':
            const paidInvoice = event.data.object;
            var customerID = (data.DEV) ? "cus_KlweqHhBmkWTId" : paidInvoice.customer;
            subscription.findOne({ customerID: customerID }, (err, sub) => {
                if(err) console.log(err);
                if(sub) sub.updateUserActive(customerID);
                else return res.json({ success: false });
                return res.send();
            })
            break;
        case 'invoice.payment_failed':
            const failedInvoice = event.data.object;
            var customerID = failedInvoice;
            subscriptions.findOne({ customerID: customerID }, (err, sub) => {
                if(err) console.log(err);
                if(sub){
                    sub.updateUserUnactive(customerID);
                } else {
                    return res.json({ succes: false });
                }
                return res.send();
            })
            break;
        default:
            return res.send();
    }
});

router.get('/stripe/get-default-payment-method', async function(req, res, next) {
    subscription.findOne({ user: req.user.username }, async (err, user) => {
        if(err) return res.json({ success: false });
        if(user.customerID){
            const customer = await stripe.customers.retrieve(user.customerID);
            const payment_method = await stripe.paymentMethods.retrieve(customer.invoice_settings.default_payment_method);
            var year = payment_method.card.exp_year.toString();
            var month = payment_method.card.exp_month.toString();
            
            return res.json({
                lastFour: payment_method.card.last4,
                exp_year: year.substr(year.length-2),
                exp_month: (month.length == 1) ? "0"+month : month,
                brand: payment_method.card.brand
            })
        } else return res.json({ success: false });
    })
})

module.exports = router;