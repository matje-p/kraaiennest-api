"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const HouseholdSchema = new mongoose_1.Schema({
    fullname: { type: String, required: true },
    name: { type: String, required: true },
    id: { type: Number, required: true, unique: true }
});
const Household = (0, mongoose_1.model)('Household', HouseholdSchema);
exports.default = Household;
