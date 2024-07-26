"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const BoodschapSchema = new mongoose_1.Schema({
    household: { type: String, required: true },
    item: { type: String, required: false },
    userAdded: { type: String, required: true },
    dateAdded: { type: Date, required: true },
    userDone: { type: String, required: false },
    dateDone: { type: Date, required: false },
    done: { type: Boolean, required: true },
    userLastChange: { type: String, required: false },
    id: { type: String, required: true, unique: true }
});
const Boodschap = (0, mongoose_1.model)('Boodschap', BoodschapSchema);
exports.default = Boodschap;
