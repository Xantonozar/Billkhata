import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
    khataId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    breakfast: {
        type: Number,
        default: 0,
        min: 0,
        max: 2
    },
    lunch: {
        type: Number,
        default: 0,
        min: 0,
        max: 2
    },
    dinner: {
        type: Number,
        default: 0,
        min: 0,
        max: 2
    },
    totalMeals: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

mealSchema.index({ khataId: 1, date: 1 });
mealSchema.index({ khataId: 1, userId: 1, date: 1 }, { unique: true });

mealSchema.pre('save', function(next) {
    this.totalMeals = (this.breakfast || 0) + (this.lunch || 0) + (this.dinner || 0);
    next();
});

const Meal = mongoose.model('Meal', mealSchema);

export default Meal;
