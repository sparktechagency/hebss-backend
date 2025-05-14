import mongoose from 'mongoose';

const billingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    type: { type: String, enum: ['subscriptionPurchase', 'invoice', 'order'], required: true },
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'type'
    }
}, {
    timestamps: true
});

const Billing = mongoose.model('billing', billingSchema);

export default Billing;
